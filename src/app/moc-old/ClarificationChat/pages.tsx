"use client";
import React, { useState } from "react";
import dayjs from "dayjs";
import { toast, ToastContainer } from "react-toastify";
import { serverRequest } from "@/services/getServerSideRender";
import { CONSTANTS } from "@/config/constant";
import { WITHDRAW_SECONDARY_ACTION, REPLY_SECONDARY_ACTION } from "@/config/apiConfig";

// Use new types for clarity and consistency
type SecondaryAction = {
  id: number;
  mocAfNo: string;
  stageType: string;
  reviewFlowType: string;
  reviewFlowStatus: string;
  initiatedFromId: string;
  initiatedFromMail: string;
  initiatedFromName: string;
  initiatedFromRemarks: string;
  responsiblePersonId: string;
  responsiblePersonMail: string;
  responsiblePersonName: string;
  initiatedDate: string;
  actionDate: string | null;
  isActionPending: boolean;
  isCurrentAction: boolean;
  isSecondaryActionWithdrawn: boolean | null;
  secondaryActionRepliedFor: number | null;
};

type User = {
  jsplid: string;
  sub: string;
  email: string;
  name: string;
};

type ClarificationChatProps = {
  mocId: string | number;
  mocNo: string | null;
  secondaryActions: SecondaryAction[];
  currentUser: User;
  token: string | null;
  onActionComplete: () => void;
};

