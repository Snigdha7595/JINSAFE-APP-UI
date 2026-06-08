"use client";
import { useFormik } from "formik";
import { jwtDecode } from "jwt-decode";
import useLogin from "@/hooks/useLogin";
import { GENERATE_OTP, VALIDATE_OTP } from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { serverRequest } from "@/services/getServerSideRender";
import { useState, useEffect } from "react";
import GoogleOneTapLogin from "@/components/GoogleOneTapLogin";
import { useRouter } from "next/navigation";
import { login } from "@/store/slices/authSlice";
import { ToastContainer, toast } from "react-toastify";

const initialValues = {
  mobile: "",
  otp: ["", "", "", ""],
};

interface DecodedToken {
  sub?: string;
  name?: string;
  role?: string;
  picture?: string;
}

export default function Home() {  
  const [isNewDomain, setIsNewDomain] = useState<boolean>(true);
  const [companyId, setCompanyId] = useState<string>("");  
  const [isCompanyIdFound, setIsCompanyIdFound] = useState<boolean>(false);
  const [startValidation, setStartValidation] = useState<boolean>(false);
  const [mobile, setMobile] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState(30);
  const router = useRouter();
  const LoginFunction = useLogin();

  // ✅ Load company ID from localStorage on mount
  useEffect(() => {
    const storedCompanyId = localStorage.getItem("companyId");
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
      setIsCompanyIdFound(true);
    } else {
      setIsCompanyIdFound(false);
    }
    let appDomain = window.location.hostname;
    //localhost, jinsafeapp.jindalgcc.com
    if (appDomain === "jinsafeapp.jindalgcc.com") {
      setIsNewDomain(true);
    }
  }, []);

  const handleChangeCompany = () => {
    localStorage.removeItem("companyId");
    // setCompanyId("");
    setIsCompanyIdFound(false);
  };
  // ✅ Handle Company Submit
  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId.trim()) {
      toast.warning("Please enter a valid company Id");
      return;
    }
    await localStorage.setItem("companyId", companyId);
    toast.success("Company Id saved successfully for this evironment!")
    window.location.reload();
  };
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (!/^[0-9]?$/.test(value)) return;
    
    const updatedOtp = [...formik.values.otp];
    updatedOtp[index] = value;
    formik.setFieldValue('otp', updatedOtp);
    
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };
  
  // countdown effect
  useEffect(() => {
    if (!startValidation || secondsLeft === 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, startValidation]);

  // handle resend click
  const handleResend = async () => {
    if(secondsLeft == 0){
      setSecondsLeft(30);
      formik.setFieldValue('otp', ["", "", "", ""]);
      
      // Trigger OTP resend API
      try {
        const payload = { Mobile: mobile };
        await serverRequest(
          payload,
          GENERATE_OTP,
          CONSTANTS.REQUEST_POST,
          true,
          true,
          process.env.NEXT_PUBLIC_API_TOKEN
        );
      } catch (error) {
        console.error('API Error:', error);
      }
    }
  };  
  
  const formik = useFormik({
  initialValues,
  enableReinitialize: true,
  onSubmit: async (values: any) => {
    let payload
    if(!startValidation){
      payload = { Mobile: `${values.mobile}` };
    }else {
      payload = { Mobile: mobile, Otp: values.otp.join("") };
    }
    try {
        // onSubmit={async (values: any) => {
              // const data = {
              //   accessToken: "123456",
              //   user: {
              //     mobile: values.mobile,
              //     password: values.password,
              //     role: "f8b8e15d-cce3-4d3e-afbc-bb8cf97b6bb1",
              //     roleCode: values.mobile == "9999999999" ? "NA" : "USER",
              //   },
              // };
              // LoginFunction(data);
        //     }}
        const response = await serverRequest(
          payload,
          !startValidation? GENERATE_OTP: VALIDATE_OTP,
          CONSTANTS.REQUEST_POST,
          false,
          false,
          process.env.NEXT_PUBLIC_API_TOKEN
        );
        if (response.success) {
          if (!startValidation) {
            setMobile(payload.Mobile);
            setStartValidation(true);
            setSecondsLeft(30); // Start timer when OTP is sent
            toast.success("OTP sent successfully!");
          } else {
            const decoded = jwtDecode<DecodedToken>(response.accessToken);
            const loginData = {
            accessToken: response.accessToken,
            user: {
              name: decoded?.name || '',
              role: Array.isArray(decoded?.role)? JSON.parse(decoded?.role) : decoded?.role || [],
              roleCode: mobile === "9999999999" ? "NA" : Array.isArray(decoded?.role) && decoded.role.some(role => role.includes("Admin")) ? "ADMIN" : "GUEST",
              picture: decoded?.picture || '',
              createdBy: decoded?.sub || '',
              updatedBy: decoded?.sub || ''              
            },
            expiryInMins: response.expiresIn //jiten
          };
          console.log("loginData on mobile login", loginData)
          LoginFunction(loginData);
          if(loginData.user.roleCode === "GUEST"){
            router.push(APP_URL.SAFETY_SO);
          }
          toast.success("Logged in successfully!");
          }
        } else {
          toast.error(response?.message || "You are not authorized!");
        }
      } catch (error: any) {
       console.error("API Error:", error);
      if (error?.response?.status === 401) {
        toast.error("You are not authorized!");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      } finally {
        if (!startValidation) {
          formik.setFieldValue('mobile', '');
        }
      }
    }
  });
  return (
    <>
              
          {/* <div className="row">
            <div className="col-12">
            <p>Our website URLs have been updated</p>
              <p> for a better browsing experience.</p>
            <p>
              Please visit our new site at{" "}
              <br />
              <a
                href="https://jinsafeapp.jindalgcc.com"
                target="_blank"
                rel="noopener noreferrer"
                className="infoLink"
              >
                jinsafeapp.jindalgcc.com
              </a>
            </p>
          </div>
          </div> */}
      {/* ✅ If companyId is null, show Company Id Selection */}
      {!isCompanyIdFound ? (
        <>
          <div className="mediaLs">
            <img width="50px" height="50px" alt="vector image" src="/images/content-images/icon-1.png" className="img-fluid u-image" />
          </div>
          <div className="mediaRs">
            <img width="50px" height="50px" alt="vector image" src="/images/svg/logo-black.svg" className="img-fluid u-image" />
          </div>
          <div className="loginWrapper">
          {isNewDomain && (
            <>          
              <div className="loginWrapper__title">Enter Company Id</div>
              <div className="loginWrapper__form">
                <div className="form_grider d1 loginWrapper__form--input">
                  <div className="position-relative inputWrapper">
                    <input
                      type="text"
                      value={companyId}
                      className="inputBox mb-3"
                      placeholder="Please Enter jindalsteel or jindalpower"
                      onChange={(e) => setCompanyId(e.target.value)}
                      // readOnly={true}
                    />
                  </div>
                  <div className="loginWrapper__btn">
                    <button type="button" onClick={handleCompanySubmit}
                      className="btn primary themeBlue">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          {!isNewDomain && (
            <div className="loginWrapper__form" style={{ marginTop: "20px", textAlign: "center" }}>
              <div className="col-12">
                <p
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    margin: "4px 0",
                    lineHeight: "1.5",
                  }}
                >
                  Our website URLs have been updated
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    margin: "4px 0",
                    lineHeight: "1.5",
                  }}
                >
                  for a better browsing experience.
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    margin: "4px 0",
                    lineHeight: "1.5",
                  }}
                >
                  Please visit our new site at
                  <br />
                  <a
                    href="https://jinsafeapp.jindalgcc.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#007bff",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                    onMouseOver={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline";
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none";
                    }}
                  >
                    jinsafeapp.jindalgcc.com
                  </a>
                </p>
              </div>
            </div>
          )}
          </div>       
        </>
      ) : (
        <>
        {isNewDomain && (
          <>
            {/* ✅ Normal Login Flow */}
            <div className="mediaLs">
              <img width="50px" height="50px" alt="vector image" src="/images/content-images/icon-1.png" className="img-fluid u-image" />
            </div>
            <div className="mediaRs">
              <img width="50px" height="50px" alt="vector image" src="/images/svg/logo-black.svg" className="img-fluid u-image" />
            </div>
            <div className="loginWrapper">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="loginWrapper__title mb-0"
                style={{ whiteSpace: "nowrap", fontSize: "1.3rem", fontWeight: "600" }}
                >
                {!startValidation ? "Sign in" : "OTP verification"}</div>

              {/* 🔁 Change Company Button */}
                <button
                  type="button"
                  onClick={handleChangeCompany}
                  className="btn btn-link p-0 ms-auto"
                  style={{
                    textDecoration: "underline",
                    color: "#007bff",
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  Change Company Id
                </button>
              </div>

              {startValidation && (
                <p className="loginWrapper__subtitle text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                  Please enter the OTP sent to your <br /> registered Mobile Number
                </p>
              )}

              <div className="loginWrapper__form">
                <div className="loginWrapper__form--Btn">
                  {!startValidation && <GoogleOneTapLogin />}
                </div>

                {!startValidation && (
                  <div className="loginWrapper__form--info">
                    <div className="desc">Or Login as Guest</div>
                  </div>
                )}

                <form onSubmit={formik.handleSubmit}>
                  <div className="form_grider d1 loginWrapper__form--input">
                    <div className="position-relative inputWrapper">
                      {!startValidation ? (
                        <>
                          <input
                            type="text"
                            value={formik.values.mobile}
                            name="mobile"
                            className="inputBox mb-3"
                            placeholder="Mobile No."
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          <img width="10" height="10" alt="Mobile icon" className="img-fluid u-icon" src="/images/svg/mobile.svg" />
                        </>
                      ) : (
                        <>
                          <div className="loginWrapper__form--Otp d-flex justify-content-center gap-2 mb-3">
                            {formik.values.otp.map((digit, index) => (
                              <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                maxLength={1}
                                className="otpBox text-center"
                                value={digit}
                                onChange={(e) => handleOtpChange(e, index)}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  border: "1px solid #ccc",
                                  borderRadius: "4px",
                                }}
                              />
                            ))}
                          </div>
                          <div className="text-center mb-4" style={{ fontSize: "0.85rem" }}>
                            <div>
                              <strong>Remaining time: </strong> 00:{secondsLeft.toString().padStart(2, "0")}
                            </div>
                            {secondsLeft === 0 && (
                              <div>
                                <span>Didn’t get the code?</span>
                                <button
                                  type="button"
                                  className="btn btn-link p-0 resend-btn"
                                  style={{
                                    textDecoration: "underline",
                                    fontSize: "0.85rem",
                                    color: "#007bff",
                                  }}
                                  disabled={secondsLeft !== 0}
                                  onClick={handleResend}
                                >
                                  Resend
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="loginWrapper__btn">
                      <button disabled={startValidation && !secondsLeft} type="submit" className="btn primary themeBlue">
                        {!startValidation ? "Request OTP" : "Verify OTP"}
                      </button>

                      {!startValidation && (
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              "https://drive.google.com/drive/folders/1Xe__8IibKJr2h_aaYmGCoVRVhz5q9xza?usp=sharing",
                              "_blank"
                            )
                          }
                          className="btn primary orange"
                        >
                          User Manual
                        </button>
                      )}

                      {startValidation && (
                        <button
                          type="button"
                          className="btn primary orange"
                          onClick={() => {
                            setStartValidation(false);
                            setMobile("");
                            formik.setFieldValue("otp", ["", "", "", ""]);
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
          
        {!isNewDomain && (
          <div className="loginWrapper">
            <div className="loginWrapper__form" style={{ marginTop: "20px", textAlign: "center" }}>
              <div className="col-12">
                <p
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    margin: "4px 0",
                    lineHeight: "1.5",
                  }}
                >
                  Our website URLs have been updated
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    margin: "4px 0",
                    lineHeight: "1.5",
                  }}
                >
                  for a better browsing experience.
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    margin: "4px 0",
                    lineHeight: "1.5",
                  }}
                >
                  Please visit our new site at
                  <br />
                  <a
                    href="https://jinsafeapp.jindalgcc.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#007bff",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                    onMouseOver={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline";
                    }}
                    onMouseOut={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none";
                    }}
                  >
                    jinsafeapp.jindalgcc.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
        </>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  );
}
