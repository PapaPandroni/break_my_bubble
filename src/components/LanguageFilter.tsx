interface LanguageFilterProps {
  languages: string[];
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function LanguageFilter({
  languages,
  selectedLanguage,
  onLanguageChange,
}: LanguageFilterProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Language
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Select a language to filter the articles.
        </p>
      </div>

      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {languages.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>
    </div>
  );
}