import React from 'react';
import { ChangeEvent, FC } from 'react';
import Select, { components } from 'react-select';

interface InputProps {
  label?: string;
  value: any;
  required?: boolean;
  name: string;
  placeholder: string;
  errors?: any;
  reference?: any;
  touched?: any;
  options: any;
  disabled?: boolean;
  onChange: any;
  defaultValue?: any;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  cls?: string;
  disableText?:string;
}

const SelectField: FC<InputProps> = ({
  label,
  required,
  name,
  errors,
  touched,
  options,
  placeholder,
  disabled,
  onChange,
  onBlur,
  reference,
  defaultValue,
  value,
  cls,
  disableText
}) => {
  return (
    <>
      <div
        className={`form_grider_wrap ${disabled ? 'hasDisabled' : ''} ${cls}`}
      >
        {label && <label className="form_grider_wrap_label">{label} {required && <span className="text-danger">*</span>}</label>}

        <Select
          ref={reference}
          value={value}
          required={required}
          name={name}
          className="form_grider_wrap_field select_field"
          classNamePrefix="react-select"
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          options={options}
          defaultValue={defaultValue}
          isDisabled={disabled}
          isSearchable
        />
        {errors && touched ? (
          <p className="form_grider_wrap_helper text-danger">{errors}</p>
        ) : null}
        {disableText != '' ? <p className="form_grider_wrap_helper">{disableText}</p> : ''}
      </div>
    </>
  );
};

export default SelectField;
