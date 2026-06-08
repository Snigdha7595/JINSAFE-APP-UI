import { FC } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface InputProps {
  label?: string;
  required?: boolean;
  name: string;
  errors?: any;
  touched?: any;
  value?: Date | null;
  minDate?: Date | null;
  maxDate?: Date | null;
  onChange: (date: Date | null) => void;
  onBlur?: (e:any) => void;
  placeholder: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  showTimeSelectOnly?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
  timeCaption?: string;
  referenceDate?: Date | null;
}

const DatePickerField: FC<InputProps> = ({
  label,
  required,
  name,
  errors,
  touched,
  value,
  minDate,
  maxDate,
  placeholder,
  onChange,
  onBlur,
  disabled,
  dateFormat = "yyyy-MM-dd",
  showTimeSelect = false,
  showTimeSelectOnly = false,
  timeFormat = "HH:mm",
  timeIntervals = 15,
  timeCaption = "Time",
  referenceDate,
}) => {
  const getEffectiveFormat = () => {
    if (showTimeSelectOnly) return timeFormat;
    if (showTimeSelect) return `${dateFormat} ${timeFormat}`;
    return dateFormat;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const now = new Date();

    if (showTimeSelectOnly && value && referenceDate instanceof Date) {
      const isToday = referenceDate.toDateString() === now.toDateString();

      const selectedTime = value.getHours() * 60 + value.getMinutes();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      // If selected time is in the future, reset to now
      if (isToday && selectedTime > currentTime) {
        onChange(now); // Reset time
      }
    }

    onBlur?.(e); // Call user's blur if provided
  };

  const shouldApplyTimeLimits =
    showTimeSelectOnly &&
    referenceDate instanceof Date &&
    referenceDate.toDateString() === new Date().toDateString();

  const safeMinTime = shouldApplyTimeLimits
    ? new Date(new Date().setHours(0, 0, 0, 0))
    : undefined;
  const safeMaxTime = shouldApplyTimeLimits ? new Date() : undefined;

  return (
    <div className={`form_grider_wrap`}>
      {label && <label className="form_grider_wrap_label">{label} {required && <span className="text-danger">*</span>}</label>}
      <DatePicker
        className="form_grider_wrap_field"
        selected={value || null}
        onChange={onChange}
        onBlur={handleBlur}
        name={name}
        minDate={minDate}
        maxDate={maxDate}
        {...(shouldApplyTimeLimits ? { minTime: safeMinTime, maxTime: safeMaxTime } : {})}
        placeholderText={placeholder}
        disabled={disabled}
        autoComplete="off"
        showTimeSelect={showTimeSelect}
        showTimeSelectOnly={showTimeSelectOnly}
        dateFormat={getEffectiveFormat()}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        timeCaption={timeCaption}
      />
      {errors && touched && (
        <p className="form_grider_wrap_helper text-danger">{errors}</p>
      )}
    </div>
  );
};

export default DatePickerField;
