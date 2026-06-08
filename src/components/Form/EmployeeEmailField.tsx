"use client";

import React, { useCallback, useEffect } from "react";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import { useEmployeeEmailSearch } from "@/hooks/useEmployeeEmailSearch";
import { toast } from "react-toastify";

interface EmployeeEmailFieldProps {
  token: string;
  label?: string;
  value: string;
  onChange: (email: string, extra?: { empName?: string; jsplid?: string }) => void;
}

const EmployeeEmailField: React.FC<EmployeeEmailFieldProps> = ({
  token,
  label,
  value,
  onChange,
}) => {
  const { handleSearch } = useEmployeeEmailSearch(token);

  const loadOptions = useCallback(
    debounce(
      (inputValue: string, callback: (opts: any[]) => void) => {
        if (!inputValue || inputValue.trim().length < 3) {
          callback([]);
          return;
        }

        handleSearch(inputValue)
          .then((opts: any[]) => {
            callback(opts || []);
          })
          .catch((err: any) => {
            console.error("Error in loadOptions:", err);
            callback([]);
          });
      },
      400
    ),
    [handleSearch]
  );

  useEffect(() => {
    return () => {
      if (loadOptions && (loadOptions as any).cancel) {
        try {
          (loadOptions as any).cancel();
        } catch (e) {}
      }
    };
  }, [loadOptions]);

  const handleChange = (selectedOption: any) => {
    if (selectedOption?.userData) {
      onChange(selectedOption.value, {
        empName: selectedOption.userData.empName || "",
        jsplid: selectedOption.userData.jsplid || "",
      });
    } else {
      onChange(selectedOption?.value || "", {
        empName: "",
        jsplid: "",
      });
    }
  };

  return (
    <div className="row form_grider d1 align-items-center">
      {/* <div className="col-md-2 py-2">
        <label className="form-label mb-1">{label}:</label>
      </div> */}

      <div className="col-md-9 py-2 mb-0">
        <AsyncSelect
          cacheOptions
          defaultOptions
          isClearable
          placeholder={`Search Email`}
          loadOptions={loadOptions}
          onChange={handleChange}
          value={
            value
              ? {
                  label: value,
                  value: value,
                }
              : null
          }
          className="form_grider_wrap_field select_field"
          classNamePrefix="react-select"
          styles={{
            control: (base) => ({
              ...base,
              minHeight: "40px",
              width: "135%", 
              borderColor: "#1f1d1dff",
              boxShadow: "none",
              "&:hover": { borderColor: "#b3b3b3" },
            }),
           menu: (base) => ({
            ...base,
            zIndex: 9999,
            width: "120%",
            minWidth: "400px"
            }),
            menuList: (base) => ({
                ...base,
                maxHeight: "320px", 
            }),
          }}
        />
      </div>
    </div>
  );
};

export default EmployeeEmailField;