const ClarificationChat = ({ mocNo, secondaryActions, currentUser, token, onActionComplete }: ClarificationChatProps) => {
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  const handleWithdrawal = async (action: SecondaryAction) => {
    if (!token || !mocNo || !currentUser) return;
    const isConfirmed = window.confirm("Are you sure you want to withdraw this request?");
    if (!isConfirmed) return;

    const url = `${WITHDRAW_SECONDARY_ACTION}/${mocNo}/${action.stageType}/${currentUser.jsplid}/${action.id}`;

    try {
      const response = await serverRequest(
        {},
        url,
        CONSTANTS.REQUEST_PATCH,
        true,
        true,
        token
      );
      if (response?.success) {
        // toast.success(response.message);
        onActionComplete(); // Refresh the parent component's data
      } else {
        toast.error("Failed to withdraw request.");
      }
    } catch (error: any) {
      toast.error(error.message || "Error withdrawing request.");
    }
  };

  const handleReply = async (action: SecondaryAction) => {
    if (!token || !mocNo || !currentUser || !replyText) {
      toast.error("Reply message cannot be empty.");
      return;
    }

    const url = `${REPLY_SECONDARY_ACTION}/${mocNo}/${action.stageType}/${action.id}`;

    const requestBody = {
      mocAfNo: mocNo,
      stageType: action.stageType,
      initiatedDate: dayjs().toISOString(),
      initiatedFromId: currentUser.sub || "",
      initiatedFromMail: currentUser.email || "",
      initiatedFromName: currentUser.name || "",
      initiatedFromRemarks: replyText,
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
        // toast.success(response.message);
        setReplyText("");
        setActiveReplyId(null);
        onActionComplete(); // Refresh the parent component's data
      } else {
        toast.error("Failed to send reply.");
      }
    } catch (error: any) {
      toast.error(error.message || "Error sending reply.");
    }
  };

  const imageStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  };

  const messageBoxStyle = (isReply = false) => ({
    // backgroundColor: isReply ? "#e9f7ef" : "#f8f9fa",
    // border: `1px solid ${isReply ? "#28a745" : "#dee2e6"}`,
    // padding: "10px",
    // borderRadius: "5px",
    // color: "#212529",
    // marginTop: "5px",    
    backgroundColor: "#EFEFEF",
    padding: "6px 12px",
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
    borderTopLeftRadius: "5px",
    borderBottomLeftRadius: "15px",
  });

  const buttonStyle = {
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
  };

  const withdrawalBtnStyle = {
    ...buttonStyle,
    backgroundColor: "#ffc107",
    color: "#000",
  };

  const replyBtnStyle = {
    ...buttonStyle,
    backgroundColor: "#28a745",
    color: "#fff",
  };
  const repliedBoxStyle = {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "6px 12px",
    borderTopLeftRadius: "10px",
    borderBottomLeftRadius: "10px",
    borderTopRightRadius: "5px",
    borderBottomRightRadius: "15px",
  };

  return (
  <>
    {(secondaryActions.length === 0) ? (<></>) : (
    <>
      <div style={{ border: "1px solid #dee2e6", borderRadius: "8px", padding: "20px", margin: "20px auto", backgroundColor: "#fff", maxWidth: "1200px" }}>
        <h5 style={{ fontWeight: "bold" }}>Secondary Actions</h5>
        <p>All clarification and expert advice will appear here.</p>
        {
          secondaryActions.map((action, index) => {
          const isCurrentUserInitiator = action.initiatedFromId === currentUser.sub;
          const isCurrentUserRecipient = action.responsiblePersonId === currentUser.sub;
          const repliedAction = secondaryActions.find(linkAction => linkAction.secondaryActionRepliedFor === action?.id);

          return (
            <div key={index}>
              {((action.reviewFlowStatus == "Ask Clarification" || action.reviewFlowStatus == "Seek Expert Advice") && (<h5 style={{ fontWeight: "bold" }}>{action.reviewFlowStatus}</h5>))}
              {/* Review flowtype == clarification && reviewflowstatus == asked for clarification --> align in leftside */}
              {/* Sender Block */}
              {(action.reviewFlowStatus == "Ask Clarification" || action.reviewFlowStatus == "Seek Expert Advice")
                && (
                  <>
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                      <img src="/images/svg/userIcon.svg" alt={action.initiatedFromName} style={imageStyle} />
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: "12px", color: "#6c757d" }}>
                          {dayjs(action.initiatedDate).format('DD-MM-YYYY hh:mm A')} &nbsp;&nbsp;
                          {(action.reviewFlowStatus == "Ask Clarification") && (<><strong>{action.initiatedFromName}</strong> asked for clarification from <strong>{action.responsiblePersonName}</strong></>)}
                          {(action.reviewFlowStatus == "Seek Expert Advice") && (<><strong>{action.initiatedFromName}</strong> sought expert advice from <strong> {action.responsiblePersonName}</strong></>)}
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginTop: "10px" }}>
                          <div style={messageBoxStyle()}>
                            {action.initiatedFromRemarks}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Action buttons (Withdrawal/Reply) */}
                    <div style={{ margin: "10px 0" }}>
                      {isCurrentUserInitiator && repliedAction == null && !(action?.isSecondaryActionWithdrawn ?? false) && (
                        <button
                          style={withdrawalBtnStyle}
                          onClick={() => handleWithdrawal(action)}
                        >
                          Withdrawal {action.reviewFlowType}
                        </button>
                      )}
                      {isCurrentUserRecipient && repliedAction == null && !(action?.isSecondaryActionWithdrawn ?? false) && (
                        <button
                          style={replyBtnStyle}
                          onClick={() => setActiveReplyId(action.id)}
                        >
                          Reply
                        </button>
                      )}
                      {repliedAction == null && !(action?.isSecondaryActionWithdrawn ?? false) && (<hr style={{ margin: "10px 0" }} />)}
                    </div>
                  </>
                )}

              {/* Withdrawl Block */}
              {(action?.isSecondaryActionWithdrawn ?? false) && (
                <>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* <img src="/images/svg/userIcon.svg" alt="Suraj Das" style={imageStyle}/> */}
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "12px", color: "#6c757d" }}>
                        {dayjs(action.actionDate).format('DD-MM-YYYY hh:mm A')} &nbsp;&nbsp;
                        {(action.reviewFlowStatus == "Ask Clarification") && (<>Clarification withdrawn.</>)}
                        {(action.reviewFlowStatus == "Seek Expert Advice") && (<>Expert advice withdrawn</>)}
                      </div>
                    </div>
                  </div>
                  <hr style={{ margin: "5px 0" }} />
                </>
              )}

              {/* Reply Block */}
              {(repliedAction != null) && (
                <>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* <img src="/images/svg/userIcon.svg" alt="Suraj Das" style={imageStyle}/> */}
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "12px", color: "#6c757d" }}>
                        {dayjs(repliedAction.initiatedDate).format('DD-MM-YYYY hh:mm A')} &nbsp;&nbsp; <strong>{repliedAction?.initiatedFromName} </strong>&nbsp; replied
                      </div>

                      {/* Reply content */}
                      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "10px" }}>
                        <div style={repliedBoxStyle}>{repliedAction?.initiatedFromRemarks}</div>
                        <img src="/images/svg/userIcon.svg" alt="Replied By"
                          style={{
                            ...imageStyle,
                            marginLeft: "10px",
                            border: "1px solid #dee2e6",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <hr style={{ margin: "5px 0" }} />
                </>
              )}
              {/* reviewflowtype == clarification && id == matching secondaryactionrepliedfor --> align in rightside */}
              {/* reviewflowtype == clarification && issecondaryactionwithdrawn == true --> clarification withdrawn --> align right side */}

              {/* Review flowtype == expertadvice && reviewflowstatus == asked for expertadvice --> align from leftside */}
              {/* reviewflowtype == expertadvice &&  id == matching secondaryactionrepliedfor --> align in rightside */}
              {/* reviewflowtype == expertadvice && issecondaryactionwithdrawn == true --> expertadvice withdrawn --> align right side */}

              {/* isactionpending == true && iscurrentaction == true && initiatorfromid == currentUser.sub --> show withdraw button */}
              {/* isactionpending == true && iscurrentaction == true && responsiblepersonid == currentUser.sub --> show reply button */}



              {/* Reply Form */}
              {activeReplyId === action.id && (
                <div style={{ marginTop: "15px" }}>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ marginBottom: "10px" }}
                  ></textarea>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button className="btn btn-secondary" onClick={() => setActiveReplyId(null)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={() => handleReply(action)}>
                      Send Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
        }
      </div>
    </>
    )}
    <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
      
  </>
  );
};

export default ClarificationChat;