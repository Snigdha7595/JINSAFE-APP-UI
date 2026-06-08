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
import { serverRequest } from "@/services/getServerSideRender";
import {
  FETCH_SECTIONS,
  FETCH_LINEMANAGER,
  GET_INCIDENT_CATEGORY,
  INVESTIGATION,
} from "@/config/apiConfig";
import { restrictAlphabets } from "@/config/globalUtils";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import MultiSelectField from "@/components/Form/MultiSelectField";
import { RootState } from "@/store/store";

interface UnitDataInterface {
  unitId?: string;
  departmentId?: string;
  sectionId?: string;
  exactLocation?: string;
  incidentDate?: string | null;
  incidentTime?: string | null;
  departmentHod?: string;
  lineManager?: string;
  costInRupees?: string;
  costOfIncident?: string;
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
  unitData: UnitDataInterface;
  reportData?: any;
  setUnitData: React.Dispatch<React.SetStateAction<UnitDataInterface>>;
  costOfIncidentOptions: SelectOptions[];
  currentStatus: number;
  prelimClassificOptions: SelectOptions[];
  setCurrentStatus: React.Dispatch<React.SetStateAction<number>>;
  setOpenSection: React.Dispatch<React.SetStateAction<number>>;
  pirData: any;
  setPirData?: any;
  unitOptions: SelectOptions[];
  departmentOptions: SelectOptions[];
  departments: DepartmentData[];
}

