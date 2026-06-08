"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";

import { selectIsAuthenticated } from "@/store/slices/authSlice";

import { AppDispatch } from "@/store/store";

import Authenticated from "./Authenticated";

const CustomLayout = ({ children }: any) => {
  const isLoggedIn = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const [clientRender, setClientRender] = useState(false);
  const [sidebarToggler, setSidebarToggler] = useState(false);
  const [responsiveSidebar, setResponsiveSidebar] = useState(false);

  useEffect(() => {
    setClientRender(true);
  }, []);

  if (!clientRender) {
    return null;
  }

  const paths = pathname.split("/");
  let pathnameClass = "";
  paths[1] == ""
    ? (pathnameClass = "login")
    : (pathnameClass = paths[1]);

  return (
    <>
      <div
        className={`admin-mainContainer theme1 ${sidebarToggler ? 'sidebar_collapsed' : ''} ${pathnameClass}`}
      >
        {!isLoggedIn || pathname === '/' ? (
          <>{children}</>
        ) : (
          <>
            <Authenticated
              responsiveSidebar={responsiveSidebar}
              setResponsiveSidebar={setResponsiveSidebar}
              sidebarState={setSidebarToggler}
            >
              {children}
            </Authenticated>
          </>
        )}
      </div>
    </>
  );
};

export default CustomLayout;
