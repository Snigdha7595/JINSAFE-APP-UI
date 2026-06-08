import { useFormik } from "formik";
import { useState } from "react";
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import UploadField from "@/components/Form/UploadField";
import CustomModal from "../Layouts/CustomModal";
import Link from "next/link";

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

const MultiAccordionForm = () => {
  // State to track which sections are open
  const [openSections, setOpenSections] = useState({
    unitdetails: true,
    preliminary: false,
    incidentdetails: false,
    injurysection: false,
    immediate: false,
    pirsubmit: false,
  });

  // Toggle section visibility
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
                  label="Unit Name"
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
              <div className="col-12 col-md-3 col-lg-2">
                <InputField
                  type="text"
                  label="Department HOD"
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
                  label="Line Manager"
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

      {/* Preliminary Classification Section */}
      <div className="c-accordion overflow-hidden">
        <div className="c-accordion__head">
          <div className="c-accordion__head--title">
            Preliminary Classification
          </div>
          <button
            type="button"
            onClick={() => toggleSection("preliminary")}
            className="c-accordion__head--btn"
          >
            {openSections.preliminary ? (
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

        {openSections.preliminary && (
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12 col-md-3 col-lg-3">
                <SelectField
                  label="Preliminary Classification"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                <SelectField
                  label="HiPo"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                <SelectField
                  label="Injury Happened"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-3">
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
            </div>
          </div>
        )}
      </div>

      {/* Incident  Details Section */}
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
            <div className="row form_grider d1">
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  label="No. of Persons injured"
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
                  label="Incident Description"
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
              <div className="col-12 ">
                <UploadField />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details of Injury Section */}
      <div className="c-accordion overflow-hidden">
        <div className="c-accordion__head">
          <div className="c-accordion__head--title">Details of Injury</div>
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
            <div className="row form_grider d1">
              <div className="row">
                <div className="col-12">
                  <div className="actionWrapper withborderBT">
                    <button className="iconBtn green v2 withborderBT">
                      <span>Add Injured</span>
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
              <div className="col-12 col-md-3 col-lg-2">
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
              <div className="col-12 col-md-3 col-lg-2">
                <InputField
                  type="text"
                  label="Emp. ID / Gate Pass No."
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
              <div className="col-12 col-md-3 col-lg-2">
                <div className="dateFlield">
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
              </div>
              <div className="col-12 col-md-3 col-lg-4">
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

              <div className="col-12 col-md-3 col-lg-2">
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
              <div className="col-12 col-md-3 col-lg-2">
                <SelectField
                  label="Body Part(s) Injured"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-2">
                <SelectField
                  label="Nature of Injury "
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-2">
                <SelectField
                  label="Job Type"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-2">
                <SelectField
                  label="Name of Employer"
                  value={""}
                  name="state"
                  placeholder=""
                  options={options}
                  onChange={() => {}}
                  onBlur={() => {}}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-2">
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
            </div>
            <div className="row">
              <div className="col-12">
                <div className="formTable">
                  <div className="formTable__title">Added Injured Persons</div>
                  <div className="formTable__table">
                    <div className="admin-table d3 table-responsive mt-3 noHover">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Employee Type</th>
                            <th>Employee ID</th>
                            <th>Injured Name</th>
                            <th>Gender</th>
                            <th>Address</th>
                            <th>Designation</th>
                            <th>Body Part Injured</th>
                            <th>Nature of Injury</th>
                            <th>Job Type</th>
                            <th>Employer Name</th>
                            <th>Incident Last Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                           <td className="u-icon">
                             <button className="tableBtn v2">
                                <span className="iconPrimary">
                                  <img
                                    width="15"
                                    height="15"
                                    alt="icon"
                                    src="/images/svg/eye-icon-blue.svg"
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
            <div className="row form_grider d1">
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  label="What Happened"
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
                  label="What Happened"
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
          </div>
        )}
      </div>
      {/* Immediate Actions Section */}
      <div className="c-accordion overflow-hidden">
        <div className="c-accordion__head">
          <div className="c-accordion__head--title">Immediate Actions</div>
          <button
            type="button"
            onClick={() => toggleSection("immediate")}
            className="c-accordion__head--btn"
          >
            {openSections.immediate ? (
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

        {openSections.immediate && (
          <div className="filters">
            <div className="row form_grider d1">
              <div className="row">
                <div className="col-12">
                  <div className="actionWrapper ">
                    {/* <button className="backBtn">
                      <img
                        width="15"
                        height="15"
                        alt="icon"
                        className="img-fluid u-image"
                        src="/images/svg/left-arrow.svg"
                      />
                    </button> */}
                    <button
                      className="iconBtn green v2 withborderBT"
                      onClick={() => setIsOpen(true)}
                    >
                      <span>Add Action</span>
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
                              <th>Immediate Actions</th>
                              <th>Responsible Person</th>
                              <th>Responsible Department</th>
                              <th>Responsible Section</th>
                              <th>Target Date</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Fix Safety Issue</td>
                              <td>Amit Kumar</td>
                              <td>Finance</td>
                              <td>Angul</td>
                              <td>12-04-2024</td>
                              <td className="u-icon">
                                 <button className="tableBtn v2">
                                  <span className="iconPrimary">
                                    <img
                                      width="15"
                                      height="15"
                                      alt="icon"
                                      src="/images/svg/eye-icon-blue.svg"
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
          </div>
        )}
      </div>
      {/* PIR Submitted by Section */}
      <div className="c-accordion overflow-hidden">
        <div className="c-accordion__head">
          <div className="c-accordion__head--title">PIR Submitted by</div>
          <button
            type="button"
            onClick={() => toggleSection("pirsubmit")}
            className="c-accordion__head--btn"
          >
            {openSections.pirsubmit ? (
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

        {openSections.pirsubmit && (
          <div className="filters">
            <div className="row form_grider d1">
              <div className="col-12 col-md-6 col-lg-6">
                <InputField
                  type="text"
                  label="Suraj Kumar Das"
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
            </div>
          </div>
        )}
      </div>

      <div className="actionWrapper ">
        <button className="iconBtn orange v2 " type="submit">
          <span>Preview</span>
          <img
            width="15"
            height="15"
            alt="icon"
            className="img-fluid u-image"
            src="/images/svg/eye-white.svg"
          />
        </button>
      </div>

      {/* Add Immediate Action Section */}
      <CustomModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
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
              <div className="row">
                <div className="col-12">
                  <div className="btnWrapper">
                    <button className="btnNoicon green">Apply</button>
                    <button className="btnNoicon red">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      </CustomModal>
     
    </form>
  );
};

export default MultiAccordionForm;
