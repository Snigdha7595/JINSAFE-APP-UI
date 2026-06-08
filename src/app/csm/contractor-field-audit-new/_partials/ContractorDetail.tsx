"use client";
import React, { useEffect, useRef, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import SelectField from "@/components/Form/SelectFields";
import { SelectOptions } from "@/components/interfaces";
import DatePickerField from "@/components/Form/DatePickerField";
import InputField from "@/components/Form/InputField";
import ContractorSearchField from "@/components/Form/ContractorSearchField";
import { emptySelector } from "@/config/config";
import { AutoSubmitTrigger } from "./AutoSubmitTrigger";
import Button from "@/components/Elements/Button";
import { restrictAlphabets, restrictSpecialCharactersExceptHyphen } from "@/config/globalUtils";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_DEPARTMENTS, FETCH_SECTIONS, FETCH_ZONES, FETCH_CSFA } from "@/config/apiConfig";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";

interface UnitDataInterface {
  objectId: string;
  csfaNo: string;
  contractorId: string;
  contractorName: string;
  contractorEmail: string;
  visitedUnit: string;
  visitedUnitName: string;
  visitedDepartment: string;
  visitedDepartmentName: string;
  visitedSection: string;
  visitedSectionName: string;
  exactLocation: string;
  hod: string;
  hodId: string;
  hodEmail: string;
  areaOwner: string;
  noOfPeopleWorking: string;
  noOfCoauditor: string;
  auditDate: string;
  auditDuration: string;
  weatherConditions: string;
  siteName: string;
  workOrderNo: string;
  auditDesc: string;
  zone: string;
  zoneName: string;
  emailStatus: string;
  createdBy: string;
  createdByEmail: string;
  createdByName: string;
  createdAt: string;
  updatedBy: string;
  updatedByEmail: string;
  updatedByName: string;
  updatedAt: string;
  status: string;
  rowIndex: number;
  id: number;
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
  csfaData: any;
  setCSFAData: any;
  unitOptions: SelectOptions[];
}

