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
import UnitPanel from "./_partials/UnitPanel";
import ZonePanel from "./_partials/ZonePanel";
import DepartmentPanel from "./_partials/DepartmentPanel";
import SectionPanel from "./_partials/SectionPanel";
import LineManagerPanel from "./_partials/LineManagerPanel";
import CommitteePanel from "./_partials/CommitteePanel";
import { APP_URL,CONSTANTS } from "@/config/constant";

const WorkPlace = () => {
  const [openSection, setOpenSection] = useState<number>(0); 
  const [currentStatus, setCurrentStatus] = useState<number>(0);
  const [activeTab, setActiveTab] = useState(0);
  const tabOptions = [
  { value: 0, label: "Unit" },
  { value: 1, label: "Zone" },
  { value: 2, label: "Department" },
  { value: 3, label: "Section" },
  { value: 4, label: "LineManager" },  
  { value: 5, label: "Committee" },
];
const setSelection = (value: number) => {
  setActiveTab(value);
  setOpenSection(value);
  setCurrentStatus(value);
};
  return (
      <div className="container-fluid">
        <div className="admin-boxContainer d3 ">
          <div className="adminAction">
            <Link href={APP_URL.ADMIN_DASHBOARD} className="adminAction__title">
              <span className="icon">
                <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/arrow-left-grey.svg"
                  className="img-fluid u-image"
                />
              </span>
              Manage WorkPlace
            </Link>
          </div>
        </div>
        <div className="admin-boxContainer d2 mb-0">
          <div className="adminFilters align-items-center">
            <h4>WorkPlace Manage</h4>
          </div>
        </div>
        <div className="d-flex my-3">
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
       <div className="c-accordion overflow-visible">
            <div className="c-accordion__head">
                <div className="c-accordion__head--title">
                    {
                        activeTab === 0
                        ? "Unit"
                        : activeTab === 1
                        ? "Zone"
                        : activeTab === 2
                        ? "Department"
                        : activeTab === 3
                        ? "Section"
                        : activeTab === 4
                        ? "Line Manager"                        
                        : "Committee"
                    }
                </div>
            </div>
        </div>
        {/* Block 2 */}
        {openSection === 0 && (
          <UnitPanel
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            setOpenSection={setOpenSection}
          />
        )}
         {openSection === 1 && (
          <ZonePanel
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            setOpenSection={setOpenSection}
            setActiveTab={setActiveTab}
          />
        )}
        {openSection === 2 && (
          <DepartmentPanel
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            setOpenSection={setOpenSection}
            setActiveTab={setActiveTab}
          />
        )}
        {openSection === 3 && (
          <SectionPanel
            currentStatus={currentStatus}
            setCurrentStatus={setCurrentStatus}
            setOpenSection={setOpenSection}
            setActiveTab={setActiveTab}
          />
        )}
        {openSection === 4 && (
         <LineManagerPanel
           currentStatus={currentStatus}
           setCurrentStatus={setCurrentStatus}
           setOpenSection={setOpenSection}
           setActiveTab={setActiveTab}
        />
        )}
        {openSection === 5 && (
         <CommitteePanel
           currentStatus={currentStatus}
           setCurrentStatus={setCurrentStatus}
           setOpenSection={setOpenSection}
           setActiveTab={setActiveTab}
        />
        )}
    </div>
  );
};

export default ProtectedRoute(WorkPlace);
