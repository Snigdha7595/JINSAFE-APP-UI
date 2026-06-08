import React, { useRef, useEffect } from "react";
import SelectField from "./SelectFields";
import { SelectOptions } from "../interfaces";
import MultiSelectField from "./MultiSelectField";
import { FormikProps } from "formik";
import dayjs from "dayjs";
import Image from "next/image"

interface InjuryDetail {
  employeeType: string;
  employeeId: string;
  injuredName: string;
  gender: string;
  address: string;
  designation: string;
  jobType: string;
  flagInjuryId: number;
  nameOfEmployer: string;
  bodyParts: string;
  natureOfInjuries: string;
  incidentLastDate: string;
  bodyPartList: {
    bodyPart: string;
    employeeId: string;
    createdAt: string;
    createdBy: string;
    natureOfInjury: string;
    flagInjuryId: number;
    rowIndex: number;
  }[];
}

interface ImmediateAction {
  actiontaken: string;              
  createdat: string;                
  createdby: string;                
  updatedat: string;                
  updatedby: string;                
  assignLinemanager: string;        
  linemanagerName: string;          
  targetdate: string;               
  sections: string;                 
  departments: string;              
  sectionhead: string;              
  imSubmoduleName: string;          
  units: string;                    
  departmentHodName: string;        
  flagId: string;                   
  responsibleDepartmentName: string;
  responsibleSectionName: string;   
  findingFlag: number;              
  status?: string;
}

interface FormValues {
  objectId: string | null;
  pirId: string | null;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
  unitId: string;
  unitName: string;
  departmentId: string;
  departmentName: string;
  sectionId: string;
  sectionName: string;
  exactLocation: string;
  incidentDate: string;
  incidentTime: string;
  tier: string;
  lineManager: string;
  sectionHead: string;
  departmentHod: string;
  incidentClassification: string;
  incidentCategory: string;
  personInjured: string;
  remark: string;
  createdByUserRole: string;
  injuryHappened: string;
  whatHappened: string;
  preliminaryFindings: string;
  hipoCase: string;
  images: Array<{
    fileName: string;
    fileSize: string;
  }>;
  injuries: InjuryDetail[];
  immediateActions: ImmediateAction[];
  designationId: string;
  designationName: string;
}

interface TableRow {
  bodyPart: SelectOptions | null;
  injuryNature: SelectOptions[];
  isOpen: boolean;
}

interface MultiSelectProps {
  disabled?: boolean;
  injuredBodyParts?: any;
  setInjuredBodyParts?: any;
  injuryNature?: any;
  setInjuryNature?: any;
  bodyPartOptions: SelectOptions[];
  injuryNatureOptions: SelectOptions[];
  formik?: FormikProps<FormValues>;
  currentInjuryIndex: number;
  onClose: () => void;
  rows: TableRow[];
  setRows: React.Dispatch<React.SetStateAction<TableRow[]>>;
  values: any;
  setFieldValue: any;
}

