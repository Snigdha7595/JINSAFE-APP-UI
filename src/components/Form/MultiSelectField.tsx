import { useEffect, useState } from 'react';
import Select, { components, OptionProps } from 'react-select';

type SelectOption = {
  label: string;
  value: any;
  id?: any;
};

interface MultiSelectFieldProps {
  name: string;
  bgColor?: string;
  label: string;
  value: string | SelectOption[];
  options?: SelectOption[];
  onChange: (selected: string | SelectOption[], selectedIds?: string) => void;
  onBlur?: (e:any) => void;
  placeholder?: string;
  required?: boolean;
  cls?: string;
  errors?: any;
  touched?: any;
  disabled?: boolean;
  enableSelectAll?: boolean;
  selectAllLabel?: string;
  outputFormat?: 'string' | 'object';
}

const CheckboxOption = (props: OptionProps<SelectOption>) => {
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

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
    name,
    bgColor,
    label,
    value,
    options = [],
    onChange,
    onBlur,
    placeholder,
    required,
    errors,
    touched,
    cls,
    disabled,
    enableSelectAll = false,
    selectAllLabel = 'Select All',
    outputFormat = 'string',
}) => {
    const [selectOptions, setSelectOptions] = useState<SelectOption[]>([]);
    const [isSelectAllSelected, setIsSelectAllSelected] = useState(false);
  //   useEffect(() => {
  //   setSelectOptions(
  //     enableSelectAll 
  //       ? [{ value: 'select_all', label: selectAllLabel, id: 'select_all' }, ...options] 
  //       : options
  //   );
  // }, [options, enableSelectAll]);

  useEffect(() => {
    const newOptions = enableSelectAll
      ? [{ value: 'select_all', label: selectAllLabel, id: 'select_all' }, ...(options ?? [])]
      : options ?? [];

    const hasChanged =
      newOptions.length !== selectOptions.length ||
      newOptions.some((opt, idx) => opt.value !== selectOptions[idx]?.value);

    if (hasChanged) {
      setSelectOptions(newOptions);
    }
  }, [options, enableSelectAll, selectAllLabel]);

    const getSelectedOptions = (): SelectOption[] => {
    if (!value) return [];
    
    if (typeof value === 'string') {
      const selectedValues = value.split(',').map(v => v.trim());
      return options?.filter(option => selectedValues.includes(option.value)) ?? [];
    }
    
    return value;
  };

  const handleChange = (selectedOptions: readonly SelectOption[] | null) => {
    if (!selectedOptions) {
      onChange(outputFormat === 'string' ? '' : []);
      return;
    }

    const selectAllOption = selectedOptions.find(opt => opt.value === 'select_all');
    
    if (enableSelectAll && selectAllOption) {
      if (isSelectAllSelected) {
        // Deselect all
        onChange(outputFormat === 'string' ? '' : []);
        setIsSelectAllSelected(false);
      } else {
        // Select all except the "Select All" option
        const allOptions = options ?? [];
        if (outputFormat === 'string') {
          const labels = allOptions.map(opt => opt.value).join(', ');
          const ids = allOptions.some(opt => 'id' in opt) 
            ? allOptions.map(opt => opt.id).join(',')
            : undefined;
          onChange(labels, ids);
        } else {
          onChange(allOptions);
        }
        setIsSelectAllSelected(true);
      }
      return;
    }

    // Normal selection handling
    const filteredOptions = selectedOptions.filter(opt => opt.value !== 'select_all');
    setIsSelectAllSelected(false);

    if (outputFormat === 'string') {
      const labels = filteredOptions.map(opt => opt.value).join(', ');
      const ids = filteredOptions.some(opt => 'id' in opt) 
        ? filteredOptions.map(opt => opt.id).join(',')
        : undefined;
      onChange(labels, ids);
    } else {
      onChange(filteredOptions);
    }
  };

    return (
        <div className={`form_grider_wrap ${disabled ? 'hasDisabled' : ''} ${cls}`}>
        {label && <label className="form_grider_wrap_label">{label}{required && <span className="text-danger"> *</span>}</label>}
      <Select
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: `${bgColor} !important`
          })
        }}
        isMulti
        className="form_grider_wrap_field select_field multi"
        classNamePrefix="react-select"
        name={name}
        required={required}
        value={getSelectedOptions()}
        options={selectOptions}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder || 'Select...'}
        isDisabled={disabled}
        closeMenuOnSelect={false}
        components={{ Option: CheckboxOption }}
        getOptionValue={option => option.value}
      />
      {touched && errors && (
        <div className="text-danger">{errors}</div>
      )}
    </div>
  );
};

export default MultiSelectField;