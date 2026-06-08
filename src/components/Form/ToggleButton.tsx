import React, { FC } from "react";

interface ToggleButtonProps {
  label?: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  theme?: "primary" | "secondary" | "accent";
  customColor?: string; // ✅ Custom color support (HEX or named)
  noLabel?: string;
  yesLabel?: string;
}

const ToggleButton: FC<ToggleButtonProps> = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  theme = "primary",
  customColor,
  noLabel = "No",
  yesLabel = "Yes",
}) => {
  const themeColor: Record<string, string> = {
    primary: "#0d6efd",
    secondary: "#6c757d",
    accent: "#6610f2",
  };

  // ✅ Use customColor if provided, otherwise use themeColor
  const trackColor = checked ? customColor || themeColor[theme] : "#ccc";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            marginBottom: "4px",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#636466",
            userSelect: "none",
          }}
        >
          {label}
        </label>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "0.8rem", color: "#6c757d" }}>{noLabel}</span>

        <label
          htmlFor={name}
          style={{
            position: "relative",
            width: "48px",
            height: "26px",
            borderRadius: "50px",
            backgroundColor: trackColor,
            transition: "background-color 0.3s ease-in-out",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            style={{
              opacity: 0,
              width: 0,
              height: 0,
              position: "absolute",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: "3px",
              left: checked ? "24px" : "3px",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "#fff",
              transition: "left 0.3s ease-in-out",
            }}
          />
        </label>

        <span style={{ fontSize: "0.8rem", color: "#6c757d" }}>{yesLabel}</span>
      </div>
    </div>
  );
};

export default ToggleButton;
