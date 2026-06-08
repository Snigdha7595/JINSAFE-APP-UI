"use client";
import React, { useEffect, useState } from "react";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import InputField from "@/components/Form/InputField";
import CustomModal from "@/components/Layouts/CustomModal";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_SECTIONS, FETCH_LINEMANAGER, FETCH_DEPARTMENTS } from "@/config/apiConfig";
import { CONSTANTS } from "@/config/constant";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { SelectOptions } from "@/components/interfaces";
import { emptySelector } from "@/config/config";
import { toast } from "react-toastify";
import { RootState } from "@/store/store";

interface ImmediateAction {
  siNo?: string;
  actiontaken?: string;
  createdat?: string;
  createdby?: string;
  updatedby?: string;
  updatedat?: string;
  actionId?: number | string;
  targetdate?: string;
  status?: string;
  rowIndex?: number;
  sectionhead?: string;
  imSubmoduleName?: string;
  units?: string;
  linemanagerName?: string;
  responsibleDepartmentName?: string;
  responsibleSectionName?: string;
  findingFlag?: number | string;
  cfsaVerifyStatus?: string;
  // ...other fields as needed
}

interface Props {
  readOnly?: boolean;
  immediateData?: any;
  setImmediateData?: (d: any) => void;
  departmentOptions?: SelectOptions[];
  currentStatus?: number;
  setCurrentStatus?: (n: number) => void;
  setOpenSection?: (n: number) => void;
  pirData?: any;
  setPirData?: (d: any) => void;
  setImmediatePendingDeletes?: (arr: (number | string)[]) => void;
  setHasUnsavedChanges?: (d: boolean) => void;
}

