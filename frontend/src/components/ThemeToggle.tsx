import React from 'react';
import { Theme } from '../hooks/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <div className="theme-toggle-wrapper">
      <label className="theme-switch">
        <input
          type="checkbox"
          checked={theme === 'light'}
          onChange={onToggle}
          aria-label="Toggle theme"
        />
        <span className="theme-slider"></span>
      </label>
    </div>
  );
};

export default ThemeToggle;
