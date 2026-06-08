'use client';
import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import dayjs from 'dayjs';

import SelectField from "@/components/Form/SelectFields";
import { SelectOptions } from "@/components/interfaces";
import DatePickerField from "@/components/Form/DatePickerField";
import InputField from "@/components/Form/InputField";

import {emptySelector} from "@/config/config";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_SECTIONS, FETCH_LINEMANAGER } from "@/config/apiConfig";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";

interface UnitDataInterface {
    unitId: string;
    departmentId: string;
    sectionId: string;
    exactLocation: string;
    incidentDate: string;
    incidentTime: string;
    departmentHod: string;
    lineManager: string;
};
interface DepartmentData {
  createdAt: string;
  departmentid: number;
  departmentname: string;
  hod: string;
  hodEmail: string;
  jsplid: string;
  lwUpdatedAt: string;
  monthlyScheduleCfsa: number;
  monthlyScheduleLw: number;
  monthlyScheduleSi: number;
  rowIndex: number;
  siUpdatedAt: string;
  status: "active" | "inactive";
  statusImage: string;
  unitid: number;
  updatedAt: string;
  weeklyScheduleLw: number;
  weeklyScheduleSi: number;
}

interface SectionData {
  departmentid: number;
  id: number;
  rowIndex: number;
  sectionid: string;
  sectionname: string;
  status: "active" | "inactive" | string;
  statusImage: string;
  unitid: number;
}

interface LineManagerData {
  unitid: string;
  departmentid: number;
  sectionid: string;
  sectionhead: "TRUE" | "FALSE" | string;
  linemanagerName: string;
  id: number;
  sectionname: string;
  rowIndex: number;
  linemanagerEmail: string;
  jsplid: string;
  status: "active" | "inactive" | string;
  createdat: string;
  updatedat: string;
}
interface UnitDetailsInterface {
  readOnly?: boolean;
  isUpdateMode?: boolean;
  unitData: any;
  saData: any;
  setSaData: React.Dispatch<React.SetStateAction<any>>;
  setUnitData: React.Dispatch<React.SetStateAction<any>>;
  currentStatus:number;
  setCurrentStatus:React.Dispatch<React.SetStateAction<number>>;
  setOpenSection:React.Dispatch<React.SetStateAction<number>>;
  pirData: any;
  setPirData: React.Dispatch<React.SetStateAction<any>>;
  unitOptions: SelectOptions[];
  departmentOptions: SelectOptions[];
  departments: any;
}

