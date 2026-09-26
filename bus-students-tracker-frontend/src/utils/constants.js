export const ROLES = {
  ADMIN: 'ADMIN',
  BUS_INCHARGE: 'BUS_INCHARGE',
  STUDENT: 'STUDENT'
};

export const BUS_STATUS = {
  WORKING: 'WORKING',
  NOT_WORKING: 'NOT_WORKING'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT'
};

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  import.meta.env.REACT_APP_API_URL || 
  'http://localhost:5000/api';
