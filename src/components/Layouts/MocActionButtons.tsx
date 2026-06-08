// components/MocActionButtons.tsx

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { serverRequest } from "@/services/getServerSideRender";
import { CONSTANTS, APP_URL } from "@/config/constant";
import {
  REVIEW_MOC_APPLICATION,
  SEND_SECONDARY_ACTION,
  FETCH_DETAILS_FROM_MAIL,
} from "@/config/apiConfig";

import CustomModal from "@/components/Layouts/CustomModal";
import InputField from "@/components/Form/InputField";
import { useModalManager } from "@/hooks/useModalManager";
import ClarificationChat from "../../app/moc/ClarificationChat/pages";
import { selectUserToken, selectUser } from "@/store/slices/authSlice";

// Import types from a single source
import { TMocRequest, TMocReviewStage } from "@/types/moc";

interface MocChecklistActionsProps {
  mocData: TMocRequest;
  mocNo: string | null;
  stageType: string | null;
  onActionComplete: () => void;
}

const MocChecklistActions: React.FC<MocChecklistActionsProps> = ({
  mocData,
  mocNo,
  stageType,
  onActionComplete,
}) => {
  const router = useRouter();
  const token = useSelector(selectUserToken);
  const user = useSelector(selectUser);
  const [remarks, setRemarks] = useState("");
  const [responsiblePerson, setResponsiblePerson] = useState<{
    id: string;
    name: string;
  }>({ id: "", name: "" });
  const [secondaryActions, setSecondaryActions] = useState<TMocReviewStage[]>(
    []
  );
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [isApproveButtonEnabled, setIsApproveButtonEnabled] = useState(false);
  const [actionSubmitted, setActionSubmitted] = useState(false);

  const { modals, openModal, closeModal } = useModalManager([
    "Clarification",
    "ExpertAdvice",
  ] as const);

  // --- Start of Formik and useEffect logic ---

  const clarificationFormik = useFormik({
    initialValues: { email: "", remarks: "" },
    onSubmit: (values) => handleSecondaryAction("Clarification", values),
  });

  const expertAdviceFormik = useFormik({
    initialValues: { email: "", remarks: "" },
    onSubmit: (values) => handleSecondaryAction("ExpertAdvice", values),
  });

  // Moved this useEffect AFTER the declaration of expertAdviceFormik
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!token || modals.Clarification) return;
      let emailToFetch = expertAdviceFormik.values.email;

      if (emailToFetch) {
        try {
          const response = await serverRequest(
            {},
            `${FETCH_DETAILS_FROM_MAIL}/email/${emailToFetch}`,
            CONSTANTS.REQUEST_GET,
            true,
            true,
            token
          );
          if (response?.jsplid) {
            setResponsiblePerson({
              id: response.jsplid,
              name: response.empName,
            });
          } else {
            setResponsiblePerson({ id: "", name: "User not found" });
          }
        } catch (error) {
          setResponsiblePerson({ id: "", name: "User lookup failed" });
        }
      } else {
        setResponsiblePerson({ id: "", name: "" });
      }
    };
    fetchUserDetails();
  }, [expertAdviceFormik.values.email, modals.ExpertAdvice, token]);


  // Filter actions based on the current stageType
  useEffect(() => {
    if (mocData && mocData.mocReviewStages && stageType) {
      const filteredActions = mocData.mocReviewStages.filter(
        (stage) => !stage.isPrimaryAction && stage.stageType === stageType
      );
      setSecondaryActions(filteredActions);

      const pendingChecklistHeader = mocData.mocChecklistsFormHeaders.find(
        (header) =>
          header.checklistPrimaryPendingAtId === user?.jsplid &&
          header.headerShtCode === stageType
      );

      const completedAction = mocData.mocReviewStages.find(
        (stage) =>
          stage.stageType === stageType &&
          stage.isPrimaryAction &&
          stage.responsiblePersonId === user?.jsplid &&
          !stage.isActionPending
      );

      const allChecklistsCompleted = mocData.mocChecklistsFormHeaders.every(
        (header) =>
          !header.mocChecklistsFormBodies.some((body) => body.status !== "Yes")
      );

      const isActionCompleted = !!completedAction;

      setShowActionButtons(!!pendingChecklistHeader && !isActionCompleted);

      setIsApproveButtonEnabled(
        !!pendingChecklistHeader &&
        allChecklistsCompleted &&
        !isActionCompleted
      );
    }
  }, [mocData, stageType, user]);


  // --- End of Formik and useEffect logic ---

  const handleSecondaryAction = async (
    actionType: "Clarification" | "ExpertAdvice",
    values: { email: string; remarks: string }
  ) => {
    if (!mocData || !token || !user || !stageType) {
      toast.error("MOC data, user information, or stage type is not available.");
      return;
    }

    let responsibleUserDetails: { id: string; mail: string; name: string };

    if (actionType === "Clarification") {
      responsibleUserDetails = {
        id: mocData?.createdById || "",
        mail: mocData?.createdByMail || "",
        name: mocData?.createdByName || "",
      };
      if (!responsibleUserDetails.id) {
        toast.error("Initiator details are missing. Cannot send clarification.");
        return;
      }
    } else {
      if (!values.email) {
        toast.error("Please enter a valid email for Expert Advice.");
        return;
      }
      try {
        const userResponse = await serverRequest(
          {},
          `${FETCH_DETAILS_FROM_MAIL}/email/${values.email}`,
          CONSTANTS.REQUEST_GET,
          true,
          true,
          token
        );
        responsibleUserDetails = {
          id: userResponse?.jsplid || "",
          mail: userResponse?.empEmail || "",
          name: userResponse?.empName || "",
        };
      } catch (error) {
        toast.error(
          "Failed to find user with that email. Please check the email and try again."
        );
        return;
      }
    }

    const url = `${SEND_SECONDARY_ACTION}/${mocData.mocAfNo}/${stageType}/${actionType}`;

    const requestBody = {
      mocAfNo: mocData.mocAfNo,
      stageType: stageType,
      initiatedDate: dayjs().toISOString(),
      initiatedFromId: user?.sub || "",
      initiatedFromMail: user?.email || "",
      initiatedFromName: user?.name || "",
      initiatedFromRemarks: values.remarks,
      responsiblePersonId: responsibleUserDetails.id,
      responsiblePersonMail: responsibleUserDetails.mail,
      responsiblePersonName: responsibleUserDetails.name,
      attachments: [],
    };

    try {
      const response = await serverRequest(
        requestBody,
        url,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response?.success) {
        // toast.success(response.message);
        setActionSubmitted(true);
        closeModal(
          actionType === "Clarification" ? "Clarification" : "ExpertAdvice"
        );
        onActionComplete();
      } else {
        toast.error(
          response?.message || `Failed to perform ${actionType} action.`
        );
      }
    } catch (error: any) {
      console.error(`Error performing ${actionType} action:`, error);
      toast.error(error?.message || `Failed to perform ${actionType} action.`);
    }
  };

  const handleAction = async (action: "approve" | "reject" | "revert") => {
    if (!mocData || !token || !stageType) {
      toast.error("MOC data or stage type is not available.");
      return;
    }

    if (action === "approve" && !isApproveButtonEnabled) {
      toast.error("Cannot approve: Conditions for approval are not met.");
      return;
    }

    const url = `${REVIEW_MOC_APPLICATION}/${mocData.mocAfNo}/${stageType}/${action}`;
    const requestBody = {
      mocAfNo: mocData.mocAfNo,
      stageType: stageType,
      initiatedDate: dayjs().toISOString(),
      initiatedFromId: user?.sub || "",
      initiatedFromMail: user?.email || "",
      initiatedFromName: user?.name || "",
      initiatedFromRemarks: remarks,
      attachments: [],
    };

    try {
      const response = await serverRequest(
        requestBody,
        url,
        CONSTANTS.REQUEST_POST,
        true,
        true,
        token
      );
      if (response?.success) {
        // toast.success(response.message);
        setActionSubmitted(true);
        router.push(APP_URL.MOC_DASHBOARD);
      } else {
        toast.error(response?.message || "Action failed.");
      }
    } catch (error: any) {
      console.error(`Error performing ${action} action:`, error);
      toast.error(error?.message || `Failed to perform ${action} action.`);
    }
  };

  const btnStyle = (bgColor: string) => ({
    backgroundColor: bgColor,
    color: "white",
    fontWeight: 600,
    fontSize: "14px",
    padding: "5px 12px",
    width: "110px",
    height: "32px",
    border: "none",
    cursor: "pointer",
  });

  return (
    <>
      <div className="mb-4">
        <strong style={{ fontSize: "18px", color: "#333" }}>Remarks</strong>
        <textarea
          className="form-control mt-2"
          placeholder="Remarks"
          rows={3}
          style={{ fontSize: "16px" }}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        ></textarea>
      </div>

      <div className="d-flex flex-column gap-2 mt-2">
        <div className="d-flex justify-content-between">
          {showActionButtons && (
            <div className="d-flex gap-2">
              <button
                className="iconBtn orange v2 d-flex align-items-center gap-2"
                onClick={() => openModal("Clarification")}
                disabled={actionSubmitted}
              >
                Ask for Clarification
              </button>
              <button
                className="iconBtn green v2 d-flex align-items-center gap-2"
                onClick={() => openModal("ExpertAdvice")}
                disabled={actionSubmitted}
              >
                Expert Advice
              </button>
            </div>
          )}
          {showActionButtons && (
            <div className="d-flex gap-2">
              <button
                className="btn"
                style={btnStyle("#5c5c5c")}
                onClick={() => handleAction("reject")}
                disabled={actionSubmitted}
              >
                Reject
              </button>
              <button
                className="btn"
                style={btnStyle("#f47b20")}
                onClick={() => handleAction("revert")}
                disabled={actionSubmitted}
              >
                Revert
              </button>
              <button
                className="btn"
                style={btnStyle("#28a745")}
                onClick={() => handleAction("approve")}
                disabled={!isApproveButtonEnabled || actionSubmitted}
              >
                Approve
              </button>
            </div>
          )}
        </div>
        <hr />
        <div>
          {mocData && (
            <ClarificationChat
              mocId={mocData.id}
              mocNo={mocNo}
              secondaryActions={secondaryActions}
              currentUser={user}
              token={token}
              onActionComplete={onActionComplete}
            />
          )}
        </div>
      </div>

      {/* Clarification Modal */}
      <CustomModal
        isOpen={modals.Clarification}
        onClose={() => closeModal("Clarification")}
        title="Ask The Clarification"
      >
        <form onSubmit={clarificationFormik.handleSubmit}>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12">
                <p>Clarification will be sent to the MOC Initiator.</p>
                <div className="mt-2 text-primary" style={{ fontWeight: 600 }}>
                  Responsible Person: {mocData.createdByName}
                </div>
                <div className="mt-1 text-primary" style={{ fontWeight: 600 }}>
                  Email: {mocData.createdByMail}
                </div>
              </div>
              <div className="col-12">
                <InputField
                  type="text"
                  label="Remarks"
                  name="remarks"
                  placeholder="Enter your remarks"
                  value={clarificationFormik.values.remarks}
                  onChange={clarificationFormik.handleChange}
                  onBlur={clarificationFormik.handleBlur}
                  errors={clarificationFormik.errors.remarks}
                  touched={clarificationFormik.touched.remarks}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="btnWrapper d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btnNoicon red"
                    onClick={() => closeModal("Clarification")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btnNoicon green">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CustomModal>

      {/* Expert Advice Modal */}
      <CustomModal
        isOpen={modals.ExpertAdvice}
        onClose={() => closeModal("ExpertAdvice")}
        title="Ask The Expert"
      >
        <form onSubmit={expertAdviceFormik.handleSubmit}>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12">
                <p>Select user for Expert Advice</p>
                <InputField
                  type="email"
                  label="Email"
                  name="email"
                  placeholder="Enter user's email"
                  value={expertAdviceFormik.values.email}
                  onChange={expertAdviceFormik.handleChange}
                  onBlur={expertAdviceFormik.handleBlur}
                  errors={expertAdviceFormik.errors.email}
                  touched={expertAdviceFormik.touched.email}
                />
              </div>
              <div className="col-12">
                <InputField
                  type="text"
                  label="Remarks"
                  name="remarks"
                  placeholder="Enter your remarks"
                  value={expertAdviceFormik.values.remarks}
                  onChange={expertAdviceFormik.handleChange}
                  onBlur={expertAdviceFormik.handleBlur}
                  errors={expertAdviceFormik.errors.remarks}
                  touched={expertAdviceFormik.touched.remarks}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="btnWrapper d-flex justify-content-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btnNoicon red"
                    onClick={() => closeModal("ExpertAdvice")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btnNoicon green">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CustomModal>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
    </>
  );
};

export default MocChecklistActions;