const ContractorDetail = ({
  unitData,
  setUnitData,
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  unitOptions,
  csfaData,
  setCSFAData,
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
  const [zoneOptions, setZoneOptions] = useState(emptySelector);
  const weatherOptions = [
  { value: "Sunny", label: "Sunny" },
  { value: "Clear", label: "Clear" },
  { value: "Partially Cloudy", label: "Partially Cloudy" },
  { value: "Cloudy", label: "Cloudy" },
  { value: "Overcast", label: "Overcast" },
  { value: "Rain", label: "Rain" },
  { value: "Drizzle", label: "Drizzle" },
  { value: "Snow", label: "Snow" },
  { value: "Stormy", label: "Stormy" },
  ];

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

  const noOfPeopleWorkingAtSiteRef = useRef<HTMLInputElement | null>(null);
  const noOfAuditTeamRef = useRef<HTMLInputElement | null>(null);
  const durationRef = useRef<HTMLInputElement | null>(null);

  const keyDownFunc = (event: React.KeyboardEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement>, isMob: boolean) => {
    restrictAlphabets(event.nativeEvent, ref, isMob);
  };
  const restrictTextArea = (event: React.KeyboardEvent<HTMLInputElement>) => {
      restrictSpecialCharactersExceptHyphen(event.nativeEvent);
  };  

  const initialValues = {
    // objectId: csfaData?.objectId || unitData?.objectId || "",
    contractorId: csfaData?.contractorId || unitData?.contractorId || "",
    contractorName: csfaData?.contractorName || unitData?.contractorName || "",
    contractorEmail: csfaData?.contractorEmail || unitData?.contractorEmail || "",
    visitedUnit: csfaData?.visitedUnit || unitData?.visitedUnit || "",
    visitedUnitName: csfaData?.visitedUnitName || unitData?.visitedUnitName || "",
    visitedDepartment: csfaData?.visitedDepartment || unitData?.visitedDepartment || "",
    visitedDepartmentName: csfaData?.visitedDepartmentName || unitData?.visitedDepartmentName || "",
    visitedSection: csfaData?.visitedSection || unitData?.visitedSection || "",
    visitedSectionName: csfaData?.visitedSectionName || unitData?.visitedSectionName || "",
    exactLocation: csfaData?.exactLocation || unitData?.exactLocation || "",
    hod: csfaData?.hod || unitData?.hod || "",
    hodId: csfaData?.hodId || unitData?.hodId || "",
    hodEmail: csfaData?.hodEmail || unitData?.hodEmail || "",
    areaOwner: csfaData?.areaOwner || unitData?.areaOwner || "",
    noOfPeopleWorking: csfaData?.noOfPeopleWorking || unitData?.noOfPeopleWorking || "", 
    noOfCoauditor: csfaData?.noOfCoauditor || unitData?.noOfCoauditor || "", 
    auditDate: csfaData?.auditDate
      ? new Date(csfaData.auditDate)
      : unitData?.auditDate
      ? new Date(unitData.auditDate)
      : null,
    auditDuration: csfaData?.auditDuration || unitData?.auditDuration || "",
    weatherConditions: csfaData?.weatherConditions || unitData?.weatherConditions || "",
    status: csfaData?.status || unitData?.status || "",
    emailStatus: csfaData?.emailStatus || unitData?.emailStatus || "",
    siteName: csfaData?.siteName || unitData?.siteName || "",
    workOrderNo: csfaData?.workOrderNo || unitData?.workOrderNo || "",
    auditDesc: csfaData?.auditDesc || unitData?.auditDesc || "",
    zone: csfaData?.zone || unitData?.zone || "",
    zoneName: csfaData?.zoneName || unitData?.zoneName || "",
    emailStatus: csfaData?.emailStatus || unitData?.emailStatus || "",
    createdBy: csfaData?.createdBy || unitData?.createdBy || user?.createdBy || "",
    createdByName: csfaData?.createdByName || unitData?.createdByName || user?.name || "",
    createdByEmail: csfaData?.createdByEmail || unitData?.createdByEmail || user?.email || "",
    createdAt: csfaData?.createdAt || unitData?.createdAt || new Date().toISOString().split("T")[0],
    updatedBy: csfaData?.updatedBy || unitData?.updatedBy || user?.createdBy || "",
    updatedByName: csfaData?.updatedByName || unitData?.updatedByName || user?.name || "",  
    updatedByEmail: csfaData?.updatedByEmail || unitData?.updatedByEmail || user?.email || "",  
    updatedAt: csfaData?.updatedAt || unitData?.updatedAt || new Date().toISOString().split("T")[0],    
    rowIndex: csfaData?.rowIndex || unitData?.rowIndex || 0,
  };

  useEffect(() => {
    if (csfaData?.visitedUnit || unitData?.visitedUnit) {
      fetchDepartments(csfaData?.visitedUnit ?? unitData.visitedUnit);
      fetchZones(csfaData?.visitedUnit ?? unitData.visitedUnit);
    }
  }, [csfaData?.visitedUnit, unitData?.visitedUnit]);

  useEffect(() => {
    if (csfaData?.visitedDepartment || unitData?.visitedDepartment) {
      fetchSections(csfaData?.visitedDepartment ?? unitData?.visitedDepartment);
    }
  }, [csfaData?.visitedDepartment, unitData?.visitedDepartment]);
  
  useEffect(() => {
    const departmentId =
      csfaData?.visitedDepartment ??
      unitData?.visitedDepartment;
    if (!departmentId || departments.length === 0) return;
    setHodFromDepartment(departmentId);
    }, [csfaData?.visitedDepartment, unitData?.visitedDepartment, departments]);

   useEffect(() => {
    if (csfaData?.visitedDepartment || unitData?.visitedDepartment) {
      if ((csfaData?.objectId ?? "").trim() === "")
      {
        let unitDisplay = (unitOptions.find((option) => String(option.value) === (String(csfaData?.visitedUnit) || String(unitData?.visitedUnit) || "")))?.label || "";
        let departmentDisplay = (departmentOptions.find((option) => String(option.value) === (String(csfaData?.visitedDepartment) || String(unitData?.visitedDepartment) || "")))?.label || "";
      
        setCSFAData((prevcsfaData: any) => ({
            ...prevcsfaData,
            visitedUnitName: unitDisplay,
            visitedDepartmentName: departmentDisplay,
        }));
      }
    }
  }, [departmentOptions]);
 
  useEffect(() => {
    if (csfaData?.visitedDepartment || unitData?.visitedDepartment) {
      if ((csfaData?.objectId ?? "").trim() === "")
      {
        let visitedSectionName = sectionOptions.find((option) => String(option.value) === (String(csfaData?.visitedSection) || String(unitData?.visitedSection) || ""))?.label || "";
      
        setCSFAData((prevcsfaData: any) => ({
            ...prevcsfaData,
            visitedSectionName: visitedSectionName,
        }));
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

  const fetchZones = async (unitId) => {
    setZoneOptions(emptySelector);
    try {
      const response = await serverRequest(
        {},
        FETCH_ZONES + `/get-zones/${unitId}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((zone: SectionData) => ({
          value: zone?.zoneId,
          label: zone?.zoneName,
        }));
        setZoneOptions(options);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const setHodFromDepartment = async (
    departmentId: string | number,
    setFieldValue?: any
  ) => {
    if (!departmentId || departments.length === 0) return;

    const matched = departments.find(
      (d: DepartmentData) =>
        Number(d.departmentid) === Number(departmentId)
    );

    if (!matched) return;
    // ✅ update Formik
    if (setFieldValue) {
      setFieldValue("hod", matched.hod || "");
      setFieldValue("hodEmail", matched.hodEmail || "");
      setFieldValue("hodId", matched.jsplid || "");
    }

    // ✅ update external state
    setCSFAData((prev: any) => ({
      ...prev,
      hod: matched.hod || "",
      hodEmail: matched.hodEmail || "",
      hodId: matched.jsplid || ""
    }));
  };
  const validationSchema = Yup.object().shape({
    contractorId: Yup.string().required("Contractor Id is required"),
    contractorName: Yup.string().required("Contractor Name is required"),
    // contractorEmail: Yup.string().required("Contractor Email is required"),
    visitedUnit: Yup.string().required("Unit is required"),
    visitedDepartment: Yup.string().required("Department is required"),
    visitedSection: Yup.string().required("Section is required"),
    exactLocation: Yup.string().required("Exact Location is required"),
    areaOwner: Yup.string().required("Area Owner is required"),
    noOfPeopleWorking: Yup.string().required("No. of People Working is required"),
    noOfCoauditor: Yup.string().required("No. of Coauditor is required"),
    auditDuration: Yup.string().required("Audit Duration is required"),
    workOrderNo: Yup.string().required("Work Order No is required"),
    auditDesc: Yup.string().required("Activity Description is required"),
    weatherConditions: Yup.string().required("Weather Condition is required"),
    siteName: Yup.string().required("Site Name is required"),
    zone: Yup.string().required("Zone Name is required"),    
    hod: Yup.string().required("HOD Name is required"),
    auditDate: Yup.date()
      .nullable()
      .required("Date is required")
      .typeError("Invalid time format"),
  });

  const today = new Date();
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 4);
 
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={(values) => {
        const finalValues = {
          ...values,
          auditDate: values.auditDate ? dayjs(values.auditDate).format("YYYY-MM-DD") : null,
        };
        let setIndex = 1;
        setCSFAData((prevcsfaData: any) => ({
          ...prevcsfaData,
          ...finalValues,
          ...(prevcsfaData?.objectId && { objectId: prevcsfaData.objectId }),
          accordionIndex: setIndex,
        }));
        console.log("Final-setCSFAData-",JSON.stringify(csfaData));
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

        return (
          <form onSubmit={handleSubmit}>
            <div className="filters">
              <div className="row form_grider d1">
                <div className="col-md-3">
                  <SelectField
                    label="Visited Unit"
                    value={
                      unitOptions.find(
                        (option) =>
                          String(option.value) === String(values.visitedUnit)
                      ) || null
                    }
                    name="visitedUnit"
                    placeholder="Select Unit"
                    options={unitOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("visitedUnit", selectedOption.value);
                      setFieldValue("visitedUnitName", selectedOption.label);
                      setFieldValue("zone", "");
                      setFieldValue("zoneName", "");
                      setFieldValue("visitedDepartment", "");
                      setFieldValue("visitedDepartmentName", "");
                      setFieldValue("visitedSection", "");
                      setFieldValue("visitedSectionName", "");
                      setFieldValue("hod", "");
                      setFieldValue("hodEmail", "");
                      setFieldValue("hodId", "");
                      setDepartmentOptions([]); 
                      setSectionOptions([]);
                      setCSFAData((prev) => ({
                        ...prev,
                        visitedUnit: selectedOption.value,
                        visitedUnitName: selectedOption.label,
                      }));
                      fetchDepartments(selectedOption.value);
                      fetchZones(selectedOption.value);
                    }}
                    onBlur={handleBlur}
                    errors={touched.visitedUnit && errors.visitedUnit}
                  />
                </div>
                <div className="col-md-3">
                  <SelectField
                    label="Visited Department"
                    value={
                      departmentOptions.find(
                        (option) =>
                          String(option.value) === String(values.visitedDepartment)
                      ) || null
                    }
                    name="visitedDepartment"
                    placeholder="Select Department"
                    options={departmentOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("visitedDepartment", selectedOption.value);
                      setFieldValue("visitedDepartmentName", selectedOption.label);
                      setCSFAData((prev) => ({
                        ...prev,
                        visitedDepartment: selectedOption.value,
                        visitedDepartmentName: selectedOption.label,
                      }));
                      setFieldValue("visitedSection", "");
                      setFieldValue("visitedSectionName", "");
                      setHodFromDepartment(selectedOption.value, setFieldValue);
                      fetchSections(selectedOption.value);
                    }}
                    onBlur={handleBlur}
                    errors={touched.visitedDepartment && errors.visitedDepartment}
                  />
                </div>
                <div className="col-md-3">
                  <SelectField
                    label="Visited Section"
                    value={
                      sectionOptions.find(
                        (option) => option.value == values.visitedSection
                      ) || null
                    }
                    name="visitedSection"
                    placeholder="Select Section"
                    options={sectionOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("visitedSection", selectedOption.value);
                      setFieldValue("visitedSectionName", selectedOption.label);
                      // setCSFAData((prev) => ({
                      //   ...prev,
                      //   visitedSection: selectedOption.value,
                      //   visitedSectionName: selectedOption.label,
                      // }));
                    }}
                    onBlur={handleBlur}
                    errors={touched.visitedSection && errors.visitedSection}
                  />
                </div>
                 <div className="col-md-3">
                  <InputField
                    type="text"
                    label="HOD Name"
                    value={values.hod}
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
                <div className="col-md-3">
                   <SelectField
                    label="Zone Name"
                    value={
                      zoneOptions.find(
                        (option) => option.value == values.zone
                      ) || ""
                    }
                    name="zone"
                    placeholder="Select Zone"
                    options={zoneOptions}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("zone", selectedOption.value);
                      setFieldValue("zoneName", selectedOption.label);
                    }}
                    onBlur={handleBlur}
                    errors={touched.zone && errors.zone}
                  />
                </div>            
                <div className="col-md-3">
                  <label className="form-label mb-0">Contractor Name:</label>
                  <ContractorSearchField
                    token={token}
                    value={values.contractorName}
                    onChange={(name, extra) => {
                      setFieldValue("contractorName", extra?.contractorName); 
                      setFieldValue("contractorId", extra?.contractorCode);
                      setFieldValue("contractorEmail", extra?.contractorEmail);
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="Work Order No."
                    value={values.workOrderNo}
                    name="workOrderNo"
                    placeholder="Work Order No."
                    touched={touched.workOrderNo}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={10}
                    errors={touched.workOrderNo && errors.workOrderNo}
                  />
                </div>
                 <div className="col-md-3">
                  <InputField
                    type="text"
                    label="Activity Description"
                    value={values.auditDesc}
                    name="auditDesc"
                    placeholder="Description"
                    touched={touched.auditDesc}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={300}
                    errors={touched.auditDesc && errors.auditDesc}
                  />
                </div>
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="Exact Location"
                    value={values.exactLocation}
                    name="exactLocation"
                    placeholder="Exact Location"
                    touched={touched.exactLocation}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={100}
                    errors={touched.exactLocation && errors.exactLocation}
                  />
                </div>
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="Site Name"
                    value={values.siteName}
                    name="siteName"
                    placeholder="Enter Site Name"
                    touched={touched.siteName}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={50}
                    errors={touched.siteName && errors.siteName}
                  />
                </div>
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="Area Owner"
                    value={values.areaOwner}
                    name="areaOwner"
                    placeholder="Enter Area Owner"
                    touched={touched.areaOwner}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={50}
                    errors={touched.areaOwner && errors.areaOwner}
                  />
                </div>
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="No. of People Working at Site"
                    value={values.noOfPeopleWorking}
                    name="noOfPeopleWorking"
                    placeholder="No. of People Working at Site"
                    touched={touched.noOfPeopleWorking}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={3}
                    reference={noOfPeopleWorkingAtSiteRef} 
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, noOfPeopleWorkingAtSiteRef, false)} 
                    errors={touched.noOfPeopleWorking && errors.noOfPeopleWorking}
                  />
                </div>
                <div className="col-md-3">
                  <InputField
                    type="text"
                    label="No. of Audit Team"
                    value={values.noOfCoauditor}
                    name="noOfCoauditor"
                    placeholder="No. of Audit Team"
                    touched={touched.noOfCoauditor}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={3}
                    reference={noOfAuditTeamRef}  
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, noOfAuditTeamRef, false)} 
                    errors={touched.noOfCoauditor && errors.noOfCoauditor}
                  />
                </div>
                <div className="col-md-3">
                  <DatePickerField
                    label="Date of Audit"
                    name="auditDate"
                    placeholder="Choose Date"
                    value={values.auditDate}
                    onChange={(date: Date | null) => {
                      setFieldValue("auditDate", date);
                    }}
                    minDate={twoDaysAgo}
                    maxDate={today}
                    dateFormat="yyyy-MM-dd"
                    errors={errors.auditDate}
                    touched={touched.auditDate}
                  />
                </div>
                <div className="col-md-3">
                   <InputField
                    type="text"
                    label="Duration"
                    value={values.auditDuration}
                    name="auditDuration"
                    placeholder="Enter Duration"
                    touched={touched.auditDuration}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    maxLength={50}
                    disabled={false}
                    reference={durationRef} 
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => keyDownFunc(e, durationRef, false)} 
                    errors={touched.auditDuration && errors.auditDuration}
                  />
                </div>
                <div className="col-md-3">
                   <SelectField
                    label="Weather Conditions"
                    value={weatherOptions.find(opt => opt.value === values.weatherConditions)}
                    name="weatherConditions"
                    placeholder="Select Weather Condition"
                    options={weatherOptions}
                    onChange={(option) => setFieldValue("weatherConditions", option?.label)}
                    onBlur={handleBlur}
                    errors={touched.weatherConditions && errors.weatherConditions}
                  />
                </div>
              </div>
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

export default ContractorDetail;
