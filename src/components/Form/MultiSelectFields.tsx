import React, { ChangeEvent, FC, useEffect, useState } from 'react';
import Select, { components, OptionProps } from 'react-select';

interface InputProps {
  label?: string;
  value: any;
  name: string;
  placeholder: string;
  errors?: any;
  reference?: any;
  touched?: any;
  options: any[];
  disabled?: boolean;
  onChange: (selectedOptions: any[]) => void;
  defaultValue?: any;
  onBlur: (e: ChangeEvent<HTMLInputElement>) => void;
  cls?: string;
  isMulti?: boolean;
  enableSelectAll?: boolean; // NEW PROP
}

// ✅ Custom option with checkbox rendering
const CheckboxOption = (props: OptionProps<any>) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        style={{ marginRight: 8 }}
      />
      {props.label}
    </components.Option>
  );
};

const MultiSelectField: FC<InputProps> = ({
  label,
  name,
  errors,
  touched,
  options,
  value,
  placeholder,
  disabled,
  onChange,
  onBlur,
  reference,
  defaultValue,
  cls,
  isMulti = true,
  enableSelectAll = false,
}) => {
  const [selectOptions, setSelectOptions] = useState<any[]>([]);

  useEffect(() => {
    setSelectOptions(
      enableSelectAll
        ? [{ value: 'select_all', label: 'Select All' }, ...options]
        : [...options]
    );
  }, [options, enableSelectAll]);

  const handleSelectChange = (selected: any) => {
    if (!selected) {
      onChange([]);
      return;
    }

    if (enableSelectAll) {
      const isSelectAllSelected = selected.some(
        (option: any) => option.value === 'select_all'
      );

      if (isSelectAllSelected) {
        const allOptionsExceptSelectAll = selectOptions.slice(1);
        onChange(allOptionsExceptSelectAll);
        return;
      }

      const filteredOptions = selected.filter(
        (option: any) => option.value !== 'select_all'
      );
      onChange(filteredOptions);
    } else {
      onChange(selected);
    }
  };

  return (
    <div
      className={`form_grider_wrap ${errors && touched ? 'hasError' : ''} ${disabled ? 'hasDisabled' : ''} ${cls}`}
    >
      {label && <label className="form_grider_wrap_label">{label}</label>}

      <Select
        ref={reference}
        className="form_grider_wrap_field select_field multi"
        classNamePrefix="react-select"
        placeholder={placeholder}
        onChange={handleSelectChange}
        options={selectOptions}
        value={value}
        isDisabled={disabled}
        closeMenuOnSelect={false}
        isMulti={isMulti}
        components={{ Option: CheckboxOption }}
        name={name}
        onBlur={onBlur}
      />

      {errors && touched ? (
        <p className="form_grider_wrap_helper">{errors}</p>
      ) : null}
    </div>
  );
};

export default MultiSelectField;
