import React, { useState } from "react";
import { Formik } from "formik";
import Image from "next/image";
import * as Yup from "yup";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import InputField from "@/components/Form/InputField";
import Button from "@/components/Elements/Button";
import CustomModal from "@/components/Layouts/CustomModal";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_SECTIONS, FETCH_LINEMANAGER, SAFETY_ALERT } from "@/config/apiConfig";
import { useRouter } from "next/navigation";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { useDispatch, useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { SelectOptions } from "@/components/interfaces";
import { emptySelector } from "@/config/config";
import { RootState } from "@/store/store";
import { setPirId } from "@/store/slices/pirSlice";

const PreventiveActions = ({
  readOnly,
  preventiveActions,
  setPreventiveActions,
  departmentOptions,
  setOpenSAPreview,
  publishButtonVisible,
  createCaseSAObjectIdRef,
  twoStepProcess,
  currentStatus,
  setCurrentStatus,
  setPublishButtonVisible,
  setOpenSection,
  pirData,
  saData,
  setSaData,
  setPirData,
}: any) => {
  const token = useSelector(selectUserToken);
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth) as { user: any };
  const dispatch = useDispatch()
  const pirId = useSelector((state: RootState) => state.pir.pirId);

  const initialValues = {
    preventiveActions: saData?.preventiveActions || [],
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
  // const [ safetyRevertRemark, setSafetyRevertRemark ] = useState<string>("")
  // const [ openRevertConfirmation, setOpenRevertConfirmation ] = useState<boolean>(false);
  const [actionText, setActionText] = useState<string>("");
  const [department, setDepartment] = useState<SelectOptions>(emptySelector[0]);
  const [section, setSection] = useState<SelectOptions | null>(null);
  const [sectionOptions, setSectionOptions] = useState<SelectOptions[] | null>(emptySelector);
  const [sectionHead, setSectionHead] = useState<string>("");
  const [assignedLineManager, setAssignedLineManager] = useState<SelectOptions | null>(null);
  const [lineManagerOptions, setLineManagerOptions] = useState(emptySelector);
  const [targetDate, setTargetDate] = useState<string | Date>("");

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
  };

  // const revertDraftSafetyAlert = async () => {
  //   if (!saData) return;

  //   try {
  //     const payload = {
  //       ...saData,
  //       objectId: createCaseSAObjectIdRef.current || null,
  //     };
  //     const response = await serverRequest(
  //       payload,
  //       SAFETY_ALERT + `/save-safety-alert/revert`,
  //       CONSTANTS.REQUEST_POST,
  //       true,
  //       true,
  //       token
  //     );

  //     if (response.success) {
  //       setSafetyRevertRemark("");
  //       dispatch(setPirId(pirId))
  //       router.push(APP_URL.INCIDENT_DETAIL);
  //     }
  //   } catch (error) {
  //     console.error("Error saving PIR:", error);
  //   }
  // };

  const handleSubmit = (values: typeof initialValues) => {
      setSaData((prev: any) => ({
        ...prev,
        preventiveActions: values.preventiveActions,
      }));
      setPirData((prev: any) => ({
        ...prev,
        preventiveActions: values.preventiveActions,
      }));
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={handleSubmit}
    >
      {({ values, handleSubmit, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="row">
                <div className="col-12">
                  <div className="actionWrapper ">
                    {!readOnly && <button
                      className="iconBtn green v2 withborderBT"
                      type="button"
                      onClick={() => {
                        resetFormFields();
                        setIsOpen(true);
                      }}
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
              <div className="row">
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
                  {/* {publishButtonVisible && !twoStepProcess && (
                    <button
                      className="iconBtn orange v2 ms-3"
                      type="button"
                      onClick={() => {
                        setOpenRevertConfirmation(true);
                      }}
                    >
                      Revert
                    </button>
                  )} */}
                </div>
              </div>
            </div>
            {/* <CustomModal
              isOpen={openRevertConfirmation}
              onClose={() => setOpenRevertConfirmation(false)}
              bodyClassName="isScrollable"
              title="Confirm Safety Alert Revert"
            >
              <div className="filters">
                <div className="row form_grider d1">
                  <h2>Are you sure you want to revert this Safety Alert?</h2>
                  <div className="py-2">
                    <InputField 
                      type="text"
                      label="Revert remark"
                      maxLength={300}
                      value={safetyRevertRemark}
                      name="safetyRevertRemark"
                      placeholder="Reverted due to..."
                      onChange={(e) => {
                        setSafetyRevertRemark(e.target.value);
                      }}/>
                  </div>
                  <div className="col-12">
                    <div className="btnWrapper">
                      <button
                        className="iconBtn orange v2"
                        onClick={async () => setOpenRevertConfirmation(false)}
                        type="button"
                      >
                        <span>Back</span>
                      </button>
                      <button
                        className="iconBtn green v2"
                        onClick={async () => {
                          setSaData(function (prev: any) {
                            return {
                              ...prev,
                              safetyRevertRemark: safetyRevertRemark,
                            };
                          });
                          revertDraftSafetyAlert();
                        }}
                        type="button"
                      >
                        <span>
                          Submit
                          <Image
                            width="15"
                            height="15"
                            alt="submit button"
                            src="/images/svg/plane_icon_45deg.svg"
                            className="img-fluid u-image ms-1"
                          />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CustomModal> */}

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
                          pirData?.unitId
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
                      {/* <button
                        className="btnNoicon green"
                        onClick={() => {
                          setFieldValue("preventiveActions", [
                            ...values.preventiveActions,
                            {
                              actiontaken: actionText,
                              linemanagerName: assignedLineManager?.label,
                              responsibleDepartmentName: department?.label,
                              responsibleSectionName: section?.label,
                              sectionhead: sectionHead,
                              targetdate: targetDate,
                            },
                          ]);
                          setIsOpen(false);
                        }}
                      >
                        Apply
                      </button>
                      <button className="btnNoicon red" onClick={() => setIsOpen(false)}>
                        Cancel
                      </button> */}
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