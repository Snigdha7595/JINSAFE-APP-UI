import { useFormik } from "formik";
import { useRef, useState } from "react";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import UploadFieldV2 from "@/components/Form/UploadFieldV2";
import CustomModal from "../Layouts/CustomModal";
import Link from "next/link";
import Image from "next/image";
import { useModalManager } from "@/hooks/useModalManager";

type FormValues = {
  personalInfo: {
    firstName: string;
    lastName: string;
  };
  contactInfo: {
    email: string;
    phone: string;
  };
  preferences: {
    newsletter: boolean;
    notifications: boolean;
  };
};

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
];

const InvestigationReportAccordion = () => {
  // State to track which sections are open
  const [openSections, setOpenSections] = useState({
    unitdetails: true,
    preliminary: false,
    incidentdetails: false,
    injurysection: false,
    immediate: false,
    pirsubmit: false,
  });

  const [boardLogo, setBoardLogo] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { modals, openModal, closeModal } = useModalManager([
    "ApproveImmediateAction",
    "AddRootCase",
    "EditRootCause",
    "PreventiveCorrectiveAction",
  ] as const);

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement> | null
  ) => {
    if (!event?.target.files?.[0]) return;

    const file = event.target.files[0];
    const validExtensions = ["image/jpeg", "image/jpg", "image/png"];
    if (!validExtensions.includes(file.type)) {
      // toast.error('Invalid file type. Please upload a JPG, JPEG, or PNG image.');
      return;
    }

    const maxSize = 1024 * 1024;
    if (file.size > maxSize) {
      // toast.error('File size too large. Maximum allowed size is 1MB.');
      return;
    }
    if (file) {
      setBoardLogo(URL.createObjectURL(file));
      formik.setFieldValue("logo", file);

      const uploadLogo = async () => {
        const uploadFormData = new FormData();
        uploadFormData.append("uploadfile", file, file.name);
        // const response = await serverRequest(
        //     uploadFormData,
        //     UPLOAD_FILE,
        //     CONSTANTS.REQUEST_POST,
        //     true,
        //     true,
        //     user?.api_auth_token,
        //     true
        // );

        // if (response?.status === CONSTANTS.STATUS_FAILED) {
        //     setAlertMsg(response.message);
        //     toast.error(response.message);
        //     response.errors.forEach(function (error: Error) {
        //         toast.error(error.message);
        //     });
        // } else if (response?.status === CONSTANTS.STATUS_SUCCESS) {
        //     setMediaId(response.data.id);
        //     setBoardLogo(response.data.cdn_path);
        //     setProceedable(true)
        //     try {
        //         setIsLoading(true)
        //         const res = await serverRequest(
        //             { id: response.data.id },
        //             SAVE_LOGO,
        //             CONSTANTS.REQUEST_POST,
        //             true,
        //             true,
        //             user?.api_auth_token
        //         );
        //         if (res?.status === CONSTANTS.STATUS_FAILED) {
        //             setAlertMsg(res.message);
        //             toast.error(res.message);
        //             res.errorsforEach(function (error: Error) {
        //                 toast.error(error.message);
        //             });
        //         } else if (res?.status === CONSTANTS.STATUS_SUCCESS) {
        //             toast.success(res.message);
        //         }
        //     }
        //     catch (err) {
        //         console.log(err)
        //     } finally {
        //         setIsLoading(false)
        //     }
        // }
      };

      uploadLogo();
    }
  };
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const formik = useFormik<FormValues>({
    initialValues: {
      personalInfo: {
        firstName: "",
        lastName: "",
      },
      contactInfo: {
        email: "",
        phone: "",
      },
      preferences: {
        newsletter: false,
        notifications: false,
      },
    },
    onSubmit: (values) => {
      console.log(values);
      // alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      {/* Unit Details Section */}
      <div className="c-accordion">
        <div className="c-accordion__head">
          <div className="c-accordion__head--title">Unit Details</div>
          <button
            type="button"
            onClick={() => toggleSection("unitdetails")}
            className="c-accordion__head--btn"
          >
            {openSections.unitdetails ? (
              <img
                width="20"
                height="20"
                alt="icon"
                src="/images/svg/up-arrow.svg"
                className="img-fluid u-image"
              />
            ) : (
              <img
                width="20"
                height="20"
                alt="icon"
                src="/images/svg/down-arrow.svg"
                className="img-fluid u-image"
              />
            )}
          </button>
        </div>

        {openSections.unitdetails && (
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12 col-md-3 col-lg-2">
                <InputField
                  type="text"
                  label="Unit Details"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-2">
                <InputField
                  type="text"
                  label="Exact Location"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-2">
                <InputField
                  type="text"
                  label="Incident Time"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-2">
                <InputField
                  type="text"
                  label="Injury Happend"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-2">
                <InputField
                  type="text"
                  label="Department"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-2">
                <InputField
                  type="text"
                  label="Cost"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-2">
                <div className="dateFlield">
                  <DatePickerField
                    label="Incident Date"
                    name="fromDate"
                    placeholder="choose a date"
                    errors={""}
                    touched={""}
                    value={new Date()}
                    maxDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    onChange={() => {}}
                  />
                  <span className="dateFlield__icon">
                    {/* <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/calendar.svg"
                  className="img-fluid u-image"
                  /> */}
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-3 col-lg-2">
                <SelectField
                  label="Incident Category"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>

              <div className="col-12 col-md-3 col-lg-2">
                <InputField
                  type="text"
                  label="Section"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-2">
                <InputField
                  type="text"
                  label="Cost of Incident"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-2">
                <SelectField
                  label="Incident Classification"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Injury Details Section */}
      <div className="c-accordion overflow-hidden">
        <div className="c-accordion__head">
          <div className="c-accordion__head--title">Injury Details</div>
          <button
            type="button"
            onClick={() => toggleSection("incidentdetails")}
            className="c-accordion__head--btn"
          >
            {openSections.incidentdetails ? (
              <img
                width="20"
                height="20"
                alt="icon"
                src="/images/svg/up-arrow.svg"
                className="img-fluid u-image"
              />
            ) : (
              <img
                width="20"
                height="20"
                alt="icon"
                src="/images/svg/down-arrow.svg"
                className="img-fluid u-image"
              />
            )}
          </button>
        </div>

        {openSections.incidentdetails && (
          <div className="filters">
            <div className="row form_grider d1"></div>
            <div className="row">
              <div className="col-12">
                <div className="actionWrapper ">
                  <button className="iconBtn orange v2 ">
                    <img
                      width="15"
                      height="15"
                      alt="icon"
                      className="img-fluid u-image"
                      src="/images/svg/eye.svg"
                    />
                  </button>
                  <button
                    className="iconBtn green v2 "
                    onClick={() => openModal("ApproveImmediateAction")}
                  >
                    <span>Add Injury Details</span>
                    <img
                      width="15"
                      height="15"
                      alt="icon"
                      className="img-fluid u-image"
                      src="/images/svg/plus.svg"
                    />
                  </button>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="formTable">
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Gender</th>
                            <th>Job Type</th>
                            <th>Body Part</th>
                            <th>Nature of Injury</th>
                            <th>Incident Last Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>11100293</td>
                            <td>Suraj Kumar Das</td>
                            <td>Male</td>
                            <td>High Risk</td>
                            <td>Head</td>
                            <td></td>
                            <td></td>
                            <td className="u-icon">
                              <button className="tableBtn v2">
                                <span className="iconPrimary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/edit-icon-blue.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                              <button className="tableBtn v2">
                                <span className="iconSecondary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/delete-icon.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="actionWrapper ">
                  <button className="iconBtn green v2 ">View Root Case</button>
                  <button className="iconBtn grey v2 ">other button</button>
                  <button className="iconBtn grey v2 ">Facts</button>
                  <button className="iconBtn grey v2 ">
                    View Investigation Team
                  </button>
                </div>
              </div>
            </div>
            <div className="row form_grider d1">
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  label="Last date of incident of contractor organization"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  label="Incident Investigation Initianted Date and Time"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12">
                <InputField
                  type="text"
                  label="Any Similar Incident happened in Organization"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12">
                <InputField
                  type="text"
                  label="Immediate Action Taken After Incident"
                  value={""}
                  name="meta_title"
                  placeholder="Action 1"
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12 col-md-12 col-lg-6">
                <div className="formTable">
                  <div className="tableTitle">Record View</div>
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Key Factor Identified</th>
                            <th>Type</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Human Factor</td>
                            <td></td>
                            <td>Lack Knowledge (..........)</td>
                          </tr>
                          <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-12 col-lg-6">
                <div className="formTable">
                  <div className="tableTitle">Record View</div>
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>S No.</th>
                            <th>Record Viewed</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>1</td>
                            <td>xyz</td>
                            <td className="u-icon">
                              <button className="tableBtn v2">
                                <span className="iconPrimary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/edit-icon-blue.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                              <button className="tableBtn v2">
                                <span className="iconSecondary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/delete-icon.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="formTable">
                  <div className="tableTitle">
                    Persons Interacted During Incident Investigation
                  </div>
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Designation</th>
                            <th>Department</th>
                            <th>Employee Type</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>xyz</td>
                            <td>xyz</td>
                            <td>xyz</td>
                            <td>xyz</td>
                            <td className="u-icon">
                              <button className="tableBtn v2">
                                <span className="iconPrimary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/edit-icon-blue.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                              <button className="tableBtn v2">
                                <span className="iconSecondary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/delete-icon.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td>xyz</td>
                            <td>xyz</td>
                            <td>xyz</td>
                            <td>xyz</td>
                            <td className="u-icon">
                              <button className="tableBtn v2">
                                <span className="iconPrimary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/edit-icon-blue.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                              <button className="tableBtn v2">
                                <span className="iconSecondary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/delete-icon.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="formTable">
                  <div className="tableTitle">Recommendation</div>
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Finding</th>
                            <th>Recommendation</th>
                            <th>Target Date</th>
                            <th>Responsible Department</th>
                            <th>Responsible Section</th>
                            <th>Responsible Person</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Finding 1 update</td>
                            <td>Action 4</td>
                            <td>27-12-2024</td>
                            <td>Civil</td>
                            <td>Operation</td>
                            <td>Mohanlas Karsh</td>
                            <td className="u-icon">
                              <button className="tableBtn v2">
                                <span className="iconPrimary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/edit-icon-blue.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                              <button className="tableBtn v2">
                                <span className="iconSecondary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/delete-icon.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                            </td>
                          </tr>
                          <tr>
                           <td>Finding 1 update</td>
                            <td>Action 4</td>
                            <td>27-12-2024</td>
                            <td>Civil</td>
                            <td>Operation</td>
                            <td>Anand Kumar Dubey</td>
                            <td className="u-icon">
                              <button className="tableBtn v2">
                                <span className="iconPrimary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/edit-icon-blue.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                              <button className="tableBtn v2">
                                <span className="iconSecondary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/delete-icon.svg"
                                    className="img-fluid u-image"
                                  />
                                </span>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="actionWrapper ">
        <button className="iconBtn orange v2 " type="submit">
          <span>Preview Team</span>
          <img
            width="15"
            height="15"
            alt="icon"
            className="img-fluid u-image"
            src="/images/svg/eye-white.svg"
          />
        </button>
      </div>

      <CustomModal
        isOpen={modals.ApproveImmediateAction}
        onClose={() => closeModal("ApproveImmediateAction")}
        title="Approve Immediate Action"
      >
        <>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12">
                <InputField
                  type="text"
                  label="Incident Classification"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-4 col-lg-4">
                <SelectField
                  label="Employee Type"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-4 col-lg-4">
                <InputField
                  type="text"
                  label="Employee ID"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-4 col-lg-4">
                <InputField
                  type="text"
                  label="Employee ID"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-4 col-lg-4">
                <InputField
                  type="text"
                  label="Injured Name"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-4 col-lg-4">
                <SelectField
                  label="Gender"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-4 col-lg-4">
                <InputField
                  type="text"
                  label="Job Type"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
 <div className="col-12 col-md-4 col-lg-4">
                <InputField
                  type="text"
                  label="Designation"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
 <div className="col-12 col-md-4 col-lg-4">
                <SelectField
                  label="Body Parts Injured"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
 <div className="col-12 col-md-4 col-lg-4">
                <InputField
                  type="text"
                  label="Nature of Injury"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>

              <div className="col-12 col-md-4 col-lg-4">
                <div className="dateFlield">
                  <DatePickerField
                    label="Incident Last Date"
                    name="fromDate"
                    placeholder="choose a date"
                    errors={""}
                    touched={""}
                    value={new Date()}
                    maxDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    onChange={() => {}}
                  />
                  <span className="dateFlield__icon">
                    {/* <img
                  width="15"
                  height="15"
                  alt="icon"
                  src="/images/svg/calendar.svg"
                  className="img-fluid u-image"
                  /> */}
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-8 col-lg-8">
                <InputField
                  type="text"
                  label="Address"
                  value={""}
                  name="meta_title"
                  placeholder=""
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="btnWrapper">
                   <button className="btnNoicon red">Cancel</button>
                  <button className="btnNoicon green">Add Details</button>
                 
                </div>
              </div>
            </div>
          </div>
        </>
      </CustomModal>
    </form>
  );
};

export default InvestigationReportAccordion;
