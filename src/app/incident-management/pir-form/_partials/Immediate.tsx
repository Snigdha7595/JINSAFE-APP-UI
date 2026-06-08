import React, { useState } from "react";
import { Formik } from "formik";
import Image from "next/image"
import * as Yup from "yup";

import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import InputField from "@/components/Form/InputField";

import { AutoSubmitTrigger } from "./AutoSubmitTrigger";
import Button from "@/components/Elements/Button";
import CustomModal from "@/components/Layouts/CustomModal";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_SECTIONS, FETCH_LINEMANAGER } from "@/config/apiConfig";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { SelectOptions } from "@/components/interfaces";
import { emptySelector } from "@/config/config";



const Immediate = ({
 readOnly,
 immediateData,
 setImmediateData,
 departmentOptions,
 currentStatus,
 setCurrentStatus,
 setOpenSection,
 pirData,
 setPirData,
}:any) => {
  const token = useSelector(selectUserToken);
  const initialValues = {
    immediateActions: pirData?.immediateActions || [],
  };

  const validationSchema = Yup.object().shape({
    
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [immedAction, setImmedAction] = useState<string>("");
  const [immedSectionOptions, setImmedSectionOptions] = useState<SelectOptions[] | null>(emptySelector);
  const [immedAssignedLineManager, setImmedAssignedLineManager] = useState<SelectOptions | null >(null);
  const [immedDepartment, setImmedDepartment] = useState<SelectOptions>(emptySelector[0]);
  const [immedLineManagerOptions, setImmedLineManagerOptions]  = useState(emptySelector)
  const [immedSection, setImmedSection] = useState<SelectOptions | null >(null);
  const [immedSectionHead, setImmedSectionHead] = useState<string>("");
  const [immedTargetDate, setImmedTargetDate] = useState<string | Date>("");
  const [modalMode, setModalMode] = useState<"add" | "view">("add");
  const [currentRowIndex, setCurrentRowIndex] = useState<number>(-1);

  const fetchImmedSections = async (departmentId: string | number) => {
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
            setImmedSectionOptions(options)
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      const fetchImmedLineManagers = async (departmentId: string | number, sectionId: string | number) => {
        try {
          const response = await serverRequest(
            {},
            FETCH_LINEMANAGER + `/get-line-managers/${departmentId}/active/${sectionId}`,
            CONSTANTS.REQUEST_GET,
            true,
            true,
            token
          );
          
          if (response.length > 0) {
            const options = response.map((manager: any) => ({value: manager?.linemanagerName, label: manager?.linemanagerName}))
            setImmedLineManagerOptions(options)
          } else {
            setImmedLineManagerOptions(emptySelector)
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

    const fetchImmedSectionHead = async (sectionId: string | number, departmentId: string | number, unitId: string | number) => {
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
          setImmedSectionHead(response.sectionHead?.linemanagerName)
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

  const resetModal = () => {
    setImmedAction("");
    setImmedDepartment(emptySelector[0]);
    setImmedSection(emptySelector[0]);
    setImmedAssignedLineManager(emptySelector[0]);
    setImmedSectionHead("");
    setImmedTargetDate("");
    setCurrentRowIndex(-1);
    setModalMode("add");
  };

  const today = new Date();
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 10);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={(values) => {
        setImmediateData(values);
        setPirData((prevPirData: any) => ({...prevPirData, ...values}))
        setCurrentStatus(5);
        setOpenSection(5);
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
      }) => (
        <form onSubmit={handleSubmit}>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="row">
                <div className="col-12">
                  <div className="actionWrapper ">
                    {!readOnly && <button
                      className="iconBtn green v2 withborderBT"
                      type="button"
                      onClick={() => {resetModal(); setIsOpen(true)}}
                    >
                      <span>Add Action</span>
                      <Image
                        width={15}
                        height={15}
                        alt="icon"
                        className="img-fluid u-image"
                        src="/images/svg/plus.svg"
                      />
                    </button>}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="formTable">
                    <div className="formTable__table">
                      <div className="admin-table d3 table-responsive mt-3 noHover">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Immediate Actions</th>
                              <th>Responsible Person</th>
                              <th>Responsible Department</th>
                              <th>Responsible Section</th>
                              <th>Section Head</th>
                              <th>Target Date</th>
                              { !readOnly && <th>Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {values.immediateActions.length > 0 ? (
                            values.immediateActions.map((row, index) => (
                              <tr key={index}>
                                <td>{row.actiontaken}</td>
                                <td>{row.linemanagerName}</td>
                                <td>{row.responsibleDepartmentName}</td>
                                <td>{row.responsibleSectionName}</td>
                                <td>{row.sectionhead}</td>
                                <td>{row.targetdate}</td>
                                { !readOnly && <td className="u-icon">
                                  <button
                                    className="tableBtn v2" 
                                    type="button"
                                    onClick={() => {
                                      setImmedAction(row.actiontaken || "");
                                      setImmedDepartment(
                                        row.responsibleDepartmentName
                                          ? { label: row.responsibleDepartmentName, value: row.responsibleDepartmentName }
                                          : emptySelector[0]
                                      );
                                      setImmedSection(
                                        row.responsibleSectionName
                                          ? { label: row.responsibleSectionName, value: row.responsibleSectionName }
                                          : null
                                      );
                                      setImmedAssignedLineManager(
                                        row.linemanagerName ? { label: row.linemanagerName, value: row.linemanagerName } : null
                                      );
                                      setImmedSectionHead(row.sectionhead || "");
                                      setImmedTargetDate(row.targetdate || "");
                                      setCurrentRowIndex(index);
                                      setModalMode("view");
                                      setIsOpen(true);
                                    }}
                                  >
                                    <span className="iconPrimary">
                                        <Image
                                          width={15}
                                          height={15}
                                          alt="icon"
                                          src="/images/svg/eye-icon-blue.svg"
                                          className="img-fluid u-image"
                                        />
                                      </span>
                                    </button>
                                    <button className="tableBtn v2"
                                      type="button"
                                      disabled={readOnly}
                                      onClick={() => {
                                      const updated = [
                                        ...values.immediateActions,
                                      ];
                                      updated.splice(index, 1);
                                      setFieldValue(
                                        "immediateActions",
                                        updated
                                      );
                                    }}>
                                      <span className="iconSecondary">
                                        <Image
                                          width={15}
                                          height={15}
                                          alt="icon"
                                          src="/images/svg/delete-icon.svg"
                                          className="img-fluid u-image"
                                        />
                                      </span>
                                    </button>
                                  </td>}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center">
                                No immediate actions added yet
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
            </div>
            { !readOnly && <button
            disabled={values.immediateActions.length === 0}
            title={`${values.immediateActions.length === 0 ? "Please add at least one immediate action" : "Save & Next"}`}
            className="iconBtn green v2 ms-0"
            type="submit"
          >
            <span>Save & Next</span>
          </button>}
          </div>
          <CustomModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          resetModal();
        }}
        title={modalMode === "add" ? "Add Immediate Action" : "View Immediate Action"}
      >
        <>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  disabled={readOnly || modalMode === "view"}
                  required={true}
                  label="Immediate Action"
                  value={immedAction}
                  name="immedAction"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={(e: any) => {
                    if (modalMode === "add") {
                      setImmedAction(e.target.value);
                    }
                  }}
                  maxLength={300}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Department"
                  value={immedDepartment}
                  disabled={readOnly || modalMode === "view"}
                  name="immedDepartment"
                  placeholder="Select Department"
                  options={departmentOptions}
                  onChange={(value: any) => {
                    if (modalMode === "add") {
                      setImmedDepartment(value);
                      setImmedLineManagerOptions(emptySelector)
                      setImmedAssignedLineManager(null)
                      setImmedSection(null)
                      fetchImmedSections(value.value)
                    }
                  }}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Section"
                  value={immedSection}
                  disabled={readOnly || modalMode === "view"}
                  name="immedSection"
                  placeholder=""
                  options={immedSectionOptions}
                  onChange={(value: any) => {
                    if(!value?.value) return;
                    if (modalMode === "add") {
                      setImmedSection(value);
                      fetchImmedLineManagers(immedDepartment?.value, value?.value)
                      fetchImmedSectionHead(value?.value, immedDepartment?.value, pirData?.unitId)
                    }
                  }}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  label="Section Head"
                  disabled={readOnly || true}
                  value={immedSectionHead}
                  name="immedSectionHead"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Assign Line Manager"
                  disabled={readOnly || modalMode === "view"}
                  value={immedAssignedLineManager}
                  name="immedAssignedLineManager"
                  placeholder=""
                  options={immedLineManagerOptions}
                  onChange={(value: any) => {
                    if (modalMode === "add") {
                      setImmedAssignedLineManager(value);
                    }
                  }}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <div className="dateFlield">
                  <DatePickerField
                    label="Target Date"
                    name="immedTargetDate"
                    placeholder="choose a date"
                    minDate={new Date()}
                    disabled={readOnly || modalMode === "view"}
                    value={immedTargetDate
                        ? new Date(immedTargetDate) 
                        : null
                    }
                    dateFormat="dd/MM/yyyy"
                    onChange={(date: Date | null) => {
                      if (modalMode === "add") {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          setImmedTargetDate(`${year}-${month}-${day}`);
                        } else {
                          setImmedTargetDate("");
                        }
                      }
                    }}
                  />
                  <span className="dateFlield__icon">
                    {/* <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/calendar.svg"
                  className="img-fluid u-image"
                  /> */}
                  </span>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="btnWrapper">
                    {modalMode === "add" && (
                    <button className="btnNoicon green" type="button" disabled={!immedAction} title={!immedAction?"Immediate Action is required":""} onClick={() => {
                      setFieldValue('immediateActions',[...values.immediateActions, {
                        actionId: 0,
                        actionMedia: "",
                        actionMediaType: "",
                        actiontakenByUser: "",
                        actionType: "",
                        assignToRole: "",
                        capaDepartments: "",
                        cfsaNo: "",
                        cfsaVerifyEmailStatus: "",
                        cfsaVerifyStatus: "",
                        emailStatus: "",
                        finding: "",
                        flagImage1: "",
                        flagImage2: "",
                        hodRemark: "",
                        imIrFlag: "",
                        imStatus: "",
                        observationNo: 0,
                        reassignReason: "",
                        rowIndex: 0,
                        siNo: "",
                        status: "",
                        actiontaken: immedAction,
                        createdat: new Date(),
                        createdby: pirData.createdBy,
                        updatedat: new Date(),
                        updatedby: pirData.updatedBy,
                        assignLinemanager: "",
                        linemanagerName: immedAssignedLineManager?.label,
                        targetdate: immedTargetDate,
                        sections: immedSection?.label,
                        departments: immedDepartment?.value.toString(),
                        sectionhead: immedSectionHead,
                        imSubmoduleName: "",
                        units: "",
                        departmentHodName: "",
                        flagId: "",
                        responsibleDepartmentName: immedDepartment?.label,
                        responsibleSectionName: immedSection?.label,
                        findingFlag: 0 }] )
                      setIsOpen(false);
                          resetModal();
                        }}
                      >
                        Apply
                      </button>
                    )}
                    <button className="btnNoicon red" type="button" onClick={() => {
                      setIsOpen(false);
                      resetModal();
                    }}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </CustomModal>
        </form>
      )}
    </Formik>
  );
};

export default Immediate;