const MultiSelectTableForm = ({ disabled, bodyPartOptions, injuryNatureOptions, injuredBodyParts, setInjuryNature, injuryNature, setInjuredBodyParts, values, setFieldValue, currentInjuryIndex, onClose, rows, setRows}: MultiSelectProps) => {
  const dropdownRefs = useRef<(HTMLTableCellElement | null)[]>([]);

  const flagInjuryId = useRef(currentInjuryIndex === -1 ? Date.now() : 
    values.injuries[currentInjuryIndex]?.bodyPartList?.[0]?.flagInjuryId || Date.now()
  ).current;

  useEffect(() => {
    const injuryDetail = values.injuries[currentInjuryIndex] || {};
    
    const updatedInjuryDetail = {
      ...injuryDetail,
      bodyParts: rows?.map(row => row?.bodyPart?.label).filter(Boolean).join(", "),
      natureOfInjuries: rows
        .map(row => row.injuryNature.map(nature => nature.label).join(", "))
        .filter(Boolean)
        .join(", "),
      bodyPartList: rows.map((row, index) => ({
        bodyPart: row.bodyPart?.label || "",
        employeeId: injuryDetail.employeeId || "",
        createdAt: injuryDetail?.createdAt || dayjs().toISOString(),
        createdBy: injuryDetail?.createdBy || "",
        natureOfInjury: row.injuryNature.map(nature => nature.label).join(", "),
        flagInjuryId: flagInjuryId,
        rowIndex: index
      }))
    };

    const newInjuries = [...values.injuries];
    newInjuries[currentInjuryIndex] = updatedInjuryDetail;
    setFieldValue("injuries", newInjuries);
  }, [rows, flagInjuryId]);


  const handleClickOutside = (event: MouseEvent) => {
    dropdownRefs.current.forEach((ref, index) => {
      if (ref && !ref.contains(event.target as Node)) {
        setRows(prevRows =>
          prevRows.map((row, i) => (i === index ? { ...row, isOpen: false } : row))
        );
      }
    });
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addRow = () => {
    setRows([...rows, { bodyPart: null, injuryNature: [], isOpen: false }]);
  };

  const deleteRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const updateBodyPart = (index: number, value: SelectOptions | null) => {
    setRows(prevRows => prevRows.map((row, i) => i === index ? { ...row, bodyPart: value } : row));
  };

  const updateInjuryNature = (index: number, value: SelectOptions[]) => {
    setRows(prevRows => prevRows.map((row, i) => i === index ? { ...row, injuryNature: value } : row ));
  };

  return (
    <div className="w-full">
      <table className="w-100 bg-white border border-gray-300 rounded">
        <thead className="bg-gray-bg-light">
          <tr>
            <th className="text-left px-4 py-2 border">Body Part</th>
            <th className="text-left px-4 py-2 border">Nature of Injury</th>
            <th className="text-center px-4 py-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="px-4 py-2 border">
                <SelectField
                  label="Body Part(s) Injured"
                  value={row?.bodyPart}
                  disabled={disabled}
                  name={`bodyPart-${index}`}
                  placeholder=""
                  options={bodyPartOptions}
                  onChange={(value: SelectOptions | null) => {                  
                    updateBodyPart(index, value);
                  }}
                  onBlur={() => {}}
                />
              </td>
              <td>
                <MultiSelectField
                  label="Nature of Injury"
                  value={row?.injuryNature}
                  disabled={disabled}
                  name={`injuryNature-${index}`}
                  placeholder="Select"
                  options={injuryNatureOptions}
                  selectAllLabel="Select All"
                  onChange={(output, ids) => {
                    updateInjuryNature(index, output as SelectOptions[]);
                  }}
                  outputFormat="object"
                  onBlur={() => {}}
                  enableSelectAll={true}
              />
              </td>
              <td className="px-4 py-2 border text-center">
                <div className="flex justify-center items-center gap-x-2">
                  {index === rows.length - 1 && (
                    <button
                      type="button"
                      onClick={addRow}
                      disabled={disabled}
                      className="green hover:bg-green-600 text-white font-bold py-1 px-3 rounded-full shadow-sm transition-all duration-200"
                      title="Add Row"
                    >
                      <span className="text-white text-xl">
                        <Image
                          width={15}
                          height={15}
                          alt="Add"
                          src="/images/svg/add-icon.svg"
                          className="img-fluid u-image"
                        />
                      </span>
                    </button>
                  )}
                  {rows.length > 1 && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => deleteRow(index)}
                      className="green hover:bg-red-600 text-white font-bold py-1 px-3 rounded-full shadow-sm transition-all duration-200"
                      title="Delete Row"
                    >
                      <span className="text-white text-xl">
                        <Image
                          width={15}
                          height={15}
                          alt="Delete"
                          src="/images/svg/delete-icon.svg"
                          className="img-fluid u-image"
                        />
                      </span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MultiSelectTableForm;