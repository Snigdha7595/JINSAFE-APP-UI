"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/Layouts/CustomModal";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { FormValues, MocChecklistFormHeader } from "@/types/moc";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_DRAFT_APPLICATION, FETCH_MOC_DETAIL } from "@/config/apiConfig";
import dayjs from "dayjs";

const HodDetailView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const token = useSelector(selectUserToken);
  const [fetchedData, setFetchedData] = useState<FormValues | undefined>(undefined);
  const draft_objId = sessionStorage.getItem('openedFormObjId');
  const mocNo = sessionStorage.getItem('mocAfNo');
  const [fetchedMocCheckList, setFetchedMocCheckList] = useState<MocChecklistFormHeader[]>([]);
  const [pendingInfo, setPendingInfo] = useState<any | null>(null);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let mocDetails;
        if (draft_objId) {
          mocDetails = await serverRequest(
            {},
            `${FETCH_DRAFT_APPLICATION}/${user?.jsplid}/${draft_objId}`,
            CONSTANTS.REQUEST_GET,
            true,
            true,
            token
          );
        } else if (mocNo) {
          mocDetails = await serverRequest(
            {},
            `${FETCH_MOC_DETAIL}/${mocNo}`,
            CONSTANTS.REQUEST_GET,
            true,
            true,
            token
          );
        }

        if (mocDetails) {
          setFetchedData(mocDetails);
          if (mocDetails.mocChecklistsFormHeaders) {
            setFetchedMocCheckList(mocDetails.mocChecklistsFormHeaders || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch MOC details:", err);
      }
    };

    if ((draft_objId || mocNo) && token) {
      fetchData();
    }
  }, [draft_objId, mocNo, token, user?.jsplid]);

  const date = dayjs(fetchedData?.createdDate).format('DD-MM-YYYY');

  return (
    <div className="container">
      <div className="admin-boxContainer d3">
        <div className="adminAction">
          <Link href={APP_URL.MOC_DASHBOARD} className="adminAction__title">
            <span className="icon">
              <Image
                width="15"
                height="15"
                alt="icon"
                src="/images/svg/arrow-left-grey.svg"
                className="img-fluid u-image"
              />
            </span>
            Moc Details View
          </Link>
        </div>
      </div>

      <div
        className="admin-boxContainer d1 p-3 shadow rounded-2 mb-3"
        style={{
          minHeight: "calc(100vh - 180px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {/* TOP SUMMARY TABLE */}
        <div className="table-responsive mb-3">
          <table className="table table-bordered mb-0">
            <thead>
              <tr>
                <th>Created By & Date</th>
                <th>Unit</th>
                <th>MOC AF No.</th>
                {/* <th>{fetchedData?.mocAfStatus?.includes('Draft') ? 'Unit' : 'MOC AF No.'}</th> */}
                <th>Department/ Section</th>
                {!fetchedData?.mocAfStatus?.includes('Draft') && <th>Request Status</th>}
                {/* {fetchedData?.mocAfStatus?.includes('Draft') ? <th>Status</th> : <th>Implementation Status</th>} */}
                {!fetchedData?.mocAfStatus?.includes('Draft') && <th>Type of Expenditure</th>}
                <th>Type of Change</th>
                {/* <th>Plant Modification?</th>
                <th>Subsequent stages are affected</th> */}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="small" style={{ padding: "11px" }}>
                  {fetchedData?.createdByName} <br />
                  {date}
                </td>
                <td style={{ padding: "11px" }}>{fetchedData?.unitName}</td>
                <td style={{ padding: "11px" }}>
                  <span style={{ color: "#005A8C", fontWeight: 600 }}>
                    {fetchedData?.mocAfNo}
                    {/* {fetchedData?.mocAfNo ? fetchedData?.mocAfNo : fetchedData?.unitName} */}
                  </span>
                </td>
                <td style={{ padding: "11px" }}>
                  {fetchedData?.departmentName} /
                  <br />
                  <span style={{ fontSize: "14px" }}>{fetchedData?.sectionName}</span>
                </td>
                {<td
                  style={{
                    color: "green",
                    fontWeight: 600,
                    padding: "11px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span>
                    {fetchedData?.mocAfStatus?.includes("Draft")
                      ? "Draft"
                      : fetchedData?.mocAfStatus}
                  </span>

                  <span style={{ color: "black", fontWeight: 400 }}>
                    { (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPendingInfo({
                            mocAfPrimaryPendingFor: fetchedData?.mocAfPrimaryPendingFor,
                            mocAfPrimaryPendingAtMail: fetchedData?.mocAfPrimaryPendingAtMail,
                            mocAfPrimaryPendingAtName: fetchedData?.mocAfPrimaryPendingAtName,
                          });
                          setIsPendingModalOpen(true);
                        }}
                        style={{
                          color: "#007bff",
                          cursor: "pointer",
                        }}
                      >
                        ({fetchedData?.mocAfPrimaryPendingFor})
                      </a>
                    )}
                  </span>
                </td>}
                {/* {!fetchedData?.mocAfStatus?.includes('Draft') && <td style={{ padding: "11px" }}>
                  <span style={{ color: "orange", fontWeight: 600 }}>
                    --
                  </span>
                  <br />
                </td>} */}
                <td style={{ padding: "11px" }}>{fetchedData?.typeOfExpenditure} ({fetchedData?.amount} {fetchedData?.currency})</td>
                <td style={{ padding: "11px" }}>{fetchedData?.typeOfChange}</td>
                {/* <td style={{ padding: "11px" }}>{fetchedData?.changeRequirePlantModification}</td>
                <td style={{ padding: "11px" }}>{fetchedData?.subsequentAffectedChange}</td> */}
                <td style={{ padding: "11px" }}>
                  {/* <button
                    onClick={() => window.location.href = APP_URL.HOD_PENDING}
                    className="tableBtn orange"
                    style={{
                      fontSize: "14px",
                      padding: "4px 10px",
                      fontWeight: 600,
                    }}
                  >
                    View
                  </button> */}
                  {(() => {
                      const isEditable = user?.jsplid === fetchedData?.mocAfPrimaryPendingAtId && fetchedData?.mocAfStatus === "Reverted";

                      const redirectUrl = isEditable
                        ? `${APP_URL.UPDATE_MOC}`
                        : `${APP_URL.HOD_PENDING}`;

                      return (    
                      <button
                    // onClick={() => window.location.href = APP_URL.HOD_PENDING}
                    onClick={() => router.push(redirectUrl)}
                    className="tableBtn orange"
                    style={{
                      fontSize: "14px",
                      padding: "4px 10px",
                      fontWeight: 600,
                    }}
                  >
                    View
                  </button>
                      );
                    })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CHECKLIST DETAILS TABLE */}
        <div className="table-responsive">
          <table className="table table-bordered mb-0">
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th>MOC Checklist Details</th>
                <th>Initiate Date</th>
                <th>Responsible Person Name</th>
                <th>Responsible Person Email ID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fetchedMocCheckList.sort((a, b) => a.headerShtCode.localeCompare(b.headerShtCode)).map((item, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white",
                  }}
                >
                  <td style={{ fontSize: "15px", padding: "11px" }}>
                    {item?.headerShtCode}
                  </td>
                  <td style={{ fontSize: "15px", padding: "11px" }}>
                    {date}
                  </td>
                  <td style={{ fontSize: "15px", padding: "11px" }}>
                    {item?.checklistPrimaryPendingAtName}
                  </td>
                  <td style={{ fontSize: "15px", padding: "11px" }}>
                    {item?.checklistPrimaryPendingAtMail}
                  </td>
                  <td
                    style={{
                      color: item.checklistStatus === "Approved" ? "green" : "orange",
                      fontWeight: 600,
                      fontSize: "15px",
                      padding: "11px",
                    }}
                  >
                    {item?.checklistStatus ? item?.checklistStatus : '--'}
                  </td>
                  <td style={{ padding: "11px" }}>
                    {/* Same logic for view in hoddetailview */}
                    {(() => {

                      const redirectUrl = `${APP_URL.HOD_CHECKLIST_VIEW}?checkList=${item?.headerShtCode}`;

                      return (
                        <button
                          className="btn"
                          onClick={() => router.push(redirectUrl)}
                          style={{
                            backgroundColor: "#f47b20",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "14px",
                            padding: "4px 10px",
                          }}
                        >
                          View
                        </button>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <CustomModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Details"
      >
        <>Your content goes here</>
      </CustomModal>
      <CustomModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        modalSizeClassName="modal-md"
        title="Pending Information"
      >
        {pendingInfo && (
          <div className="p-3">
            {pendingInfo.mocAfPrimaryPendingFor === "Checklists In Review" ? (
              <p className="text-danger fw-bold">
                Please go through the checklist page to check the responsible person detail.
              </p>
            ) : (
              <>
                <p>
                  <strong>Pending at Name:</strong>{" "}
                  {pendingInfo.mocAfPrimaryPendingAtName}
                </p>
                <p>
                  <strong>Pending at Email:</strong>{" "}
                  {pendingInfo.mocAfPrimaryPendingAtMail}
                </p>
              </>
            )}
          </div>
        )}
      </CustomModal>

    </div>
  );
};

export default HodDetailView;