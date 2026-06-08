"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { Table, Modal } from "react-bootstrap";
import { serverRequest } from "@/services/getServerSideRender";
import { useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { FormValues, MocChecklistFormHeader, MocChecklistFormBody, TMocRequest, Attachment } from "@/types/moc";
import { RootState } from "@/store/store";
import { FETCH_MOC_DETAIL, DOWNLOAD_FILE } from "@/config/apiConfig";
import MocChecklistActions from "../../moc/components/MocActionButtons";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";

const tabData = [
  { label: "C1. Oper. Methods", content: "C1" },
  { label: "C2. Process", content: "C2" },
  { label: "C3. Safety", content: "C3" },
  { label: "C4. Environment", content: "C4" },
  { label: "C5. Maintenance", content: "C5" },
  { label: "C6. Materials", content: "C6" },
];

const questions: Record<
  "C1" | "C2" | "C3" | "C4" | "C5" | "C6",
  { serial: string; text: string }[]
> = {
  C1: [
    {
      serial: "1",
      text: "Is there any variation caused by this intended change in",
    },
    { serial: "", text: "Temperature" },
    { serial: "", text: "Pressure" },
    { serial: "", text: "Concentration" },
    { serial: "", text: "Agitation" },
    { serial: "", text: "Chemical Incompatibility (e.g. water reactive)" },
    { serial: "", text: "Any Other" },
    {
      serial: "2",
      text: "Is the material of construction of the equipment compatible with the new chemical?",
    },
    {
      serial: "3",
      text: "Is any specific training required for operating the new process?",
    },
    {
      serial: "4",
      text: "Whether HAZOP has been done for the new change/process",
    },
    {
      serial: "5",
      text: "Whether the risk has been evaluated for the activities involved",
    },
    {
      serial: "6",
      text: "Is the existing operating procedure adequate to new requirement? Especially for:",
    },
    { serial: "", text: "Start up:" },
    { serial: "", text: "Shut down" },
    {
      serial: "",
      text: "Emergency operation (Liquid spillage, Containment of dusts, gases and vapours, noise, fire and explosion):",
    },
    {
      serial: "7",
      text: "If no, the new procedure operating procedure is prepared?",
    },
    { serial: "8", text: "Is the Nitrogen availability adequate?" },
    {
      serial: "9",
      text: "Are the existing handling facilities/practices applicable and adequate for the proposed change?",
    },
    {
      serial: "10",
      text: "Does the modification require change or training of staff from:",
    },
    { serial: "", text: "a) Implementation Level" },
    { serial: "", text: "b) Supervisory Level" },
    { serial: "", text: "c) Managerial Level" },
  ],

  C2: [
    {
      serial: "1",
      text: "Are any of the materials used incompatible with each other, if yes specify",
    },
    { serial: "2", text: "Are any oxidizing chemicals used if yes specify" },
    {
      serial: "3",
      text: "Are any peroxide forming materials used, if yes specify",
    },
    {
      serial: "4",
      text: "Are any spontaneously combustible, inflammable or pyrophoric materials used, if yes specify",
    },
    { serial: "5", text: "Is any chemical water reactive, if yes specify" },
    { serial: "6", text: "Is the reaction exothermic/endothermic?" },
    { serial: "7", text: "If exothermic, what is the heat of generation?" },
    {
      serial: "8",
      text: "Any specific conditions for runaway reaction? if yes specify",
    },
    {
      serial: "9",
      text: "Whether HAZOP has been done for the new change/process",
    },
    {
      serial: "10",
      text: "Any known history of runaway reactions? if yes specify",
    },
    {
      serial: "11",
      text: "Whether MSDS of all chemicals supplied to Production, EHS and Stores",
    },
    {
      serial: "12",
      text: "Any specific tests carried out for any RM, Intermediate, finished product e.g. Reaction Calorimetry (RC1), ARSST/TSU, Powder safety testing results etc. Pl. specify:",
    },
    {
      serial: "13",
      text: "Whether Form for ‘Safer Chemical Reaction’ filled? (Attach copy)",
    },
  ],

  C3: [
    {
      serial: "1",
      text: "Is the existing safety system and facilities adequate? E.g. eye wash/shower station, fire extinguisher, etc.",
    },
    {
      serial: "2",
      text: "Whether HAZOP is necessary for the proposed change?",
    },
    {
      serial: "3",
      text: "Whether activity-based risk assessment has been carried out for the proposed change?",
    },
    {
      serial: "4",
      text: "Any additional firefighting arrangement is necessary?",
    },
    {
      serial: "5",
      text: "Any specific PPE needed? If yes, what is to be procured?",
    },
    { serial: "6", text: "Does this change need any Engineering controls?" },
    { serial: "7", text: "Will on-site emergency plan need any changes?" },
    {
      serial: "8",
      text: "Whether related statutory provisions are complied with?",
    },
    {
      serial: "9",
      text: "Does the modification require the authorities responsible for the inspection and insurance of the modified plant?",
    },
    {
      serial: "10",
      text: "Does the modification require any additional/new neutralizing agents?",
    },
    {
      serial: "11",
      text: "Does the modification require review of exposure containment measures?",
    },
    { serial: "12", text: "Whether any specific training necessary?" },
    {
      serial: "13",
      text: "Whether means of escape adequate and unobstructed?",
    },
    { serial: "14", text: "Whether the following items are adequate?" },
  ],

  C4: [
    {
      serial: "1",
      text: "Will there be any change in quantity and/or characteristics in wastewater generation?",
    },
    {
      serial: "2",
      text: "If yes, will this be a problem for existing effluent treatment system?",
    },
    { serial: "3", text: "Are any of the toxic chemicals used?" },
    { serial: "4", text: "Is the waste water treatable?" },
    {
      serial: "5",
      text: "Will the emissions require modifications in stack or scrubbing system?",
    },
    {
      serial: "6",
      text: "Will there be any change in quantity and/or characteristics of solid waste?",
    },
    { serial: "7", text: "Will the waste be classified as hazardous?" },
    { serial: "8", text: "Will hazardous waste disposal quantity be changed?" },
    {
      serial: "9",
      text: "Will the change require modification in the consent? (CFE, CFO, HW Authorization, EC)",
    },
    {
      serial: "10",
      text: "Will the modification require modification in the agreements of CETP/TSDF?",
    },
    {
      serial: "11",
      text: "Will hazardous waste treatment/storage/disposal facility need to be enhanced?",
    },
    {
      serial: "12",
      text: "Will the new process require any additional requirement of storage?",
    },
    { serial: "13", text: "Is there any specific scrubbing system required?" },
  ],

  C5: [
    {
      serial: "1",
      text: "Is there sufficient space for installing new equipment",
    },
    {
      serial: "2",
      text: "Is the material of construction of the equipment compatible with new/existing chemical?",
    },
    { serial: "3", text: "Is existing SRV, RD, Venting are adequate?" },
    {
      serial: "4",
      text: "Is the existing structure designed to take the load?",
    },
    {
      serial: "5",
      text: "Does this change alter or bypass following:/ impact the following",
    },
    { serial: "", text: "Trips or alarm settings" },
    { serial: "", text: "Will the waste be classified as hazardous?" },
    { serial: "", text: "Maintenance procedure" },
    { serial: "", text: "Inspection and Preventive maintenance" },
    { serial: "", text: "Supports - Piping etc." },
    { serial: "", text: "Insulation" },
    { serial: "", text: "Electrical area classification" },
    { serial: "", text: "Electrical wiring diagram" },
    { serial: "", text: "Design Pressure/Temp." },
    { serial: "", text: "Structural stability" },
    { serial: "", text: "Spare parts, standby equipment" },
    {
      serial: "6",
      text: "Is the existing utilities adequate, if yes support with document?",
    },
    { serial: "7", text: "Will additional electricity be required?" },
    { serial: "8", text: "Will additional vents or drains be required?" },
    {
      serial: "9",
      text: "Has equipment been adequately located to permit anticipated maintenance during operation without danger to the process?",
    },
    {
      serial: "10",
      text: "Whether additional effluent transfer facility planned?",
    },
    {
      serial: "11",
      text: "Whether necessary certificates obtained from ‘competent person’?",
    },
  ],

  C6: [
    { serial: "1", text: "Is there any new chemical introduced?" },
    {
      serial: "2",
      text: "If yes, whether the new chemical introduction form submitted to safety along with MSDS?",
    },
    {
      serial: "3",
      text: "Is the material highly toxic/flammable/corrosive/water reactive etc.?",
    },
    {
      serial: "4",
      text: "Whether the incompatibility of new chemical established?",
    },
    {
      serial: "5",
      text: "Will the existing emergency equipment and procedures be adequate?",
    },
    {
      serial: "6",
      text: "Does the new material need additional storage space?",
    },
    {
      serial: "7",
      text: "Does the new material need special conditions to store?",
    },
  ],
};

const User = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [responsesMap, setResponsesMap] = useState<Record<string, { value: string; remarks: string; na: boolean; file: string | null }[]>>({});
  const [comments, setComments] = useState("");
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const token = useSelector(selectUserToken);
  const [fetchedData, setFetchedData] = useState<TMocRequest | null>(null);
  const [fetchedMocCheckListBody, setFetchedMocCheckListBody] = useState<MocChecklistFormHeader[]>([]);
  const mocNo = typeof window !== 'undefined' ? sessionStorage.getItem('mocAfNo') : null;
  const checkListHeader = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('checkList') : null;

  // New state for the modal/pop-up
  const [showModal, setShowModal] = useState(false);
  const [modalFiles, setModalFiles] = useState<Attachment[]>([]);

  const handleClose = () => setShowModal(false);
  const handleShow = (files: Attachment[]) => {
    setModalFiles(files);
    setShowModal(true);
  };

  const downloadFile = async (file: Attachment) => {
    const payload = file.fileId;
    try {
        const response = await serverRequest(
            payload,
            DOWNLOAD_FILE,
            CONSTANTS.REQUEST_POST,
            true,
            true,
            token,
            false,   
            true,  
           "blob"   // responseType — tell it to treat response as a Blob
        );

        let blob;

        if (response instanceof Response) {
            blob = await response.blob();
        } else {
            blob = response; // already a Blob
        }

        const url = window.URL.createObjectURL(blob);

        window.open(url, "_blank");

        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 1000);
    } catch (error) {
        console.error("Open failed:", error);
        toast.error("File open failed. Please try again.");
    }
  };


  const fetchMocData = async () => {
    if (!mocNo || !token) return;
    try {
      const res: TMocRequest = await serverRequest(
        {},
        FETCH_MOC_DETAIL + `/${mocNo}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      setFetchedData(res);
    } catch (err) {
      console.error(err);
      setFetchedData(null);
    }
  };

  useEffect(() => {
    fetchMocData();
  }, [mocNo, token]);

  useEffect(() => {
    if (fetchedData?.mocChecklistsFormHeaders?.length) {
      const fetchChecklistData = async () => {
        const allChecklists = await Promise.all(
          fetchedData.mocChecklistsFormHeaders.map(async (header) => {
            try {
              const res = await serverRequest(
                {},
                FETCH_MOC_DETAIL + `/${mocNo}` + `/${header.headerShtCode}`,
                CONSTANTS.REQUEST_GET,
                true,
                true,
                token
              );
              return res?.form;
            } catch (err) {
              console.error(err);
              return null;
            }
          })
        );
        const validChecklists = allChecklists.filter(Boolean).sort((a, b) => a.headerShtCode.localeCompare(b.headerShtCode));
        setFetchedMocCheckListBody(validChecklists);

        const newResponsesMap: Record<string, any> = {};
        validChecklists.forEach((checklist: MocChecklistFormHeader) => {
          newResponsesMap[checklist.headerShtCode] = checklist.mocChecklistsFormBodies.map((body: MocChecklistFormBody) => ({
            value: body.status === 'Yes' || body.status === 'No' ? body.status : 'N/A',
            remarks: body.remarks || '',
            na: body.status === 'NA',
            file: body.attachments?.[0]?.fileName || null,
          }));
        });
        setResponsesMap(newResponsesMap);

        if (checkListHeader) {
          const tabIndex = validChecklists.findIndex(
            (tab) => tab.headerShtCode === checkListHeader
          );
          if (tabIndex !== -1) {
            setActiveTab(tabIndex);
          }
        }
      };
      fetchChecklistData();
    }
  }, [fetchedData, checkListHeader, mocNo, token]);

  const activeChecklistData = fetchedMocCheckListBody[activeTab];
  const activeStageType = activeChecklistData?.headerShtCode || '';

  const renderTableView = (
    questionList: { serial: string; text: string }[]
  ) => {
    if (!activeChecklistData) {
      return <p>No data found for this checklist.</p>;
    }

    return (
      <div className="mb-4">
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">Responsible Name</label>
            <p>{activeChecklistData?.checklistPrimaryPendingAtName}</p>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Responsible Email</label>
            <p>{activeChecklistData?.checklistPrimaryPendingAtMail}</p>
          </div>
        </div>

        <Table bordered>
          <thead>
            <tr style={{ backgroundColor: "#005A8C", color: "white" }}>
              <th
                style={{
                  textAlign: "center",
                  verticalAlign: "middle",
                  width: "5%",
                }}
              >
                Sr. No.
              </th>
              <th
                style={{
                  textAlign: "center",
                  verticalAlign: "middle",
                  width: "38%",
                }}
              >
                Description
              </th>
              <th
                style={{
                  textAlign: "center",
                  verticalAlign: "middle",
                  width: "10%",
                }}
              >
                Status
              </th>
              {/* <th
                style={{
                  textAlign: "center",
                  verticalAlign: "middle",
                  width: "6%",
                }}
              >
                Yes/No
              </th> */}
              <th
                style={{
                  textAlign: "center",
                  verticalAlign: "middle",
                  width: "14%",
                }}
              >
                File
              </th>
              <th
                style={{
                  textAlign: "center",
                  verticalAlign: "middle",
                  width: "20%",
                }}
              >
                Remarks
              </th>
            </tr>
          </thead>
          <tbody>
            {activeChecklistData.mocChecklistsFormBodies.map((item, index) => {
              const isHeaderRow = item?.subItemNo === "Header";
              const attachments = item.attachments || [];
              const hasMultipleFiles = attachments.length > 1;

              return isHeaderRow ? (
                <tr key={index} style={{ backgroundColor: "#e8e8e8" }}>
                  <td className="text-center align-middle">{item.itemNo}</td>
                  <td colSpan={5} style={{ fontSize: "17px" }}>
                    {item?.description}
                  </td>
                </tr>
              ) : (
                <tr key={index} style={{ backgroundColor: "#f9f9f9" }}>
                  <td className="text-center align-middle">{item.subItemNo ? item.subItemNo : item?.itemNo}</td>
                  <td style={{ fontSize: "17px" }}>{item.description}</td>
                  <td className="text-center align-middle">
                    {item?.status}
                  </td>
                  {/* <td className="text-center align-middle">
                    {item?.status === "NA" ? "Yes" : "No"}
                  </td> */}
                  {/* <td className="align-middle">
                    <a href="#">{item?.attachments?.[0]?.fileName || "-"}</a>
                  </td> */}
                  <td className="align-middle text-center">
                    {hasMultipleFiles ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <span className="me-2">{attachments.length}</span>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleShow(attachments); }}>
                          <img
                            src="/images/svg/eyeicon.svg"
                            alt="view files"
                            width="20"
                            height="20"
                          />
                        </a>
                      </div>
                    ) : attachments.length === 1 ? (
                      <a href="#" onClick={(e) => { e.preventDefault(); downloadFile(attachments[0]); }}>
                        {attachments[0].fileName || "-"}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="align-middle">
                    {item?.remarks || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };

  const sectionKey = activeChecklistData?.headerShtCode as keyof typeof questions;

  return (
    <div className="container-fluid p-4">

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
            Moc Details View
          </Link>
        </div>
      </div>

      <div className="card shadow rounded-4 p-4">
        <div className="admin-boxContainer d3 mb-4">
          <div className="text-center">
            <h5 className="fw-bold mb-5" style={{ fontSize: "20px" }}>
              Management of Change <br />
              <span style={{ fontWeight: 400 }}>
                (Technology and Facilities) Procedure
              </span>
            </h5>
          </div>
          <div className="d-flex justify-content-between flex-wrap gap-2 px-2">
            {fetchedData?.mocChecklistsFormHeaders?.sort((a, b) => a.headerShtCode.localeCompare(b.headerShtCode)).map((tab, index) => (
              <button
                key={index}
                className={`btn px-3 py-2 ${activeTab === index
                  ? "text-white"
                  : "btn-outline-dark text-dark"
                  }`}
                style={{
                  borderRadius: "6px",
                  flex: "1 1 15%",
                  minWidth: "140px",
                  whiteSpace: "nowrap",
                  fontWeight: 500,
                  fontSize: "13px",
                  backgroundColor: activeTab === index ? "#f57821" : "#f8f9fa",
                  borderColor: activeTab === index ? "#f57821" : undefined,
                  color: activeTab === index ? "white" : "#333",
                }}
                onClick={() => setActiveTab(index)}
              >
                {tab.headerShtCode} ({tab.headerName})
              </button>
            ))}
          </div>
        </div>

        <div
          className="admin-boxContainer d1 nobackground mt-4"
          style={{
            fontFamily: "inherit",
            minHeight: "60vh",
            overflowY: "auto",
          }}
        >
          {activeChecklistData ? (
            renderTableView(questions[activeChecklistData?.headerShtCode as keyof typeof questions] || [])
          ) : (
            <p>Select a checklist to view details.</p>
          )}
        </div>

        {/*
          Conditionally render MocChecklistActions only if fetchedData is available.
          This prevents errors from trying to pass null/undefined props.
        */}
        {fetchedData && (
          <MocChecklistActions
            mocData={fetchedData}
            mocNo={mocNo}
            stageType={activeStageType}
            onActionComplete={fetchMocData} // Passing the function to re-fetch data
          />
        )}
      </div>

      {/* Pop-up for multiple files */}
      <Modal show={showModal} onHide={handleClose} size="sm" centered>
        <Modal.Header closeButton>
          <Modal.Title>Attached Files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {modalFiles.map((file, index) => (
              <li key={index} className="mb-2">
                <a href="#" onClick={(e) => { e.preventDefault(); downloadFile(file); }}>
                  {file.fileName}
                </a>
              </li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer>
         <div className="w-100 d-flex justify-content-center">
          <div>
          <button className="btn btn-danger btn-sm" onClick={handleClose}>
            Close
          </button>
          </div>
         </div>
        </Modal.Footer>
      </Modal>
      <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
    </div>
  );
};

export default ProtectedRoute(User);
