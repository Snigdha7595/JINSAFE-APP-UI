"use client";
import React, { useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";

import SelectField from "@/components/Form/SelectFields";
import { SelectOptions } from "@/components/interfaces";
import DatePickerField from "@/components/Form/DatePickerField";
import InputField from "@/components/Form/InputField";

import { emptySelector } from "@/config/config";
import { AutoSubmitTrigger } from "./AutoSubmitTrigger";
import Button from "@/components/Elements/Button";
import { restrictAlphabets, restrictSpecialCharactersExceptHyphen } from "@/config/globalUtils";

import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_DEPARTMENTS, FETCH_SECTIONS } from "@/config/apiConfig";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";

interface UnitDataInterface {
  unit: string;
  unitDisplay: string;
  department: string;
  departmentDisplay: string;
  sections: string;
  sectionDisplay: string;
  hod: string;
  nameObserver: string;
  siDate: string;
  starttime: string;
  endtime: string;
  duration: string;
}
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

interface UnitInteractionInterface {
  unitData: UnitDataInterface;
  setUnitData: React.Dispatch<React.SetStateAction<UnitDataInterface>>;
  currentStatus: number;
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;
  lwData: any;
  setLWData: any;
  unitOptions: SelectOptions[];
  // departmentOptions: SelectOptions[];
  // departments: DepartmentData[];
}

