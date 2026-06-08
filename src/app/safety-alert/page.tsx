"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";

import Link from 'next/link';
import SafetyAlertAccordion from "@/components/Form/SafetyAlertAccordion";



const User = () => {
  return (
    <div className="container-fluid">
      <div className="admin-boxContainer d3">
        <div className="adminAction">
          <Link href="#" className="adminAction__title">
            <span className="icon">
              <Image
                width="15"
                height="15"
                alt="icon"
                src="/images/svg/arrow-left-grey.svg"
                className="img-fluid u-image"
              />
            </span>
            Publish Safety Alert
          </Link>
          
        </div>
      </div>
      <div className="admin-boxContainer d1 nobackground">
          <SafetyAlertAccordion/>
      </div>
    </div>
  );
};

export default ProtectedRoute(User);
