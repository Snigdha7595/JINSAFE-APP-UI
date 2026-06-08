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
  const [startValidation, setStartValidation] = useState<boolean>(false)
  const [mobile, setMobile] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState(30);
  const router = useRouter();
  const LoginFunction = useLogin();

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
      payload = { Mobile: `${values.mobile}` }; // add contractor related params
    }else {
      payload = { Mobile: mobile, Otp: values.otp.join("")}; // add contractor related params
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
          } else {
            const decoded = jwtDecode<DecodedToken>(response.accessToken);
            const loginData = {
            accessToken: response.accessToken,
            user: {
              roleCode: mobile === "9999999999" ? "NA" : "CONTRACTOR",
              name: decoded?.name || '',
              role: JSON.parse(decoded?.role) || [],
              picture: decoded?.picture || '',
              createdBy: decoded?.sub || '',
              updatedBy: decoded?.sub || ''
            }
          };
          
          LoginFunction(loginData);
          //router.push(APP_URL.DASHBOARD);
          }
        }
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        if (!startValidation) {
          formik.setFieldValue('mobile', '');
        }
      }
    }
  });
  return (
    <>
      <div className="mediaLs">
        <img width="50px" height="50px" alt="vector image" src="/images/content-images/icon-1.png" className="img-fluid u-image" />
      </div>
      <div className="mediaRs">
        <img width="50px" height="50px" alt="vector image" src="/images/svg/logo-black.svg" className="img-fluid u-image" />
      </div>
      <div className="loginWrapper">
        <div className="loginWrapper__title">
          {!startValidation ? "Sign in" : "OTP verification"}
        </div>
        {startValidation && (
          <p className="loginWrapper__subtitle text-muted mb-4" style={{ fontSize: "0.9rem" }}>
            Please enter the OTP sent to your <br />
            registered Mobile Number
          </p>
        )}
        <div className="loginWrapper__form">
          <div className="loginWrapper__form--Btn">
            {/* <button className="loginBtn" onClick={() => {}}>Continue with Google</button>
            <Image
              width={25}
              height={25}
              src="/images/svg/googlelogo.svg"
              alt="google logo image"
              className="img-fluid u-image"
            /> */}
            <div id="google-one-tap-container" className="fixed top-4 right-4"></div>
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
                    {/* OTP Inputs */}
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
                    {/* Remaining time + resend */}
                    <div className="text-center mb-4" style={{ fontSize: "0.85rem" }}>
                      <div>
                        <strong>Remaining time: </strong> 00:{secondsLeft.toString().padStart(2, "0")}
                      </div>
                      <div>
                        <span>{`Didn't get the code?`}</span>
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
                    </div>
                  </>
                )}
              </div>
              <div className="loginWrapper__btn">
                <button type="submit" className="btn primary themeBlue">
                  {!startValidation ? "Request OTP" : "Verify OTP"}
                </button>
                {!startValidation && <button type="button" className="btn primary orange">
                  User Manual
                </button>}
                {startValidation && (
                  <button 
                    type="button" 
                    className="btn primary orange"
                    onClick={() => {
                      setStartValidation(false);
                      setMobile('');
                      formik.setFieldValue('otp', ["", "", "", ""]);
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
  );
}