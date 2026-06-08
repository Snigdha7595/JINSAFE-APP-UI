"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { KEYS } from "@/config/key";
import { GOOGLE_LOGIN, LOGIN_EMP_DETAILS } from "@/config/apiConfig";
import useLogin from "@/hooks/useLogin";
import { jwtDecode, type JwtPayload } from "jwt-decode"; 
import { serverRequest } from "@/services/getServerSideRender";
import { toast,ToastContainer } from "react-toastify";
import {  } from "jwt-decode";

interface JwtUserDetails extends JwtPayload {
  sub?: string;
  name?: string;
  role?: string;
  picture?: string;
}

interface EmployeeDetails {
  jsplid?: string;
}

export default function GoogleOneTapLogin() {
  const router = useRouter();
  const LoginFunction = useLogin();
  const handleGoogleError = () => {
    toast.error("Google login failed. Please check your network connection.");
    };

  const getLoginEmployeeDetails = async (authToken: string) : Promise<EmployeeDetails> => {
        try {
        const response = await serverRequest(
            {},
            LOGIN_EMP_DETAILS,
            CONSTANTS.REQUEST_GET,
            true,
            true,
            authToken
        );

        if(response){
            return response
        } else {
            toast.error(response.message);
            throw new Error(response.message || "Failed to fetch employee details");
        }
    } catch (errors: unknown) {
        toast.error('Something went wrong. Please try again.');
        console.log(errors)
    }}

  return (
    <>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            // const fingerprint = {
            //   userAgent: navigator.userAgent,
            //   screenResolution: `${window.screen.width}x${window.screen.height}`,
            //   timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            // };
            // Send the credential JWT to your backend
            
            // const response = await fetch(GOOGLE_LOGIN, {
            const googleLoginPromise = fetch(GOOGLE_LOGIN, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                [KEYS.X_API_KEY]: CONSTANTS.X_API_KEY,
              },
              body: JSON.stringify({
                credential: credentialResponse.credential,
                // Fingerprint: JSON.stringify(fingerprint),
                Fingerprint: "",
              }),}).then(async (response) => {
              const data = await response.json();
              if (response.ok && data.success) {
                return {
                  accessToken: data.accessToken,
                  userDetails: jwtDecode<JwtUserDetails>(data.accessToken),
                  expiresInMins: data.expiresIn
                };
              } else {
                throw new Error(data.error || "You are not authorized");
              }
            });

            // const data = await response.json();

            // if (response.ok && data.success) {
            //   const userDetails = jwtDecode(data.accessToken);
            //   const employeeDetails = getLoginEmployeeDetails(data.accessToken)
            //     if(userDetails?.sub && employeeDetails?.jsplid ){

            //           const loginData = {
            //             accessToken: data.accessToken,
            //             user: {
            //             name: userDetails?.name || "",
            //             role: JSON.parse(userDetails?.role) || [],
            //             roleCode: "USER",
            //             picture: userDetails?.picture || "",
            //             createdBy: userDetails?.sub || "",
            //             updatedBy: userDetails?.sub || "",
            //             },
            //         };
            //         console.log("userDetails 2", userDetails)
            //         console.log("employeeDetails 2", employeeDetails)
            //         // Use your existing login flow
            //         LoginFunction(loginData);
            //         router.push(APP_URL.DASHBOARD);   
            //     }
            // } else {
            //   throw new Error(data.error || "Authentication failed");
            // Wait for both API calls to complete
            const [googleLoginResult, employeeDetails] = await Promise.all([
              googleLoginPromise,
              googleLoginPromise.then(result => 
                getLoginEmployeeDetails(result.accessToken)
              )
            ]);

            // Combine the data from both APIs
            const combinedUserData = {
              accessToken: googleLoginResult.accessToken,
              user: {
                ...googleLoginResult.userDetails,
                ...employeeDetails,
                role: JSON.parse(googleLoginResult.userDetails?.role|| '[]'),
                roleCode: googleLoginResult.userDetails?.role && googleLoginResult?.userDetails?.role.includes("Admin") ? "ADMIN" : "USER",
                higher_role: [{ role_code: "USER" }], // Employee
                createdBy: googleLoginResult.userDetails.sub || "",
                updatedBy: googleLoginResult.userDetails.sub || "",
              },
              expiresInMins: googleLoginResult.expiresInMins //jiten
            };
            console.log("Google role IsArray--:", googleLoginResult.userDetails?.role && googleLoginResult?.userDetails?.role.includes("Super Admin") ? "ADMIN" : "USER");
            // console.log("Google role array:", Array.isArray(googleLoginResult.userDetails?.role) && googleLoginResult.userDetails?.role.some(role => role.includes("Admin")) ? "ADMIN" : "USER");
            // console.log("Combined User Data:", combinedUserData,googleLoginResult.userDetails?.role);
            // Verify we have all required data
            if (!googleLoginResult.userDetails?.sub || !employeeDetails?.jsplid) {
              throw new Error("Incomplete user data received");
            }

            LoginFunction(combinedUserData);

            //router.push(APP_URL.DASHBOARD);
          } catch (error: any) {
            let errorMsg = error?.message || "Login failed";
            // Check if it's the known backend transient failure from Google Auth library
            if (errorMsg.toLowerCase().includes("transient failure")) {
              errorMsg = "Google login is temporarily unavailable due to a network timeout. Please try again or use standard login.";
            } else {
              // Only log to console if it's an unexpected error
              console.error("Login error:", error);
            }
            toast.error(errorMsg);
          }
        }}
        useOneTap
        onError={handleGoogleError}
      />
      <ToastContainer position="top-right" autoClose={3000}
        hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
}