const UnitDetails = ({
 readOnly,
 unitData,
 saData,
 setSaData,
 setUnitData,
 currentStatus,
 setCurrentStatus,
 setOpenSection,
 unitOptions, 
 departmentOptions,
 departments,
 pirData,
 setPirData,
}: UnitDetailsInterface) => {
  const token = useSelector(selectUserToken);
  const [selectedSection, setSelectedSection] = useState<SelectOptions | null>(null)
  const [sectionOptions, setSectionOptions] = useState<SelectOptions[] | null>(emptySelector);
  const [lineManagerOptions, setLineManagerOptions] = useState(emptySelector)

const getInitialTimeValue = (timeStr: string | undefined, dateStr: string | undefined): Date | null => {
  if (!timeStr) return null;
  
  const date = dateStr ? dayjs(dateStr) : dayjs();
  const [hours, minutes] = timeStr.split(':');
  
  return date
    .hour(parseInt(hours))
    .minute(parseInt(minutes))
    .second(0)
    .millisecond(0)
    .toDate();
};
const initialValues = {
  unitId: saData?.unitId || "",
  departmentId: saData?.department || "",
  exactLocation: saData?.incidentLocation || "",
  incidentDate: saData?.incidentDate ? new Date(saData?.incidentDate) : saData?.incidentDate ? new Date(saData?.incidentDate) : null,
  incidentTime: getInitialTimeValue(saData?.incidentTime || saData?.incidentTime, saData?.incidentDate || saData?.incidentDate),
  sectionId: "",
  departmentHod: "",
  lineManager: "",
};

  useEffect(() => {
  if (saData?.department) {
    fetchSections(saData?.department);
    fetchLineManagers(saData?.department);
  }
}, [saData?.department]);

  const fetchSections = async (departmentId: string | number) => {
      try {
        const response = await serverRequest(
          {},
          FETCH_SECTIONS + `/get-sections/${departmentId}`,
          CONSTANTS.REQUEST_GET,
          true,
          true,
          token
        );
        if (response.length > 0) {
          const options = response.map((sect: any) => ({value: sect?.sectionid, label: sect?.sectionname}))
          setSectionOptions(options)
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const fetchSectionHead = async (sectionId: string | number, departmentId: string | number, unitId: string | number, setFieldValue: (field: string, value: any) => void) => {
          try {
            const response = await serverRequest(
              {},
              FETCH_SECTIONS + `/${unitId}/${departmentId}/${sectionId}`,
              CONSTANTS.REQUEST_GET,
              true,
              true,
              token
            );
            if (response?.sectionHead) {
              setFieldValue('sectionHead', response.sectionHead?.linemanagerName)
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };

    const fetchLineManagers = async (departmentId: string | number) => {
      try {
        const response = await serverRequest(
          {},
          FETCH_LINEMANAGER + `/get-line-managers/${departmentId}/active`,
          CONSTANTS.REQUEST_GET,
          true,
          true,
          token
        );
        
        if (response.length > 0) {
          const options = response.map((manager: any) => ({value: manager?.linemanagerName, label: manager?.linemanagerName}))
          setLineManagerOptions(options)
        } else {
          setLineManagerOptions(emptySelector)
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

  const validationSchema = Yup.object().shape({
    unitId: Yup.string().required("Unit is required"),
    exactLocation: Yup.string().required("Location is required"),
    incidentTime: Yup.date().nullable().required("Incident time is required").typeError("Invalid time format"),
    incidentDate: Yup.date().nullable().required("Incident date is required"),
  });

  const today = new Date();
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 10);

  const onSubmit = async (values: any) => {
    const updatedSaData = {
      ...saData,
      unitId: values.unitId,
      unitName: unitOptions.find(u => u.value === values.unitId)?.label || "",
      incidentLocation: values.exactLocation,
      incidentDate: values.incidentDate ? dayjs(values.incidentDate).format("YYYY-MM-DD") : null,
      incidentTime: values.incidentTime ? dayjs(values.incidentTime).format("HH:mm") : null,
      department: values.departmentId,
      departmentName: departmentOptions.find(d => d.value == values.departmentId)?.label || "",
    }

    setSaData(updatedSaData);
    setCurrentStatus(1);
    setOpenSection(1);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={onSubmit}
    >
      {({
        values,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        touched,
        errors,
      }) => {

        useEffect(() => {
          if (values?.sectionId && values?.departmentId && values?.unitId) {
            fetchSectionHead(values?.sectionId, values?.departmentId, values?.unitId, setFieldValue);
          }
        }, [values?.sectionId]);
        return (
        <form onSubmit={handleSubmit}>
         <div className="filters">
           <div className="row form_grider d1">             
             <div className="col-12 col-md-4 col-lg-3">
               <SelectField
                label="Unit Name"
                value={unitOptions?.find(option => option.value == values.unitId) || ""}
                name="unitId"
                disabled={readOnly || true}
                placeholder="Select Unit"
                options={unitOptions}
                onChange={(selectedOption: SelectOptions) => {
                    setFieldValue("unitId", selectedOption.value);
                }}
                onBlur={handleBlur}
                errors={touched.unitId && errors.unitId}
                />
             </div>
             <div className="col-12 col-md-4 col-lg-3">
               <InputField
                  type="text"
                  label="Exact Location"
                  disabled={readOnly}
                  value={values.exactLocation}
                  name="exactLocation"
                  placeholder="Enter Location"
                  touched={touched.exactLocation}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  maxLength={250}
                  errors={touched.exactLocation && errors.exactLocation}
              />
             </div>

             {/* Incident Date - Custom Date Picker */}
             <div className="col-12 col-md-4 col-lg-3">
               <DatePickerField
              label="Incident Date"
              name="incidentDate"
              placeholder="Choose date"
              disabled={readOnly}
              value={values.incidentDate}
              onChange={(date: Date | null) =>{
                setFieldValue("incidentDate", date)
                setFieldValue("incidentTime", null)
              }}
              minDate={tenDaysAgo}
              maxDate={today}
              dateFormat="dd/MM/yyyy"
              errors={errors.incidentDate}
              touched={touched.incidentDate}
            />
             </div>
             <div className="col-12 col-md-4 col-lg-3">
              <DatePickerField
                label="Incident Time"
                name="incidentTime"
                placeholder="Select time"
                disabled={readOnly}
                value={values.incidentTime}
                onChange={(time: Date | null) =>
                  setFieldValue("incidentTime", time)
                }
                showTimeSelect
                showTimeSelectOnly
                dateFormat="HH:mm"
                timeFormat="HH:mm"
                timeIntervals={15}
                referenceDate={values.incidentDate}
                errors={errors.incidentTime}
                touched={touched.incidentTime}
              />
                </div>
           </div>              
              {!readOnly &&(<button className="iconBtn green v2 ms-0" type="submit">
                <span>Save & Next</span>
              </button>)
                }
          </div>
        </form>
      )}}
    </Formik>
  );
};

export default UnitDetails;
