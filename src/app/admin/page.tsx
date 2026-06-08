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

const adminDashboard = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const handleWorkPlace = () => {
    router.push(APP_URL.WORK_PLACE);
  };
  const handleEmployeeManage = () => {
    router.push(APP_URL.EMPLOYEE_MANAGE);
  };
  const handleRoleManage = () => {
    router.push(APP_URL.ROLE_MANAGE);
  };
  return (
    <>
      <div className="admin-login">
      <div className="row">
       <div className="col-4">
        <div className="admin-boxContainer d1 chartView card-box"
          style={{position: 'relative',borderColor: '#f47920',borderWidth: '1px',borderStyle: 'solid',height: '90px'}}>
          <img
            src="/images/svg/icons/Department.svg"
            alt="icon"
            style={{position: 'absolute',top: '5px',right: '5px', width: '24px',height: '24px',backgroundColor: '#f47920' }}/>
            <div className="chartView__container">
             <h4 className="card-title text-center">Work Place</h4>
              <div style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginTop: '10px'}}>
                <button
                  style={{width: '30%',alignSelf: 'center',justifyContent: 'center',borderColor: 'black',color: '#fff',backgroundColor: '#f47920'}}
                  className="btn" onClick={handleWorkPlace}>
                  <b>Manage</b>
                </button>
              </div>
           </div>
        </div>
      </div>
      <div className="col-4">
        <div className="admin-boxContainer d1 chartView card-box"
          style={{position: 'relative',borderColor: '#f47920',borderWidth: '1px',borderStyle: 'solid',height: '90px'}}>
          <img
            src="/images/svg/icons/User.svg"
            alt="icon"
            style={{position: 'absolute',top: '5px',right: '5px', width: '24px',height: '24px',backgroundColor: '#f47920' }}/>
            <div className="chartView__container">
             <h4 className="card-title text-center">Employee</h4>
              <div style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginTop: '10px'}}>
                <button
                  style={{width: '30%',alignSelf: 'center',justifyContent: 'center',borderColor: 'black',color: '#fff',backgroundColor: '#f47920'}}
                  className="btn" onClick={handleEmployeeManage}>
                  Manage
                </button>
              </div>
           </div>
        </div>
      </div>
       {/* <div className="col-4">
        <div className="admin-boxContainer d1 chartView card-box"
          style={{position: 'relative',borderColor: '#3224adff',borderWidth: '1px',borderStyle: 'solid',height: '90px'}}>
          <img
            src="/images/svg/icons/Employee.svg"
            alt="icon"
            style={{position: 'absolute',top: '5px',right: '5px', width: '24px',height: '24px',backgroundColor: 'green' }}/>
            <div className="chartView__container">
             <h4 className="card-title text-center">Role</h4>
              <div style={{display: 'flex',justifyContent: 'center',alignItems: 'center',marginTop: '10px'}}>
                <button
                  style={{width: '30%',alignSelf: 'center',justifyContent: 'center',borderColor: 'green',color: '#fff',backgroundColor: 'green'}}
                  className="btn" onClick={handleRoleManage}>
                  Manage
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

export default ProtectedRoute(adminDashboard);