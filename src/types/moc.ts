export type TMocUnits = {
  createdat: string;
  lwObservation: string;
  rowIndex: number;
  siObservation: string;
  status: string;
  statusImage: string;
  unitid: number;
  unitname: string;
  updatedat: string;
}


export type TMocDepartments = {
  createdAt: string;
  departmentid: number;
  departmentname: string;
  hod: string;
  hodEmail: string;
  jsplid: string;
  lwUpdatedAt: string;
  monthlyScheduleCfsa: number;
  monthlyScheduleLw: number;
  monthlyScheduleSi: number;
  rowIndex: number;
  siUpdatedAt: string;
  status: string;
  statusImage: string;
  unitid: number;
  updatedAt: string;
  weeklyScheduleLw: number;
  weeklyScheduleSi: number;
}

export type TMocSections = {
  departmentid: number;
  id: number;
  rowIndex: number;
  sectionid: string;
  sectionname: string;
  status: string;
  statusImage: string;
  unitid: number;
}


export interface Attachment {
  fileName: string | null;
  fileId: string | null;
  fileSize: number | undefined;
  mimeType: string | null;
}

export interface MocChecklistFormBody {
  id: number;
  headerShtCode: string;
  sortRowNo: number;
  itemNo: number;
  subItemNo: string;
  description: string;
  createdById: string | null;
  createdByMail: string | null;
  createdByName: string | null;
  updatedById: string | null;
  updatedByMail: string | null;
  updatedByName: string | null;
  status: string;
  remarks: string;
  attachments: Attachment[];
}

export interface MocChecklistFormHeader {
  headerShtCode: string;
  headerName: string;
  createdById: string | null;
  createdByMail: string | null;
  createdByName: string | null;
  updatedById: string | null;
  updatedByMail: string | null;
  updatedByName: string | null;
  checklistStatus?: string;
  checklistPrimaryPendingAtId: string | null;
  checklistPrimaryPendingAtMail: string | null;
  checklistPrimaryPendingAtName: string | null
  mocChecklistsFormBodies: MocChecklistFormBody[];
  allHeaders?: boolean;
}

interface MocChangeCategory {
  slNo: number;
  changeCategory: string;
  status: string;
  identificationName: string;
  createdDate?: string | null;
  updatedDate?: string | null;
  createdById?: string | null;
  createdByMail?: string | null;
  createdByName?: string | null;
  updatedById?: string | null;
  updatedByMail?: string | null;
  updatedByName?: string | null;
}

export interface FormValues {
  objectId?: string | null;
  id?: number | null;
  docNo?: string | null;
  revNo?: number | null;
  revDate?: Date | null;
  mocAfNo?: string | null;
  mocAfStatusModifiedDate?: Date | null;
  mocAfStatusModifiedById?: string | null;
  mocAfStatusModifiedByMail?: string | null;
  mocAfStatusModifiedByName?: string | null;
  date?: Date | null;
  createdDate?: Date;
  title: string | null;
  unitId: number | undefined;
  unitName: string | null;
  departmentId: number | undefined;
  departmentName: string | null;
  sectionId: number | undefined;
  sectionName: string | null;
  departmentHodId: string | null;
  departmentHodEmail: string | null;
  departmentHodName: string | null;
  sectionHeadId: string | null;
  sectionHeadMail: string | null;
  sectionHeadName: string | null;
  descriptionPresent: string | null;
  descriptionProposed: string | null;
  typeOfChange: "Temporary" | "Permanent" | string;
  applicableForDays: number;
  applicableTillDate: string | null;
  reasonForChange: string | null;
  typeOfExpenditure: "Capex" | "Opex";
  amount: number;
  currency: "INR" | "USD";
  changeRequirePlantModification: string | null;
  changeRequirePlantModificationDetails: string | null;
  subsequentAffectedChange: string | null;
  subsequentAffectedChangeDetails: string | null;
  createdById: string | null;
  createdByMail: string | null;
  createdByName: string | null;
  updatedById: string | null;
  updatedByMail: string | null;
  updatedByName: string | null;
  mocAfPrimaryPendingAtId?: string | null;
  mocAfPrimaryPendingAtMail?: string | null;
  mocAfPrimaryPendingAtName?: string | null;
  mocAfPrimaryPendingFor?: string | null;
  mocAfStatus?: string;
  mocReviewStages?: [];
  mocChangeCategories: MocChangeCategory[];
  mocChecklistsFormHeaders: MocChecklistFormHeader[];
}