const ImmediateEdit: React.FC<Props> = ({
  readOnly,
  immediateData,
  setImmediateData,
  departmentOptions: departmentOptionsProp,
  currentStatus,
  setCurrentStatus,
  setOpenSection,
  pirData,
  setPirData,
  setImmediatePendingDeletes,
  setHasUnsavedChanges,
}) => {
  const token = useSelector(selectUserToken);
  const { user } = useSelector((state: RootState) => state.auth as { user: any });

  // modal/local fields
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [initialActions, setInitialActions] = useState<ImmediateAction[]>([]);
  const [immedAction, setImmedAction] = useState<string>("");
  const [immedDepartment, setImmedDepartment] = useState<SelectOptions | null>(emptySelector[0]);
  const [immedSection, setImmedSection] = useState<SelectOptions | null>(null);
  const [immedSectionOptions, setImmedSectionOptions] = useState<SelectOptions[] | null>(emptySelector);
  const [immedAssignedLineManager, setImmedAssignedLineManager] = useState<SelectOptions | null>(null);
  const [immedLineManagerOptions, setImmedLineManagerOptions] = useState<SelectOptions[]>(emptySelector);
  const [immedSectionHead, setImmedSectionHead] = useState<string>("");
  const [immedTargetDate, setImmedTargetDate] = useState<string | Date>("");
  const [departmentOptions, setDepartmentOptions] = useState<SelectOptions[]>(departmentOptionsProp ?? emptySelector);
  const [modalMode, setModalMode] = useState<"add" | "view">("add");

  useEffect(() => {
    if (Array.isArray(departmentOptionsProp) && departmentOptionsProp.length > 0) {
      setDepartmentOptions(departmentOptionsProp);
    }
  }, [departmentOptionsProp]);

  useEffect(() => {
    if (pirData?.immediateActions && initialActions.length === 0) {
      setInitialActions(JSON.parse(JSON.stringify(pirData.immediateActions || [])));
    }
  }, [pirData?.immediateActions, initialActions.length]);

  useEffect(() => {
    if (!setHasUnsavedChanges) return;
    const currentActions = pirData?.immediateActions || [];
    const hasChanges = checkForChanges(currentActions, initialActions);
    setHasUnsavedChanges(hasChanges);
  }, [pirData?.immediateActions, initialActions, setHasUnsavedChanges]);

  const checkForChanges = (currentActions: ImmediateAction[], initialActions: ImmediateAction[]): boolean => {
    if (currentActions.length !== initialActions.length) {
      return true;
    }

    return currentActions.some((currentAction, index) => {
      const initialAction = initialActions[index];
      if (!initialAction) return true;

      return (
        currentAction.actiontaken !== initialAction.actiontaken ||
        currentAction.linemanagerName !== initialAction.linemanagerName ||
        currentAction.responsibleDepartmentName !== initialAction.responsibleDepartmentName ||
        currentAction.responsibleSectionName !== initialAction.responsibleSectionName ||
        currentAction.sectionhead !== initialAction.sectionhead ||
        currentAction.targetdate !== initialAction.targetdate
      );
    });
  };

  useEffect(() => {
    const fetchDeps = async (unitId: string | number) => {
      try {
        const resp = await serverRequest({}, `${FETCH_DEPARTMENTS}/get-departments/${unitId}`, CONSTANTS.REQUEST_GET, true, true, token);
        if (resp?.length > 0) {
          const opts = resp.map((d: any) => ({ value: d.departmentid, label: d.departmentname }));
          setDepartmentOptions(opts);
        } else {
          setDepartmentOptions([]);
        }
      } catch (err) {
        console.error("fetchDeps error:", err);
      }
    };

    if ((!departmentOptionsProp || departmentOptionsProp.length === 0) && pirData?.unitId) {
      fetchDeps(pirData.unitId);
    }
  }, [departmentOptionsProp, pirData?.unitId, token]);

  // fetch sections for a department
  const fetchImmedSections = async (departmentId: string | number) => {
    try {
      const resp = await serverRequest({}, `${FETCH_SECTIONS}/get-sections/${departmentId}`, CONSTANTS.REQUEST_GET, true, true, token);
      if (resp?.length > 0) {
        const opts = resp.map((s: any) => ({ value: s.sectionid, label: s.sectionname }));
        setImmedSectionOptions(opts);
      } else {
        setImmedSectionOptions([]);
      }
    } catch (err) {
      console.error("fetchImmedSections error:", err);
      setImmedSectionOptions([]);
    }
  };

  // fetch line managers
  const fetchImmedLineManagers = async (departmentId: string | number, sectionId: string | number) => {
    try {
      const resp = await serverRequest({}, `${FETCH_LINEMANAGER}/get-line-managers/${departmentId}/active/${sectionId}`, CONSTANTS.REQUEST_GET, true, true, token);
      if (resp?.length > 0) {
        const opts = resp.map((m: any) => ({ value: m.linemanagerName, label: m.linemanagerName }));
        setImmedLineManagerOptions(opts);
      } else {
        setImmedLineManagerOptions([]);
      }
    } catch (err) {
      console.error("fetchImmedLineManagers error:", err);
      setImmedLineManagerOptions([]);
    }
  };

  // fetch section head
  const fetchImmedSectionHead = async (sectionId: string | number, departmentId: string | number, unitId: string | number) => {
    try {
      const resp = await serverRequest({}, `${FETCH_SECTIONS}/${unitId}/${departmentId}/${sectionId}`, CONSTANTS.REQUEST_GET, true, true, token);
      if (resp?.sectionHead) {
        setImmedSectionHead(resp.sectionHead?.linemanagerName || "");
      } else {
        setImmedSectionHead("");
      }
    } catch (err) {
      console.error("fetchImmedSectionHead error:", err);
      setImmedSectionHead("");
    }
  };

  const resetModal = () => {
    setImmedAction("");
    setImmedDepartment(emptySelector[0]);
    setImmedSection(null);
    setImmedSectionOptions(emptySelector);
    setImmedAssignedLineManager(null);
    setImmedLineManagerOptions(emptySelector);
    setImmedSectionHead("");
    setImmedTargetDate("");
    setModalMode("add");
  };

  // Formik initial values
  const initialValues = {
    immediateActions: pirData?.immediateActions?.slice() ?? immediateData?.immediateActions?.slice() ?? [],
  };

  const validationSchema = Yup.object().shape({
    immediateActions: Yup.array(),
  });

  // Append new action locally
  const appendImmediateAction = (values: any, setFieldValue: FormikHelpers<any>["setFieldValue"]) => {
    const newAction: ImmediateAction = {
      actionId: 0,
      actiontaken: immedAction,
      linemanagerName: immedAssignedLineManager?.label || "",
      responsibleDepartmentName: immedDepartment?.label || "",
      responsibleSectionName: immedSection?.label || "",
      sectionhead: immedSectionHead,
      targetdate:
        immedTargetDate && typeof immedTargetDate !== "string"
          ? (immedTargetDate as Date).toISOString().split("T")[0]
          : (immedTargetDate as string) || "",
      createdby: pirData?.createdBy || user?.createdBy,
      updatedby: pirData?.updatedBy || user?.createdBy,
      rowIndex: (values.immediateActions?.length ?? 0),
      status: "Pending",
      siNo: "", // left blank for new local ones
    };

    const updated = [...(values.immediateActions || []), newAction];
    setFieldValue("immediateActions", updated);
    // sync to parent
    setPirData?.((prev: any) => ({ ...(prev || {}), immediateActions: updated }));
    setImmediateData?.({ immediateActions: updated });
    toast.success("Immediate action added locally");
    // reset modal
    setIsOpen(false);
    resetModal();
  };

  const handleModalSubmit = (values: any, setFieldValue: FormikHelpers<any>["setFieldValue"]) => {
    appendImmediateAction(values, setFieldValue);
  };

  // Delete immediate action locally — record server-side id for deletion
  const deleteImmediateActionLocal = (index: number, values: any, setFieldValue: FormikHelpers<any>["setFieldValue"]) => {
    const action = values.immediateActions[index];
    const updated = [...values.immediateActions];
    updated.splice(index, 1);
    setFieldValue("immediateActions", updated);
    // sync parent and record deletes
    setPirData?.((prev: any) => {
      const newPrev = { ...(prev || {}) };
      newPrev.immediateActions = updated;
      if (action?.actionId) {
        const id = action.actionId;
        newPrev._immediateActionsToDelete = Array.isArray(newPrev._immediateActionsToDelete)
          ? Array.from(new Set([...newPrev._immediateActionsToDelete, id]))
          : [id];
        // inform parent via callback if available
        if (setImmediatePendingDeletes) {
          setImmediatePendingDeletes(newPrev._immediateActionsToDelete);
        }
      }
      return newPrev;
    });
    setImmediateData?.({ immediateActions: updated });
    toast.warning("Immediate action removed locally. Click Update PIR to persist deletion.");
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, formikHelpers) => {
        try {
          formikHelpers.setSubmitting(true);
          const updatedPayload = {
            ...(pirData || {}),
            immediateActions: values.immediateActions,
            updatedBy: user?.createdBy,
          };
          setImmediateData?.(updatedPayload);
          setPirData?.((prev: any) => ({ ...(prev || {}), ...updatedPayload }));
          toast.success("Immediate actions saved locally");
          formikHelpers.setSubmitting(false);

          // Move to next step if desired
          if (setCurrentStatus) setCurrentStatus((currentStatus ?? 0) + 1);
          if (setOpenSection) setOpenSection((currentStatus ?? 0) + 1);
          setHasUnsavedChanges(false)
        } catch (err) {
          console.error("save immediate error", err);
          toast.error("Error saving immediate actions locally");
          formikHelpers.setSubmitting(false);
        }
      }}
    >
      {({ values, handleSubmit, setFieldValue, submitForm }) => (
        <form onSubmit={handleSubmit}>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="row">
                <div className="col-12">
                  <div className="actionWrapper">
                    {!readOnly && (
                      <button
                        className="iconBtn green v2 withborderBT"
                        type="button"
                        onClick={() => {
                          resetModal();
                          setModalMode("add");
                          setIsOpen(true);
                        }}
                      >
                        <span>Add Action</span>
                        <Image width={15} height={15} alt="icon" className="img-fluid u-image" src="/images/svg/plus.svg" />
                      </button>
                    )}
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
                              {!readOnly && <th>Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {values.immediateActions && values.immediateActions.length > 0 ? (
                              values.immediateActions.map((row: ImmediateAction, index: number) => (
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
                                          // open modal for view/edit (we keep only view capability here)
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
                                          setModalMode("view");
                                          setIsOpen(true);
                                        }}
                                      >
                                        <span className="iconPrimary">
                                          <Image width={15} height={15} alt="icon" src="/images/svg/eye-icon-blue.svg" className="img-fluid u-image" />
                                        </span>
                                      </button>

                                      <button className="tableBtn v2" type="button" onClick={() => deleteImmediateActionLocal(index, values, setFieldValue)}>
                                        <span className="iconSecondary">
                                          <Image width={15} height={15} alt="icon" src="/images/svg/delete-icon.svg" className="img-fluid u-image" />
                                        </span>
                                      </button>
                                    </td>
                                  )}
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
            {!readOnly && (
                <button
                  disabled={!values.immediateActions || values.immediateActions.length === 0}
                  title={!values.immediateActions || values.immediateActions.length === 0 ? "Please add at least one immediate action" : "Next"}
                  className="iconBtn green v2 ms-0"
                  type="button"
                  onClick={() => {
                    if (!values.immediateActions || values.immediateActions.length === 0) {
                      toast.warning("Please add at least one immediate action");
                      return;
                    }
                    submitForm();
                  }}
                >
                  <span>Next</span>
                </button>
              )}
          </div>

          <CustomModal isOpen={isOpen} onClose={() => {
              setIsOpen(false);
              resetModal();
            }} 
            title={modalMode === "add" ? "Add Immediate Action" : "View Immediate Action"}>
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
                        setImmedLineManagerOptions(emptySelector);
                        setImmedAssignedLineManager(null);
                        setImmedSection(null);
                        fetchImmedSections(value.value);
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
                      if (modalMode === "add") {
                        setImmedSection(value);
                        fetchImmedLineManagers(immedDepartment?.value ?? "", value.value);
                        fetchImmedSectionHead(value.value, immedDepartment?.value ?? "", pirData?.unitId);
                      }
                    }}
                    onBlur={() => {}}
                  />
                </div>

                <div className="col-12 col-md-6 col-lg-6">
                  <InputField type="text" label="Section Head" disabled={true} value={immedSectionHead} name="immedSectionHead" placeholder="" errors={""} touched={""} onBlur={() => {}} onChange={() => {}} maxLength={30} />
                </div>

                <div className="col-12 col-md-6 col-lg-6">
                  <SelectField
                    label="Assign Line Manager"
                    disabled={readOnly || modalMode === "view"}
                    value={immedAssignedLineManager}
                    name="immedAssignedLineManager"
                    placeholder=""
                    options={immedLineManagerOptions}
                    onChange={(value: any) => {if (modalMode === "add") {
                      setImmedAssignedLineManager(value)
                    }}}
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
                      value={immedTargetDate ? new Date(immedTargetDate) : null}
                      dateFormat="dd/MM/yyyy"
                      onChange={(date: Date | null) => {
                        if (modalMode === "add") {
                        if (date) {
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, "0");
                          const day = String(date.getDate()).padStart(2, "0");
                          setImmedTargetDate(`${year}-${month}-${day}`);
                        } else {
                          setImmedTargetDate("");
                        }}
                      }}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-12">
                    <div className="btnWrapper">
                      {modalMode === "add" ? (<><button className="btnNoicon green" type="button" disabled={!immedAction} title={!immedAction ? "Immediate Action is required" : ""} onClick={() => handleModalSubmit(values, setFieldValue)}
                      >
                        Apply
                      </button>
                      <button className="btnNoicon red" type="button" onClick={() => {
                          setIsOpen(false);
                          resetModal();
                        }}>
                        Cancel
                      </button></>) : (<button className="btnNoicon red" type="button" onClick={() => {
                          setIsOpen(false);
                          resetModal();
                        }}>
                        Close
                      </button>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CustomModal>
        </form>
      )}
    </Formik>
  );
};

export default ImmediateEdit;