const UnitInteraction = ({
  unitData,
  setUnitData,
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  unitOptions,
  lwData,
  setLWData,
}: UnitInteractionInterface) => {
  const token = useSelector(selectUserToken);
  const [selectedSection, setSelectedSection] = useState<SelectOptions | null>(
    null
  );  
  const [departmentOptions, setDepartmentOptions] = useState(emptySelector);
  const [departments, setDepartments] = useState([]);
  const [sectionOptions, setSectionOptions] = useState(emptySelector);

  const getInitialTimeValue = (
    timeStr: string | undefined,
    dateStr: string | undefined
  ): Date | null => {
    if (!timeStr) return null;

    const date = dateStr ? dayjs(dateStr) : dayjs();
    const [hours, minutes] = timeStr.split(":");

    return date
      .hour(parseInt(hours))
      .minute(parseInt(minutes))
      .second(0)
      .millisecond(0)
      .toDate();
  };

  const keyDownFunc = (event: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement>, isMob: boolean) => {
    restrictAlphabets(event.nativeEvent, ref, isMob);
  };
  const restrictTextArea = (event: React.KeyboardEvent<HTMLInputElement>) => {
      restrictSpecialCharactersExceptHyphen(event.nativeEvent);
  };  

  const initialValues = {
    unit: lwData?.unit || unitData?.unit || "",
    unitDisplay: lwData?.unitDisplay || unitData?.unitDisplay || "",
    department: lwData?.department || unitData?.department || "",
    departmentDisplay: lwData?.departmentDisplay || unitData?.departmentDisplay || "",
    sections: lwData?.sections || unitData?.sections || "",
    sectionDisplay: lwData?.sectionDisplay || unitData?.sectionDisplay || "",
    hod: lwData?.hod || unitData?.hod || "",
    nameObserver: lwData?.nameObserver || unitData?.nameObserver || "",
    siDate: lwData?.siDate
      ? new Date(lwData.siDate)
      : unitData?.siDate
      ? new Date(unitData.siDate)
      : null,
    starttime: getInitialTimeValue(lwData?.starttime || unitData?.starttime || "", lwData?.siDate || unitData?.siDate || ""),
    endtime: getInitialTimeValue(lwData?.endtime || unitData?.endtime || "", lwData?.siDate || unitData?.siDate || ""),
    duration: lwData?.duration || unitData?.duration || "",
  };

  useEffect(() => {
    if (lwData?.unit || unitData?.unit) {
      fetchDepartments(lwData?.unit ?? unitData.unit);
    }
  }, [lwData?.unit || unitData.unit]);

  useEffect(() => {
    if (lwData?.department || unitData?.department) {
      fetchSections(lwData.department ?? unitData?.department);
    }
  }, [lwData?.department || unitData?.department]);

  useEffect(() => {
    if (lwData?.department || unitData?.department) {
      const departmentId = lwData?.department ?? unitData?.department;
      const matched = departments.find(
        (d) => d.departmentid.toString() === departmentId.toString()
      );
      if (matched?.hod) {
        setLWData((prevlwData: any) => ({
          ...prevlwData,
          hod: matched.hod,
        }));
      }
    }
  }, [lwData?.department, unitData?.department, departments]);

  useEffect(() => {
    if (lwData?.department || unitData?.department) {
      if ((lwData?.scheduleId ?? 0) > 0 && (lwData?.objectId ?? "").trim() === "")
      {
        let unitDisplay = (unitOptions.find((option) => option.value == (lwData?.unit || unitData?.unit || "")))?.label || "";
        let departmentDisplay = departmentOptions.find((option) => option.value == (lwData?.department || unitData?.department || ""))?.label || "";
        
        setLWData((prevlwData: any) => ({
            ...prevlwData,
            unitDisplay: unitDisplay,
            departmentDisplay: departmentDisplay,
        }));
        }
    }
  }, [departmentOptions]);

  useEffect(() => {
    if (lwData?.department || unitData?.department) {
      if((lwData?.scheduleId ?? 0) > 0 && (lwData?.objectId ?? "").trim() === "")
      {
        let sectionDisplay = sectionOptions.find((option) => option.value == (lwData?.sections || unitData?.sections || ""))?.label || "";
        setLWData((prevlwData: any) => ({
            ...prevlwData,
            sectionDisplay: sectionDisplay,
        }));     }
    }
  }, [sectionOptions]);

  const fetchDepartments = async (unitId) => {
    try {
      setDepartmentOptions(emptySelector);
      setDepartments([]);
      setSectionOptions([]);
      //setSelectedSection(null);
      const response = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/get-departments/${unitId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((dept: DepartmentData) => ({
          value: dept?.departmentid,
          label: dept?.departmentname,
        }));
        setDepartmentOptions(options);
        setDepartments(response);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
    
  const fetchSections = async (departmentId: string | number) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_SECTIONS + `/get-sections/${departmentId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((sect: SectionData) => ({
          value: sect?.sectionid,
          label: sect?.sectionname,
        }));
        setSectionOptions(options);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const validationSchema = Yup.object().shape({
    unit: Yup.string().required("Unit is required"),
    department: Yup.string().required("Department is required"),
    sections: Yup.string().required("Section is required"),
    // hod: Yup.string().required("HOD Name is required"),
    nameObserver: Yup.string().required("Name of Observer is required"),
    siDate: Yup.date()
      .nullable()
      .required("LW Date is required")
      .typeError("Invalid time format"),
    starttime: Yup.string().required("Start time is required"),
    endtime: Yup.string().required("End time is required"),
    duration: Yup.string().required("Duration time is required"),
  });

  const today = new Date();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);
  const calculateDuration = (start: Date | null, end: Date | null) => {
    if (!start || !end) return;

    const st = dayjs(start).second(0).millisecond(0);
    const et = dayjs(end).second(0).millisecond(0);

    if (!st.isValid() || !et.isValid()) {
      alert("Invalid time format.");
      return;
    }

    if (et.isBefore(st) || et.isSame(st)) {
      alert("End time must be greater than start time.");
      return;
    }

    const diff = et.diff(st, "minute").toFixed(0);

    if (Number(diff) > 120) {
      alert("Duration cannot exceed 120 minutes.");
      return;
    }

    return diff;
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={(values) => {
        const finalValues = {
          ...values,
          siDate: values.siDate ? dayjs(values.siDate).format("YYYY-MM-DD") : null,
          starttime: values.starttime ? dayjs(values.starttime).format("HH:mm") : null,
          endtime: values.endtime ? dayjs(values.endtime).format("HH:mm") : null,
        };
        if ((lwData?.scheduleId ?? 0) > 0) {
          finalValues.unit = lwData?.unit
          finalValues.department = lwData?.department;
          finalValues.sections = lwData?.sections;
          finalValues.unitDisplay = lwData?.unitDisplay;
          finalValues.departmentDisplay = lwData?.departmentDisplay;
          finalValues.sectionDisplay = lwData?.sectionDisplay;
          finalValues.hod = lwData?.hod;
        }
        let setIndex = 1;
        setLWData((prevlwData: any) => ({
          ...prevlwData,
          ...finalValues,
          // Ensure these additional fields are maintained if they exist
          ...(prevlwData?.objectId && { objectId: prevlwData.objectId }),
          ...(prevlwData?.scheduleId && { scheduleId: prevlwData.scheduleId }),
          accordionIndex: setIndex,
        }));

        setUnitData(finalValues);
        setCurrentStatus(setIndex);
        setOpenSection(setIndex);
      }}
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
        //Any helper logic put here...

        // useEffect(() => {
        //   if (values.department && departments.length > 0) {
        //     const matched = departments.find(d => d.departmentid.toString() === values.department.toString());
        //     if (matched?.hod) {
        //       setFieldValue("hod", matched.hod); // Explicitly set HOD for Formik
        //     }
        //   } else {
        //     setFieldValue("hod", ""); 
        //   }
        // }, [values.department, departments]);

        return (
          <form onSubmit={handleSubmit}>
            <div className="filters">
              <div className="row form_grider d1">
                <div className="col-md-3">
                  <SelectField
                    label="Unit Name"
                    disabled={(lwData?.scheduleId ?? 0)}
                    value={
                      unitOptions?.find(
                        (option) => option.value == values.unit
                      ) || ""
                    }
                    name="unit"
                    placeholder="Select Unit"
                    options={unitOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("unit", selectedOption.value);
                      setFieldValue("unitDisplay", selectedOption.label);
                      setFieldValue("department", "");
                      setFieldValue("departmentDisplay", "");
                      setFieldValue("sections", "");
                      setFieldValue("sectionDisplay", "");
                      setFieldValue("hod", "");
                      setUnitData((prev) => ({
                        ...prev,
                        unit: selectedOption.value,
                        unitDisplay: selectedOption.label,
                      }));

                      fetchDepartments(selectedOption.value);
                    }}
                    onBlur={handleBlur}
                    errors={touched.unit && errors.unit}
                  />
                </div>

                {/* Department */}
                <div className="col-md-3">
                  <SelectField
                    label="Department"
                    disabled={(lwData?.scheduleId ?? 0) > 0}
                    value={
                      departmentOptions.find(
                        (option) => option.value == values.department
                      ) || ""
                    }
                    name="department"
                    placeholder="Select Department"
                    options={departmentOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("sections", "");
                      setFieldValue("sectionDisplay", "");
                      setFieldValue("department", selectedOption.value);
                      setFieldValue("departmentDisplay", selectedOption.label);
                      let hod = departments.filter(
                        (dept: DepartmentData) =>
                          Number(selectedOption.value) ===
                          Number(dept.departmentid)
                      )[0]?.hod;
                      setFieldValue("hod", hod);

                      // setUnitData((prev) => ({
                      //   ...prev,
                      //   hod: hod,
                      // }));
                      // setUnitData((prev) => ({
                      //   ...prev,
                      //   department: selectedOption.value,
                      //   departmentDisplay: selectedOption.label,
                      //   hod: hod,
                      // }));
                      setSectionOptions(emptySelector);
                      fetchSections(selectedOption.value);
                    }}
                    onBlur={handleBlur}
                    errors={touched.department && errors.department}
                  />
                </div>
                {/* Visited Section */}
                <div className="col-md-3">
                  <SelectField
                    label="Visited Section"
                    disabled={(lwData?.scheduleId ?? 0) > 0}
                    value={
                      sectionOptions.find(
                        (option) => option.value == values.sections
                      ) || ""
                    }
                    name="sections"
                    placeholder="Select Section"
                    options={sectionOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      //setSelectedSection(selectedOption);
                      setFieldValue("sections", selectedOption.value);
                      setFieldValue("sectionDisplay", selectedOption.label);
                      // setUnitData((prev) => ({
                      //   ...prev,
                      //   sections: selectedOption.value,
                      //   sectionDisplay: selectedOption.label,
                      // }));
                    }}
                    onBlur={handleBlur}
                    errors={touched.sections && errors.sections}
                  />
                </div>
                {/* HOD Name */}
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="HOD Name"
                    value={values.hod || departments.find(
                        (d) => d.departmentid.toString() == values.department.toString()
                      )?.hod || ""}
                    name="hod"
                    placeholder="Enter HOD Name"
                    touched={touched.hod}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    disabled={true}
                    maxLength={50}
                    errors={touched.hod && errors.hod}
                  />
                </div>
                {/* LW Date */}
                <div className="col-md-3">
                  <DatePickerField
                    label="LW Date"
                    name="siDate"
                    placeholder="Choose Date"
                    value={values.siDate}
                    onChange={(date: Date | null) => {
                      setFieldValue("siDate", date);
                    }}
                    minDate={twoDaysAgo}
                    maxDate={today}
                    dateFormat="yyyy-MM-dd"
                    errors={errors.siDate}
                    touched={touched.siDate}
                  />
                </div>
                {/* Start Time */}
                <div className="col-md-3">
                  <DatePickerField
                    label="Start Time"
                    name="starttime"
                    placeholder="Select Time"
                    value={values.starttime}
                    onChange={(time: Date | null) => {
                      setFieldValue("starttime", time);
                      if (time && values.endtime) {
                        const durationTime = calculateDuration(
                          time,
                          values.endtime
                        );
                        if (durationTime !== undefined) {
                          setFieldValue("duration", durationTime);
                        } else {                          
                          setFieldValue("duration", "");
                          setFieldValue("starttime", "");
                        }
                      }
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    dateFormat="HH:mm"
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    // referenceDate={values.siDate}
                    errors={errors.starttime}
                    touched={touched.starttime}
                  />
                </div>
                {/* End Time */}
                <div className="col-md-3">
                  <DatePickerField
                    label="End Time"
                    name="endtime"
                    placeholder="Select Time"
                    value={values.endtime}
                    onChange={(time: Date | null) => {
                      setFieldValue("endtime", time);
                      if (values.starttime && time) {
                        const durationTime = calculateDuration(
                          values.starttime,
                          time
                        );
                        if (durationTime !== undefined) {
                          setFieldValue("duration", durationTime);
                        } else {                          
                          setFieldValue("duration", "");
                          setFieldValue("endtime", "");
                        }
                      }
                    }}
                    showTimeSelect
                    showTimeSelectOnly
                    dateFormat="HH:mm"
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    // referenceDate={values.siDate}
                    errors={errors.endtime}
                    touched={touched.endtime}
                  />
                </div>
                {/* Duration */}
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="Duration"
                    value={values.duration}
                    name="duration"
                    placeholder="Enter Duration"
                    touched={touched.duration}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={50}
                    disabled={true}
                    errors={touched.duration && errors.duration}
                  />
                </div>
                {/* Name of Observer */}
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="Name of Observer"
                    value={values.nameObserver}
                    name="nameObserver"
                    placeholder="Enter Name of Observer"
                    touched={touched.nameObserver}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={50}
                    errors={touched.nameObserver && errors.nameObserver}
                  />
                </div>
              </div>
              {/* {currentStatus == 0 ?
                <AutoSubmitTrigger /> : (
                <button className="iconBtn green v2 ms-0" type="submit">
                  <span>Save & next</span>
                </button>)
              } */}
              <button className="iconBtn green v2 ms-0" type="submit">
                <span>Save & Next</span>
              </button>
            </div>
          </form>
        );
      }}
    </Formik>
  );
};

export default UnitInteraction;
