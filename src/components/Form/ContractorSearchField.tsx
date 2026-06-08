"use client";

import React, { useCallback, useEffect } from "react";
import AsyncSelect from "react-select/async";
import debounce from "lodash.debounce";
import { useContractorSearch } from "@/hooks/useContractorSearch";

interface ContractorFieldProps {
  token: string;
  label?: string;
  value: string;
  onChange: (
    contractorName: string,
    extra?: {
      contractorCode?: string;
      contractorName?: string;
      contractorEmail?: string;
    }
  ) => void;
}

const ContractorSearchField: React.FC<ContractorFieldProps> = ({
  token,
  label,
  value,
  onChange,
}) => {
  const { handleSearch } = useContractorSearch(token);

  const loadOptions = useCallback(
    debounce((inputValue: string, callback: (opts: any[]) => void) => {
      if (!inputValue || inputValue.trim().length < 3) {
        callback([]);
        return;
      }

      handleSearch(inputValue)
        .then((options) => callback(options || []))
        .catch(() => callback([]));
    }, 400),
    [handleSearch]
  );

  useEffect(() => {
    return () => {
      (loadOptions as any)?.cancel?.();
    };
  }, [loadOptions]);

  const handleChange = (selected: any) => {
    if (!selected?.userData) {
      onChange("", {});
      return;
    }

    const c = selected.userData;

    onChange(c.contractorName, {
      contractorCode: c.contractorCode,
      contractorName: c.contractorName,
      contractorEmail: c.contractorEmail,
    });
  };

  return (
    <div className="row form_grider d1 align-items-center">
      <div className="col-md-9 py-2 mb-0">
        <AsyncSelect
          cacheOptions
          defaultOptions={false}
          isClearable
          placeholder="Search Name / Code"
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
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999,
              minWidth: "450px",
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

export default ContractorSearchField;