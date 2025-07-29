import LZString from 'lz-string'

/**
 * Compression utilities for cache optimization
 * Provides efficient data compression/decompression with graceful fallback
 */

export interface CompressionResult {
  data: string
  compressed: boolean
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

export interface DecompressionResult<T> {
  data: T | null
  success: boolean
  wasCompressed: boolean
  error?: string
}

/**
 * Compresses data using LZ-string compression
 * Falls back to raw JSON if compression fails or doesn't provide benefit
 */
export function compressData<T>(data: T): CompressionResult {
  try {
    const jsonString = JSON.stringify(data)
    const originalSize = new Blob([jsonString]).size
    
    // Compress using LZ-string
    const compressed = LZString.compress(jsonString)
    
    if (!compressed) {
      // Compression failed, return original
      return {
        data: jsonString,
        compressed: false,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1
      }
    }
    
    const compressedSize = new Blob([compressed]).size
    const compressionRatio = compressedSize / originalSize
    
    // Only use compression if it provides at least 10% reduction
    if (compressionRatio < 0.9) {
      return {
        data: compressed,
        compressed: true,
        originalSize,
        compressedSize,
        compressionRatio
      }
    } else {
      // Compression didn't provide significant benefit
      return {
        data: jsonString,
        compressed: false,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1
      }
    }
  } catch (error) {
    console.warn('Compression failed, using raw data:', error)
    const jsonString = JSON.stringify(data)
    const size = new Blob([jsonString]).size
    
    return {
      data: jsonString,
      compressed: false,
      originalSize: size,
      compressedSize: size,
      compressionRatio: 1
    }
  }
}

/**
 * Decompresses data with automatic format detection
 * Handles both compressed and uncompressed data gracefully
 */
export function decompressData<T>(compressedData: string, wasCompressed: boolean): DecompressionResult<T> {
  try {
    let jsonString: string
    
    if (wasCompressed) {
      // Attempt to decompress
      const decompressed = LZString.decompress(compressedData)
      if (!decompressed) {
        return {
          data: null,
          success: false,
          wasCompressed: true,
          error: 'Decompression failed'
        }
      }
      jsonString = decompressed
    } else {
      // Data is already raw JSON
      jsonString = compressedData
    }
    
    // Parse JSON
    const parsed = JSON.parse(jsonString) as T
    
    return {
      data: parsed,
      success: true,
      wasCompressed
    }
  } catch (error) {
    return {
      data: null,
      success: false,
      wasCompressed,
      error: error instanceof Error ? error.message : 'Unknown decompression error'
    }
  }
}

/**
 * Attempts to auto-detect if data is compressed and decompress accordingly
 * Useful for backward compatibility with existing cache entries
 */
export function smartDecompressData<T>(data: string): DecompressionResult<T> {
  // First, try to parse as raw JSON (backward compatibility)
  try {
    const parsed = JSON.parse(data) as T
    return {
      data: parsed,
      success: true,
      wasCompressed: false
    }
  } catch {
    // Not valid JSON, might be compressed
  }
  
  // Try to decompress
  try {
    const decompressed = LZString.decompress(data)
    if (decompressed) {
      const parsed = JSON.parse(decompressed) as T
      return {
        data: parsed,
        success: true,
        wasCompressed: true
      }
    }
  } catch (error) {
    return {
      data: null,
      success: false,
      wasCompressed: true,
      error: error instanceof Error ? error.message : 'Smart decompression failed'
    }
  }
  
  return {
    data: null,
    success: false,
    wasCompressed: false,
    error: 'Unable to parse data as JSON or compressed format'
  }
}

/**
 * Calculates the storage size of data in bytes
 */
export function calculateStorageSize(data: string): number {
  return new Blob([data]).size
}

/**
 * Formats bytes into human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Compression performance metrics
 */
export interface CompressionMetrics {
  totalCompressions: number
  totalDecompressions: number
  totalOriginalSize: number
  totalCompressedSize: number
  averageCompressionRatio: number
  compressionSuccessRate: number
  decompressionSuccessRate: number
}

class CompressionMetricsTracker {
  private metrics: CompressionMetrics = {
    totalCompressions: 0,
    totalDecompressions: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    averageCompressionRatio: 0,
    compressionSuccessRate: 0,
    decompressionSuccessRate: 0
  }
  
  private compressionSuccesses = 0
  private decompressionSuccesses = 0
  
  recordCompression(result: CompressionResult): void {
    this.metrics.totalCompressions++
    this.metrics.totalOriginalSize += result.originalSize
    this.metrics.totalCompressedSize += result.compressedSize
    
    if (result.compressed) {
      this.compressionSuccesses++
    }
    
    this.updateRatios()
  }
  
  recordDecompression(success: boolean): void {
    this.metrics.totalDecompressions++
    
    if (success) {
      this.decompressionSuccesses++
    }
    
    this.updateRatios()
  }
  
  private updateRatios(): void {
    this.metrics.averageCompressionRatio = 
      this.metrics.totalOriginalSize > 0 
        ? this.metrics.totalCompressedSize / this.metrics.totalOriginalSize 
        : 1
    
    this.metrics.compressionSuccessRate = 
      this.metrics.totalCompressions > 0 
        ? this.compressionSuccesses / this.metrics.totalCompressions 
        : 0
    
    this.metrics.decompressionSuccessRate = 
      this.metrics.totalDecompressions > 0 
        ? this.decompressionSuccesses / this.metrics.totalDecompressions 
        : 0
  }
  
  getMetrics(): CompressionMetrics {
    return { ...this.metrics }
  }
  
  reset(): void {
    this.metrics = {
      totalCompressions: 0,
      totalDecompressions: 0,
      totalOriginalSize: 0,
      totalCompressedSize: 0,
      averageCompressionRatio: 0,
      compressionSuccessRate: 0,
      decompressionSuccessRate: 0
    }
    this.compressionSuccesses = 0
    this.decompressionSuccesses = 0
  }
}

// Export singleton metrics tracker
export const compressionMetrics = new CompressionMetricsTracker()