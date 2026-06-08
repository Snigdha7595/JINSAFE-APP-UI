import dayjs from 'dayjs';

interface UnitDataInterface {
  unitId: string;
  departmentId: string;
  sectionId: string;
  exactLocation: string;
  incidentDate: string;
  incidentTime: string;
  departmentHod: string;
  lineManager: string;
}

interface FormikInitialValues {
  unitId: string;
  departmentId: string;
  sectionId: string;
  exactLocation: string;
  incidentDate: Date | null;
  incidentTime: Date | null;
  departmentHod: string;
  lineManager: string;
}

export function prepareInitialValues(unitData: UnitDataInterface): FormikInitialValues {
  const {
    unitId = '',
    departmentId = '',
    sectionId = '',
    exactLocation = '',
    incidentDate = '',
    incidentTime = '',
    departmentHod = '',
    lineManager = '',
  } = unitData || {};

  const parsedIncidentTime =
    incidentTime && dayjs(incidentTime, 'HH:mm', true).isValid()
      ? dayjs(incidentTime, 'HH:mm', true).toDate()
      : null;

  const parsedIncidentDate =
    incidentDate && dayjs(incidentDate, 'YYYY-MM-DD', true).isValid()
      ? dayjs(incidentDate, 'YYYY-MM-DD', true).toDate()
      : null;

  return {
    unitId,
    departmentId,
    sectionId,
    exactLocation,
    incidentDate: parsedIncidentDate,
    incidentTime: parsedIncidentTime,
    departmentHod,
    lineManager,
  };
}
