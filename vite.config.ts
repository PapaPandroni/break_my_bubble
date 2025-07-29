import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import analyzer from 'rollup-plugin-analyzer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - only run when ANALYZE=true
    ...(process.env.ANALYZE ? [analyzer({ summaryOnly: true })] : [])
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  build: {
    // Enable chunk splitting for better caching
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: {
          // Vendor chunks - separate by usage frequency
          'react-vendor': ['react', 'react-dom'],
          
          // Heavy components - loaded only when needed
          'topic-modal': ['./src/components/TopicSelectionModal.tsx'],
          'results-display': ['./src/components/ResultsDisplay.tsx'],
          
          // Large data files - split into separate chunks
          'data-sources': ['./src/data/newsSources.ts'],
          'data-topics': ['./src/data/topics.ts'],
          'data-keywords': ['./src/data/multiLanguageKeywords.ts'],
          
          // Services - business logic separation
          'api-services': [
            './src/services/newsApiService.ts',
            './src/services/unifiedSourceService.ts',
            './src/services/filterService.ts'
          ],
          
          // Complex selectors that are used in multiple places
          'selectors': [
            './src/components/CountrySelector.tsx',
            './src/components/LanguageSelector.tsx',
            './src/components/DateRangePicker.tsx'
          ]
        },
        
        // Configure chunk file naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            // Create meaningful chunk names based on content
            if (facadeModuleId.includes('data/')) {
              return 'chunks/data-[name]-[hash].js'
            }
            if (facadeModuleId.includes('components/')) {
              return 'chunks/components-[name]-[hash].js'
            }
            if (facadeModuleId.includes('services/')) {
              return 'chunks/services-[name]-[hash].js'
            }
          }
          return 'chunks/[name]-[hash].js'
        },
        
        // Optimize entry chunk naming
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // Chunk size warnings - help identify large chunks
    chunkSizeWarningLimit: 500, // 500kb warning threshold
    
    // Enable source maps for debugging in production
    sourcemap: false, // Disable for smaller bundle size
    
    // Minification and compression settings
    minify: 'esbuild', // Use esbuild instead of terser for faster builds
    
    // Target modern browsers for smaller bundles
    target: 'es2020',
  },
  
  // Development optimizations
  optimizeDeps: {
    // Include dependencies that should be pre-bundled
    include: [
      'react',
      'react-dom',
    ],
    // Exclude large dependencies from pre-bundling to enable lazy loading
    exclude: [
      // These will be loaded dynamically
    ],
  },
})