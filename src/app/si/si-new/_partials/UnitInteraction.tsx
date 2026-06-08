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
import { RootState } from "@/store/store";

interface UnitDataInterface {
  unit: string;
  unitDisplay: string;
  department: string;
  departmentDisplay: string;
  sections: string;
  sectionDisplay: string;
  hod: string;
  nameObserver: string;
  noOfCoobserver: string;
  noPeopleObserved: string;
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
  siData: any;
  setSIData: any;
  unitOptions: SelectOptions[];
}

const UnitInteraction = ({
  unitData,
  setUnitData,
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  unitOptions,
  siData,
  setSIData,
}: UnitInteractionInterface) => {
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
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

  //console.log(unitOptions);
  
  const noOfCoobserverRef = useRef<HTMLInputElement | null>(null);
  const noOfPeopleInteractedRef = useRef<HTMLInputElement | null>(null);

  const keyDownFunc = (event: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement>, isMob: boolean) => {
    restrictAlphabets(event.nativeEvent, ref, isMob);
  };
  const restrictTextArea = (event: React.KeyboardEvent<HTMLInputElement>) => {
      restrictSpecialCharactersExceptHyphen(event.nativeEvent);
  };  

  const initialValues = {
    unit: siData?.unit || unitData?.unit || "",
    unitDisplay: siData?.unitDisplay || unitData?.unitDisplay || "",
    department: siData?.department || unitData?.department || "",
    departmentDisplay: siData?.departmentDisplay || unitData?.departmentDisplay || "",
    sections: siData?.sections || unitData?.sections || "",
    sectionDisplay: siData?.sectionDisplay || unitData?.sectionDisplay || "",
    hod: siData?.hod || unitData?.hod || "",
    nameObserver: siData?.nameObserver || unitData?.nameObserver || "",
    noOfCoobserver: siData?.noOfCoobserver || unitData?.noOfCoobserver || 0,
    noPeopleObserved:
      siData?.noPeopleObserved || unitData?.noPeopleObserved || "",
    siDate: siData?.siDate
      ? new Date(siData.siDate)
      : unitData?.siDate
      ? new Date(unitData.siDate)
      : null,
    starttime: getInitialTimeValue(siData?.starttime || unitData?.starttime || "", siData?.siDate || unitData?.siDate || ""),
    endtime: getInitialTimeValue(siData?.endtime || unitData?.endtime || "", siData?.siDate || unitData?.siDate || ""),
    duration: siData?.duration || unitData?.duration || "",
  };

  useEffect(() => {
    if (siData?.unit || unitData?.unit) {      
      fetchDepartments(siData?.unit ?? unitData.unit);
    }
  }, [siData?.unit || unitData.unit]);

  useEffect(() => {
    if (siData?.department || unitData?.department) {
      fetchSections(siData.department ?? unitData?.department);      
    }
  }, [siData?.department || unitData?.department]);

  useEffect(() => {
    if (siData?.department || unitData?.department) {
      const departmentId = siData?.department ?? unitData?.department;
      //console.log("use Effect department id", departmentId);
      const matched = departments.find(
        (d) => d.departmentid.toString() === departmentId.toString()
      );
      //console.log("use Effect matched", matched);
      if (matched?.hod) {      
        setSIData((prevsiData: any) => ({
          ...prevsiData,
          hod: matched.hod,
        }));
      }
    }
  }, [siData?.department, unitData?.department, departments]);

  useEffect(() => {
    if (siData?.department || unitData?.department) {
      if ((siData?.scheduleId ?? 0) > 0 && (siData?.objectId ?? "").trim() === "")
      {
        let unitDisplay = (unitOptions.find((option) => option.value == (siData?.unit || unitData?.unit || "")))?.label || "";
        let departmentDisplay = departmentOptions.find((option) => option.value == (siData?.department || unitData?.department || ""))?.label || "";
        
        setSIData((prevsiData: any) => ({
            ...prevsiData,
            unitDisplay: unitDisplay,
            departmentDisplay: departmentDisplay,
        }));
        // console.log("-------Department-------");
        // console.log(siData?.department, " - ", departmentDisplay, " - ", unitDisplay);
      }
    }
  }, [departmentOptions]);

  useEffect(() => {
    if (siData?.department || unitData?.department) {
      if ((siData?.scheduleId ?? 0) > 0 && (siData?.objectId ?? "").trim() === "")
      {
        let sectionDisplay = sectionOptions.find((option) => option.value == (siData?.sections || unitData?.sections || ""))?.label || "";
        setSIData((prevsiData: any) => ({
            ...prevsiData,
            sectionDisplay: sectionDisplay,
        }));
        // console.log("-------Section-------");
        // console.log(siData?.sections, " - ", sectionDisplay, " - ", siData?.departmentDisplay, " - ", siData?.unitDisplay);
      }
    }
  }, [sectionOptions]);

  // useEffect(() => {
  //   if (unitData.starttime && unitData.endtime) {
  //     calculateDuration(unitData.starttime, unitData.endtime);
  //   }
  // }, [unitData.starttime, unitData.endtime]);
  // useEffect(() => {
  //   console.log("unitData changed:", unitData);
  // }, [unitData]);
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
    //hod: Yup.string().required("HOD Name is required"),
    nameObserver: Yup.string().required("Name of Observer is required"),
    noOfCoobserver: Yup.number()
      .typeError("Number of People Observed must be a number")
      .required("Number of Co-Observers is required"),
    noPeopleObserved: Yup.number()
      .typeError("Number of People Observed must be a number")
      .required("Number of People Observed is required")
      .moreThan(0, "Number must be greater than 0"),
    siDate: Yup.date()
      .nullable()
      .required("SI is required")
      .typeError("Invalid time format"),
    starttime: Yup.string().required("Start time is required"),
    endtime: Yup.string().required("End time is required"),
    //duration: Yup.string().required("Duration time is required"),
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

    if (Number(diff) > 30) {
      alert("Duration cannot exceed 30 minutes.");
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
        if((siData?.scheduleId ?? 0) > 0) {
          finalValues.unit = siData?.unit
          finalValues.department = siData?.department;
          finalValues.sections = siData?.sections;
          finalValues.unitDisplay = siData?.unitDisplay;
          finalValues.departmentDisplay = siData?.departmentDisplay;
          finalValues.sectionDisplay = siData?.sectionDisplay;
          finalValues.hod = siData?.hod;
        }

        let setIndex = (Number(values.noOfCoobserver) > 0) ? 1 : 2;
        setSIData((prevsiData: any) => ({
          ...prevsiData,
          ...finalValues,
          // Ensure these additional fields are maintained if they exist
          ...(prevsiData?.objectId && { objectId: prevsiData.objectId }),
          ...(prevsiData?.scheduleId && { scheduleId: prevsiData.scheduleId }),
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
                    disabled={(siData?.scheduleId ?? 0)}
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
                      
                      //console.log("From formik dept call");
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
                    disabled={(siData?.scheduleId ?? 0) > 0}
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
                      let hod = departments.find(
                        (dept: DepartmentData) =>
                          Number(selectedOption.value) ===
                          Number(dept.departmentid)
                      )?.hod;
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
                      setSectionOptions([]);
                      //console.log("From formik dept call");
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
                    disabled={(siData?.scheduleId ?? 0) > 0}
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
                {/* SI Date */}
                <div className="col-md-3">
                  <DatePickerField
                    label="SI Date"
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
                {/* No of Co-Observer */}
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="No of Co-Observer"
                    value={values.noOfCoobserver}
                    name="noOfCoobserver"
                    placeholder="Enter No of Co-Observer"
                    touched={touched.noOfCoobserver}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={50}
                    reference={noOfCoobserverRef} 
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, noOfCoobserverRef, false)} 
                    errors={touched.noOfCoobserver && errors.noOfCoobserver}
                  />
                </div>
                {/* No. of People Interacted During SI */}
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="No. of People Interacted During SI"
                    value={values.noPeopleObserved}
                    name="noPeopleObserved"
                    placeholder="Enter No. of People Interacted During SI"
                    touched={touched.noPeopleObserved}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={50}
                    reference={noOfPeopleInteractedRef} 
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, noOfPeopleInteractedRef, false)} 
                    errors={touched.noPeopleObserved && errors.noPeopleObserved}
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
