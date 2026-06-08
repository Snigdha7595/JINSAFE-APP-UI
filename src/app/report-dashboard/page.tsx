"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import CustomModal from "@/components/Layouts/CustomModal";
import { useState } from "react";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import { useRouter } from "next/navigation"; 
import { APP_URL, CONSTANTS } from "@/config/constant";

const reportDashboard = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const handleSISOLWReport = () => {
    router.push(APP_URL.REPORT_SI_SO_LW);
  };
  const handleIMReport = () => {
    router.push(APP_URL.REPORT_IM);
  };
  return (
    <>
      <div className="admin-login">
      <div className="row">
       <div className="col-4">
        <div className="admin-boxContainer d1 chartView card-box"
          style={{position: 'relative',borderColor: '#f47920',borderWidth: '1px',borderStyle: 'solid',height: '90px'}}>
          <img
            src="/images/svg/icons/Graph.svg"
            alt="icon"
            style={{position: 'absolute',top: '5px',right: '5px', width: '24px',height: '24px',backgroundColor: '#f47920' }}/>
            <div className="chartView__container">
             <h5 className="card-title text-center m-1">SI/SO/LW</h5>
              <div style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginTop: '10px'}}>
                <button
                  style={{width: '30%',alignSelf: 'center',justifyContent: 'center',borderColor: 'black',color: '#fff',backgroundColor: '#f47920'}}
                  className="btn" onClick={handleSISOLWReport}>
                  Report
                </button>
              </div>
           </div>
        </div>
      </div>
      <div className="col-4">
        <div className="admin-boxContainer d1 chartView card-box"
          style={{position: 'relative',borderColor: '#f47920',borderWidth: '1px',borderStyle: 'solid',height: '90px'}}>
          <img
            src="/images/svg/icons/Items.svg"
            alt="icon"
            style={{position: 'absolute',top: '5px',right: '5px', width: '24px',height: '24px',backgroundColor: '#f47920' }}/>
            <div className="chartView__container">
             <h5 className="card-title text-center m-1">Incident Management</h5>
              <div style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginTop: '10px'}}>
                <button
                  style={{width: '30%',alignSelf: 'center',justifyContent: 'center',borderColor: 'black',color: '#fff',backgroundColor: '#f47920'}}
                  className="btn" onClick={handleIMReport}>
                  Report
                </button>
              </div>
           </div>
        </div>
      </div>
       {/* <div className="col-4">
        <div className="admin-boxContainer d1 chartView card-box"
          style={{position: 'relative',borderColor: '#3224adff',borderWidth: '1px',borderStyle: 'solid',height: '90px'}}>
          <img
            src="/images/svg/icons/Review.svg"
            alt="icon"
            style={{position: 'absolute',top: '5px',right: '5px', width: '24px',height: '24px',backgroundColor: '#f47920' }}/>
            <div className="chartView__container">
             <h5 className="card-title text-center m-1">MOC</h5>
              <div style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginTop: '10px'}}>
                <button
                  style={{width: '30%',alignSelf: 'center',justifyContent: 'center',borderColor: 'black',color: '#fff',backgroundColor: '#f47920'}}
                  className="btn" onClick={handleIMReport}>
                  Report
                </button>
              </div>
           </div>
        </div>
      </div> */}
     </div>
   </div>
  </>
  );
};

export default ProtectedRoute(reportDashboard);