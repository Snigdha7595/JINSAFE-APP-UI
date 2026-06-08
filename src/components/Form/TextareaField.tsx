import { ChangeEvent, FC } from "react";
import { handleCopyPaste } from "@/config/globalUtils";

interface InputProps {
  label?: string;
  name: string;
  required?: boolean;
  placeholder: string;
  errors?: any;
  touched?: any;
  disabled?: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  reference?: React.RefObject<HTMLTextAreaElement>;
  value: any;
  maxLength?: number;
  onKeyDown?: any;
  customClass?: string; // ✅ New
  rows?: number;
}

const TextareaField: FC<InputProps> = ({
  label,
  required,
  name,
  touched,
  placeholder,
  errors,
  disabled,
  reference,
  onChange,
  onBlur,
  value,
  maxLength,
  onKeyDown,
  customClass,
  rows,
}) => {
  return (
    <div className="form_grider_wrap">
      {label && <label className="form_grider_wrap_label">{label} {required &&<span className="text-danger">*</span>}</label>}
      <textarea
        id={label}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        rows={rows} // ✅ Set rows
        className={`form_grider_wrap_field textarea w-100 ${customClass || ""}`} // ✅ Width 100 + custom class
      ></textarea>
      {errors && touched ? (
        <p className="form_grider_wrap_helper text-danger">{errors}</p>
      ) : null}
    </div>
  );
};

export default TextareaField;
