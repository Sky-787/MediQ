import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
