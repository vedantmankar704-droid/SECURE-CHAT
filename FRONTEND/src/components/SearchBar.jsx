import { Search } from 'lucide-react';

const SearchBar = ({ placeholder = "Search conversations...", value, onChange }) => {
  return (
    <div className="relative">
      <Search
        size={18}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-500"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-full outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
      />
    </div>
  );
};

export default SearchBar;