interface filterMoc {
  fromDate: string,
  toDate: string,
  mocAfNo: string | null,
  unitId: string | null,
  departmentId: string | null,
  createdBy: string,
  pendingAt: string | null,
  orderByColumn: string | null,
  orderByDirection: string | null
}

export interface Mocs {
  filter: filterMoc;
  mocs: FormValues[]
}

export type TMocRequest = {
  id: number;
  docNo: string;
  revNo: number;
  revDate: string;
  mocAfNo: string;
  title: string;
  createdDate: string;
  updatedDate: string;
  unitId: number;
  unitName: string;
  departmentId: number;
  departmentName: string;
  sectionId: number;
  sectionName: string;
  departmentHodId: string;
  departmentHodEmail: string;
  departmentHodName: string;
  sectionHeadId: string;
  sectionHeadMail: string;
  sectionHeadName: string;
  descriptionPresent: string;
  descriptionProposed: string;
  typeOfChange: string;
  applicableForDays: number;
  applicableTillDate: string;
  reasonForChange: string;
  typeOfExpenditure: string;
  amount: number;
  currency: string;
  changeRequirePlantModification: string;
  changeRequirePlantModificationDetails: string;
  subsequentAffectedChange: string;
  subsequentAffectedChangeDetails: string;
  isDeleted: boolean;
  createdById: string;
  createdByMail: string;
  createdByName: string;
  updatedById: string;
  updatedByMail: string;
  updatedByName: string;
  mocAfPrimaryPendingAtId: string;
  mocAfPrimaryPendingAtMail: string;
  mocAfPrimaryPendingAtName: string;
  mocAfPrimaryPendingFor: string;
  mocAfStatus: string;
  mocReviewStages: TMocReviewStage[];
  mocChangeCategories: TMocChangeCategory[];
  mocChecklistsFormHeaders: TMocChecklistFormHeader[];
  // Add a helper field to store the current stage for easy access
  currentStage?: string;
};

export type TMocReviewStage = {
  id: number;
  mocAfNo: string;
  stageType: string;
  isPrimaryAction: boolean;
  reviewFlowType: string;
  reviewFlowStatus: string;
  initiatedDate: string;
  initiatedFromId: string;
  initiatedFromMail: string;
  initiatedFromName: string;
  isActionPending: boolean;
  isCurrentAction: boolean;
  responsiblePersonId: string;
  responsiblePersonMail: string;
  responsiblePersonName: string;
  currentAction: string;
  nextAction: string;
  isDeleted: boolean;
  attachments: any[];
  initiatedFromRemarks: string;
  actionDate: string | null;
  isSecondaryActionWithdrawn: boolean | null;
  secondaryActionRepliedFor: number | null;
};

export type TMocChangeCategory = {
  id: number;
  mocAfNo: string;
  slNo: number;
  changeCategory: string;
  status: string;
  identificationName: string;
  identificationDescription: string;
  createdDate: string;
  updatedDate: string;
  createdById: string;
  createdByMail: string;
  createdByName: string;
  updatedById: string;
  updatedByMail: string;
  updatedByName: string;
};

export type TMocChecklistFormHeader = {
  id: number;
  mocAfNo: string;
  headerShtCode: string;
  headerName: string;
  createdDate: string;
  updatedDate: string;
  isDeleted: boolean;
  createdById: string;
  createdByMail: string;
  createdByName: string;
  updatedById: string;
  updatedByMail: string;
  updatedByName: string;
  checklistPrimaryPendingAtId: string;
  checklistPrimaryPendingAtMail: string;
  checklistPrimaryPendingAtName: string;
  mocChecklistsFormBodies: any[];
};
