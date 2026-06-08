"use client";
import React from "react";
import CreatableSelect from "react-select/creatable";

interface CreatableSelectFieldProps {
  name: string;
  label?: string;
  value: string;
  placeholder?: string;
  options: { value: string; label: string; userData?: any }[];
  isLoading?: boolean;
  onChange: (option: any) => void;
  onInputChange?: (value: string) => void;
  onBlur?: (e: any) => void;
  error?: string;
  touched?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
}

const CreatableSelectField: React.FC<CreatableSelectFieldProps> = ({
  name,
  label,
  value,
  placeholder,
  options,
  isLoading = false,
  onChange,
  onInputChange,
  onBlur,
  error,
  touched,
  isClearable = true,
  isSearchable = true,
}) => {
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={name} className="form-label mb-1">
          {label}
        </label>
      )}
      <CreatableSelect
        inputId={name}
        name={name}
        placeholder={placeholder}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isLoading={isLoading}
        options={options}
        onChange={onChange}
        onInputChange={onInputChange}
        onBlur={onBlur}
        value={value ? { value, label: value } : null}
        formatCreateLabel={(inputValue) => `Use "${inputValue}"`}
      />
      {error && touched && (
        <div className="text-danger mt-1" style={{ fontSize: "0.85rem" }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default CreatableSelectField;