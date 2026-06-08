import { ChangeEvent, FC } from 'react';
interface InputProps {
  type: 'text';
  label?: string;
  value: string | number;
  name: string;
  placeholder: string;
  errors?: string;
  touched?: boolean | undefined;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: any;
  reference?: any;
}

const SearchInputField: FC<InputProps> = ({
  type,
  label,
  value,
  name,
  touched,
  placeholder,
  errors,
  disabled,
  maxLength,
  minLength,
  onChange,
  onBlur,
  onKeyDown,
  reference,
}) => {
  return (
    <>
      <div
        className={`form_grider_wrap ${errors && touched ? 'hasError' : ''}`}
      >
        {label && <label className="form_grider_wrap_label">{label}</label>}
        <input
          type={type}
          id={label}
          value={value}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          className="form_grider_wrap_field"
          onKeyDown={onKeyDown}
          ref={reference}
          autoComplete="off"
        />
        <div className='form_grider_wrap_svg'>
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_1249_14408)">
              <mask
                id="mask0_1249_14408"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="22"
                height="22"
              >
                <path d="M22 0H0V22H22V0Z" fill="white" />
              </mask>
              <g mask="url(#mask0_1249_14408)">
                <path d="M22 0H0V22H22V0Z" fill="transparent" />
                <path
                  d="M9.62508 15.5834C12.9158 15.5834 15.5834 12.9158 15.5834 9.62508C15.5834 6.33438 12.9158 3.66675 9.62508 3.66675C6.33438 3.66675 3.66675 6.33438 3.66675 9.62508C3.66675 12.9158 6.33438 15.5834 9.62508 15.5834Z"
                  stroke="#666666"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.0091 18.6574C18.1881 18.8363 18.4784 18.8363 18.6574 18.6574C18.8363 18.4784 18.8363 18.1881 18.6574 18.0091L18.0091 18.6574ZM18.6574 18.0091L14.074 13.4258L13.4258 14.074L18.0091 18.6574L18.6574 18.0091Z"
                  fill="#333333"
                />
              </g>
            </g>
            <defs>
              <clipPath id="clip0_1249_14408">
                <rect width="22" height="22" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        {errors && touched ? (
          <p className="form_grider_wrap_helper">{errors}</p>
        ) : null}
      </div>
    </>
  );
};

export default SearchInputField;
