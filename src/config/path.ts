import { APP_URL } from './constant';

export const userRedirects: { [key: string]: string } = {
  ADMIN: APP_URL.DASHBOARD, //APP_URL.ADMIN_DASHBOARD,
  GUEST: APP_URL.DASHBOARD,
  USER: APP_URL.USER
};

export const roleRestrictions: any = {
  ADMIN: [
    // APP_URL.DASHBOARD,
    // APP_URL.SAFETY_SI,
    // APP_URL.SAFETY_LW,
    // APP_URL.SAFETY_SO,
    // APP_URL.INCIDENT_MANAGEMENT,
    // APP_URL.CONTRACTOR,
    // APP_URL.BHM,
    // APP_URL.MOC_DASHBOARD,
    // APP_URL.MY_PORTFOLIO
  ],
  GUEST: [

  ],
  USER: [
    APP_URL.ADMIN_DASHBOARD
  ]
};