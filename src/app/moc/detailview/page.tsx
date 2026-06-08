"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomModal from "@/components/Layouts/CustomModal";

const DetailView = () => {
  const modalButtonStyle = {
    color: "white",
    padding: "4px 12px",
    fontSize: "14px",
    minWidth: "90px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeEditingStep, setActiveEditingStep] = useState<number | null>(
    null
  );
  const [formData, setFormData] = useState<{
    [key: number]: { date: string; comments: string };
  }>({
    2: { date: "", comments: "" },
    3: { date: "", comments: "" },
  });

  const [showActionSection, setShowActionSection] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleActionSubmit = () => {
    console.log("Action:", selectedAction);
    console.log("Remarks:", remarks);
    setShowActionSection(false);
    setSelectedAction("");
    setRemarks("");
  };

  const router = useRouter();

  const handleTopViewClick = () => {
    router.push("/moc/hodpending");
  };
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleChecklistViewClick = () => {
    router.push("/moc/hodomview");
  };

  const implementationSteps = [
    {
      id: 1,
      statusText: "MOC All Checklists Implementation Started",
      status: "Implementation Started",
    },
    {
      id: 2,
      statusText: "Implementation Completed",
      status: "Implementation Completed",
    },
    {
      id: 3,
      statusText: "Implementation Completed",
      status: "Implementation Completed",
    },
  ];

  const handleEditClick = (stepId: number) => {
    setActiveEditingStep(stepId);
    setIsOpen(true);
  };

  const handleModalClose = () => {
    setIsOpen(false);
    setActiveEditingStep(null);
  };

  const handleModalSubmit = () => {
    if (activeEditingStep && activeEditingStep < 4) {
      setCurrentStep((prev) => prev + 1);
      setIsOpen(false);
      setActiveEditingStep(null);
    }
  };

  return (
    <div className="container">
      <div className="admin-boxContainer d3">
        <div className="adminAction">
          <Link href="#" className="adminAction__title">
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

      <div
        className="admin-boxContainer d1 p-5 shadow rounded-4 mb-5"
        style={{
          minHeight: "calc(100vh - 180px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {/* 🔹 TOP SUMMARY TABLE */}
        <div className="table-responsive mb-5">
          <table className="table table-bordered mb-0">
            <thead>
              <tr>
                <th>MOC AF No./ Date</th>
                <th>Department/ Section</th>
                <th>Request Status</th>
                <th>Implementation Status</th>
                <th>Type of Expenditure</th>
                <th>Type of Change</th>
                <th>Plant Modification?</th>
                <th>Subsequent stages are affected</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span>JSP0234</span>
                  <br />
                  <span>12-23-24</span>
                </td>
                <td>
                  Fire Safety
                  <br />
                  <span>XYZ</span>
                </td>
                <td>Approved</td>
                <td>
                  <span>Pending</span>
                  <br />
                  <span style={{ fontSize: "14px" }}>(Fill checklists)</span>
                </td>
                <td style={{ padding: "11px" }}>Opex (38.01 Cr)</td>
                <td style={{ padding: "11px" }}>Permanent</td>
                <td style={{ padding: "11px" }}>Yes</td>
                <td style={{ padding: "11px" }}>Yes</td>
                <td style={{ padding: "11px" }}>
                  <button
                    onClick={handleTopViewClick}
                    className="tableBtn orange"
                    style={{
                      fontSize: "14px",
                      padding: "4px 10px",
                      fontWeight: 600,
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🔹 CHECKLIST DETAILS TABLE */}
        <div className="table-responsive mb-5">
          <table className="table table-bordered mb-0">
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th>MOC Checklist Details</th>
                <th>Initiate Date</th>
                <th>Responsible Person</th>
                <th>Status</th>
                <th>Completed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { title: "C1. Operating Methods", status: "Approved" },
                { title: "C2. Process", status: "Approved" },
                { title: "C3. Safety", status: "Approved" },
                { title: "C4. Environment", status: "Approved" },
                { title: "C5. Maintenance", status: "Pending" },
                { title: "C6. Materials", status: "Pending" },
              ].map((item, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white",
                  }}
                >
                  <td>{item.title}</td>
                  <td>12-06-2025</td>
                  <td>Surjeet Singh</td>
                  <td
                    style={{
                      color: item.status === "Approved" ? "green" : "orange",
                      fontWeight: 600,
                      fontSize: "15px",
                      padding: "11px",
                    }}
                  >
                    {item.status}
                  </td>
                  <td>25-06-2025</td>
                  <td>
                    <button
                      onClick={handleChecklistViewClick}
                      className="btn"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🔹 NEW MOC IMPLEMENTATION STATUS TABLE */}
        <div className="table-responsive">
          <table className="table table-bordered mb-0">
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th>MOC Implementation Status</th>
                <th>Status</th>
                <th>Date</th>
                <th>Responsible Person</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {implementationSteps.slice(0, currentStep).map((step) => (
                <tr key={step.id}>
                  <td>{step.statusText}</td>
                  <td
                    style={{ color: "green", fontWeight: 600, padding: "11px" }}
                  >
                    {step.status}
                  </td>
                  <td style={{ padding: "11px" }}>
                    {step.id === 1
                      ? "25-06-2025"
                      : formData[step.id]?.date || ""}
                  </td>
                  <td style={{ padding: "11px" }}>Surjeet kumar Singh</td>
                  <td style={{ padding: "11px" }}>
                    {step.id === currentStep && currentStep < 4 && (
                      <button
                        onClick={() => handleEditClick(step.id)}
                        className="btn"
                        style={{
                          backgroundColor: "#28a745",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "13px",
                          padding: "4px 8px",
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {/* ✅ NEW ROW exactly as in IMAGE 1 */}
              {currentStep >= 4 && (
                <tr>
                  <td>MOC Expired On (For Temporary Change)</td>
                  <td
                    style={{ color: "green", fontWeight: 600, padding: "11px" }}
                  >
                    Moc Not Expired yet
                  </td>
                  <td style={{ padding: "11px" }}>25-06-2025</td>
                  <td style={{ padding: "11px" }}>Surjeet Singh</td>
                  <td style={{ padding: "11px" }}>
                    <button
                      onClick={() => setShowActionSection(!showActionSection)}
                      className="btn"
                      style={{
                        backgroundColor: "#f47b20",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "13px",
                        padding: "4px 12px",
                      }}
                    >
                      Take action
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Action Details Section exactly as in IMAGE 2 */}
        {showActionSection && (
          <div className="border rounded p-3 my-3">
            <form className="form mt-4">
              <div className="row mb-4">
                <div className="col-md-2">
                  <label className="form-label mb-2">Action type</label>
                  <select
                    className="form-select form-select-sm"
                    name="unit"
                    onChange={handleInputChange}
                  >
                    <option>Close</option>
                    <option>Extend </option>
                    <option>Permanent</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label mb-2"> Extend till</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    name="date"
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-md-8">
                  <label className="form-label mb-2"> Remarks</label>
                  <textarea
                    className="form-control"
                    rows={1}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </div>
            </form>

            <div className="d-flex justify-content-end">
              <button
                onClick={handleActionSubmit}
                className="btn"
                style={{
                  backgroundColor: "#4fb748",
                  color: "white",
                  fontWeight: 600,
                  padding: "4px 12px",
                  border: "none",
                  borderRadius: "4px",
                  maxWidth: "100px",
                  maxHeight: "80px",
                }}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔹 POPUP MODAL */}
      <CustomModal isOpen={isOpen} onClose={handleModalClose} title="Edit">
        <div
          style={{
            maxWidth: "950px",
            margin: "0 auto",
            padding: "20px 24px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            minHeight: "auto",
          }}
        >
          {/* Row: Status and Date */}
          <div
            className="d-flex mb-3"
            style={{
              gap: "20px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ flex: 1 }}>
              <label className="form-label small mb-1">
                Implementation Status
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                readOnly
                value={
                  activeEditingStep
                    ? implementationSteps[activeEditingStep - 1]?.status
                    : ""
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label small mb-1">Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={
                  activeEditingStep
                    ? formData[activeEditingStep]?.date || ""
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [activeEditingStep!]: {
                      ...formData[activeEditingStep!],
                      date: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Comments */}
          <div className="mb-3">
            <label className="form-label small mb-1">Comments</label>
            <textarea
              rows={2}
              className="form-control form-control-sm"
              value={
                activeEditingStep
                  ? formData[activeEditingStep]?.comments || ""
                  : ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [activeEditingStep!]: {
                    ...formData[activeEditingStep!],
                    comments: e.target.value,
                  },
                })
              }
            />
          </div>

          {/* Buttons (as they were before) */}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              style={{
                color: "white",
                padding: "4px 12px",
                fontSize: "14px",
                minWidth: "90px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: "#f47b20",
              }}
              onClick={handleModalClose}
            >
              Cancel
            </button>
            <button
              style={{
                color: "white",
                padding: "4px 12px",
                fontSize: "14px",
                minWidth: "90px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: "#28a745",
              }}
              onClick={handleModalSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default DetailView;
