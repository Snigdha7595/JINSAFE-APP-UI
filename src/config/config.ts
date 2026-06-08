export const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const APPIMAGES = {
  DASHBORD_ICON: `/images/svg/dashboard.svg`,
  SAFETY_INT_ICON: `/images/svg/saftey-intercation.svg`,
  SAFETY_OBS_ICON: `/images/svg/safety-observation.svg`,
  LINE_ICON: `/images/svg/line-walk.svg`,
  INCIDENT_ICON: `/images/svg/incident-management.svg`,
  CONTRACTOR_ICON: `/images/svg/contractor-field.svg`,
  BHIM_ICON: `/images/svg/bhim.svg`,
  PORTFOLIO_ICON: `/images/svg/my-portfolio.svg`,
  ADMIN_ICON: `/images/svg/userIcon.svg`
};

export const userRolesInfo = [
  {
    id: '2afc9acd-e474-4a9f-9670-8db9b6016a66',
    name: 'National Admin',
    role_code: 'NA',
    max_user_allow: 1,
  },
  {
    id: 'eb8aa96b-240d-44bb-a8fe-69422413b396',
    name: 'National Subdivision',
    role_code: 'N_SUBDIV',
    max_user_allow: 1,
  },
  {
    id: '33e7827d-4392-4097-ac63-f84cc93e3151',
    name: 'State/UT(s) Admin',
    role_code: 'SA',
    max_user_allow: 1,
  },
];

export const roleMapping: any = {
  NA: 'National Admin',
  N_SUBDIV: 'National Subdivision',
  SA: 'State/UT(s) Admin',
};


export const UNIT_OPTIONS = [
  { label: "Unit A", value: "unit_a" },
  { label: "Unit B", value: "unit_b" },
  { label: "Unit C", value: "unit_c" },
];

export const DEPARTMENT_OPTIONS = [
  { label: "HR", value: "hr" },
  { label: "Engineering", value: "engineering" },
  { label: "Logistics", value: "logistics" },
];

export const SECTION_OPTIONS = [
  { label: "Section 1", value: "section_1" },
  { label: "Section 2", value: "section_2" },
];

export const LOCATION_OPTIONS = [
  { label: "Building A", value: "building_a" },
  { label: "Building B", value: "building_b" },
];

export const LINE_MANAGER_OPTIONS = [
  { label: "Manager A", value: "manager_a" },
  { label: "Manager B", value: "manager_b" },
];

export const INCIDENT_CLASSIFICATION_OPTIONS = [
  { label: "Unsafe Act", value: "unsafe_act" },
  { label: "Unsafe Condition", value: "unsafe_condition" },
  { label: "Near Miss", value: "near_miss" },
  { label: "First Aid", value: "first_aid" },
  { label: "Medical Treatment", value: "medical_treatment" },
  { label: "Lost Time Injury", value: "lost_time_injury" },
  { label: "Fatality", value: "fatality" },
];

export const HIPO_CASE_OPTIONS = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export const INJURY_HAPPENED_OPTIONS = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export const INCIDENT_CATEGORY_OPTIONS = [
  { label: "Behavioral", value: "behavioral" },
  { label: "Environmental", value: "environmental" },
  { label: "Equipment", value: "equipment" },
  { label: "Process Safety", value: "process_safety" },
  { label: "Security", value: "security" },
  { label: "Others", value: "others" },
];

export const TIER_OPTIONS = [
  { label: "Tier 1", value: "tier_1" },
  { label: "Tier 2", value: "tier_2" },
  { label: "Tier 3", value: "tier_3" },
];

export const emptySelector = [{label: '', value: ''}]
export const yesNoSelector = [{ value: "Yes", label: "Yes" }, { value: "No", label: "No" }]
export const genderSelector = [{ value: "Male", label: "Male" }, { value: "Female", label: "Female" },{ value: "Others", label: "Others" }]