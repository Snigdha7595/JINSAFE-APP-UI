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

const InvestigationTeamAccordion = () => {
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
    "AddImmediateAction",
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
          <div className="c-accordion__head--title">PIR Details</div>
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
              <div className="col-12 col-md-3 col-lg-3">
                <InputField
                  type="text"
                  label="Incident ID"
                  value={""}
                  name="meta_title"
                  placeholder="IM001503"
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                <InputField
                  type="text"
                  label="Incident Classification"
                  value={""}
                  name="meta_title"
                  placeholder="Lost Time Case...."
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                <InputField
                  type="text"
                  label="Incident Category"
                  value={""}
                  name="meta_title"
                  placeholder="Manual Tasks Tools"
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                <div className="dateFlield">
                  <DatePickerField
                    label="Date of Incident"
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
              <div className="col-12 col-md-3 col-lg-3">
                <InputField
                  type="text"
                  label="Exact Location"
                  value={""}
                  name="meta_title"
                  placeholder="xyz"
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={() => {}}
                  maxLength={30}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Incident Details Section */}
      <div className="c-accordion overflow-hidden">
        <div className="c-accordion__head">
          <div className="c-accordion__head--title">Incident Details</div>
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
                <div className="formTable">
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Email ID</th>
                            <th>Name</th>
                            <th>Desination</th>
                            <th>Department</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <InputField
                                type="text"
                                label=""
                                value={""}
                                name="meta_title"
                                placeholder=""
                                errors={""}
                                touched={""}
                                onBlur={() => {}}
                                onChange={() => {}}
                                maxLength={30}
                              />
                            </td>
                            <td>
                              <InputField
                                type="text"
                                label=""
                                value={""}
                                name="meta_title"
                                placeholder=""
                                errors={""}
                                touched={""}
                                onBlur={() => {}}
                                onChange={() => {}}
                                maxLength={30}
                              />
                            </td>
                            <td>
                              <InputField
                                type="text"
                                label=""
                                value={""}
                                name="meta_title"
                                placeholder=""
                                errors={""}
                                touched={""}
                                onBlur={() => {}}
                                onChange={() => {}}
                                maxLength={30}
                              />
                            </td>
                            <td>
                              <InputField
                                type="text"
                                label=""
                                value={""}
                                name="meta_title"
                                placeholder=""
                                errors={""}
                                touched={""}
                                onBlur={() => {}}
                                onChange={() => {}}
                                maxLength={30}
                              />
                            </td>
                            <td className="u-icon">
                              <button className="tableBtn v2">
                                <span className="iconPrimary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/add-icon.svg"
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
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Email ID</th>
                            <th>Name</th>
                            <th>Desination</th>
                            <th>Department</th>
                            <th>IM Trained</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              xyz@jindalsteel.com
                            </td>
                            <td>
                              Suraj Kumar Das
                            </td>
                            <td>
                              Manager
                            </td>
                            <td>
                              IT
                            </td>
                            <td>
                             Yes
                            </td>
                            <td className="u-icon">
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

      {/* Immediate Actions Section */}
      <div className="c-accordion overflow-hidden">
        <div className="c-accordion__head">
          <div className="c-accordion__head--title">Immediate Actions</div>
          <button
            type="button"
            onClick={() => toggleSection("injurysection")}
            className="c-accordion__head--btn"
          >
            {openSections.injurysection ? (
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

        {openSections.injurysection && (
          <div className="filters">
            <div className="row form_grider d1"></div>
            <div className="row">
              <div className="col-12">
                <div className="formTable">
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Email ID</th>
                            <th>Name</th>
                            <th>Desination</th>
                            <th>Department</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <InputField
                                type="text"
                                label=""
                                value={""}
                                name="meta_title"
                                placeholder=""
                                errors={""}
                                touched={""}
                                onBlur={() => {}}
                                onChange={() => {}}
                                maxLength={30}
                              />
                            </td>
                            <td>
                              <InputField
                                type="text"
                                label=""
                                value={""}
                                name="meta_title"
                                placeholder=""
                                errors={""}
                                touched={""}
                                onBlur={() => {}}
                                onChange={() => {}}
                                maxLength={30}
                              />
                            </td>
                            <td>
                              <InputField
                                type="text"
                                label=""
                                value={""}
                                name="meta_title"
                                placeholder=""
                                errors={""}
                                touched={""}
                                onBlur={() => {}}
                                onChange={() => {}}
                                maxLength={30}
                              />
                            </td>
                            <td>
                              <InputField
                                type="text"
                                label=""
                                value={""}
                                name="meta_title"
                                placeholder=""
                                errors={""}
                                touched={""}
                                onBlur={() => {}}
                                onChange={() => {}}
                                maxLength={30}
                              />
                            </td>
                            <td className="u-icon">
                              <button className="tableBtn v2">
                                <span className="iconPrimary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/add-icon.svg"
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
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Email ID</th>
                            <th>Name</th>
                            <th>Desination</th>
                            <th>Department</th>
                            <th>IM Trained</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              xyz@jindalsteel.com
                            </td>
                            <td>
                              Suraj Kumar Das
                            </td>
                            <td>
                              Manager
                            </td>
                            <td>
                              IT
                            </td>
                            <td>
                             Yes
                            </td>
                            <td className="u-icon">
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

<div className="filters mb-4">
        <div className="row form_grider d1">
          <div className="col-12 col-md-6 col-lg-6">
          Note: At Least one user should be trained in incident investigation
          </div>
        </div>
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
        isOpen={modals.AddImmediateAction}
        onClose={() => closeModal("AddImmediateAction")}
        title="Add Immediate Action"
      >
        <>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  label="Immediate Action"
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
                <SelectField
                  label="Department"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Section"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Section Head"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Assign Line Manager"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-6">
                <div className="dateFlield">
                  <DatePickerField
                    label="Target Date"
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
            </div>
            <div className="row">
              <div className="col-12">
                <div className="btnWrapper">
                  <button className="btnNoicon green">Apply</button>
                  <button className="btnNoicon red">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      </CustomModal>
      <CustomModal
        isOpen={modals.AddRootCase}
        onClose={() => closeModal("AddRootCase")}
        title="Add Root Case"
      >
        <>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12">
                <InputField
                  type="text"
                  label="Finding"
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
                <SelectField
                  label=""
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label=""
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Factor Type"
                  value={""}
                  name="state"
                  placeholder="Human Factor"
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Human Factor"
                  value={""}
                  name="state"
                  placeholder="Lack of skill (...)"
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="btnWrapper">
                  <button className="btnNoicon green">Apply</button>
                  <button className="btnNoicon red">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      </CustomModal>
      <CustomModal
        isOpen={modals.EditRootCause}
        onClose={() => closeModal("EditRootCause")}
        title="Edit Root Cause"
      >
        <>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12">
                <InputField
                  type="text"
                  label="Finding"
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
                <SelectField
                  label=""
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label=""
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Factor Type"
                  value={""}
                  name="state"
                  placeholder="System Factor"
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="System Factor"
                  value={""}
                  name="state"
                  placeholder="Inadequate Design/Engineering)"
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div className="btnWrapper">
                  <button className="btnNoicon green">Apply</button>
                  <button className="btnNoicon red">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      </CustomModal>
      <CustomModal
        isOpen={modals.PreventiveCorrectiveAction}
        onClose={() => closeModal("PreventiveCorrectiveAction")}
        title="Preventive/Corrective Action"
      >
        <>
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  label="Immediate Action"
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
                <SelectField
                  label="Department"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Section"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Section Head"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-6 col-lg-6">
                <SelectField
                  label="Assign Line Manager"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>

              <div className="col-12 col-md-6 col-lg-6">
                <div className="dateFlield">
                  <DatePickerField
                    label="Target Date"
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
            </div>
            <div className="row">
              <div className="col-12">
                <div className="btnWrapper">
                  <button className="btnNoicon green">Apply</button>
                  <button className="btnNoicon red">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </>
      </CustomModal>
    </form>
  );
};

export default InvestigationTeamAccordion;
