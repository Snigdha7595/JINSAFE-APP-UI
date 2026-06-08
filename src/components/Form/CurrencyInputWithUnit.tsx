// components/Form/CurrencyInputWithUnit.tsx
import React, { useState, useEffect } from 'react';

interface CurrencyInputWithUnitProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: (e: any) => void;
  touched?: boolean;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const unitOptions = [
  { value: "1", label: "(₹)" },
  { value: "1000", label: "Thousand (K)" },
  { value: "100000", label: "Lakh (L)" },
  { value: "10000000", label: "Crore (Cr)" },
];

const CurrencyInputWithUnit: React.FC<CurrencyInputWithUnitProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  touched,
  error,
  placeholder,
  disabled = false,
  required = false,
}) => {
  // Get the stored value (always in rupees)
  const storedValue = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
  
  // State for display value and selected unit
  const [displayValue, setDisplayValue] = useState<string>("");
  const [selectedUnit, setSelectedUnit] = useState<string>("1");

  // When component loads or stored value changes
  useEffect(() => {
    if (storedValue > 0) {
      const multiplier = parseFloat(selectedUnit);
      // Calculate display value by dividing, but check if it's a whole number
      const calculatedValue = storedValue / multiplier;
      
      // Check if it's a whole number (no decimal)
      if (Number.isInteger(calculatedValue)) {
        setDisplayValue(calculatedValue.toString());
      } else {
        // If not whole number, find the best unit or just show as is
        // Try to find a unit that makes it whole
        let bestUnit = selectedUnit;
        let bestValue = calculatedValue;
        
        for (const unit of unitOptions) {
          const unitMultiplier = parseFloat(unit.value);
          const testValue = storedValue / unitMultiplier;
          if (Number.isInteger(testValue)) {
            bestUnit = unit.value;
            bestValue = testValue;
            break;
          }
        }
        
        if (bestUnit !== selectedUnit) {
          setSelectedUnit(bestUnit);
        }
        setDisplayValue(bestValue.toString());
      }
    } else {
      setDisplayValue("");
    }
  }, [storedValue]);

  

 

  // Handle user input (they enter face value)
  const handleDisplayValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayValue = e.target.value;
    setDisplayValue(newDisplayValue);
    
    // Convert to rupees by MULTIPLYING with the unit multiplier
    const multiplier = parseFloat(selectedUnit);
    const numericValue = parseFloat(newDisplayValue);
    
    if (!isNaN(numericValue) && numericValue > 0) {
      const actualValue = numericValue * multiplier;
      onChange(Math.floor(actualValue).toString()); // Always store as integer
    } else {
      onChange("");
    }
  };

  // Handle unit change
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMultiplier = parseFloat(e.target.value);
    const currentDisplayValue = parseFloat(displayValue);
    
    if (!isNaN(currentDisplayValue) && currentDisplayValue > 0) {
      // Calculate new actual value based on current display value and new multiplier
      const newActualValue = currentDisplayValue * newMultiplier;
      onChange(Math.floor(newActualValue).toString());
      setSelectedUnit(e.target.value);
      // Display value stays the same (user entered number doesn't change)
    } else {
      setSelectedUnit(e.target.value);
    }
  };

  return (
    <div className="currency-input-wrapper">
      <label className="form-label">
        {label} 
      </label>
      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <div style={{ flex: 2 }}>
          <input
            type="number"
            className={`form-control ${touched && error ? 'is-invalid' : ''}`}
            value={displayValue}
            onChange={handleDisplayValueChange}
            onBlur={onBlur}
            placeholder={placeholder || "Enter amount"}
            step="1"
            disabled={disabled}
          />
          {touched && error && <div className="invalid-feedback">{error}</div>}
        </div>
        <div style={{ flex: 1 }}>
          <select
            className="form-select"
            value={selectedUnit}
            onChange={handleUnitChange}
            disabled={disabled}
          >
            {unitOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
    {/* {storedValue > 0 && (
        <small className="text-muted" style={{ display: 'block', marginTop: '5px' }}>
          Actual Value: ₹{storedValue.toLocaleString('en-IN')}
        </small>
      )} */}
    </div>
  );
};

export default CurrencyInputWithUnit;