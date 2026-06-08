"use client"
import React, { useState } from "react";
import { Formik } from "formik";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Image from "next/image";
import * as Yup from "yup";

import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import InputField from "@/components/Form/InputField";

import CustomModal from "@/components/Layouts/CustomModal";
import { SelectOptions } from "@/components/interfaces";
import { useModalManager } from "@/hooks/useModalManager";
import MultiSelectDropdown from "@/components/Form/MultiSelectDropdown";
import { genderSelector } from "@/config/config";

type InjuryRow = {
  bodyPart: SelectOptions | null;
  injuryNature: SelectOptions[];
  isOpen: boolean;
};

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

interface DetailsOfInjuryProps {
  readOnly?: boolean; 
  injuryData: any;
  injuredJobTypeOptions: SelectOptions[];
  setInjuryData: (data: any) => void;
  currentStatus: number;
  bodyPartOptions: SelectOptions[];
  injuryNatureOptions: SelectOptions[];
  setCurrentStatus: (status: number) => void;
  setOpenSection: (section: number) => void;
  pirData?: any;
  setPirData?: (data: any) => void;
}

const DetailsOfInjury = ({
  readOnly,
  pirData,
  injuryData,
  injuredJobTypeOptions,
  setInjuryData,
  bodyPartOptions,
  injuryNatureOptions,
  setCurrentStatus,
  setOpenSection,
  setPirData = () => {}
}: DetailsOfInjuryProps) => {
  dayjs.extend(customParseFormat);

  const initialValues = {
    injuries: injuryData?.injuries || pirData?.injuries || [],
    // whatHappened: injuryData?.whatHappened || pirData?.whatHappened || "",
    // preliminaryFindings: injuryData?.preliminaryFindings || pirData?.preliminaryFindings || "",
  };
  
  const injuredEmployeeTypeOptions = [{ value: "Internal", label: "Internal" }, { value: "External", label: "External" },{ value: "Contractor", label: "Contractor" }, { value: "Others", label: "Others" }]
  // const [initFlagId, setInitFlagId] = useState<number>(1);
  // const [initFlagId, setInitFlagId] = useState<number>(() => {
  //   const existing = (injuryData?.injuries || pirData?.injuries || []) as any[];
  //   if (!existing || existing.length === 0) return 1;
  //   const maxFlag = Math.max(...existing.map((inj: any) => (inj?.flagInjuryId ? Number(inj.flagInjuryId) : 0)));
  //   return maxFlag + 1;
  // });
  // const [existingFlagId, setExistingFlagId] = useState<number>(0)
  const [incidentLastDate, setIncidentLastDate] = useState("")
  const [injuredEmployeeType, setInjuredEmployeeType] = useState<SelectOptions | null>(null);
  const [employeeIdOrGatePass, setEmployeeIdOrGatePass] = useState<string>('');
  const [injuredGender, setInjuredGender] = useState<SelectOptions | null>(null);
  const [injuredAddress, setInjuredAddress] = useState<string>('');
  const [injuredDesignation, setInjuredDesignation] = useState<string>('');
  const [injuredBodyParts, setInjuredBodyParts] = useState<SelectOptions | null>(null);
  const [injuryNature, setInjuryNature] = useState<SelectOptions[]>([]);
  const [injuredJobType, setInjuredJobType] = useState<SelectOptions | null>(null);
  const [injuredEmployerName, setInjuredEmployerName] = useState<string>('');
  const [injuredName, setInjuredName] = useState<string>('');
  const [currentInjuryIndex, setCurrentInjuryIndex] = useState<number>(-1);
  const [rows, setRows] = useState<any[]>([{ bodyPart: null, injuryNature: [], isOpen: false }]);

  const validationSchema = Yup.object().shape({
    // whatHappened: Yup.string().required("What Happened is required"),
    injuries: Yup.array().of(
      Yup.object().shape({
        employeeType: Yup.string().required("Employee Type is required"),
        employeeId: Yup.string().required("Employee ID / Gate Pass is required"),
        jobType: Yup.string().required("Job Type is required"),
        bodyParts: Yup.string().required("Body Parts Injured is required"),
        natureOfInjuries: Yup.string().required("Nature of Injury is required"),
      })
    )
  });

  const today = new Date();
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 10);

  const { modals, openModal, closeModal } = useModalManager([
    "DetailsOfInjury",
  ] as const);
  const getNextFlagId = (injuries: any[]) => {
    if (!injuries || injuries.length === 0) return 1;
    const maxFlag = Math.max(...injuries.map(i => Number(i.flagInjuryId) || 0));
    return maxFlag + 1;
  };

  const resetInjuryForm = () => {
    setInjuredEmployeeType(null);
    setEmployeeIdOrGatePass("");
    setInjuredName("");
    setInjuredGender(null);
    setInjuredAddress("");
    setInjuredDesignation("");
    setInjuredBodyParts(null);
    setInjuryNature([]);
    setInjuredJobType(null);
    setInjuredEmployerName("");
    setCurrentInjuryIndex(-1);
    setRows([{ bodyPart: null, injuryNature: [], isOpen: false }]);
  };

  const handleAddInjuries = (values: any, setFieldValue: any) => {
    const validRows = rows.filter(row => row.bodyPart != '' && row.injuryNature.length > 0);
    if (validRows.length === 0) {
      return;
    }

    let flagInjuryId;

    if (currentInjuryIndex === -1) {
      flagInjuryId = getNextFlagId(values.injuries);
    } else {
      flagInjuryId = values.injuries[currentInjuryIndex].flagInjuryId;
    }
    const bodyParts = validRows.map(row => row.bodyPart?.label).filter(Boolean).join(", ");
    const natureOfInjuries = validRows.map(row => 
      row.injuryNature.map((nature: SelectOptions) => nature.label).join(", ")
    ).filter(Boolean).join(", ");

    const newInjuryDetail: InjuryDetail = {
      employeeType: injuredEmployeeType?.label || "",
      employeeId: employeeIdOrGatePass,
      injuredName: injuredName,
      gender: injuredGender?.label || "",
      address: injuredAddress,
      designation: injuredDesignation,
      jobType: injuredJobType?.label || "",
      nameOfEmployer: injuredEmployerName,
      flagInjuryId: flagInjuryId,
      bodyParts: bodyParts,
      natureOfInjuries: natureOfInjuries,
      incidentLastDate: incidentLastDate,
      bodyPartList: validRows.map((row, index) => ({
        bodyPart: row.bodyPart?.label || "",
        employeeId: employeeIdOrGatePass,
        createdAt: dayjs().toISOString(),
        createdBy: pirData?.createdBy || "",
        natureOfInjury: row.injuryNature.map((n: SelectOptions) => n.label).join(", "),
        flagInjuryId: flagInjuryId,
        rowIndex: index
      }))
    };

    const updatedInjuries = [...values.injuries];
    if (currentInjuryIndex === -1) {
      updatedInjuries.push(newInjuryDetail);
      console.log("newInjuryDetail", newInjuryDetail)
      // setInitFlagId(prev => prev + 1);
    } else {
      if (currentInjuryIndex >= 0 && currentInjuryIndex < updatedInjuries.length) {
        updatedInjuries[currentInjuryIndex] = newInjuryDetail;
      }
    }
    setFieldValue("injuries", updatedInjuries);
    resetInjuryForm();
    closeModal("DetailsOfInjury");
  };

  const editInjuryDetail = (index: number, injuries: InjuryDetail[]) => {
    if (index < 0 || index >= injuries.length) return;
    const injury = injuries[index];
    setInjuredEmployeeType(injuredEmployeeTypeOptions.find(opt => opt.label === injury.employeeType) || null);
    setEmployeeIdOrGatePass(injury.employeeId);
    setInjuredName(injury.injuredName);
    setInjuredGender(genderSelector.find(opt => opt.label === injury.gender) || null);
    setInjuredAddress(injury.address);
    setInjuredDesignation(injury.designation);
    setInjuredJobType(injuredJobTypeOptions?.find(opt => opt.label === injury.jobType) || null);
    setInjuredEmployerName(injury.nameOfEmployer);
    
    const newRows = injury.bodyPartList.filter(item => item.rowIndex >= 0 && item.bodyPart).map(item => ({
      bodyPart: bodyPartOptions?.find(opt => opt.label === item.bodyPart) || null,
      injuryNature: injuryNatureOptions?.filter(opt => 
        item.natureOfInjury.includes(opt.label)
      ) || [],
      isOpen: false
    }));
    if(newRows.length){
      setRows( newRows);
    }
    setCurrentInjuryIndex(index);
    openModal("DetailsOfInjury");
  };

  return (
    <div className="filters">
            <div className="row form_grider d1">
              <div className="row">
                <div className="col-12">
                  <div className="actionWrapper withborderBT">
                    {!readOnly && <button className="iconBtn green v2 d-flex align-items-center gap-2" type="button" 
                      title={
                        !injuredEmployeeType?.label ||
                        !injuredName || !employeeIdOrGatePass || !injuredGender || !injuredAddress || !injuredDesignation || !injuredBodyParts || !injuryNature || !injuredJobType || !injuredEmployerName ? "Please fill all fields" : ""
                      }
                      onClick={() => {
                          // !injuredEmployeeType?.label || !employeeIdOrGatePass || !injuredName || !injuredGender || !injuredAddress || !injuredDesignation || !injuredBodyParts || !injuryNature || !injuredJobType || !injuredEmployerName 
                          openModal("DetailsOfInjury")
                      }}>
                        <Image
                        width={16}
                        height={16}
                        alt="Add"
                        className="img-fluid"
                        src="/images/svg/plus.svg"
                      />
                      <span>Add Injured</span>
                    </button>}
                  </div>
                </div>
              </div>
            </div>
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={(values) => {
        setInjuryData(values);
        setPirData((pirData: any) => ({ ...pirData, ...values }));
        setCurrentStatus(4);
        setOpenSection(4);
      }}
    >
      {({
        values,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setFieldTouched,
        touched,
        errors,
      }) => (
        <form onSubmit={handleSubmit}>
          <div className="row">
              <div className="col-12">
                <div className="formTable">
                  <div className="formTable__title">Added Injured Persons</div>
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Employee Type</th>
                            <th>Employee ID</th>
                            <th>Injured Name</th>
                            <th>Gender</th>
                            <th>Address</th>
                            <th>Designation</th>
                            <th>Body Part Injured</th>
                            <th>Nature of Injury</th>
                            <th>Job Type</th>
                            <th>Employer Name</th>
                            <th>Incident Last Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {values.injuries?.length > 0 ? (
                            values.injuries.map((row: InjuryDetail, index: number) => (
                              <tr key={index}>
                                <td>{row.employeeType}</td>
                                <td>{row.employeeId}</td>
                                <td>{row.injuredName}</td>
                                <td>{row.gender}</td>
                                <td>{row.address}</td>
                                <td>{row.designation}</td>
                                <td>{row.bodyParts}</td>
                                <td>{row.natureOfInjuries}</td>
                                <td>{row.jobType}</td>
                                <td>{row.nameOfEmployer}</td>
                                <td>{row.incidentLastDate}</td>
                                <td>
                                  <div className="u-icon">
                                  <button className="tableBtn v2" type="button">
                                    <span className="iconPrimary">
                                      <Image width={15} height={15} alt="icon" src="/images/svg/eye-icon-blue.svg" className="img-fluid u-image" />
                                    </span>
                                  </button>
                                  {/* <button 
                                    className="tableBtn v2" 
                                    type="button" 
                                    disabled={readOnly}
                                    onClick={() => editInjuryDetail(index, values.injuries)}
                                  >
                                    <span className="iconPrimary">
                                      <Image width={15} height={15} alt="icon" src="/images/svg/edit-icon.svg" className="img-fluid u-image" />
                                    </span>
                                  </button> */}
                                  <button 
                                    className="tableBtn v2" 
                                    type="button" 
                                    disabled={readOnly}
                                    onClick={() => {
                                      const updated = [...values.injuries];
                                      updated.splice(index, 1);
                                      setFieldValue("injuries", updated);
                                    }}
                                  >
                                    <span className="iconSecondary">
                                      <Image width={15} height={15} alt="icon" src="/images/svg/delete-icon.svg" className="img-fluid u-image" />
                                    </span>
                                  </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={12} className="text-center">
                                No injury details added yet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="row form_grider d1 mt-3">
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  label="What Happened"
                  required={true}
                  value={values.whatHappened}
                  disabled={readOnly}
                  name="whatHappened"
                  placeholder=""
                  errors={touched.whatHappened && errors.whatHappened}
                  touched={touched.whatHappened}
                  onBlur={(e) => {setFieldTouched('whatHappened', true);handleBlur(e)}}
                  onChange={(e: any) => {
                    setFieldValue('whatHappened',e.target.value);
                    setFieldTouched('whatHappened', true)
                  }}
                  maxLength={300}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  label="Preliminary Findings"
                  disabled={readOnly}
                  value={values.preliminaryFindings}
                  name="preliminaryFindings"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={(e: any) => {
                    setFieldValue('preliminaryFindings',e.target.value);
                  }}
                  maxLength={300}
                />
              </div>
            </div>           */}

          <CustomModal
            isOpen={modals.DetailsOfInjury}
            onClose={() => { resetInjuryForm(); closeModal("DetailsOfInjury") }}
            title="Add Injury Details"
          >
            <>
              <div className="filters">
                <div className="row form_grider d1">
                  <div className="col-12 col-md-4 col-lg-2">
                    <SelectField
                      label="Employee Type"
                      value={injuredEmployeeType}
                      name="injuredEmployeeType"
                      disabled={readOnly}
                      placeholder=""
                      options={injuredEmployeeTypeOptions}
                      onChange={(value: any) => {
                        setInjuredEmployeeType(value);
                      }}
                      onBlur={() => { }}
                    />
                  </div>
                  <div className="col-12 col-md-4 col-lg-2">
                    <InputField
                      type="text"
                      label="Emp. ID / Gate Pass No."
                      value={employeeIdOrGatePass}
                      disabled={readOnly}
                      name="employeeIdOrGatePass"
                      placeholder=""
                      errors={""}
                      touched={""}
                      onBlur={() => { }}
                      onChange={(e: any) => {
                        setEmployeeIdOrGatePass(e.target.value);
                      }}
                      maxLength={30}
                    />
                  </div>

                  <div className="col-12 col-md-4 col-lg-2">
                    <InputField
                      type="text"
                      label="Injured Name"
                      value={injuredName}
                      name="injuredName"
                      disabled={readOnly}
                      placeholder=""
                      errors={""}
                      touched={""}
                      onBlur={() => { }}
                      onChange={(e: any) => {
                        setInjuredName(e.target.value);
                      }}
                      maxLength={30}
                    />
                  </div>
                  <div className="col-12 col-md-4 col-lg-2">
                    <SelectField
                      label="Gender"
                      value={injuredGender}
                      disabled={readOnly}
                      name="injuredGender"
                      placeholder=""
                      options={genderSelector}
                      onChange={(value: any) => {
                        setInjuredGender(value);
                      }}
                      onBlur={() => { }}
                    />
                  </div>
                  <div className="col-12 col-md-4 col-lg-4">
                    <InputField
                      type="text"
                      label="Address"
                      value={injuredAddress}
                      name="injuredAddress"
                      placeholder=""
                      errors={""}
                      disabled={readOnly}
                      touched={""}
                      onBlur={() => { }}
                      onChange={(e: any) => {
                        setInjuredAddress(e.target.value);
                      }}
                      maxLength={100}
                    />
                  </div>
                  <div className="col-12 col-md-4 col-lg-3">
                    <InputField
                      type="text"
                      label="Designation"
                      value={injuredDesignation}
                      name="injuredDesignation"
                      disabled={readOnly}
                      placeholder=""
                      errors={""}
                      touched={""}
                      onBlur={() => { }}
                      onChange={(e: any) => {
                        setInjuredDesignation(e.target.value);
                      }}
                      maxLength={30}
                    />
                  </div>
                  <div className="col-12 col-md-4 col-lg-3">
                    <SelectField
                      label="Job Type"
                      value={injuredJobType}
                      name="injuredJobType"
                      disabled={readOnly}
                      placeholder=""
                      options={injuredJobTypeOptions}
                      onChange={(value: any) => {
                        setInjuredJobType(value);
                      }}
                      onBlur={() => { }}
                    />
                  </div>
                  <div className="col-12 col-md-4 col-lg-3">
                    <InputField
                      type="text"
                      label="Name of Employer"
                      value={injuredEmployerName}
                      name="injuredEmployerName"
                      disabled={readOnly}
                      placeholder=""
                      errors={""}
                      touched={""}
                      onBlur={() => { }}
                      onChange={(e: any) => {
                        setInjuredEmployerName(e.target.value);
                      }}
                      maxLength={50}
                    />
                  </div>
                  <div className="col-12 col-md-4 col-lg-3">
                    <DatePickerField
                      label="Incident Last Date"
                      name="incidentLastDate"
                      placeholder="choose a date"
                      maxDate={new Date()}
                      value={incidentLastDate ? new Date(incidentLastDate) : null}
                      dateFormat="dd/MM/yyyy"
                      onChange={(date: Date | null) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          setIncidentLastDate(`${year}-${month}-${day}`);
                        } else {
                          setIncidentLastDate("");
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  {bodyPartOptions && injuryNatureOptions && (
                    <MultiSelectDropdown
                      rows={rows}
                      setRows={setRows}
                      disabled={readOnly}
                      injuredBodyParts={injuredBodyParts}
                      setInjuredBodyParts={setInjuredBodyParts}
                      bodyPartOptions={bodyPartOptions || []}
                      injuryNature={injuryNature}
                      setInjuryNature={setInjuryNature}
                      injuryNatureOptions={injuryNatureOptions || []}
                      currentInjuryIndex={currentInjuryIndex}
                      values={values}
                      setFieldValue={setFieldValue}
                      onClose={() => {
                        resetInjuryForm();
                        closeModal("DetailsOfInjury");
                      }} />)}
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="btnWrapper">
                      <button className="btnNoicon red" type="button" onClick={() => {
                        resetInjuryForm();
                        closeModal("DetailsOfInjury");
                      }}>Cancel</button>
                      <button className="btnNoicon green" type="button"
                        onClick={() => handleAddInjuries(values, setFieldValue)}
                      >{currentInjuryIndex === -1 ? "Add Details" : "Update Details"}</button>
                  </div>
                  </div>
                </div>
              </div>
            </>
          </CustomModal>
          { !readOnly && <button
            className="iconBtn green v2 ms-0"
            type="submit"
          >
            <span>Save & Next</span>
          </button>}
        </form>
      )}
    </Formik>
    </div>
  );
};

export default DetailsOfInjury;