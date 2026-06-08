"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHead from "@/components/Elements/PageHead";

import Link from 'next/link';
import SafetyAccordion from "@/components/Form/SafetyAccordion";


const User = () => {
  return (
    <div className="container-fluid">
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
           Create PIR
          </Link>
          
        </div>
      </div>
      <div className="admin-boxContainer d3">
        <div className="adminAction">
          <Link href="#">
            <button className="iconBtn orange">
              <span>PIR  Form</span>
              <img
                width="15"
                height="15"
                alt="icon"
                src="/images/svg/draft-icon.svg"
                className="img-fluid u-image"
              />
            </button>
          </Link>
          <Link href="#">
            <button className="iconBtn green">
              <span>Save as Draft</span>
              
            </button>
          </Link>
        </div>
      </div>
      <div className="admin-boxContainer d1 nobackground">
          <SafetyAccordion/>
      </div>
    </div>
  );
};

export default ProtectedRoute(User);
