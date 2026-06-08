"use client"
import React, { useState } from "react";
import { Formik, FormikHelpers } from "formik";
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
import { serverRequest } from "@/services/getServerSideRender";
import { CONSTANTS } from "@/config/constant";
import { SAVE_DRAFT_PIR} from "@/config/apiConfig";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { ToastContainer, toast } from "react-toastify";
import { RootState } from "@/store/store";

interface InjuryDetail {
  pirId: string;
  injuryId: number;
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
  bodyPartOptions: SelectOptions[];
  injuryNatureOptions: SelectOptions[];
  pirData?: any;
  setPirData?: (data: any) => void;
}
interface InjuryFormValues {
  injuries: InjuryDetail[];
}
const DetailsOfInjuryEdit = ({
  readOnly,
  pirData,
  injuryData,
  injuredJobTypeOptions,
  setInjuryData,
  bodyPartOptions,
  injuryNatureOptions,
  setPirData = () => {}
}: DetailsOfInjuryProps) => {
  dayjs.extend(customParseFormat);
   const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  const initialValues: InjuryFormValues = {
    injuries: pirData?.injuries || injuryData?.injuries || []
  };
  
  const injuredEmployeeTypeOptions = [{ value: "Internal", label: "Internal" }, { value: "External", label: "External" },{ value: "Contractor", label: "Contractor" }, { value: "Others", label: "Others" }]
  const [initFlagId, setInitFlagId] = useState<number>(1);
  // const [existingFlagId, setExistingFlagId] = useState<number>(0)
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
  const [injuryModalMode, setInjuryModalMode] = useState<"add" | "view">("view");
  const pirId = pirData?.pirId; 

  const validationSchema = Yup.object().shape({
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
    const flagInjuryId = currentInjuryIndex === -1 ? initFlagId : values.injuries[currentInjuryIndex].flagInjuryId;
    const bodyParts = validRows.map(row => row.bodyPart?.label).filter(Boolean).join(", ");
    const natureOfInjuries = validRows.map(row => 
      row.injuryNature.map((nature: SelectOptions) => nature.label).join(", ")
    ).filter(Boolean).join(", ");

    const newInjuryDetail: InjuryDetail = {
      pirId: pirId || null,
      injuryId: currentInjuryIndex === -1 ? null : values.injuries[currentInjuryIndex].injuryId,
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
      incidentLastDate: null,
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
      setInitFlagId(prev => prev + 1);
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

  // Fill form values
  setInjuredEmployeeType(injuredEmployeeTypeOptions.find(opt => opt.label === injury.employeeType) || null);
  setEmployeeIdOrGatePass(injury.employeeId);
  setInjuredName(injury.injuredName);
  setInjuredGender(genderSelector.find(opt => opt.label === injury.gender) || null);
  setInjuredAddress(injury.address);
  setInjuredDesignation(injury.designation);
  setInjuredJobType(injuredJobTypeOptions?.find(opt => opt.label === injury.jobType) || null);
  setInjuredEmployerName(injury.nameOfEmployer);

  const newRows = injury.bodyPartList
    .filter(item => item.rowIndex >= 0 && item.bodyPart)
    .map(item => ({
      bodyPart: bodyPartOptions?.find(opt => opt.label === item.bodyPart) || null,
      injuryNature: injuryNatureOptions?.filter(opt => item.natureOfInjury.includes(opt.label)) || [],
      isOpen: false
    }));

  setRows(newRows);
  setCurrentInjuryIndex(index);

  setInjuryModalMode("view");   // <<< 👈 IMPORTANT
  openModal("DetailsOfInjury");
};
const openAddInjuryModal = () => {
  resetInjuryForm();   // clear all fields
  setInjuryModalMode("add");
  openModal("DetailsOfInjury");
};
  // 🆕 New Delete Handler with API Call 
  const deleteInjuryDetail = async (index: number, injuries: InjuryDetail[], setFieldValue: FormikHelpers<InjuryFormValues>["setFieldValue"]) => {
    if (readOnly) return;
    const injuryToDelete = injuries[index];    
    // Check if we have the necessary IDs for the API call
    console.log("injuries", JSON.stringify(injuries));
    console.log("injuryToDelete", injuries[index]);
    if (!pirId) {
      // If pirId is missing, assume it's a new PIR not yet saved.
      // Perform local Formik deletion and show warning.
      const updated = [...injuries];
      updated.splice(index, 1);
      setFieldValue("injuries", updated);
      toast.warning("Local injury deleted. Save PIR to confirm changes.");
      return;
    }

    const rownumber = injuryToDelete.injuryId;

    if (rownumber === undefined || rownumber === null) {
      // If rownumber is missing, it means this injury was added locally but not saved to the server yet.
      // Just perform local Formik deletion.
      const updated = [...injuries];
      updated.splice(index, 1);
      setFieldValue("injuries", updated);
      toast.warning("Unsaved injury deleted locally. Save PIR to confirm.");
      return;
    }
    console.log("rownumber", rownumber);
    try {
      // Perform the API request to delete the injury on the server
      const response = await serverRequest(
        {},
        SAVE_DRAFT_PIR + `/remove-pir-injury/${pirId}/${rownumber}`,
        CONSTANTS.REQUEST_DELETE,
        true,
        true,
        token
      );
      if (response?.success === true) {
        // If server delete is successful, update Formik state
        const updated = [...injuries];
        updated.splice(index, 1);
        setFieldValue("injuries", updated);
        // Also update the main data prop if needed
        setInjuryData({ injuries: updated });
        setPirData((prev: any) => ({ ...prev, injuries: updated }));
        toast.success(response?.message || `Injury for ${injuryToDelete.injuryId} deleted successfully.`);
      } else {
        toast.error(response?.message || "Failed to delete injury from server.");
      }
    } catch (error) {
      console.error("API Error during injury deletion:", error);
    }
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
                      onClick={() => {openAddInjuryModal();}}>
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
    <Formik<InjuryFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
    //   onSubmit={(values) => {
    //     setInjuryData(values);
    //     setPirData((pirData: any) => ({ ...pirData, ...values }));
    //   }}
    onSubmit={async (values, formikHelpers) => {
    // 1) Combine existing PIR + form section values
    const updatedData = {
      ...pirData,
      injuries: values.injuries,   // includes injuries array
      updatedBy: user?.createdBy,
    };
    try {
      formikHelpers.setSubmitting(true);
      const response = await serverRequest(
        updatedData,
        SAVE_DRAFT_PIR + `/update-pir/${pirData.pirId}`,
        CONSTANTS.REQUEST_PUT,
        true,
        true,
        token
      );
      if (response?.success === true) {
        toast.success(response?.message || "PIR Updated Successfully");
        setPirData(updatedData);
        setInjuryData(values);
        formikHelpers.resetForm({
          values: { ...values }
        });
      } else {
        toast.error(response?.message || "Failed to update PIR");
      }

    } catch (error) {
      console.error("Error saving PIR:", error);
      toast.error("Something went wrong");
    } finally {
      formikHelpers.setSubmitting(false);
    }
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
                                  {/* <button className="tableBtn v2" type="button">
                                    <span className="iconPrimary">
                                      <Image width={15} height={15} alt="icon" src="/images/svg/eye-icon-blue.svg" className="img-fluid u-image" />
                                    </span>
                                  </button> */}
                                  <button 
                                    className="tableBtn v2" 
                                    type="button" 
                                    disabled={readOnly}
                                    onClick={() => editInjuryDetail(index, values.injuries)}
                                  >
                                    <span className="iconPrimary">
                                      <Image width={15} height={15} alt="icon" src="/images/svg/eye-icon-blue.svg" className="img-fluid u-image" />
                                    </span>
                                  </button>
                                  <button 
                                    className="tableBtn v2" 
                                    type="button" 
                                    disabled={readOnly}
                                    // onClick={() => {
                                    //   const updated = [...values.injuries];
                                    //   updated.splice(index, 1);
                                    //   setFieldValue("injuries", updated);
                                    // }}
                                    onClick={() => deleteInjuryDetail(index, values.injuries, setFieldValue)}
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
           
          <CustomModal
            isOpen={modals.DetailsOfInjury}
            onClose={() => { resetInjuryForm(); closeModal("DetailsOfInjury") }}
            title={injuryModalMode === "add" ? "Add Injury Details" : "View Injury Details"}
          >
            <>
              <div className="filters">
                <div className="row form_grider d1">
                  <div className="col-12 col-md-4 col-lg-2">
                    <SelectField
                      label="Employee Type"
                      value={injuredEmployeeType}
                      name="injuredEmployeeType"
                      disabled={injuryModalMode === "view"}
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
                      disabled={injuryModalMode === "view"}
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
                      disabled={injuryModalMode === "view"}
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
                      disabled={injuryModalMode === "view"}
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
                      disabled={injuryModalMode === "view"}
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
                      disabled={injuryModalMode === "view"}
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
                      disabled={injuryModalMode === "view"}
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
                      disabled={injuryModalMode === "view"}
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
                      name="fromDate"
                      placeholder="choose a date"
                      errors={""}
                      touched={""}
                      disabled={injuryModalMode === "view"}
                      value={new Date()}
                      maxDate={new Date()}
                      dateFormat="yyyy-MM-dd"
                      onChange={() => { }}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  {bodyPartOptions && injuryNatureOptions && (
                    <MultiSelectDropdown
                      rows={rows}
                      setRows={setRows}
                      disabled={injuryModalMode === "view"}
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

export default DetailsOfInjuryEdit;