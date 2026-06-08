import { useFormik } from "formik";
import { useState, useEffect } from "react";
import * as Yup from 'yup';
import InputField from "@/components/Form/InputField";
import SelectField from "@/components/Form/SelectFields";
import DatePickerField from "@/components/Form/DatePickerField";
import Image from "next/image";
import { serverRequest } from "@/services/getServerSideRender";
import { FETCH_DEPARTMENTS, INVESTIGATION, SEARCH_INDIVIDUAL } from "@/config/apiConfig";
import { APP_URL, CONSTANTS } from "@/config/constant";
import { useDispatch, useSelector } from "react-redux";
import { selectUserToken } from "@/store/slices/authSlice";
import { SelectOptions } from "@/components/interfaces";
import { emptySelector } from "@/config/config";
import { RootState } from "@/store/store";
import CustomModal from "@/components/Layouts/CustomModal";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { setPirId } from "@/store/slices/pirSlice";

type TeamMember = {
  id?: number;
  email: string;
  name: string;
  designation: string;
  department: string;
  imTrained: boolean;
  memberRole: string;
  designationName: string;
  departmentName: string;
  tlMemJsplid: string;
  unitId: string;
  departmentId: string;
  sectionId: string;
  designationId: string;
  rowIndex: number;
  isLead: boolean;

};

const teamMemberSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  designation: Yup.string()
    .required('Designation is required'),
  department: Yup.string()
    .required('Department is required'),
  imTrained: Yup.boolean()  // Add this line
    .required('IM Training status is required')
});

const investigationTeamSchema = Yup.object().shape({
  teamMembers: Yup.array()
    .of(teamMemberSchema)
    .min(1, 'At least one team member is required')
    .test(
      'has-trained-member',
      'At least one team member must be IM trained',
      (members: TeamMember[] | undefined) => members?.some(member => member.imTrained) || false
    )
});

const InvestigationTeamAccordion = ({ pirData, setPirData }: any) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const pirId = useSelector((state: RootState) => state.pir.pirId);
    const { user } = useSelector(
      (state: RootState) => state.auth as { user: any }
    );
  const token = useSelector(selectUserToken);
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  const [openSections, setOpenSections] = useState({
    unitdetails: true,
    incidentdetails: false,
    injurysection: false,
  });

  const [departmentOptions, setDepartmentOptions] = useState<SelectOptions[]>(emptySelector);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [memberDetail, setMemberDetail] = useState<any>(null);
  const [isFirstSubmission, setIsFirstSubmission] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

