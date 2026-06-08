"use client";
export interface PageProps {
  params?: { mocId: string }
  searchParams?: Record<string, string | string[] | undefined>
}
import Link from "next/link";
import CustomModal from "@/components/Layouts/CustomModal";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import InputField from "@/components/Form/InputField";
import ClarificationChat from "../../moc/ClarificationChat/pages";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { useModalManager } from "@/hooks/useModalManager";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_MOC_DETAIL, REVIEW_MOC_APPLICATION, SEND_SECONDARY_ACTION, FETCH_DETAILS_FROM_MAIL } from "@/config/apiConfig";
import { useSelector } from "react-redux";
import { selectUserToken, selectUser } from "@/store/slices/authSlice";
import { ToastContainer, toast } from "react-toastify";
import dayjs from "dayjs";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";


// Define the types to match the API response structure precisely.
type TMocReviewStage = {
  id: number;
  mocAfNo: string;
  stageType: string;
  isPrimaryAction: boolean;
  reviewFlowType: string;
  reviewFlowStatus: string;
  initiatedDate: string;
  initiatedFromId: string;
  initiatedFromMail: string;
  initiatedFromName: string;
  isActionPending: boolean;
  isCurrentAction: boolean;
  responsiblePersonId: string;
  responsiblePersonMail: string;
  responsiblePersonName: string;
  currentAction: string;
  nextAction: string;
  isDeleted: boolean;
  attachments: any[];
  initiatedFromRemarks: string;
  actionDate: string | null;
  isSecondaryActionWithdrawn: boolean | null;
  secondaryActionRepliedFor: number | null;
  isUnitHeadApprovalRequired: boolean | null;
};

type TMocChangeCategory = {
  id: number;
  mocAfNo: string;
  slNo: number;
  changeCategory: string;
  status: string;
  identificationName: string;
  identificationDescription: string;
  createdDate: string;
  updatedDate: string;
  createdById: string;
  createdByMail: string;
  createdByName: string;
  updatedById: string;
  updatedByMail: string;
  updatedByName: string;
};

type TMocChecklistFormHeader = {
  id: number;
  mocAfNo: string;
  headerShtCode: string;
  headerName: string;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
  createdById: string;
  createdByMail: string;
  createdByName: string;
  updatedById: string;
  updatedByMail: string;
  updatedByName: string;
  checklistPrimaryPendingAtId: string;
  checklistPrimaryPendingAtMail: string;
  checklistPrimaryPendingAtName: string;
  mocChecklistsFormBodies: any[];
};

type TMocRequest = {
  id: number;
  docNo: string;
  revNo: number;
  revDate: string;
  mocAfNo: string;
  title: string;
  createdDate: string;
  updatedDate: string;
  unitId: number;
  unitName: string;
  departmentId: number;
  departmentName: string;
  sectionId: number;
  sectionName: string;
  departmentHodId: string;
  departmentHodEmail: string;
  departmentHodName: string;
  sectionHeadId: string;
  sectionHeadMail: string;
  sectionHeadName: string;
  descriptionPresent: string;
  descriptionProposed: string;
  typeOfChange: string;
  applicableForDays: number;
  applicableTillDate: string;
  reasonForChange: string;
  typeOfExpenditure: string;
  amount: number;
  currency: string;
  changeRequirePlantModification: string;
  changeRequirePlantModificationDetails: string;
  subsequentAffectedChange: string;
  subsequentAffectedChangeDetails: string;
  isDeleted: boolean;
  createdById: string;
  createdByMail: string;
  createdByName: string;
  updatedById: string;
  updatedByMail: string;
  updatedByName: string;
  mocAfPrimaryPendingAtId: string;
  mocAfPrimaryPendingAtMail: string;
  mocAfPrimaryPendingAtName: string;
  mocAfPrimaryPendingFor: string;
  mocAfStatus: string;
  mocReviewStages: TMocReviewStage[];
  mocChangeCategories: TMocChangeCategory[];
  mocChecklistsFormHeaders: TMocChecklistFormHeader[];
  // Add a helper field to store the current stage for easy access
  currentStage?: string;
};

