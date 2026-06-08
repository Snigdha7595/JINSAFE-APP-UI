"use client";
import { APP_URL, CONSTANTS } from "@/config/constant";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState, useCallback, useRef, use } from "react";
import { Table, Modal } from "react-bootstrap";
import ToggleSwitch from "@/components/Elements/ToggleSwitch";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import { selectUserToken } from "@/store/slices/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { FETCH_CHECKLIST_BODY, FETCH_CHECKLIST_HEADERS, FETCH_DETAILS_FROM_MAIL, FETCH_DRAFT_APPLICATION, SAVE_MOC_APPLICATION_FORM, UPLOAD_FILE, DELETE_FILE, BUCKET_URL, DOWNLOAD_FILE } from "@/config/apiConfig";
import { serverRequest } from "@/services/getServerSideRender";
import { RootState } from "@/store/store";
import Image from "next/image";
import CustomModal from "@/components/Layouts/CustomModal";
import { Attachment, FormValues } from "@/types/moc";
import { toast, ToastContainer } from "react-toastify";
import { clearObjectId } from "@/store/slices/mocSlice";
import * as Yup from "yup";
import { FormikErrors } from "formik";


const User = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useSelector(selectUserToken);
  const { user } = useSelector((state: RootState) => state.auth);
  const objectId = useSelector((state: RootState) => state.moc.objectId);

  const [activeTab, setActiveTab] = useState(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [CheckListName, setCheckListName] = useState<
    { headerName: string, headerShtCode: string }[]
  >([]);
  const [modalAttachments, setModalAttachments] = useState<Attachment[]>([]);
  const [modalAttachmentKey, setModalAttachmentKey] = useState<string | null>(null);

  const validationSchema = Yup.object().shape({
    mocChecklistsFormHeaders: Yup.array().of(
      Yup.object().shape({
        checklistPrimaryPendingAtMail: Yup.string()
          .email("Invalid email format")
          .required("Responsible Email is required"),
      })
    ),
  });
  const formik = useFormik<FormValues>({
    initialValues: {
      objectId: objectId as unknown as string,
      date: null,
      title: null,
      unitId: null,
      unitName: null,
      departmentId: null,
      departmentName: null,
      sectionId: null,
      sectionName: null,
      departmentHodId: null,
      departmentHodEmail: null,
      departmentHodName: null,
      sectionHeadId: null,
      sectionHeadMail: null,
      sectionHeadName: null,
      descriptionPresent: null,
      descriptionProposed: null,
      typeOfChange: "",
      applicableForDays: 0,
      applicableTillDate: null,
      reasonForChange: null,
      typeOfExpenditure: "Capex",
      amount: 0,
      currency: "INR",
      changeRequirePlantModification: null,
      changeRequirePlantModificationDetails: null,
      subsequentAffectedChange: null,
      subsequentAffectedChangeDetails: null,
      createdById: null,
      createdByMail: null,
      createdByName: null,
      updatedById: null,
      updatedByMail: null,
      updatedByName: null,
      mocChangeCategories: [],
      mocChecklistsFormHeaders: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          updatedById: user?.jsplid,
          updatedByMail: user?.empEmail,
          updatedByName: user?.empName,
        };
        const response = await serverRequest(
          payload,
          SAVE_MOC_APPLICATION_FORM + `/save-moc`,
          CONSTANTS.REQUEST_POST,
          true,
          true,
          token
        );
        if (response) {
          toast.success("Checklist form saved successfully!");
          // router.push(`${APP_URL.MOC_DASHBOARD}`);
          setTimeout(() => {
            router.push(`${APP_URL.MOC_DASHBOARD}`);
          }, 2000);
        }
      } catch (error) {
        console.error("Error saving checklist form:", error);
        toast.error("Failed to save checklist form.");
      }
    },
  });

  const handlePreviewClick = (headerIndex: number, bodyIndex: number) => {
    const key = `${headerIndex}_${bodyIndex}`;
    const attachments = formik.values.mocChecklistsFormHeaders[headerIndex].mocChecklistsFormBodies[bodyIndex].attachments || [];
    setModalAttachments(attachments);
    setModalAttachmentKey(key);
    setIsPreviewOpen(true);
  };

  // const handleDeleteAttachment = (fileId: string) => {
  //   if (!modalAttachmentKey) return;
  //   const [headerIndexStr, bodyIndexStr] = modalAttachmentKey.split('_');
  //   const headerIndex = parseInt(headerIndexStr);
  //   const bodyIndex = parseInt(bodyIndexStr);
  //   setLocalAttachments(prev => ({
  //     ...prev,
  //     [modalAttachmentKey]: prev[modalAttachmentKey]?.filter(att => att.fileId !== fileId) || []
  //   }));
  //   const currentAttachments = formik.values.mocChecklistsFormHeaders[headerIndex].mocChecklistsFormBodies[bodyIndex].attachments || [];
  //   formik.setFieldValue(
  //     `mocChecklistsFormHeaders[${headerIndex}].mocChecklistsFormBodies[${bodyIndex}].attachments`,
  //     currentAttachments.filter((att: Attachment) => att.fileId && att.fileId !== fileId)
  //   );
  //   setModalAttachments(prev => prev.filter(att => att.fileId !== fileId));
  //   toast.success("Attachment deleted successfully!");
  // };

  const handleDeleteAttachment = async (fileId: string) => {
    if (!modalAttachmentKey) return;

    const payload = [fileId];

    try {
      const response = await serverRequest(
        payload,
        DELETE_FILE,
        CONSTANTS.REQUEST_DELETE,
        false,
        true,
        token
      );

      if (response?.success) {
        const [headerIndexStr, bodyIndexStr] = modalAttachmentKey.split('_');
        const headerIndex = parseInt(headerIndexStr);
        const bodyIndex = parseInt(bodyIndexStr);

        // setLocalAttachments(prev => ({
        //   ...prev,
        //   [modalAttachmentKey]: prev[modalAttachmentKey]?.filter(att => att.fileId !== fileId) || []
        // }));

        const currentAttachments = formik.values.mocChecklistsFormHeaders[headerIndex].mocChecklistsFormBodies[bodyIndex].attachments || [];
        const updatedAttachments = currentAttachments.filter((att: Attachment) => att.fileId && att.fileId !== fileId);

        formik.setFieldValue(
          `mocChecklistsFormHeaders[${headerIndex}].mocChecklistsFormBodies[${bodyIndex}].attachments`,
          updatedAttachments
        );

        setModalAttachments(updatedAttachments);
        toast.success("Attachment deleted successfully!");
      } else {
        toast.error("Deletion failed: " + (response?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting attachment:", error);
      toast.error("Failed to delete attachment.");
    }
  };

  // const downloadFile = async (fileId, fileName, fileSize) => {
  //   const objectName = `new-jinsafe/${fileId}_${fileSize}_${fileName}`;
  //   try {
  //     const response = await fetch(DOWNLOAD_FILE, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(objectName),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`File download failed. Status: ${response.status}`);
  //     }

  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = fileName;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(url);
  //     toast.success("File downloaded successfully!");
  //   } catch (error) {
  //     console.error("Download failed:", error);
  //     toast.error("Failed to download file.");
  //   }
  // };

  useEffect(() => {
    if (!objectId) {
      router.push(APP_URL.MOC_DASHBOARD);
      return;
    }
    if (user?.jsplid) {
      serverRequest({}, `${FETCH_DRAFT_APPLICATION}/${user?.jsplid}/${objectId}`, CONSTANTS.REQUEST_GET, true, true, token).then((data) => {
        formik.setValues({
          ...formik.values,
          ...data,
          date: data?.createdDate ? new Date(data.createdDate) : null,
          objectId: data?.objectId || objectId,
        });
      });
    }
  }, [objectId, user?.jsplid, token]);

  useEffect(() => {
    const fetchHeaders = async () => {
      try {
        const response = await serverRequest(
          {},
          FETCH_CHECKLIST_HEADERS,
          CONSTANTS.REQUEST_GET,
          true,
          true,
          token
        );
        if (response?.length > 0) {
          setCheckListName(response);
          const activeCheck = searchParams.get("activeCheck");
          const activeIndex = response.findIndex((item: any) => item.headerShtCode === activeCheck);
          setActiveTab(activeIndex !== -1 ? activeIndex : 0);
        }
      } catch (error) {
        console.error("Error fetching checklist headers:", error);
      }
    };
    fetchHeaders();
  }, [token, searchParams]);

  useEffect(() => {
    const fetchBodies = async () => {
      const currentHeader = formik?.values?.mocChecklistsFormHeaders?.[activeTab];
      const headerIndex = formik.values.mocChecklistsFormHeaders.findIndex(
        (h) => h.headerShtCode === currentHeader?.headerShtCode
      );

      if (formik.values.unitId && currentHeader && headerIndex !== -1) {
        const isPopulated = formik.values.mocChecklistsFormHeaders[headerIndex]?.mocChecklistsFormBodies?.length > 0;

        if (!isPopulated) {
          try {
            const data = await serverRequest(
              {},
              `${FETCH_CHECKLIST_BODY}/${formik.values.unitId}/${currentHeader.headerShtCode}`,
              CONSTANTS.REQUEST_GET,
              true,
              true,
              token
            );
            if (data?.checklistsBodies) {
              formik.setFieldValue(
                `mocChecklistsFormHeaders[${headerIndex}].mocChecklistsFormBodies`,
                data.checklistsBodies.map((item: any) => ({
                  ...item,
                  // status: item?.status || null,      --> surjya changed
                  status: item?.status || "No",
                  remarks: item?.remarks || null,
                  attachments: item?.attachments || [],
                }))
              );
            }
          } catch (error) {
            console.error("Error fetching checklist bodies:", error);
          }
        }
      }
    };
    fetchBodies();
  }, [formik.values.unitId, activeTab, token]);

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, headerIndex: number, bodyIndex: number) => {
  //   const files = Array.from(event.target.files || []);
  //   if (files.length > 0) {
  //     const key = `${headerIndex}_${bodyIndex}`;
  //     const newLocalAttachments = files.map(file => {
  //       return {
  //         file,
  //         fileId: crypto.randomUUID(),
  //         dataUrl: URL.createObjectURL(file),
  //       };
  //     }).filter((att): att is LocalAttachment => att !== null);

  //     setLocalAttachments(prev => ({
  //       ...prev,
  //       [key]: [...(prev[key] || []), ...newLocalAttachments]
  //     }));

  //     const newAttachments: Attachment[] = newLocalAttachments.map(att => ({
  //       fileName: att.file.name,
  //       fileId: att.fileId,
  //       fileSize: att.file.size,
  //       mimeType: att.file.type,
  //     }));

  //     const currentAttachments = formik.values.mocChecklistsFormHeaders[headerIndex].mocChecklistsFormBodies[bodyIndex].attachments || [];
  //     formik.setFieldValue(
  //       `mocChecklistsFormHeaders[${headerIndex}].mocChecklistsFormBodies[${bodyIndex}].attachments`,
  //       [...currentAttachments, ...newAttachments]
  //     );
  //     toast.success("File(s) uploaded successfully!");
  //   }
  //   event.target.value = '';
  // };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, headerIndex: number, bodyIndex: number) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await serverRequest(
          formData,
          UPLOAD_FILE,
          CONSTANTS.REQUEST_POST,
          true,
          true,
          token,
          true,
          false
        );

        if (response?.success && response?.objectId) {
          const newAttachment: Attachment = {
            fileName: file.name,
            fileId: response.objectId,
            fileSize: file.size,
            mimeType: file.type,
          };
          const currentAttachments = formik.values.mocChecklistsFormHeaders[headerIndex].mocChecklistsFormBodies[bodyIndex].attachments || [];
          formik.setFieldValue(
            `mocChecklistsFormHeaders[${headerIndex}].mocChecklistsFormBodies[${bodyIndex}].attachments`,
            [...currentAttachments, newAttachment]
          );
          toast.success(`${file.name} uploaded successfully!`);
        } else {
          toast.error("Upload failed: " + (response?.message || "Unknown error"));
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(`Failed to upload file: ${file.name}`);
      }
    }
    event.target.value = '';
  };

    //   if (newLocalAttachments.length > 0) {
    //     setLocalAttachments(prev => ({
    //       ...prev,
    //       [key]: [...(prev[key] || []), ...newLocalAttachments]
    //     }));

    //     const currentAttachments = formik.values.mocChecklistsFormHeaders[headerIndex].mocChecklistsFormBodies[bodyIndex].attachments || [];
    //     formik.setFieldValue(
    //       `mocChecklistsFormHeaders[${headerIndex}].mocChecklistsFormBodies[${bodyIndex}].attachments`,
    //       [...currentAttachments, ...newAttachments]
    //     );
    //     toast.success("File(s) uploaded successfully!");
    //   }
    //   event.target.value = '';
    // };

    const handleFieldChange = (
      type: "value" | "remarks" | "na",
      headerIndex: number,
      bodyIndex: number,
      newValue: string | boolean
    ) => {
      if (type === "na") {
        const na = newValue as boolean;
        formik.setFieldValue(`mocChecklistsFormHeaders[${headerIndex}].mocChecklistsFormBodies[${bodyIndex}].status`, na ? "NA" : "No");
      } else if (type === "value") {
        formik.setFieldValue(`mocChecklistsFormHeaders[${headerIndex}].mocChecklistsFormBodies[${bodyIndex}].status`, newValue ? "Yes" : "No");
      } else if (type === "remarks") {
        formik.setFieldValue(`mocChecklistsFormHeaders[${headerIndex}].mocChecklistsFormBodies[${bodyIndex}].remarks`, newValue);
      }
    };

    const renderTableView = () => {
      const currentHeader = formik?.values?.mocChecklistsFormHeaders?.[activeTab];
      const currentBodies = currentHeader?.mocChecklistsFormBodies;

      if (!currentBodies || currentBodies.length === 0) {
        return (
          <div className="text-center p-5">
            <p>No checklist items found for this selection.</p>
          </div>
        );
      }

      return (
        <div className="mb-4">
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">CheckList Name</label>
              <div className="form-control fw-normal border border py-2 rounded-md" style={{ backgroundColor: "#dee2e6", opacity: 0.8 }}>
                {currentHeader?.headerName ?? "N/A"}
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Responsible Email</label>
              {/* {console.log("email-",formik.values.mocChecklistsFormHeaders[activeTab]?.checklistPrimaryPendingAtMail)} */}
              <input
                type="email"
                className="form-control"
                value={formik.values.mocChecklistsFormHeaders[activeTab]?.checklistPrimaryPendingAtMail || ""}
                onChange={(e) => {
                  formik.setFieldValue(`mocChecklistsFormHeaders[${activeTab}].checklistPrimaryPendingAtMail`, e.target.value);
                }}
               onBlur={async () => {
  const email = formik.values.mocChecklistsFormHeaders[activeTab]?.checklistPrimaryPendingAtMail;
  
  // Skip if email is empty
  if (!email) {
    return;
  }
  
  // Check for duplicate email in other checklists
  const isDuplicate = formik.values.mocChecklistsFormHeaders.some(
    (header, index) => 
      index !== activeTab && // Skip current tab
      header.checklistPrimaryPendingAtMail === email
  );
  
  if (isDuplicate) {
    toast.error("This email is already assigned to another checklist. Please use a different email.");
    formik.setFieldValue(`mocChecklistsFormHeaders[${activeTab}].checklistPrimaryPendingAtMail`, "");
    formik.setFieldValue(`mocChecklistsFormHeaders[${activeTab}].checklistPrimaryPendingAtId`, null);
    formik.setFieldValue(`mocChecklistsFormHeaders[${activeTab}].checklistPrimaryPendingAtName`, null);
    return;
  }
                  try {
                    const res = await serverRequest(
                      {},
                      `${FETCH_DETAILS_FROM_MAIL}/email/${email}`,
                      CONSTANTS.REQUEST_GET,
                      true,
                      true,
                      token
                    );
                    if (res) {
                      formik.setFieldValue(`mocChecklistsFormHeaders[${activeTab}].checklistPrimaryPendingAtId`, res.jsplid);
                      formik.setFieldValue(`mocChecklistsFormHeaders[${activeTab}].checklistPrimaryPendingAtMail`, res.empEmail);
                      formik.setFieldValue(`mocChecklistsFormHeaders[${activeTab}].checklistPrimaryPendingAtName`, res.empName);
                    } else {
                      toast.error("No user found with this email.");
                    }
                  } catch (error) {
                    console.error("Error fetching user details:", error);
                  }
                }}
                name={`mocChecklistsFormHeaders[${activeTab}].checklistPrimaryPendingAtMail`}
                placeholder="Enter email"
              />
              {/* {formik.touched.mocChecklistsFormHeaders?.[activeTab]?.checklistPrimaryPendingAtMail &&
                formik.errors.mocChecklistsFormHeaders?.[activeTab]?.checklistPrimaryPendingAtMail && (
                  <div className="text-danger">
                    {formik.errors.mocChecklistsFormHeaders[activeTab].checklistPrimaryPendingAtMail}
                  </div>
                )} */}
                {formik.touched.mocChecklistsFormHeaders?.[activeTab]?.checklistPrimaryPendingAtMail &&
                  typeof formik.errors.mocChecklistsFormHeaders?.[activeTab] === "object" &&
                  formik.errors.mocChecklistsFormHeaders?.[activeTab]?.checklistPrimaryPendingAtMail && (
                  <div className="text-danger">
                    {formik.errors.mocChecklistsFormHeaders?.[activeTab]?.checklistPrimaryPendingAtMail}
                  </div>
                )}
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold">Responsible Name</label>
              <input
                type="text"
                className="form-control"
                disabled={true}
                value={formik.values.mocChecklistsFormHeaders[activeTab]?.checklistPrimaryPendingAtName || ""}
                placeholder="Responsible Name"
              />
            </div>
          </div>
          <Table bordered>
            <thead>
              <tr style={{ backgroundColor: "#005A8C", color: "white" }}>
                <th style={{ textAlign: "center", verticalAlign: "middle", width: "5%" }}>Sr. No.</th>
                <th style={{ textAlign: "center", verticalAlign: "middle", width: "38%" }}>Description</th>
                <th style={{ textAlign: "center", verticalAlign: "middle", width: "6%" }}>NA</th>
                <th style={{ textAlign: "center", verticalAlign: "middle", width: "12%" }}>Yes/No</th>
                <th style={{ textAlign: "center", verticalAlign: "middle", width: "14%" }}>File</th>
                <th style={{ textAlign: "center", verticalAlign: "middle", width: "20%" }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {currentBodies.map((item, index: number) => {
                const isHeaderRow = item?.subItemNo === "Header";
                const isNa = item.status === "NA";
                //   const toggleValue = item.status === "Yes" || item.status === null;  
                const toggleValue = item.status === "Yes";  // surjya changed
                // const hasAttachments = (item.attachments?.length > 0) || (localAttachments[`${activeTab}_${index}`]?.length > 0);
                // const attachments = localAttachments[`${activeTab}_${index}`] || [];
                const attachments = formik.values.mocChecklistsFormHeaders[activeTab]?.mocChecklistsFormBodies?.[index]?.attachments || [];
                const hasAttachments = attachments.length > 0;
                return isHeaderRow ? (
                  <tr key={index} style={{ backgroundColor: "#e8e8e8" }}>
                    <td className="text-center align-middle">{item?.sortRowNo}</td>
                    <td colSpan={5} style={{ fontSize: "17px" }}>{item.description}</td>
                  </tr>
                ) : (
                  <tr key={index} style={{ backgroundColor: "#f9f9f9" }}>
                    <td className="text-center align-middle">{item?.subItemNo ?? item?.sortRowNo}</td>
                    <td style={{ fontSize: "17px" }}>{item.description}</td>
                    <td className="text-center align-middle">
                      <input type="checkbox" className="custom-checkbox" checked={isNa} onChange={() => handleFieldChange("na", activeTab, index, !isNa)} />
                    </td>
                    <td className="text-center align-middle">
                      <div className="d-flex justify-content-center">
                        <ToggleSwitch value={toggleValue} onChange={(val) => handleFieldChange("value", activeTab, index, val)} disabled={isNa} />
                      </div>
                    </td>
                    <td className="align-middle">
                      <style jsx>{` input[type="file"] { display: none; } `}</style>
                      <div className="d-flex my-4">
                        <label htmlFor={`file-upload-${activeTab}-${index}`} className="iconBtn green" style={{ alignSelf: "center", cursor: isNa ? 'not-allowed' : 'pointer' }}>
                          <Image width={20} height={20} src="/images/svg/upload-icon.svg" alt="Upload Icon" />
                        </label>
                        <input
                          id={`file-upload-${activeTab}-${index}`} type="file" multiple
                          onChange={(e) => handleFileChange(e, activeTab, index)} className="hidden"
                        />
                        <button type="button" onClick={() => handlePreviewClick(activeTab, index)} disabled={!hasAttachments} className={`iconBtn ${hasAttachments ? 'orange' : 'disable'}`} style={{ alignSelf: "center" }}>
                          {/* ({(localAttachments[`${activeTab}_${index}`]?.length || 0)}) */}
                          ({(attachments?.length || 0)})
                          <Image width={20} height={20} src="/images/svg/icons/view.svg" alt="View Icon" />
                        </button>
                      </div>
                    </td>
                    <td className="align-middle">
                      <input
                        type="text" className="form-control" value={item.remarks ?? ''}
                        onChange={(e) => handleFieldChange("remarks", activeTab, index, e.target.value)} placeholder="Remarks"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      );
    };

    const handleSubmit = async () => {
      const errors = await formik.validateForm();
      // if (Object.keys(errors).length > 0) {
      //   const firstError = errors.mocChecklistsFormHeaders?.[0]?.checklistPrimaryPendingAtMail;
      //   toast.error(firstError || "Please provide responsible person details against all selected checklist forms.");
      //   return;
      // }
      if (Object.keys(errors).length > 0) {
          const firstHeaderError = errors.mocChecklistsFormHeaders?.[0];
          let firstError: string | undefined;
          if (
            firstHeaderError &&
            typeof firstHeaderError !== "string" &&
            "checklistPrimaryPendingAtMail" in firstHeaderError
          ) {
            firstError = (firstHeaderError as FormikErrors<any>).checklistPrimaryPendingAtMail as string;
          }
          toast.error(
            firstError ||
              "Please provide responsible person details against all selected checklist forms."
          );
          return;
        }
      const responsibleName =
        formik.values.mocChecklistsFormHeaders[activeTab]?.checklistPrimaryPendingAtName;

      if (!responsibleName) {
        toast.error("Please enter a valid Email.");
        return;
      }
      try {
        const payload = {
          ...formik.values,
          updatedById: user?.jsplid,
          updatedByMail: user?.empEmail,
          updatedByName: user?.empName,
        };

        const response = await serverRequest(
          payload,
          SAVE_MOC_APPLICATION_FORM + `/save-moc`,
          CONSTANTS.REQUEST_POST,
          true,
          true,
          token
        );
        if (response) {
          toast.success("Checklist form saved successfully!");
          //router.push(`${APP_URL.CREATE_MOC}`);
          // dispatch(setMocAfNo(response.mocAfNo));
          setTimeout(() => {
            if(response.mocAfNo){
              router.push(`${APP_URL.UPDATE_MOC}/${response.mocAfNo}`);
            } else {
              router.push(`${APP_URL.CREATE_MOC}`);
            }
          }, 2000);
        }
      } catch (error) {
        console.error("Error saving checklist form:", error);
        toast.error("Failed to save checklist form.");
      }
    };

    return (
      <div className="container-fluid p-4">
        <div className="card shadow rounded-4 p-4">
          <div className="admin-boxContainer d3 mb-4">
            <div className="text-center">
              <h5 className="fw-bold mb-5" style={{ fontSize: "20px" }}>
                Management of Change <br />
                <span style={{ fontWeight: 400 }}>(Technology and Facilities) Procedure</span>
              </h5>
            </div>
            <div className="p-3 my-3 border rounded">
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="mocTitle" className="form-label fw-bold">MOC Title</label>
                  <input type="text" className="form-control" id="mocTitle" name="title" disabled={true} value={formik?.values?.title ?? ''} placeholder="Enter MOC title" />
                </div>
                <div className="col-md-4">
                  <label htmlFor="unit" className="form-label fw-bold">Unit</label>
                  <input type="text" className="form-control" id="unit" name="unitName" disabled={true} value={formik?.values?.unitName ?? ''} placeholder="Enter unit" />
                </div>
                <div className="col-md-4">
                  <label htmlFor="dept" className="form-label fw-bold">Dept.</label>
                  <input type="text" className="form-control" id="dept" name="departmentName" value={formik?.values?.departmentName ?? ''} disabled={true} placeholder="Enter department" />
                </div>
                <div className="col-md-4">
                  <label htmlFor="section" className="form-label fw-bold">Section</label>
                  <input type="text" className="form-control" id="section" name="sectionName" disabled={true} value={formik?.values?.sectionName ?? ''} placeholder="Enter section" />
                </div>
              </div>
            </div>
            <div className="table-responsive mb-3">
              <table className="table table-bordered mb-0">
                <thead>
                  <tr>
                    <th>MOC AF No./ Date</th>
                    <th>Type of Change</th>
                    <th>Type of Expenditure</th>
                    <th>Plant Modification?</th>
                    <th>Subsequent stages are affected</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "11px" }}>
                      <span style={{ color: "#005A8C", fontWeight: 600 }}>
                        {formik?.values?.objectId}
                      </span>
                      <br />
                      <span style={{ fontSize: "14px" }}> {formik?.values?.date ? new Date(formik.values.date).toLocaleDateString() : ""} </span>
                    </td>
                    <td style={{ padding: "11px" }}>{formik?.values?.typeOfChange}</td>
                    <td style={{ padding: "11px" }}>{formik?.values?.typeOfExpenditure} ({(formik?.values?.amount)} Cr)</td>
                    <td style={{ padding: "11px" }}>{formik?.values?.changeRequirePlantModification}</td>
                    <td style={{ padding: "11px" }}>{formik?.values?.subsequentAffectedChange}</td>
                    <td style={{ padding: "11px" }}>
                      <button
                        onClick={() => router.push(APP_URL.CREATE_MOC)}
                        className="tableBtn orange"
                        style={{ fontSize: "14px", padding: "4px 10px", fontWeight: 600 }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-between flex-wrap gap-2 px-2">
              {formik?.values?.mocChecklistsFormHeaders?.map((tab, index) => (
                <button
                  key={index} className={`btn px-3 py-2 ${activeTab === index ? "text-white" : "btn-outline-dark text-dark"}`}
                  style={{
                    borderRadius: "6px", flex: "1 1 15%", minWidth: "140px", whiteSpace: "nowrap", fontWeight: 500, fontSize: "13px",
                    backgroundColor: activeTab === index ? "#f57821" : "#f8f9fa",
                    borderColor: activeTab === index ? "#f57821" : undefined,
                    color: activeTab === index ? "white" : "#333",
                  }}
                  onClick={() => setActiveTab(index)}
                >
                  {tab?.headerShtCode}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-boxContainer d1 nobackground mt-4" style={{ fontFamily: "inherit", minHeight: "60vh", overflowY: "auto" }}>
            {renderTableView()}
          </div>
          <div className="mt-4">
            {/* <label className="fw-bold mb-2">Any other Comments:</label>
          <textarea
            className="form-control mb-3" rows={3} placeholder="Any other comments" value={comments} onChange={(e) => setComments(e.target.value)}
          /> */}
            <div className="d-flex justify-content-end mt-4 gap-3">
              <button
                onClick={() => router.push(APP_URL.CREATE_MOC)}
                className="btn btn-secondary d-flex align-items-center justify-content-center"
                style={{ fontWeight: 600, width: "110px", height: "38px", borderRadius: "6px", fontSize: "14px" }}
              >
                Back <i className="bi bi-arrow-left ms-2"></i>
              </button>
              <button type="button"
                onClick={handleSubmit}
                className="btn text-white d-flex align-items-center justify-content-center"
                style={{ backgroundColor: "#f37021", fontWeight: 600, width: "110px", height: "38px", borderRadius: "6px", fontSize: "14px" }}
              >
                Save <i className="bi bi-shield-check ms-2"></i>
              </button>
            </div>
          </div>
        </div>
        {isPreviewOpen && (
          <CustomModal
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            title="Uploaded Images"
          >
            <Table className="table border">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>File Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {modalAttachments.length > 0 ? (
                  modalAttachments.map((attachment, idx) => (
                    <tr key={idx}>
                      {/* <td>{attachment.file.name}</td> */}
                      <td>
                        <a
                          href={`${BUCKET_URL}/${attachment.fileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {attachment.fileName}
                        </a>
                      </td>
                      <td>{attachment.mimeType}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteAttachment(attachment.fileId)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center">No attachments available.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </CustomModal>
        )}
        <ToastContainer position="top-right" autoClose={3000}
          hideProgressBar={false} closeOnClick pauseOnHover />
      </div>

    );
  };

  export default ProtectedRoute(User);