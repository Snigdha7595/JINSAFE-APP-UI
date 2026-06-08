export const API_URL = "";

export const getBaseUrl = () => {
   // Default tenant if not found
  //const companyId = localStorage.getItem("companyId") || "defaulttenant";
  //return `https://${companyId}-jinsafe-api.jindalgcc.com`;

   return process.env.NEXT_PUBLIC_BASE_URL;
};

export const getBucketUrl = () => {
   // Get tenant
  const companyId = localStorage.getItem("companyId") || "defaulttenant";
  let bucketUrl = "";
  switch(companyId)
  {
     case "jindalsteel":
        bucketUrl = "https://storage.googleapis.com/jinsafe-app-bucket";
        break;
     case "jindalpower":
        bucketUrl = "https://storage.googleapis.com/jinsafe-app-bucket-jpl";
        break;
  }
  return bucketUrl;

  // return process.env.NEXT_PUBLIC_BASE_URL;
};

export const GENERATE_OTP = `${getBaseUrl()}/api/jinsafeauth/auth/generate-otp`;
export const GOOGLE_LOGIN = `${getBaseUrl()}/api/jinsafeauth/auth/google-login`;
export const VALIDATE_OTP = `${getBaseUrl()}/api/jinsafeauth/auth/validate-otp`;
// Master API URLs
export const FETCH_UNITS = `${getBaseUrl()}/api/jinsafe-master/Unit`;
export const FETCH_ZONES = `${getBaseUrl()}/api/jinsafe-master/Zone`;
export const FETCH_COMMITTEES = `${getBaseUrl()}/api/jinsafe-master/Committee`;
export const FETCH_DEPARTMENTS = `${getBaseUrl()}/api/jinsafe-master/Department`;
export const FETCH_SECTIONS = `${getBaseUrl()}/api/jinsafe-master/Section`;
export const FETCH_LINEMANAGER = `${getBaseUrl()}/api/jinsafe-master/LineManager`;
export const FETCH_DSO = `${getBaseUrl()}/api/jinsafe-master/Dso`;
export const FETCH_SAFETY_INCHARGE = `${getBaseUrl()}/api/jinsafe-master/SafetyIncharge`;
export const FETCH_DESIGNATION = `${getBaseUrl()}/api/jinsafe-master/Designation`;
export const FETCH_OBSERVATION_TYPE = `${getBaseUrl()}/api/jinsafe-master/ObservationType`;
export const FETCH_OBSERVATION_CATEGORY = `${getBaseUrl()}/api/jinsafe-master/ObservationCategory`;
export const FETCH_RISK_POTENTIAL = `${getBaseUrl()}/api/jinsafe-master/Risk`;
export const FETCH_DETAILS_FROM_MAIL = `${getBaseUrl()}/api/jinsafe-master/User/SearchIndividual`;
//(Full API URL for below service available where API called from)
export const GET_PRELIMINARY_CLASSIFICATION = `${getBaseUrl()}/api/jinsafe-master/IncidentClassification`;
export const GET_INCIDENT_CATEGORY = `${getBaseUrl()}/api/jinsafe-master/IncidentCategory`;
export const GET_ALL_BODY_PARTS = `${getBaseUrl()}/api/jinsafe-master/BodyPart`;
export const GET_NATURE_OF_INJURIES = `${getBaseUrl()}/api/jinsafe-master/NatureOfInjury`;
export const SEARCH_INDIVIDUAL =    `${getBaseUrl()}/api/jinsafe-master/User/SearchIndividual`;
export const SAVE_DRAFT_PIR = `${getBaseUrl()}/api/jinsafeim/PIR`;
export const SAFETY_ALERT = `${getBaseUrl()}/api/jinsafeim/SafetyAlert`
export const INVESTIGATION = `${getBaseUrl()}/api/jinsafeim/Investigation`
export const LESSION_LEARNT = `${getBaseUrl()}/api/jinsafeim/LessonLearnt`
export const INCIDENT_RCA_FACTOR = `${getBaseUrl()}/api/jinsafe-master/IncidentRCAFactor`
export const INCIDENT_COST = `${getBaseUrl()}/api/jinsafe-master/IncidentCost`
export const HORIZONTAL_DEPLOYMENT = `${getBaseUrl()}/api/jinsafeim/Capa`

