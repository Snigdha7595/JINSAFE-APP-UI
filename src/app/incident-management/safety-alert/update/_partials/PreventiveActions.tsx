import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import Image from "next/image";
import * as Yup from "yup";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import InputField from "@/components/Form/InputField";
import CustomModal from "@/components/Layouts/CustomModal";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_SECTIONS, FETCH_LINEMANAGER } from "@/config/apiConfig";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { SelectOptions } from "@/components/interfaces";
import { emptySelector } from "@/config/config";
import { RootState } from "@/store/store";

const PreventiveActions = ({
  readOnly,
  departmentOptions,
  setOpenSAPreview,
  publishButtonVisible,
  revertButtonVisible,
  twoStepProcess,
  currentStatus,
  setCurrentStatus,
  setOpenRevertConfirmation,
  setPublishButtonVisible,
  setOpenSection,
  saData,
  setSaData,
  isUpdateMode,
}: any) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector((state: RootState) => state.auth) as { user: any };
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getInitialValues = () => {
    return {
      preventiveActions: saData?.preventiveActions || [],
    };
  };

  const validationSchema = Yup.object().shape({
    preventiveActions: Yup.array().of(
      Yup.object().shape({
        actiontaken: Yup.string().required("Action is required"),
        linemanagerName: Yup.string().required("Manager is required"),
        responsibleDepartmentName: Yup.string().required("Department is required"),
        responsibleSectionName: Yup.string().required("Section is required"),
        targetdate: Yup.string().required("Target date is required"),
      })
    ),
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [actionText, setActionText] = useState<string>("");
  const [department, setDepartment] = useState<SelectOptions>(emptySelector[0]);
  const [section, setSection] = useState<SelectOptions | null>(null);
  const [sectionOptions, setSectionOptions] = useState<SelectOptions[] | null>(emptySelector);
  const [sectionHead, setSectionHead] = useState<string>("");
  const [assignedLineManager, setAssignedLineManager] = useState<SelectOptions | null>(null);
  const [lineManagerOptions, setLineManagerOptions] = useState(emptySelector);
  const [targetDate, setTargetDate] = useState<string | Date>("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [currentActionId, setCurrentActionId] = useState<number | null>(null);

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
        setSectionOptions(
          response.map((sect: any) => ({
            value: sect?.sectionid,
            label: sect?.sectionname,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const fetchLineManagers = async (departmentId: string | number, sectionId: string | number) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_LINEMANAGER + `/get-line-managers/${departmentId}/active/${sectionId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      setLineManagerOptions(
        response.length > 0
          ? response.map((manager: any) => ({
              value: manager?.linemanagerName,
              label: manager?.linemanagerName,
            }))
          : emptySelector
      );
    } catch (error) {
      console.error("Error fetching line managers:", error);
    }
  };

  const fetchSectionHead = async (sectionId: string | number, departmentId: string | number, unitId: string | number) => {
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
        setSectionHead(response.sectionHead?.linemanagerName);
      }
    } catch (error) {
      console.error("Error fetching section head:", error);
    }
  };

  const resetFormFields = () => {
    setActionText("");
    setDepartment(null);
    setSection(null);
    setSectionHead("");
    setAssignedLineManager(null);
    setTargetDate("");
    setSectionOptions(emptySelector);
    setLineManagerOptions(emptySelector);
    setEditIndex(null);
    setCurrentActionId(null);
  };

  useEffect(() => {
    if (!isOpen) {
      resetFormFields();
    }
  }, [isOpen]);

  const transformToPreventiveActions = (actions: any[]) => {
    return actions.map(action => ({
      siNo: action.siNo || saData?.pirId || "",
      actiontaken: action.actiontaken || "",
      createdat: action.createdat || new Date().toISOString(),
      createdby: action.createdby || user?.createdBy || "",
      updatedat: action.updatedat || new Date().toISOString(),
      updatedby: action.updatedby || user?.createdBy || "",
      actionId: action.actionId || 0,
      targetdate: action.targetdate || "",
      status: action.status || "Pending",
      imSubmoduleName: action.imSubmoduleName || "Safety Alert",
      units: action.units || saData?.unitId || "",
      departments: action.departments.toString() || "",
      responsibleDepartmentName: action.responsibleDepartmentName || "",
      sections: action.sections || "",
      responsibleSectionName: action.responsibleSectionName || "",
      sectionhead: action.sectionhead || "",
      assignLinemanager: action.assignLinemanager || "",
      linemanagerName: action.linemanagerName || "",
      actionType: action.actionType || "Preventive",
      rowIndex: action.rowIndex || 0
    }));
  };

  // const handleSubmit = async (values: any) => {
  //   if (isSubmitting) return;
  //   setIsSubmitting(true);
  //   try {
  //     const updatedSaData = {
  //       ...saData,
  //       preventiveActions: transformToPreventiveActions(values.preventiveActions)
  //     };
  //     console.log("PreventiveActions - Updated saData:", updatedSaData);
  //     setSaData(updatedSaData);
  //     return true;
  //   } catch (error) {
  //     console.error("Submission error:", error);
  //     return false;
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const forceSavePreventiveActions = async (values: any) => {
    if (isSubmitting) return false;
    setIsSubmitting(true);
    try {
      const updatedSaData = {
        ...saData,
        preventiveActions: transformToPreventiveActions(values.preventiveActions)
      };
      console.log("PreventiveActions - Updated saData:", updatedSaData);
      setSaData(updatedSaData);
      return true;
    } catch (error) {
      console.error("Submission error:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (values: any) => {
    return await forceSavePreventiveActions(values);
  };

  const handleSubmitForm = async (values: any) => {
    const success = await handleSubmit(values);
    if (success) {
      if (!twoStepProcess) {
        setPublishButtonVisible(true);
        setOpenSAPreview(true);
      }
    }
  }

  return (
    <Formik
      initialValues={getInitialValues()}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={handleSubmitForm}
    >
      {({ values, handleSubmit: formikSubmit, setFieldValue, errors, touched, isValid }) => (
        <form onSubmit={(e) => {
          e.preventDefault();
          formikSubmit();
        }}>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="row">
                <div className="col-12">
                  <div className="actionWrapper ">
                    {!readOnly && isUpdateMode &&  <button
                      className="iconBtn green v2 withborderBT"
                      type="button"
                      onClick={() => {
                        resetFormFields();
                        setIsOpen(true);
                      }}
                      disabled={isSubmitting}
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
                              <th>Action</th>
                              <th>Responsible Person</th>
                              <th>Responsible Department</th>
                              <th>Responsible Section</th>
                              <th>Section Head</th>
                              <th>Target Date</th>
                              {!readOnly && <th>Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {values.preventiveActions.length > 0 ? (
                              values.preventiveActions.map((row, index) => (
                                <tr key={index}>
                                  <td>{row.actiontaken}</td>
                                  <td>{row.linemanagerName}</td>
                                  <td>{row.responsibleDepartmentName}</td>
                                  <td>{row.responsibleSectionName}</td>
                                  <td>{row.sectionhead}</td>
                                  <td>{row.targetdate}</td>
                                  {!readOnly && (
                                    <td className="u-icon">
                                      <button
                                        className="tableBtn v2"
                                        type="button"
                                        onClick={() => {
                                          const updated = [
                                            ...values.preventiveActions,
                                          ];
                                          updated.splice(index, 1);
                                          setFieldValue(
                                            "preventiveActions",
                                            updated
                                          );
                                        }}
                                      >
                                        <span className="iconSecondary">
                                          <Image
                                            width={15}
                                            height={15}
                                            alt="delete"
                                            src="/images/svg/delete-icon.svg"
                                            className="img-fluid u-image"
                                          />
                                        </span>
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={7} className="text-center">
                                  No actions added yet
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
              {/* <div className="row">
                <div className="col-4 d-flex">
                  {publishButtonVisible && !twoStepProcess && (
                    <button
                      className="iconBtn green v2 ms-0"
                      type="submit"
                      onClick={() => {
                        setOpenSAPreview(true);
                      }}
                    ><span>Save & Preview</span>
                    </button>
                  )}
                  {publishButtonVisible && !twoStepProcess && (
                    <button
                      className="iconBtn orange v2 ms-3"
                      type="button"
                      onClick={() => {
                        setOpenRevertConfirmation(true);
                      }}
                    >
                      Revert
                    </button>
                  )}
                </div>
              </div> */}
              <div className="row">
                <div className="col-12 d-flex">
                  {!readOnly && isUpdateMode && currentStatus === 5 && (
                    <>
                      {!twoStepProcess ? (
                        <button
                          className="iconBtn green v2 ms-0"
                          type="button"
                          disabled={isSubmitting || !isValid}
                          onClick={() => formikSubmit()}
                        >
                          <span>{isSubmitting ? "Saving..." : "Save & Preview"}</span>
                        </button>
                      ) : (
                        <button
                          className="iconBtn green v2 ms-0"
                          type="button"
                          disabled={isSubmitting || !isValid}
                          onClick={() => formikSubmit()}
                        >
                          <span>{isSubmitting ? "Saving..." : "Save"}</span>
                        </button>
                      )}

                      {!twoStepProcess && publishButtonVisible && revertButtonVisible &&(
                        <button
                          className="iconBtn orange v2 ms-3"
                          type="button"
                          // onClick={() => {
                          //   setOpenRevertConfirmation(true);
                          // }}
                          disabled={isSubmitting}
                          onClick={async () => {
                            const saved = await forceSavePreventiveActions(values);
                            if (saved) {
                              setOpenRevertConfirmation(true);
                            }
                          }}
                        >
                          Revert
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <CustomModal
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              title="Add Preventive/Corrective Action"
            >
              <div className="filters">
                <div className="row form_grider d1">
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      type="text"
                      label="Action"
                      value={actionText}
                      name="actionText"
                      placeholder="Action (Max. 300 characters)"
                      errors={""}
                      touched={""}
                      onBlur={() => {}}
                      onChange={(e: any) => setActionText(e.target.value)}
                      maxLength={300}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <SelectField
                      label="Department"
                      value={department}
                      name="department"
                      placeholder="Select Department"
                      options={departmentOptions}
                      onChange={(value: any) => {
                        setDepartment(value);
                        setLineManagerOptions(emptySelector);
                        setAssignedLineManager(null);
                        setSectionHead("");
                        setSection(null);
                        fetchSections(value.value);
                      }}
                      onBlur={() => {}}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <SelectField
                      label="Section"
                      value={section}
                      placeholder="Select Section"
                      name="section"
                      options={sectionOptions}
                      onChange={(value: any) => {
                        setSection(value);
                        fetchLineManagers(department?.value, value.value);
                        fetchSectionHead(
                          value.value,
                          department?.value,
                          saData?.unitId
                        );
                      }}
                      onBlur={() => {}}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <InputField
                      type="text"
                      label="Section Head"
                      value={sectionHead}
                      name="sectionHead"
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
                      placeholder="Line Manager Name"
                      value={assignedLineManager}
                      name="assignedLineManager"
                      options={lineManagerOptions}
                      onChange={(value: any) => setAssignedLineManager(value)}
                      onBlur={() => {}}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-6">
                    <DatePickerField
                      label="Target Date"
                      name="targetDate"
                      placeholder="choose a date"
                      minDate={new Date()}
                      value={targetDate ? new Date(targetDate) : null}
                      dateFormat="dd/MM/yyyy"
                      onChange={(date: Date | null) => {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(
                            2,
                            "0"
                          );
                          const day = String(date.getDate()).padStart(2, "0");
                          setTargetDate(`${year}-${month}-${day}`);
                        } else {
                          setTargetDate("");
                        }
                      }}
                    />
                  </div>
                  <div className="col-12">
                    <div className="btnWrapper">
                      <button
                        className="btnNoicon green"
                        type="button"
                        onClick={() => {
                          if (
                            !actionText ||
                            !department ||
                            !section ||
                            !assignedLineManager ||
                            !targetDate
                          ) {
                            return;
                          }

                          const newAction = {
                            siNo: saData?.pirId || "",
                            actiontaken: actionText,
                            linemanagerName: assignedLineManager.label,
                            responsibleDepartmentName: department.label,
                            responsibleSectionName: section.label,
                            sectionhead: sectionHead,
                            targetdate: targetDate,
                            createdat: new Date().toISOString(),
                            createdby: user?.createdBy || "",
                            updatedat: new Date().toISOString(),
                            updatedby: user?.updatedBy || "",
                            status: "Pending",
                            imSubmoduleName: "Safety Alert",
                            units: saData?.unitId || "",
                            departments: department.value.toString() || "",
                            sections: section.value || "",
                            assignLinemanager: "",
                            actionType: "Preventive",
                          };

                          setFieldValue("preventiveActions", [
                            ...values.preventiveActions,
                            newAction,
                          ]);
                          setIsOpen(false);
                          resetFormFields();
                        }}
                      >
                        Apply
                      </button>
                      <button
                        className="btnNoicon red"
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          resetFormFields();
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CustomModal>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default PreventiveActions;