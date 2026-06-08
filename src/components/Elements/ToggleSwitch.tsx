"use client";
import React from "react";

type ToggleSwitchProps = {
  label?: string;
  value: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean; // ✅ new prop
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  value,
  onChange,
  disabled = false, // ✅ default to false
}) => {
  return (
    <div className="toggle-wrapper">
      {label && <label className="toggle-label">{label}</label>}
      <div
        className={`toggle-switch ${value ? "on" : ""} ${disabled ? "disabled" : ""}`} // ✅ add disabled class
        onClick={() => {
          if (!disabled) onChange(!value); // ✅ prevent toggle when disabled
        }}
      >
        <div className="toggle-circle" />
        <span className="toggle-text">{value ? "Yes" : "No"}</span>
      </div>
    </div>
  );
};

export default ToggleSwitch;