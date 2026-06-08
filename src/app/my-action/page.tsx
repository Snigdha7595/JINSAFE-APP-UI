"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import dayjs from "dayjs";
import { useFormik } from "formik";
import Image from "next/image"
import CustomModal from "@/components/Layouts/CustomModal";
import { useState, useEffect } from "react";
import InputField from "@/components/Form/InputField";
import TextareaField from "@/components/Form/TextareaField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import RadioField from "@/components/Form/RadioField";
import { useSelector } from "react-redux";
import { emptySelector } from "@/config/config";
import { selectUserToken } from "@/store/slices/authSlice";
import { serverRequest } from "@/services/getServerSideRender";
import SiAction from "./_partials/SiAction";
import SoAction from "./_partials/SoAction";
import LwAction from "./_partials/LwAction";
import IMAction from "./_partials/IMAction";
import CSFAAction from "./_partials/CSFAAction";
import { CONSTANTS } from "@/config/constant";

const MyActions = () => {
  const [openSection, setOpenSection] = useState<number>(0); 
  const [currentStatus, setCurrentStatus] = useState<number>(0);
  const [activeTab, setActiveTab] = useState(0);
  const tabOptions = [
  { value: 0, label: "Safety Interaction" },
  { value: 1, label: "Safety Observation" },
  { value: 2, label: "Line Walk" },
  { value: 3, label: "Incident Management" },
  { value: 4, label: "Contractor Safety" },
];
const setSelection = (value: number) => {
  setActiveTab(value);
  setOpenSection(value);
  setCurrentStatus(value);
};
  return (
      <div className="container-fluid">
        <div className="c-accordion overflow-visible">
          <div className="c-accordion__head">
            <div className="c-accordion__head--title">
              My Action
            </div>
          </div>
        </div>
        <div className="d-flex gap-2 my-3">
         {tabOptions.map((tab) => (
          <button
            key={tab.value}
            className={`btn btn-lg fw-semibold 
              ${activeTab === tab.value ? "iconBtn orange" : "iconBtn grey"}`}
            onClick={() => setSelection(tab.value)}
          >
            {tab.label}
          </button>
        ))}
        </div>
        {/* Block 1 */}
       <div className="d-flex justify-content-between align-items-center flex-wrap gap-1 px-4">
          <h4 className="m-0">
            {/* {activeTab === 0
              ? "Safety Interaction"
              : activeTab === 1
              ? "Safety Observation"
              : activeTab === 2
              ? "Line Walk"
              : "Incident Management"
              } */}
             {activeTab === 0
              ? "Safety Interaction"
              : activeTab === 1
              ? "Safety Observation"
              : activeTab === 2
              ? "Line Walk"
              : activeTab === 3
              ? "Incident Management"
              : "Contractor Safety"
             }
          </h4>
        </div>
        {/* Block 2 */}
        {openSection === 0 && (
          <SiAction
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            setOpenSection={setOpenSection}
          />
        )}
        {openSection === 1 && (
          <SoAction
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            setOpenSection={setOpenSection}
          />
        )}
        {openSection === 2 && (
          <LwAction
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            setOpenSection={setOpenSection}
          />
        )}
         {openSection === 3 && (
          <IMAction
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            setOpenSection={setOpenSection}
          />
        )}
        {openSection === 4 && (
          <CSFAAction
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            setOpenSection={setOpenSection}
          />
        )}
    </div>
  );
};

export default ProtectedRoute(MyActions);
