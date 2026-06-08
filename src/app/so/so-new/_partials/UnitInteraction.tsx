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
  siDate: string;
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
  soData: any;
  setSOData: any;
  unitOptions: SelectOptions[];
}

const UnitInteraction = ({
  unitData,
  setUnitData,
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  unitOptions,
  soData,
  setSOData,
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

  
  const durationRef = useRef<HTMLInputElement | null>(null);

  const keyDownFunc = (event: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement>, isMob: boolean) => {
    restrictAlphabets(event.nativeEvent, ref, isMob);
  };
  const restrictTextArea = (event: React.KeyboardEvent<HTMLInputElement>) => {
      restrictSpecialCharactersExceptHyphen(event.nativeEvent);
  };  

  const initialValues = {
    unit: soData?.unit || unitData?.unit || "",
    unitDisplay: soData?.unitDisplay || unitData?.unitDisplay || "",
    department: soData?.department || unitData?.department || "",
    departmentDisplay: soData?.departmentDisplay || unitData?.departmentDisplay || "",
    sections: soData?.sections || unitData?.sections || "",
    sectionDisplay: soData?.sectionDisplay || unitData?.sectionDisplay || "",
    hod: soData?.hod || unitData?.hod || "",
    nameObserver: soData?.nameObserver || unitData?.nameObserver || "",
    siDate: soData?.siDate
      ? new Date(soData.siDate)
      : unitData?.siDate
      ? new Date(unitData.siDate)
      : null,
      duration: soData?.duration || unitData?.duration || "",
  };

  useEffect(() => {
    if (soData?.unit || unitData?.unit) {
      fetchDepartments(soData?.unit ?? unitData.unit);
    }
  }, [soData?.unit || unitData.unit]);

  useEffect(() => {
    if (soData?.department || unitData?.department) {
      fetchSections(soData.department ?? unitData?.department);
    }
  }, [soData?.department || unitData?.department]);

  useEffect(() => {
    if (soData?.department || unitData?.department) {
      const departmentId = soData?.department ?? unitData?.department;
      const matched = departments.find(
        (d) => d.departmentid.toString() === departmentId.toString()
      );
      if (matched?.hod) {
        setSOData((prevsoData: any) => ({
          ...prevsoData,
          hod: matched.hod,
        }));
      }
    }
  }, [soData?.department, unitData?.department, departments]);

   useEffect(() => {
    if (soData?.department || unitData?.department) {
      if ((soData?.scheduleId ?? 0) > 0 && (soData?.objectId ?? "").trim() === "")
      {
        let unitDisplay = (unitOptions.find((option) => option.value == (soData?.unit || unitData?.unit || "")))?.label || "";
        let departmentDisplay = departmentOptions.find((option) => option.value == (soData?.department || unitData?.department || ""))?.label || "";

        setSOData((prevsoData: any) => ({
            ...prevsoData,
            unitDisplay: unitDisplay,
            departmentDisplay: departmentDisplay,
        }));
        // console.log("-------Department-------");
        // console.log(soData?.department, " - ", departmentDisplay, " - ", unitDisplay);
      }
    }
  }, [departmentOptions]);

  useEffect(() => {
    if (soData?.department || unitData?.department) {
      if ((soData?.scheduleId ?? 0) > 0 && (soData?.objectId ?? "").trim() === "")
      {
        let sectionDisplay = sectionOptions.find((option) => option.value == (soData?.sections || unitData?.sections || ""))?.label || "";
        setSOData((prevsoData: any) => ({
            ...prevsoData,
            sectionDisplay: sectionDisplay,
        }));
        // console.log("-------Section-------");
        // console.log(soData?.sections, " - ", sectionDisplay, " - ", soData?.departmentDisplay, " - ", soData?.unitDisplay);
      }
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
    hod: Yup.string().required("HOD Name is required"),
    nameObserver: Yup.string().required("Name of Observer is required"),
    siDate: Yup.date()
      .nullable()
      .required("SO Date is required")
      .typeError("Invalid time format"),
    duration: Yup.string().when([], {
                is: () => user?.siTrainedStatus?.toString() === "YES",
                then: (schema) => schema.required("Duration time is required")
                                  .test("max-120", "Duration cannot exceed 120 minutes", function (value) {
                                    if (!value) return true;
                                    const num = Number(value);
                                    return !isNaN(num) && num <= 120;
                                  }),
                otherwise: (schema) => schema.notRequired()
                                  .test("max-120", "Duration cannot exceed 120 minutes", function (value) {
                                    if (!value) return true; // skip check if blank
                                    const num = Number(value);
                                    return !isNaN(num) && num <= 120;
                                  }),
              }),
  });

  const today = new Date();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);
 
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={(values) => {
        const finalValues = {
          ...values,
          siDate: values.siDate ? dayjs(values.siDate).format("YYYY-MM-DD") : null,
        };
        let setIndex = 1;
        setSOData((prevsoData: any) => ({
          ...prevsoData,
          ...finalValues,
          // Ensure these additional fields are maintained if they exist
          ...(prevsoData?.objectId && { objectId: prevsoData.objectId }),
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
                    value={
                      unitOptions?.find((option) => option.value == values.unit) ||
                      (values.unit && values.unitDisplay
                        ? { label: values.unitDisplay, value: values.unit }
                        : "")
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
                    value={
                      departmentOptions.find(
                        (option) => option.value == values.department
                      ) ||
                      (values.department && values.departmentDisplay
                        ? { label: values.departmentDisplay, value: values.department }
                        : "")
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
                    value={
                      sectionOptions.find(
                        (option) => option.value == values.sections
                      ) ||
                      (values.sections && values.sectionDisplay
                        ? { label: values.sectionDisplay, value: values.sections }
                        : "")
                    }
                    name="sections"
                    placeholder="Select Section"
                    options={sectionOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("sections", selectedOption.value);
                      setFieldValue("sectionDisplay", selectedOption.label);
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
                    label="SO Date"
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
                    disabled={false}
                    reference={durationRef} 
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, durationRef, false)} 
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