const UnitDetails = ({
  readOnly,
  unitData,
  reportData,
  setUnitData,
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  prelimClassificOptions,
  costOfIncidentOptions,
  unitOptions,
  departmentOptions,
  departments,
  pirData,
  setPirData,
}: UnitDetailsInterface) => {
  const token = useSelector(selectUserToken);
  const [selectedSection, setSelectedSection] = useState<SelectOptions | null>(
    null
  );
  const [exactLocation, setExactLocation] = useState<string>("");
  const pirId = useSelector((state: RootState) => state.pir.pirId);

  const [sectionOptions, setSectionOptions] = useState<SelectOptions[] | null>(emptySelector);
  const [incidentCategoryOptions, setIncidentCategoryOptions] =
    useState<SelectOptions[]>(emptySelector);
  const [lineManagerOptions, setLineManagerOptions] = useState(emptySelector);
  const costRef = useRef<HTMLInputElement | null>(null);

  const keyDownFunc = (
    event: React.KeyboardEvent<HTMLInputElement>,
    ref: React.RefObject<HTMLInputElement | null>,
    isMob: boolean
  ) => {
    restrictAlphabets(event.nativeEvent, ref, isMob);
  };

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
  const parseIncidentTime = (value) => {
    if (!value) return null;
    // Case 1: Full ISO datetime
    if (value.includes('T')) {
      return new Date(value);
    }
    // Case 2: Time only (HH:mm or HH:mm:ss)
    return new Date(`1970-01-01T${value}:00`);
  };
  
  const initialValues = {
    unitId: pirData?.unitId || unitData?.unitId || "",
    departmentId: pirData?.departmentId || unitData?.departmentId || "",
    sectionId: pirData?.sectionId || unitData?.sectionId || "",
    incidentDate: pirData?.incidentDate
      ? new Date(pirData.incidentDate)
      : unitData?.incidentDate
      ? new Date(unitData.incidentDate)
      : null,
    incidentTime: pirData?.incidentTime ? parseIncidentTime(pirData?.incidentTime) : null,
    // incidentTime: getInitialTimeValue(
    //   pirData?.incidentTime || unitData?.incidentTime,
    //   pirData?.incidentDate || unitData?.incidentDate
    // ),
    unitName: pirData?.unitName || "",
    injuryHappened: pirData?.injuryHappened || "",
    departmentName: pirData?.departmentName || "",
    incidentCategory: pirData?.incidentCategory || "",
    sectionName: pirData?.sectionName || "",
    costInRupees: pirData?.costInRupees || "",
    costOfIncident: pirData?.costOfIncident || "",
    incidentClassification: pirData?.incidentClassification || "",
  };

  useEffect(() => {
    if (pirData?.departmentId) {
      fetchSections(pirData.departmentId);
      fetchLineManagers(pirData.departmentId);
      if (
        pirData.incidentClassification &&
        pirData.incidentClassification.includes("Process Safety")
      ) {
        fetchIncidentCategory(true);
      } else {
        fetchIncidentCategory(false);
      }
    }
  }, [pirData?.departmentId]);

  useEffect(() => {
    if (pirData?.exactLocation) {
      setExactLocation(pirData?.exactLocation || "");
    }
  }, [pirData]);

  const fetchTeamMembers = async () => {
    try {
      if (pirId) {
        const response = await serverRequest(
          {},
          INVESTIGATION + `/get-investigation-team-members/${pirId}`,
          CONSTANTS.REQUEST_GET,
          true,
          true,
          token
        );

        const apiData = response;
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  useEffect(() => {
    if (pirId && token) {
      fetchTeamMembers();
    }
  }, [pirId, token]);

  const fetchIncidentCategory = async (hasProcessSafety?: boolean) => {
    const endpoint = hasProcessSafety ? "Process Safety" : " ";
    try {
      const response = await serverRequest(
        {},
        GET_INCIDENT_CATEGORY + `/get-incident-categories/${endpoint}/`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((dept: any) => ({
          value: dept?.category,
          label: dept?.category,
        }));
        setIncidentCategoryOptions(options);
      } else {
        setIncidentCategoryOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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
  const fetchSectionHead = async (
    sectionId: string | number,
    departmentId: string | number,
    unitId: string | number,
    setFieldValue: (field: string, value: any) => void
  ) => {
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
        setFieldValue("sectionHead", response.sectionHead?.linemanagerName);
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
        const options = response.map((manager: LineManagerData) => ({
          value: manager?.linemanagerName,
          label: manager?.linemanagerName,
        }));
        setLineManagerOptions(options);
      } else {
        setLineManagerOptions(emptySelector);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const validationSchema = Yup.object().shape({
    unitId: Yup.string().required("Unit is required"),
    departmentId: Yup.string().required("Department is required"),
    sectionId: Yup.string().required("Section is required"),
    // exactLocation: Yup.string().required("Location is required"),
    incidentTime: Yup.date()
      .nullable()
      .required("Incident time is required")
      .typeError("Invalid time format"),
    incidentDate: Yup.date().nullable().required("Incident date is required"),
    // departmentHod: Yup.string().required("Department HOD is required"),
    // lineManager: Yup.string().required("Line Manager is required"),
    costInRupees: Yup.string(),
    costOfIncident: Yup.string(),
    incidentClassification: Yup.string(),
  });

  const today = new Date();
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 10);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={(values) => {
        const finalValues = {
          ...values,
          incidentTime: values.incidentTime
            ? dayjs(values.incidentTime).format("HH:mm")
            : null,
          incidentDate: values.incidentDate
            ? dayjs(values.incidentDate).format("YYYY-MM-DD")
            : null,
        };
        setPirData((prevPirData: any) => ({
          ...prevPirData,
          ...finalValues,
          accordionIndex: 0,
          // Ensure these additional fields are maintained if they exist
          ...(prevPirData?.objectId && { objectId: prevPirData.objectId }),
          ...(prevPirData?.pirId && { pirId: prevPirData.pirId }),
        }));

        setUnitData(finalValues);
        setCurrentStatus(1);
        setOpenSection(1);
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
        useEffect(() => {
          if (pirData?.sectionId && pirData?.departmentId && pirData?.unitId) {
            fetchSectionHead(
              pirData.sectionId,
              pirData.departmentId,
              pirData.unitId,
              setFieldValue
            );
          }
        }, [pirData?.sectionId]);
        return (
          <form onSubmit={handleSubmit}>
            <div className="filters">
              <div className="row form_grider d1">
                <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="Unit Details"
                    value={values.unitName}
                    name="unitName"
                    placeholder=""
                    errors={touched.unitName && errors.unitName}
                    touched={touched.unitName}
                    onChange={handleChange}
                    maxLength={50}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="Department"
                    value={values.departmentName}
                    name="departmentName"
                    placeholder=""
                    errors={touched.departmentName && errors.departmentName}
                    touched={touched.departmentName}
                    onChange={handleChange}
                    maxLength={50}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="Section"
                    value={values.sectionName}
                    name="sectionName"
                    placeholder=""
                    errors={touched.sectionName && errors.sectionName}
                    touched={touched.sectionName}
                    onChange={handleChange}
                    maxLength={50}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="Injury Happened"
                    value={values.injuryHappened}
                    name="injuryHappened"
                    placeholder=""
                    errors={touched.injuryHappened && errors.injuryHappened}
                    touched={touched.injuryHappened}
                    onChange={handleChange}
                    maxLength={180}
                    disabled={true}
                  />
                </div>
              </div>
              <div className="row form_grider d1">
                <div className="col-12 col-md-3 col-lg-3">
                  <div className="dateFlield">
                    <DatePickerField
                      label="Date of Incident"
                      name="incidentDate"
                      value={values.incidentDate}
                      placeholder="choose a date"
                      maxDate={new Date()}
                      dateFormat="yyyy-MM-dd"
                      onChange={(date: Date) =>
                        setFieldValue("incidentDate", date)
                      }
                      disabled={true}
                    />
                    <span className="dateFlield__icon"></span>
                  </div>
                </div>
                <div className="col-12 col-md-3 col-lg-3">
                  <InputField
                    type="text"
                    label="Incident Time"
                    value={values?.incidentTime ? dayjs(values?.incidentTime).format("HH:mm") : ""}
                    name="incidentTime"
                    placeholder=""
                    errors={touched.incidentTime && errors.incidentTime}
                    touched={touched.incidentTime}
                    onChange={handleChange}
                    maxLength={30}
                    disabled={true}
                  />
                </div>
                <div className="col-12 col-md-6 col-lg-6">
                  <InputField
                    type="text"
                    label="Exact Location"
                    value={exactLocation}
                    name="exactLocation"
                    placeholder=""
                    errors=""
                    touched=""
                    onChange={() => {}}
                    maxLength={300}
                    disabled={true}
                  />
                </div>
              </div>
              <div className="row form_grider d1">
                <div className="col-12 col-md-4 col-lg-4">
                  <MultiSelectField
                    label="Cost of Incident"
                    value={values.costOfIncident}
                    name="costOfIncident"
                    placeholder="Select"
                    options={costOfIncidentOptions}
                    selectAllLabel="Select All"
                    onChange={(output, ids) => {
                      setFieldValue("costOfIncident", output);
                    }}
                    outputFormat="string"
                    onBlur={() => handleBlur}
                    enableSelectAll={true}
                  />
                </div>
                <div className="col-12 col-md-2 col-lg-2">
                  <InputField
                    type="text"
                    label="Cost"
                    value={values.costInRupees}
                    name="costInRupees"
                    placeholder=""
                    errors={touched.costInRupees && errors.costInRupees}
                    touched={touched.costInRupees}
                    reference={costRef}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                      keyDownFunc(e, costRef, false)
                    }
                    onChange={(e) => 
                      setFieldValue("costInRupees", e.target.value)
                    }
                    maxLength={30}
                  />
                </div>
                <div className="col-12 col-md-4 col-lg-4">
                  <MultiSelectField
                    label="Preliminary Classification"
                    value={values.incidentClassification || ""}
                    disabled={true}
                    name="incidentClassification"
                    placeholder="Select"
                    options={prelimClassificOptions}
                    selectAllLabel="Select All"
                    onChange={(output, ids) => {
                      setFieldValue("incidentClassification", output);
                    }}
                    outputFormat="string"
                    onBlur={() => handleBlur}
                    enableSelectAll={true}
                  />
                </div>
                <div className="col-12 col-md-2 col-lg-2">
                  <SelectField
                    label="Incident Category"
                    value={
                      incidentCategoryOptions.find(
                        (option) => option.label == values.incidentCategory
                      ) || emptySelector
                    }
                    name="incidentCategory"
                    placeholder="Select Incident Category"
                    options={incidentCategoryOptions}
                    disabled={true}
                    onChange={(selectedOption: SelectOptions) => {
                      setFieldValue("incidentCategory", selectedOption.value);
                    }}
                    onBlur={handleBlur}
                    errors={touched.incidentCategory && errors.incidentCategory}
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

export default UnitDetails;