const handleSubmitTeamMembers = async () => {
  try {
    setIsSubmitting(true);
    setSubmitError(null);
    
    const payload = formik.values.teamMembers.map(member => ({
      id: member.id || 0,
      pirId: pirId,
      name: member.name,
      email: member.email,
      designationName: member.designation,
      departmentName: member.department,
      memberRole: member.isLead ? "Lead" : "Member",      
      trainingStatus: member.imTrained ? "Yes" : "No",
      tlMemJsplid: member.tlMemJsplid,
      unitId: member.unitId,
      departmentId: member.departmentId,
      sectionId: member.sectionId,
      designationId: member.designationId,
      createdBy: user.createdBy,
      updatedBy: user.updatedBy,
      unitName: pirData.unitName,
      rowIndex: member.rowIndex,
    }));

    const response = await serverRequest(
      payload,
      INVESTIGATION + `/save-investigation-team-members/${pirId}`,
      CONSTANTS.REQUEST_POST,
      true,
      true,
      token
    );

    if (response.success) {
      toast.success('Team members saved successfully!', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setSubmitSuccess(true);
      setPirData(prev => ({ ...prev, teamMembers: formik.values.teamMembers }));
      setShowPreviewModal(false);
      dispatch(setPirId(pirId))
      router.push(APP_URL.INCIDENT_DETAIL)
    } else {
      toast.error(response.message || "Failed to save team members", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setSubmitError(response.message || "Failed to save team members");
    }
  } catch (error) {
    toast.error(`${error}`, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    setSubmitError("An error occurred while saving the team");
  } finally {
    setIsSubmitting(false);
  }
};

  // Formik setup
  const formik = useFormik({
    initialValues: {
  teamMembers: [] as TeamMember[], 
      currentMember: {
        email: '',
        name: '',
        designation: '',
        tlMemJsplid: '',
        department: null as SelectOptions | null,
        imTrained: false,
        isLead: false,
      },
      incidentId: pirData?.pirId || '',
      incidentClassification: pirData?.incidentClassification || '',
      incidentCategory: pirData?.incidentCategory || '',
      incidentDate: pirData?.incidentDate ? new Date(pirData.incidentDate) : new Date(),
      location: pirData?.exactLocation || '',
    },
    validationSchema: investigationTeamSchema,
    onSubmit: handleSubmitTeamMembers,
    enableReinitialize: true,
  });

  const addTeamMember = () => {
  if (!formik.values.currentMember.department) return;

  // Check if this is the first team member being added
  const isFirstMember = formik.values.teamMembers.length === 0;
  const nextRowIndex = formik.values.teamMembers.length > 0 
    ? Math.max(...formik.values.teamMembers.map(m => m.rowIndex)) + 1 
    : 1;

  const newMember = {
    id: 0,
    email: formik.values.currentMember.email,
    name: formik.values.currentMember.name,
    designation: formik.values.currentMember.designation,
    department: formik.values.currentMember.department.label,
    imTrained: formik.values.currentMember.imTrained,
    memberRole: formik.values.currentMember.isLead ? "Lead" : "Member",
    isLead: formik.values.currentMember.isLead,    designationName: formik.values.currentMember.designation,
    departmentName: formik.values.currentMember.department.label,
    tlMemJsplid: formik.values.currentMember.tlMemJsplid,
    unitId: pirData?.unitId || "",
    departmentId: formik.values.currentMember.department.value.toString(),
    sectionId: pirData?.sectionId,
    designationId: pirData?.designationId,
    createdBy: user?.createdBy || '',
    updatedBy: user?.updatedBy || '',
    createdAt: new Date().toISOString(),
    rowIndex: nextRowIndex
  };

  formik.setFieldValue('teamMembers', [...formik.values.teamMembers, newMember]);
  formik.setFieldValue('currentMember', {
    email: '',
    name: '',
    designation: '',
    department: null,
    imTrained: false,
    isLead: false,
    tlMemJsplid: ''
  });
};

  const removeTeamMember = (index: number) => {
    const updatedMembers = [...formik.values.teamMembers];
    updatedMembers.splice(index, 1);
    formik.setFieldValue('teamMembers', updatedMembers);
  };
  
  const fetchDepartments = async (id: string | number) => {
    try {
      const response = await serverRequest(
        {},
        FETCH_DEPARTMENTS + `/get-departments/${id}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      if (response.length > 0) {
        const options = response.map((dept: any) => ({ value: dept?.departmentid, label: dept?.departmentname }));
        setDepartmentOptions(options);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

 const fetchMemberDetail = async (email: string) => {
  try {
    const response = await serverRequest(
      {},
      SEARCH_INDIVIDUAL + `/email/${email}`,
      CONSTANTS.REQUEST_GET,
      true,
      true,
      token
    );
    
    if (response) {
      const memberData = response;
      formik.setFieldValue('currentMember.name', memberData.empName || '');
      formik.setFieldValue('currentMember.designation', memberData.empDesignation || '');
      formik.setFieldValue('currentMember.tlMemJsplid', memberData.jsplid)

      const departmentOption = departmentOptions.find(
        option => option.label === memberData.empDepartment
      );
      
      formik.setFieldValue('currentMember.department', departmentOption || null);
      formik.setFieldValue('currentMember.imTrained', memberData.imTrainedStatus || false);

    }
  } catch (error) {
    console.error("Error fetching member detail:", error);
    formik.setFieldValue('currentMember.name', '');
    formik.setFieldValue('currentMember.designation', '');
    formik.setFieldValue('currentMember.department', null);
    formik.setFieldValue('currentMember.imTrained', false);
  }
};


  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    if (pirData?.unitId) {
      fetchDepartments(pirData.unitId);
    }
  }, [pirData?.unitId]);



 useEffect(() => {
  const email = formik.values.currentMember.email;
  
  if (email) {
    const timer = setTimeout(() => {
      fetchMemberDetail(email);
    }, 2000); 
    
    return () => clearTimeout(timer);
  } else {
    if (!email) {
      formik.setFieldValue('currentMember.name', '');
      formik.setFieldValue('currentMember.designation', '');
      formik.setFieldValue('currentMember.department', null);
      formik.setFieldValue('currentMember.imTrained', false);
    }
  }
}, [formik.values.currentMember.email]);

const fetchTeamMembers = async () => {
  try {
    if (pirId) {
      const response = await serverRequest(
        {},
        INVESTIGATION + `/get-investigation-team-members/${pirId}`,
        CONSTANTS.REQUEST_GET,
        true,
        true,
        token
      );
      
      const apiData = response;

      if (apiData?.length > 0) {
        const mappedMembers = apiData.map((member: any, index: number) => {
          return {
            id: member.id || index + 1,
            email: member.email || member.memberEmail,
            name: member.name || member.memberName,
            designation: member.designationName || member.designation || member.memberDesignation,
            department: member.departmentName || member.department || member.memberDepartment,
            imTrained: member.trainingStatus === "Yes" || member.imTrained || member.isTrained,
            memberRole: member.memberRole || member.role,
            isLead: member.memberRole === "Lead" || member.isLead,
            designationName: member.designationName || member.designation || member.designation,
            departmentName: member.departmentName || member.department,
            tlMemJsplid: member.tlMemJsplid || member.jsplId,
            unitId: member.unitId,
            departmentId: member.departmentId,
            sectionId: member.sectionId,
            designationId: member.designationId || member.designationID,
            rowIndex: member.rowIndex || index + 1
          };
        });

        formik.setFieldValue('teamMembers', mappedMembers);
      } else {
        formik.setFieldValue('teamMembers', []);
      }
    }
  } catch (error) {
    console.error("Error fetching team members:", error);
  }
};

useEffect(() => {
  if (pirId && token) {
    fetchTeamMembers();
  }
}, [pirId, token]);


  const togglePreviewModal = () => {
    setShowPreviewModal(!showPreviewModal);
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* PIR Details Section */}
        <div className="c-accordion"><div className="c-accordion__head">
          <div className="c-accordion__head--title">PIR Details</div>
          <button
            type="button"
            onClick={() => toggleSection("unitdetails")}
            className="c-accordion__head--btn"
          >
            {openSections.unitdetails ? (
              <Image
                width={20}
                height={20}
                alt="icon"
                src="/images/svg/up-arrow.svg"
                className="img-fluid u-image"
              />
            ) : (
              <Image
                width={20}
                height={20}
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
                  value={formik.values.incidentId}
                  onBlur={() => {}}
                  name="incidentId"
                  placeholder="IM001503"
                  errors={""}
                  touched={""}
                  onChange={formik.handleChange}
                  maxLength={30}
                  disabled={true} 
                />
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                 <InputField
                  type="text"
                  label="Incident Classification"
                  value={formik.values.incidentClassification}
                  onBlur={() => {}}
                  name="incidentClassification"
                  placeholder="Lost Time Case...."
                  errors={""}
                  touched={""}
                  onChange={formik.handleChange}
                  maxLength={30}
                  disabled={true} 
                />
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                 <InputField
                  type="text"
                  label="Incident Category"
                  value={formik.values.incidentCategory}
                  name="incidentCategory"
                  placeholder="Manual Tasks Tools"
                  onBlur={() => {}}
                  errors={""}
                  touched={""}
                  onChange={formik.handleChange}
                  maxLength={30}
                  disabled={true} 
                />
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                <div className="dateFlield">
                   <DatePickerField
                    label="Date of Incident"
                    name="incidentDate"
                    value = {formik.values.incidentDate}
                    placeholder="choose a date"
                    maxDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    onChange={() => {}}
                    disabled={true} 
                  />
                </div>
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                <InputField
                  type="text"
                  label="Exact Location"
                  value={formik.values.location}
                  name="location"
                  placeholder="xyz"
                  errors={""}
                  touched={""}
                  onBlur={() => {}}
                  onChange={formik.handleChange}
                  maxLength={30}
                  disabled={true} 
                />
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Incident Details Section */}
        <div className="c-accordion overflow-hidden">
 <div className="c-accordion__head">
          <div className="c-accordion__head--title">Investigation Team</div>
          <button
            type="button"
            onClick={() => toggleSection("incidentdetails")}
            className="c-accordion__head--btn"
          >
            {openSections.incidentdetails ? (
              <Image
                width={20}
                height={20}
                alt="icon"
                src="/images/svg/up-arrow.svg"
                className="img-fluid u-image"
              />
            ) : (
              <Image
                width={20}
                height={20}
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
              {/* Inline form for adding team members */}
              <div className="col-12 col-md-3 col-lg-3 pe-0">
                <InputField
                    type="email"
                    label="Email ID"
                    name="currentMember.email"
                    value={formik.values.currentMember.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}

                    placeholder="Enter email"
                    errors={formik.errors.currentMember?.email}
                    touched={formik.touched.currentMember?.email}
                  />
              </div>
              <div className="col-12 col-md-2 col-lg-2 pe-0">
                <InputField
                    type="text"
                    label="Name"
                    disabled={true}
                    name="currentMember.name"
                    value={formik.values.currentMember.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter name"
                    errors={formik.errors.currentMember?.name}
                    touched={formik.touched.currentMember?.name}
                  />
              </div>
              <div className="col-12 col-md-2 col-lg-2 pe-0">
                <InputField
                    type="text"
                    label="Designation"
                    disabled={true}
                    name="currentMember.designation"
                    value={formik.values.currentMember.designation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter designation"
                    errors={formik.errors.currentMember?.designation}
                    touched={formik.touched.currentMember?.designation}
                  />
              </div>
              <div className="col-12 col-md-3 col-lg-3 pe-0">
                  <SelectField
                    label="Department"
                    name="currentMember.department"
                    value={formik.values.currentMember.department}
                    disabled={true}
                    options={departmentOptions}
                    onChange={(value) => formik.setFieldValue('currentMember.department', value)}
                    onBlur={formik.handleBlur}
                    placeholder="Select Department"
                    errors={formik.errors.currentMember?.department as string}
                    touched={!!formik.touched.currentMember?.department}
                  />
              </div>
              <div className="col-12 col-md-2 col-lg-2 d-flex align-items-end ps-1">
                <div className="form-check">
                  <input
                      className="form-check-input"
                      type="checkbox"
                      name="currentMember.imTrained"
                      checked={formik.values.currentMember.imTrained}
                      onChange={formik.handleChange}
                      id="imTrainedCheck"
                      disabled={true}
                    />
                  <label className="form-check-label" htmlFor="imTrainedCheck">
                    IM Trained
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="currentMember.isLead"
                    checked={formik.values.currentMember.isLead}
                    onChange={formik.handleChange}
                    id="isLeadCheck"
                    disabled={formik.values.teamMembers.some(member => member.memberRole === "Lead")}
                  />
                  <label className="form-check-label" htmlFor="isLeadCheck">
                    Is Team Lead
                  </label>
                </div>
                <button
                    type="button"
                    className="iconBtn green v2"
                    onClick={addTeamMember}
                   
                  >
                    <Image width={15} height={15} alt="Add" src="/images/svg/plus.svg" className="img-fluid u-image" />
                  </button>
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
                            <th>Designation</th>
                            <th>Department</th>
                            <th>IM Trained</th>
                            <th>Role</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formik.values.teamMembers.length > 0 ? (
                            formik.values.teamMembers.map((member: any, index: number) => (
                              <tr key={index}>
                                <td>{member.email}</td>
                                <td>{member.name}</td>
                                <td>{member.designation}</td>
                                <td>{member.department}</td>
                                <td>{member.imTrained ? "Yes" : "No"}</td>
                                <td>{member.memberRole}</td>
                                <td className="u-icon">
                                  <button
                                    type="button"
                                    className="tableBtn v2"
                                    onClick={() => removeTeamMember(index)}
                                  >
                                    <span className="iconSecondary">
                                      <Image
                                        width={15}
                                        height={15}
                                        alt="Delete"
                                        src="/images/svg/delete-icon.svg"
                                        className="img-fluid u-image"
                                      />
                                    </span>
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="text-center">
                                No Data Found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      {formik.errors.teamMembers && typeof formik.errors.teamMembers === 'string' && (
                        <div className="alert alert-danger mt-2">
                          {formik.errors.teamMembers}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
          
        </div>

        {/* Note section and submit button */}
        <div className="filters mb-4">
          <div className="row form_grider d1">
            <div className="col-12 col-md-6 col-lg-6">
              Note: At least one user should be trained in incident investigation
            </div>
           
          </div>
          
        </div>
        <div className="actionWrapper">
                <button className="iconBtn orange v2" type="button" title={!(formik.values.teamMembers.some(m => m.memberRole === 'Lead') && 
                      formik.values.teamMembers.some(m => m.memberRole === 'Member'))? 'Atleast One team Lead and one team Member is required': ''} disabled={
                    !(formik.values.teamMembers.some(m => m.memberRole === 'Lead') && 
                      formik.values.teamMembers.some(m => m.memberRole === 'Member'))
                  } onClick={togglePreviewModal}>
                  <span>Preview Team</span>
                  <Image
                    width={15}
                    height={15}
                    alt="Preview"
                    className="img-fluid u-image"
                    src="/images/svg/eye-white.svg"
                  />
                </button>
              </div>
      </form>


      <CustomModal 
  isOpen={showPreviewModal} 
  onClose={togglePreviewModal}
  title="Preview Investigation Details"
  backdrop={true}
>
  <div className="preview-content">
    <div className="preview-section mb-4">
      <div className="c-accordion__head"><div className="c-accordion__head--title">PIR Details</div></div>
      <h4 className="mb-3"></h4>
      <div className="row form_grider d1">
        <div className="col-12 col-md-6 col-lg-6">
          <InputField
            type="text"
            label="Incident ID"
            placeholder=""
            value={formik.values.incidentId}
            name="previewIncidentId"
            onBlur={() => {}}
            onChange={formik.handleChange}
            disabled={true}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <InputField
            type="text"
            label="Incident Classification"
            placeholder=""
            value={formik.values.incidentClassification}
            name="previewIncidentClassification"
            onBlur={() => {}}
            onChange={formik.handleChange}
            disabled={true}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <InputField
            type="text"
            label="Incident Category"
            placeholder=""
            value={formik.values.incidentCategory}
            onChange={formik.handleChange}
            onBlur={() => {}}
            name="previewIncidentCategory"
            disabled={true}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <InputField
            type="text"
            label="Date of Incident"
            placeholder=""
            value={formik.values.incidentDate.toLocaleDateString()}
            onChange={formik.handleChange}
            onBlur={() => {}}
            name="previewIncidentDate"
            disabled={true}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <InputField
            type="text"
            label="Exact Location"
            placeholder=""
            value={formik.values.location}
            onChange={formik.handleChange}
            onBlur={() => {}}
            name="previewLocation"
            disabled={true}
          />
        </div>
      </div>
    </div>

    <div className="preview-section">
    <div className="c-accordion__head"><div className ="c-accordion__head--title">Investigation Team</div></div>
      {formik.values.teamMembers.length > 0 ? (
        <div className="formTable">
          <div className="formTable__table">
            <div className="admin-table d3 table-responsive mt-3 noHover">
              <table className="table">
                <thead>
                  <tr>
                    <th>Email ID</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Department</th>
                    <th>IM Trained</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody >
                  {formik.values.teamMembers.map((member: any, index: number) => (
                    <tr key={index}>
                      <td>
                        <input 
                          type="text" 
                          className="form-control-plaintext" 
                          value={member.email} 
                          readOnly 
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-control-plaintext" 
                          value={member.name} 
                          readOnly 
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-control-plaintext" 
                          value={member.designation} 
                          readOnly 
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-control-plaintext" 
                          value={member.department} 
                          readOnly 
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          className="form-control-plaintext" 
                          value={member.imTrained ? "Yes" : "No"} 
                          readOnly 
                        />
                      </td>
                       <td>
                        <input 
                          type="text" 
                          className="form-control-plaintext" 
                          value={member.memberRole} 
                          readOnly 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <p>No Data Found</p>
      )}
    </div>
     <div className="d-flex">
    <button
      className="iconBtn orange v2"
      type="button"
      onClick={togglePreviewModal}
    >
      <span>Back</span>
    </button>
    <button
      className="iconBtn green v2"
      type="button"
      onClick={() => {
        if (!formik.values.teamMembers.some(m => m.imTrained)) {
          toast.error('At least one team member must be IM trained', {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }
        handleSubmitTeamMembers();
      }}
      disabled={isSubmitting || !formik.values.teamMembers.some(m => m.imTrained)}
    >
      <span>Save</span>
    </button>
  </div>
  </div>
</CustomModal>
    </>
  );
};

export default InvestigationTeamAccordion;