// User API URLs
export const LOGIN_EMP_DETAILS = `${getBaseUrl()}/api/jinsafeauth/user/me`;
export const GUEST_DETAILS = `${getBaseUrl()}/api/jinsafeauth/user/guest/me`;
export const FETCH_USER = `${getBaseUrl()}/api/jinsafe-master/User`;
// SI API URLs
export const FETCH_SI = `${getBaseUrl()}/api/jinsafeso/SI`;
export const FETCH_LW = `${getBaseUrl()}/api/jinsafeso/LW`;
export const FETCH_SO = `${getBaseUrl()}/api/jinsafeso/SO`;
// CSM API URLs
export const FETCH_CSFA = `${getBaseUrl()}/api/jinsafecsm/CSFA`;
export const FETCH_CSM = `${getBaseUrl()}/api/jinsafecsm`;
// SAFETY SCORE API URLs
export const FETCH_SAFETY_SCORE = `${getBaseUrl()}/api/jinsafesafetyscore/SafetyScoreBoard`;
// moc API URLs
export const SAVE_MOC_APPLICATION_FORM = `${getBaseUrl()}/api/jinsafemoc/MocApplication`;
export const FETCH_ALL_MOCS = `${getBaseUrl()}/api/jinsafemoc/MocApplication/get-mocs`;
export const FETCH_CHECKLIST_HEADERS = `${getBaseUrl()}/api/jinsafemoc/MocMaster/checkilsts-headers`;
export const FETCH_CHECKLIST_BODY = `${getBaseUrl()}/api/jinsafemoc/MocMaster/checkilsts-body-with-responsibility`;
export const FETCH_DRAFT_APPLICATION = `${getBaseUrl()}/api/jinsafemoc/MocApplication/get-draft`;
export const FETCH_MOC_DETAIL = `${getBaseUrl()}/api/jinsafemoc/MocApplication`;
export const FETCH_ALL_DRAFT_APPLICATION = `${getBaseUrl()}/api/jinsafemoc/MocApplication/get-drafts`;
export const REVIEW_MOC_APPLICATION = `${getBaseUrl()}/api/jinsafemoc/MocApplication/review`;
export const SEND_SECONDARY_ACTION = `${getBaseUrl()}/api/jinsafemoc/MocApplication/send-secondary-action`;
export const WITHDRAW_SECONDARY_ACTION = `${getBaseUrl()}/api/jinsafemoc/MocApplication/withdraw-secondary-action`;
export const REPLY_SECONDARY_ACTION = `${getBaseUrl()}/api/jinsafemoc/MocApplication/reply-secondary-action`;
export const REMOVE_DRAFT_MOC = `${getBaseUrl()}/api/jinsafemoc/MocApplication/remove-draft`;
//FILE STORAGE
export const UPLOAD_FILE = `${getBaseUrl()}/api/gcp-service/GcsStorage/upload`;
export const DELETE_FILE = `${getBaseUrl()}/api/gcp-service/GcsStorage/delete`;
export const DOWNLOAD_FILE = `${getBaseUrl()}/api/gcp-service/GcsStorage/download`;
export const BUCKET_URL = `${getBucketUrl()}`;
//REPORT
export const FETCH_REPORT = `${getBaseUrl()}/api/jinsafeso/Report`;
export const FETCH_REPORT_IM = `${getBaseUrl()}/api/jinsafeim/Report`;
//Tracker master
export const SOURCE_MASTER = `${getBaseUrl()}/api/jinsafegrt/SourceMaster/get-sources`;
export const RECOMMENDATION_TYPE_MASTER = `${getBaseUrl()}/api/jinsafegrt/RecommendationTypeMaster/get-recommendation-types`;
export const INJURY_POTENTIAL_MASTER =  `${getBaseUrl()}/api/jinsafegrt/InjuryPotentialMaster/get-injury-potentials`;
export const CONSEQUENCE_TYPE_MASTER =  `${getBaseUrl()}/api/jinsafegrt/ConsequenceTypeMaster/get-consequence-types`;
export const RECOMMENDATION_TRACKER_MASTER = `${getBaseUrl()}/api/jinsafegrt`;
// Recommendation Tracker API URLs
export const RECOMMENDATION_TRACKER = `${getBaseUrl()}/api/jinsafegrt/RecommendationTransaction`;
export const RECOMMENDATION_HISTORY = `${getBaseUrl()}/api/jinsafegrt/RecommendationTransactionLogs/transaction-history`;