type RequestBody = {
  mocAfNo: string;
  stageType: string;
  initiatedDate: string;
  initiatedFromId: string;
  initiatedFromMail: string;
  initiatedFromName: string;
  initiatedFromRemarks: string;
  attachments: any[];
  responsiblePersonId?: string;
  responsiblePersonMail?: string;
  responsiblePersonName?: string;
  isUnitHeadApprovalRequired?: boolean;
};
// export interface PageProps {
//   // match .next/types so type checker stops complaining
//   params?: Promise<{ mocId: string }>
//   searchParams?: Promise<Record<string, string | string[] | undefined>>
// }
export default function HodPending({ params }: PageProps) {
  const { mocId } = params || {};
  // normalize back to plain object
  // const { mocId } = await params!
  const router = useRouter();
  const token = useSelector(selectUserToken);
  const [mocData, setMocData] = useState<TMocRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");

  const [isApproveButtonEnabled, setIsApproveButtonEnabled] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [apiCheckedChecklists, setApiCheckedChecklists] = useState<Set<string>>(new Set());
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const mocNo = sessionStorage.getItem('mocAfNo');
  const [fetchedData, setfetchedData] = useState<TMocRequest>();
  const [responsiblePerson, setResponsiblePerson] = useState<{ id: string; name: string }>({ id: "", name: "" });
  const [secondaryActions, setSecondaryActions] = useState<TMocReviewStage[]>([]);

  const allChecklistCodes = ["C1", "C2", "C3", "C4", "C5", "C6"];

  const { modals, openModal, closeModal } = useModalManager([
    "Clarification",
    "ExpertAdvice",
  ] as const);
  const [zonalHeadMail, setZonalHeadMail] = useState("");
  const [zonalHeadName, setZonalHeadName] = useState("");
  const [zonalHeadId, setZonalHeadId] = useState("");
  const [flag, setFlag] = useState(false);

  const handleRadioButtonChange = (e) => {
    const value = e.target.value === "true";
    setFlag(value);
  };

  const handleEmailBlur = async () => {
    setZonalHeadName("");
    setZonalHeadId("");
    setZonalHeadMail("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!zonalHeadMail || !emailRegex.test(zonalHeadMail)) {
      toast.error("Please enter a valid email for Zonal Head.");
      return;
    }
    try {
      const response = await serverRequest(
        {},
        `${FETCH_DETAILS_FROM_MAIL}/email/${zonalHeadMail}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response) {
        setZonalHeadId(response?.jsplid);
        setZonalHeadName(response?.empName);
        setZonalHeadMail(response?.empEmail);
      } else {
        toast.error("No user found with that email.");
      }
    } catch (error) {
      toast.error("Failed to find user detail with this email. Please check the email and try again.");
    }
  };

  // Function to handle secondary actions (Clarification, Expert Advice)
  const handleSecondaryAction = async (actionType: 'Clarification' | 'ExpertAdvice', values: { email: string; remarks: string }) => {
    if (!mocData || !token || !user) {
      toast.error("MOC data or user information is not available.");
      return;
    }

    const stageType = mocData.currentStage;
    if (!stageType) {
      toast.error("Cannot perform action: no active stage found for this MOC request.");
      return;
    }

    // Fetch user details before making the secondary action call
    let responsibleUserDetails: { id: string; mail: string; name: string };

    // Condition to check if the action is Clarification
    if (actionType === 'Clarification') {
      // Always send clarification to the initiator, regardless of the email typed in the field
      responsibleUserDetails = {
        id: fetchedData?.createdById || "",
        mail: fetchedData?.createdByMail || "",
        name: fetchedData?.createdByName || "",
      };
      // Show an error if the initiator details are missing
      if (!responsibleUserDetails.id) {
        toast.error("Initiator details are missing. Cannot send clarification.");
        return;
      }

    } else {
      // For Expert Advice, use the email from the form field
      if (!values.email) {
        toast.error("Please enter a valid email for Expert Advice.");
        return;
      }
      try {
        const userResponse = await serverRequest({}, `${FETCH_DETAILS_FROM_MAIL}/email/${values.email}`, CONSTANTS.REQUEST_GET, true, true, token);
        responsibleUserDetails = {
          id: userResponse?.jsplid || "",
          mail: userResponse?.empEmail || "",
          name: userResponse?.empName || "",
        };
      } catch (error) {
        console.error("Failed to fetch responsible person details:", error);
        toast.error("Failed to find user with that email. Please check the email and try again.");
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
      attachments: []
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
        toast.success(response.message);
        closeModal(actionType === 'Clarification' ? "Clarification" : "ExpertAdvice");
        fetchMocRequest(); // Re-fresh the data after action
      } else {
        toast.error(response?.message || `Failed to perform ${actionType} action.`);
      }
    } catch (error: any) {
      console.error(`Error performing ${actionType} action:`, error);
      toast.error(error?.message || `Failed to perform ${actionType} action.`);
    }
  };

  const clarificationFormik = useFormik({
    initialValues: {
      email: "",
      remarks: "",
    },
    onSubmit: async (values) => {
      await handleSecondaryAction('Clarification', values);
    },
  });

  const expertAdviceFormik = useFormik({
    initialValues: {
      email: "",
      remarks: "",
    },
    onSubmit: async (values) => {
      await handleSecondaryAction('ExpertAdvice', values);
    },
  });

  // useEffect to fetch user details when email changes in the forms
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!token || modals.Clarification) return; // Only fetch for Expert Advice
      let emailToFetch = expertAdviceFormik.values.email;

      if (emailToFetch) {
        try {
          const response = await serverRequest({}, `${FETCH_DETAILS_FROM_MAIL}/email/${emailToFetch}`, CONSTANTS.REQUEST_GET, true, true, token);
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

  const fetchMocRequest = async () => {
    try {
      setLoading(true);

      const response: TMocRequest = await serverRequest(
        {},
        `${FETCH_MOC_DETAIL}/${mocNo}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );

      if (response && response.mocAfNo) {
        const primaryActionStage = response.mocReviewStages.find(
          (stage) => stage.isPrimaryAction && stage.isCurrentAction && stage.isActionPending && stage.responsiblePersonId === user?.jsplid
        );

        const secondaryActions = response.mocReviewStages.filter(
          (stage) => !stage.isPrimaryAction && (stage.stageType == "C0" || stage.stageType == "D")
        );
        setSecondaryActions(secondaryActions);

        const currentStage = primaryActionStage?.stageType || "";
        // setShowActionButtons(!!primaryActionStage);
        setShowActionButtons(!!primaryActionStage && (primaryActionStage.stageType === "C0" || primaryActionStage.stageType === "D"));

        const mocDataWithStage = { ...response, currentStage };
        setMocData(mocDataWithStage);

        // Checklist handling
        const apiHeaders = new Set(
          mocDataWithStage.mocChecklistsFormHeaders.map(
            (item) => item.headerShtCode
          )
        );
        setApiCheckedChecklists(apiHeaders);

        const allChecklistsCompleted = apiHeaders.size > 0;
        setIsApproveButtonEnabled(
          !!primaryActionStage && (currentStage === "C0" || currentStage === "D") && allChecklistsCompleted
        );
        setfetchedData(response);

      } else {
        setError("Invalid MOC data received.");
        toast.error("Invalid MOC data received.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch MOC data.");
      toast.error(err.message || "Failed to fetch MOC data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && mocNo) {
      fetchMocRequest();
    }
  }, [token, user?.jsplid, mocNo]);

  const handleAction = async (action: 'approve' | 'reject' | 'revert') => {

      if (
    (action === 'reject' || action === 'revert') &&
    (!remarks || remarks.trim().length === 0)
  ) {
    toast.error("Please enter remarks before proceeding.");
    return;
  }
    if (!mocData || !token) {
      toast.error("MOC data is not available.");
      return;
    }

    // console.log("Current Token:", token);
    // console.log("Current user:", user);

    const stageType = mocData.currentStage;

    // Check if the stageType is available before proceeding
    if (!stageType) {
      toast.error("Cannot perform action: no active stage found for this MOC request.");
      return;
    }

    // The approve button is conditionally disabled, so this check acts as a double-safety
    if (action === 'approve' && !isApproveButtonEnabled) {
      toast.error("Cannot approve: Conditions for approval are not met.");
      return;
    }

    const url = `${REVIEW_MOC_APPLICATION}/${mocData.mocAfNo}/${stageType}/${action}`;
    //add zonal head

    let requestBody: RequestBody = {
      mocAfNo: mocData.mocAfNo,
      stageType: stageType,
      initiatedDate: dayjs().toISOString(),
      initiatedFromId: user?.sub || "",
      initiatedFromMail: user?.email || "",
      initiatedFromName: user?.name || "",
      initiatedFromRemarks: remarks,
      attachments: []
    };

    if (fetchedData?.mocAfPrimaryPendingFor == "Review Pending At HoD" && fetchedData?.mocAfPrimaryPendingAtId == user?.jsplid) {
      if (!zonalHeadId || !zonalHeadMail || !zonalHeadName) {
        toast.error("Please enter a valid Zonal Head Email.");
        return;
      }
      requestBody = {
        ...requestBody,
        responsiblePersonId: zonalHeadId,
        responsiblePersonMail: zonalHeadMail,
        responsiblePersonName: zonalHeadName
      };
    }
    if (fetchedData?.mocAfPrimaryPendingFor == "Review Pending At Zonal Head" && fetchedData?.mocAfPrimaryPendingAtId == user?.jsplid) {
      requestBody = {
        ...requestBody,
        isUnitHeadApprovalRequired: flag
      };
    }

    // Log the data you're about to send
    console.log("API URL:", url);
    console.log("Request Body:", JSON.stringify(requestBody));

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
        toast.success(response.message);
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
    border: 'none',
    cursor: 'pointer'
  });

  if (loading) {
    return <div className="container-fluid">Loading MOC request...</div>;
  }

  if (error) {
    return <div className="container-fluid text-danger">{error}</div>;
  }

  if (!mocData) {
    return <div className="container-fluid">MOC request not found.</div>;
  }

  return (
    <div className="container-fluid">
      <div className="admin-boxContainer d3">
        <div className="adminAction">
          <Link href={APP_URL.HOD_DETAIL_VIEW} className="adminAction__title">
            <span className="icon">
              <img
                width="15"
                height="15"
                alt="icon"
                src="/images/svg/arrow-left-grey.svg"
                className="img-fluid u-image"
              />
            </span>
            Request View Details
          </Link>
        </div>
      </div>

      <div className="admin-boxContainer d1 p-3 shadow rounded-4 mb-2">
        <div className="mb-3">
          <h5 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "20px" }}>
            Management of Change{" "}
            <span style={{ fontWeight: 400 }}>(Technology and Facilities)</span>{" "}
            <span style={{ fontWeight: 600 }}>Procedure</span>
          </h5>
          <div className="d-flex flex-wrap gap-4 mt-2" style={{ fontSize: "15px", fontWeight: 600 }}>
            <div>
              <strong>Unit:</strong> {fetchedData?.unitName}
            </div>
            <div>
              <strong>Department:</strong> {fetchedData?.departmentName}
            </div>
            <div>
              <strong>Section:</strong> {fetchedData?.sectionName}
            </div>
            <div>
              <strong>Date:</strong> {dayjs(fetchedData?.createdDate).format('DD-MM-YYYY')}
            </div>
          </div>
          <div className="d-flex flex-wrap gap-4 mt-2" style={{ fontSize: "15px", fontWeight: 600 }}>
            <div>
              <strong>Title {" : "}</strong> {fetchedData?.title}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive mb-5">
          <table className="table table-bordered">
            <thead style={{ backgroundColor: "#34587f", color: "white" }}>
              <tr style={{ height: "60px" }}>
                <th style={{ width: "40%", fontSize: "18px", padding: "16px", verticalAlign: "middle" }}>Category</th>
                <th style={{ width: "20%", fontSize: "18px", padding: "16px", verticalAlign: "middle" }}>Status</th>
                <th style={{ width: "20%", fontSize: "18px", padding: "16px", verticalAlign: "middle" }}>Name of Product</th>
              </tr>
            </thead>
            {fetchedData?.mocChangeCategories.map((item, index) => (
              <tbody key={index}>
                <tr style={{ backgroundColor: "#f9f9f9" }}>
                  <td style={{ padding: "14px", fontSize: "17px" }}>{item?.changeCategory}</td>
                  <td style={{ padding: "14px", fontSize: "17px" }}> {item?.status}</td>
                  <td style={{ padding: "14px", fontSize: "17px" }}>{item?.identificationName}</td>
                </tr>
              </tbody>
            ))}

          </table>
        </div>

        <div
          className="p-4 rounded-3 mb-5"
          style={{
            border: "1px solid #d1d1d1",
            backgroundColor: "#fff",
          }}
        >

          {fetchedData?.descriptionPresent && <div className="mb-4">
            <strong style={{ fontSize: "18px" }}> Description of the present procedure / system </strong>
            <p style={{ fontSize: "16px", marginTop: "8px" }}> {fetchedData?.descriptionPresent} </p>
          </div>}

          {fetchedData?.descriptionProposed && <div className="mb-4">
            <strong style={{ fontSize: "18px" }}> Description of the proposed change* </strong>
            <p style={{ fontSize: "16px", marginTop: "8px" }}> {fetchedData?.descriptionProposed} </p>
          </div>}

          {fetchedData?.typeOfChange && <div className="mb-4">
            <strong style={{ fontSize: "18px" }}> Type of Changes </strong>
            <p style={{ fontSize: "16px", marginTop: "8px" }}> {fetchedData?.typeOfChange} </p>
          </div>}
          {fetchedData?.descriptionProposed && <div className="mb-4">
            <strong style={{ fontSize: "18px" }}> Reasons (justification) for the proposed change*</strong>
            <p style={{ fontSize: "16px", marginTop: "8px" }}> {fetchedData?.reasonForChange} </p>
          </div>}

          {fetchedData?.typeOfExpenditure && <div className="mb-4">
            <strong style={{ fontSize: "18px" }}> Type of Expenditure</strong>
            <p style={{ fontSize: "16px", marginTop: "8px" }}> {fetchedData?.typeOfExpenditure} : ({fetchedData?.amount} {fetchedData?.currency}) </p>
          </div>}

          {fetchedData?.changeRequirePlantModification && <div className="mb-4">
            <strong style={{ fontSize: "18px" }}>  Does this change require plant modification? </strong>
            <p style={{ fontSize: "16px", marginTop: "8px" }}> {fetchedData?.changeRequirePlantModification} : {fetchedData?.changeRequirePlantModificationDetails && ':'} {fetchedData?.changeRequirePlantModificationDetails} </p>
          </div>}
          {fetchedData?.subsequentAffectedChange && <div className="mb-4">
            <strong style={{ fontSize: "18px" }}>  Whether subsequent stages are affected by this change: </strong>
            <p style={{ fontSize: "16px", marginTop: "8px" }}> {fetchedData?.subsequentAffectedChange} : {fetchedData?.subsequentAffectedChangeDetails && ':'} {fetchedData?.subsequentAffectedChangeDetails} </p>
          </div>}
        </div>

        <div className="mb-4">
          <strong style={{ fontSize: "18px", color: "#333333ff" }}>
            Mandatory checklists must be completed for MOC approval.
          </strong>
          <div className="d-flex flex-wrap gap-4 mt-3">
            {allChecklistCodes.map((item, idx) => (
              <label
                key={idx}
                className="d-flex align-items-center gap-2"
                style={{ fontSize: "16px", fontWeight: 400, cursor: "not-allowed" }}
              >
                <input
                  type="checkbox"
                  value={item}
                  checked={fetchedData?.mocChecklistsFormHeaders?.some((header) => header.headerShtCode === item)}
                  style={{ width: "18px", height: "18px" }}
                  onChange={()=>{}}
                />
                {item}
              </label>
            ))}
          </div>
        </div>
        {(fetchedData?.mocAfPrimaryPendingFor == "Review Pending At HoD" && fetchedData?.mocAfPrimaryPendingAtId == user?.jsplid) && (
          <div className="mb-3" style={{ border: "0.5px solid #ccc", borderRadius: "8px", padding: "10px" }}>
            <strong style={{ fontSize: "18px", color: "#333" }}>Zonal Head Detail</strong>
            <div className="d-flex flex-row gap-3 m-2 align-items-center">
              <label className="form-label mb-0">Zonal Head Email</label>
              <input type="email" value={zonalHeadMail} onChange={(e) => setZonalHeadMail(e.target.value)} onBlur={handleEmailBlur} className="form-control w-auto" style={{ flex: "0 0 30%" }} placeholder="Enter email" />
              <label className="form-label mb-0">Zonal Head Name</label>
              <input type="text" value={zonalHeadName} className="form-control w-auto" style={{ flex: "0 0 30%" }} placeholder="Enter name" readOnly />
            </div>
          </div>
        )}
        {(fetchedData?.mocAfPrimaryPendingFor == "Review Pending At Zonal Head" && fetchedData?.mocAfPrimaryPendingAtId == user?.jsplid) && (
          <div className="mb-3" style={{ border: "0.5px solid #ccc", borderRadius: "8px", padding: "10px" }}>
            <strong style={{ fontSize: "18px", color: "#333" }}>Requires Unit Head Approval?</strong>
            <div className="d-flex flex-row gap-4 m-2 align-items-center">
              <label className="form-check-label d-flex align-items-center gap-2 mb-0">
                <input type="radio" name="uhApproval" value="true" onChange={handleRadioButtonChange} className="form-check-input" style={{ accentColor: "red", width: "18px", height: "18px" }} />
                Yes
              </label>
              <label className="form-check-label d-flex align-items-center gap-2 mb-0">
                <input type="radio" name="uhApproval" value="false" onChange={handleRadioButtonChange} defaultChecked className="form-check-input" style={{ accentColor: "red", width: "18px", height: "18px" }} />
                No
              </label>
            </div>
          </div>
        )}
        {/* The rest of the component */}
        <div className="mb-4">
          <div className="mb-3">
            <strong style={{ fontSize: "18px", color: "#333" }}>Remarks*</strong>
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
                  <button className="iconBtn orange v2 d-flex align-items-center gap-2" onClick={() => openModal("Clarification")}>
                    Ask for Clarification
                  </button>
                  <button className="iconBtn green v2 d-flex align-items-center gap-2" onClick={() => openModal("ExpertAdvice")}>
                    Expert Advice
                  </button>
                </div>
              )}
              {/* Only show these buttons if an action is pending for the current user */}
              {showActionButtons && (
                <div className="d-flex gap-2">
                  <button className="btn" style={btnStyle("#5c5c5c")} onClick={() => handleAction('reject')}>
                    Reject
                  </button>
                  <button className="btn" style={btnStyle("#f47b20")} onClick={() => handleAction('revert')} >
                    Revert
                  </button>
                  <button className="btn" style={btnStyle("#28a745")} onClick={() => handleAction('approve')}
  disabled={!isApproveButtonEnabled}
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
            <hr />
            <div>
              <ClarificationChat
                mocId={mocId}
                mocNo={mocNo}
                secondaryActions={secondaryActions}
                currentUser={user}
                token={token}
                onActionComplete={fetchMocRequest}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clarification Modal with Formik */}
      < CustomModal
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
                  Responsible Person: {fetchedData?.createdByName}
                </div>
                <div className="mt-1 text-primary" style={{ fontWeight: 600 }}>
                  Email: {fetchedData?.createdByMail}
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
                  <button type="submit" className="btnNoicon green">Submit</button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CustomModal >

      {/* Expert Advice Modal with Formik */}
      < CustomModal
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
                  <button type="submit" className="btnNoicon green">Submit</button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CustomModal>
      <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
    </div>

  );
};

// export default HodPending;
