"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import GirlsBoysStatewiseChart from "./_partials/GirlsBoysStatewiseChart";
import GenderwiseChart from "./_partials/GenderwiseChart";
import StackedBarchart from "./_partials/StackedBarChart";
import RenameThisChart from "./_partials/RenameThisChart";
import Link from "next/link";
import { useState , useEffect} from "react";
import ImmediateAction from "./_partials/ImmediateAction";
import Image from "next/image"
import SomeTable from "./_partials/SomeTable";
import { selectUserToken } from "@/store/slices/authSlice";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

  const Dashboard = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const token = useSelector(selectUserToken);
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: any }
  );
  //  const [showDashboard, setShowDashboard] = useState(false);
  // useEffect(() => {
  //   if (
  //     user?.email &&
  //     (user?.email.toLowerCase().includes("jspl") || user?.email.toLowerCase().includes("jindalsteel"))
  //   ) {
  //     setShowDashboard(true);
  //   }
  // }, [user?.email]);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const email = user?.email?.toLowerCase() || "";
    if (email.includes("jindalsteel") || email.includes("jspl")) {
      setCompany("jindalsteel");
    } else if (email.includes("jindalpower")) {
      setCompany("jindalpower");
    } else {
      setCompany(null);
    }
  }, [user?.email]);

  const POWERBI_LINKS = {
    jindalsteel:
      "https://app.powerbi.com/reportEmbed?reportId=7ded1455-4362-495e-9015-6e8a1b5f0725&autoAuth=true&ctid=dceafa58-89d9-419f-8d1a-cc0295447f38&actionBarEnabled=true",
    jindalpower:
      // "https://app.powerbi.com/reportEmbed?reportId=4215c7c7-a3fb-4cd2-9a6e-9fd041d26f5a&autoAuth=true&ctid=871c010f-5e61-4fb1-83ac-98610a7e9110&actionBarEnabled=true"
      "https://app.powerbi.com/links/NuYy-fTYuy?ctid=4215c7c7-a3fb-4cd2-9a6e-9fd041d26f5a&pbi_source=linkShare"
  };

  return (
    <>
      <div className="admin-login">
        <div className="row">
          <div className="col-12">
            <div className="admin-boxContainer d3">
              <div className="adminAction">
                <div className="adminAction__title">Power BI Reports</div>
                {/* {showDashboard && (
                 <button className="iconBtn orange" type="button"
                   onClick={() => window.open("https://mom.jindalsteel.com/", "_blank")}
                 >
                  <span>Safety Governance</span>
                  <Image
                    width="15"
                    height="15"
                    alt="icon"
                    src="/images/svg/icons/Link.svg"
                    className="img-fluid u-image"
                  />
                </button>
                 )} */}
                 {company === "jindalsteel" && (
                    <button
                      className="iconBtn orange"
                      type="button"
                      onClick={() => window.open("https://mom.jindalsteel.com/", "_blank")}
                    >
                      <span>Safety Governance</span>
                      <Image
                        width="15"
                        height="15"
                        alt="icon"
                        src="/images/svg/icons/Link.svg"
                        className="img-fluid u-image"
                      />
                    </button>
                   )}
              </div>
            </div>
            {/* {showDashboard ? (
                <div className="admin-boxContainer d1 chartView mt-4">
                  <div className="chartView__container">
                    <iframe
                      title="JINSAFE DASHBOARD"
                      width={1140}
                      height={541.25}
                      src="https://app.powerbi.com/reportEmbed?reportId=7ded1455-4362-495e-9015-6e8a1b5f0725&autoAuth=true&ctid=dceafa58-89d9-419f-8d1a-cc0295447f38&actionBarEnabled=true"
                      frameBorder={0}
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              ) : (
                <div>
                <div className="admin-boxContainer d1 chartView mt-4">
                  <div className="chartView__container text-center">
                    <b style={{color: "red"}}>You are not authorized to view this page.</b>
                  </div>
                </div>
                </div>
              )}            */}
              {company === "jindalsteel" ? (
                <iframe
                  title="Jindal Steel Dashboard"
                  width={1140}
                  height={541.25}
                  src={POWERBI_LINKS.jindalsteel}
                  frameBorder={0}
                  allowFullScreen
                />
              ) : company === "jindalpower" ? (
                <iframe
                  title="Jindal Power Dashboard"
                  width={1140}
                  height={541.25}
                  src={POWERBI_LINKS.jindalpower}
                  frameBorder={0}
                  allowFullScreen
                />
              ) : (
                <div className="text-center">
                  <b style={{ color: "red" }}>
                    You are not authorized to view this page.
                  </b>
                </div>
              )}
          </div>
        </div>        
      </div>
    </>
  );
};

export default ProtectedRoute(Dashboard);
