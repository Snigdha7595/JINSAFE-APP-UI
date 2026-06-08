import React, { useState, useMemo } from 'react';
import './DisasterDropdown.css';

interface DisasterDropdownProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  allowCustom?: boolean;
}

export const DisasterDropdown: React.FC<DisasterDropdownProps> = ({ options, value, onChange, allowCustom = true }) => {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const lower = search.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(lower));
  }, [search, options]);

  const handleSelect = (opt: string) => {
    onChange(opt);
    setSearch('');
  };

  const handleCustom = () => {
    if (search.trim()) {
      onChange(search.trim());
      setSearch('');
    }
  };

  return (
    <div className="disaster-dropdown">
      <input
        type="text"
        placeholder="Search or type disaster..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleCustom();
          }
        }}
        className="search-input"
      />
      <ul className="options-list">
        {filtered.map((opt) => (
          <li key={opt} onClick={() => handleSelect(opt)} className="option-item">
            {opt}
          </li>
        ))}
        {allowCustom && search && !options.includes(search) && (
          <li onClick={handleCustom} className="option-item custom">
            Use "{search}"
          </li>
        )}
      </ul>
    </div>
  );
};
