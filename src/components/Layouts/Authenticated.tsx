import { APP_URL } from "@/config/constant";
import Header from "./Header";
import Sidebar from "./Sidebar";
// import Footer from './Footer';
import { Tooltip } from "react-tooltip";
import Footer from "./Footer";
import { APPIMAGES } from "@/config/config";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

interface User {
  name: string;
  picture?: string;
  role?: string[];
  roleCode?: string;
  createdBy?: string;
  updatedBy?: string;
}

const Authenticated = ({
  children,
  sidebarState,
  responsiveSidebar,
  setResponsiveSidebar,
}: // Footer,
any) => {
  const { user } = useSelector(
    (state: RootState) => state.auth as { user: User }
  );
  const menu = [
    {
      id: 0,
      label: "Dashboard",
      icon: APPIMAGES.DASHBORD_ICON,
      link: APP_URL.DASHBOARD,
      children: [],
    },
    {
      id: "2",
      label: "Safety Interaction",
      icon: APPIMAGES.SAFETY_INT_ICON,
      link: APP_URL.SAFETY_SI,
      children: [],
    },
    {
      id: "3",
      label: "Safety Observation",
      icon: APPIMAGES.SAFETY_OBS_ICON,
      link: APP_URL.SAFETY_SO,
      children: [],
    },
    {
      id: "4",
      label: "Line Walk",
      icon: APPIMAGES.LINE_ICON,
      link: APP_URL.SAFETY_LW,
      children: [],
    },
    {
      id: "5",
      label: "Incident Management",
      icon: APPIMAGES.INCIDENT_ICON,
      link: "/incident-management",
      children: [],
    },    
    {
      id: '6',
      label: 'CSM',
      icon: APPIMAGES.CONTRACTOR_ICON,
      link: APP_URL.CSM,
      // link: APP_URL.CONTRACTOR,
      children: [],
    },
    //  {
    //   id: '7',
    //   label: 'BHM',
    //   icon: APPIMAGES.BHIM_ICON,
    //   link: APP_URL.BHM,
    //   children: [],
    // },
    {
      id: '7',
      label: 'MOC',
      icon: APPIMAGES.INCIDENT_ICON,
      link: APP_URL.MOC_DASHBOARD,
      children: [],
    },   
    {
      id: '8',
      label: "Safety Score Card",
      icon: APPIMAGES.SAFETY_INT_ICON,
      link: APP_URL.SAFETY_SCORE,
      children: [],
    },
     {
      id: '9',
      label: "Recommendation Tracker",
      icon: APPIMAGES.SAFETY_OBS_ICON,
      link: APP_URL.RECOMMENDATION,
      children: [],
    },
    {
      id: '10',
      label: "Admin",
      icon: APPIMAGES.ADMIN_ICON,
      link: APP_URL.ADMIN_DASHBOARD,
      children: [],
    },
    // {
    //   id: '10',
    //   icon: APPIMAGES.PORTFOLIO_ICON,
    //   label: 'My Portfolio',
    //   link: APP_URL.MY_PORTFOLIO,
    //   children: [
    //     {
    //       id: '11',
    //       icon: APPIMAGES.PORTFOLIO_ICON,
    //       label: 'My Draft',
    //       link: APP_URL.MY_PORTFOLIO,
    //       children: [],
    //     },
    //     {
    //       id: '12',
    //       icon: APPIMAGES.PORTFOLIO_ICON,
    //       label: 'My Action',
    //       link: APP_URL.MY_PORTFOLIO,
    //       children: [],
    //     },
    //     {
    //       id: '13',
    //       icon: APPIMAGES.PORTFOLIO_ICON,
    //       label: 'My SI',
    //       link: APP_URL.MY_PORTFOLIO,
    //       children: [],
    //     },
    //     {
    //       id: '14',
    //       icon: APPIMAGES.PORTFOLIO_ICON,
    //       label: 'My SO',
    //       link: APP_URL.MY_PORTFOLIO,
    //       children: [],
    //     },
    //     {
    //       id: '15',
    //       icon: APPIMAGES.PORTFOLIO_ICON,
    //       label: 'Global Action Tracker',
    //       link: APP_URL.MY_PORTFOLIO,
    //       children: [],
    //     }
    //   ],
    // },
    // {
    //   id: '16',
    //   icon: APPIMAGES.PORTFOLIO_ICON,
    //   label: 'Admin',
    //   link: APP_URL.ADMIN_DASHBOARD,
    //   children: [
    //     {
    //       id: '17',
    //       icon: APPIMAGES.PORTFOLIO_ICON,
    //       label: 'Employee',
    //       link: APP_URL.ADMIN_EMPLOYEE_MANAGE,
    //       children: [],
    //     },
    //     {
    //       id: '18',
    //       icon: APPIMAGES.PORTFOLIO_ICON,
    //       label: 'Work Place Management',
    //       link: APP_URL.ADMIN_WORKPLACE_MANAGE,
    //       children: [],
    //     },
    //   ],
    // }
  ];
  return (
    <>
      <Sidebar
        user={user}
        responsiveSidebar={responsiveSidebar}
        setResponsiveSidebar={setResponsiveSidebar}
        sidebarState={sidebarState}
        menu={menu}
      />
      <div className="admin-mainContainer_panel">
        <Header setResponsiveSidebar={setResponsiveSidebar} />
        <div className="admin-mainContainer_container">{children}</div>
        <Tooltip id="genericTooltip" place="top" />
        <Footer />
      </div>
    </>
  );
};

export default Authenticated;
