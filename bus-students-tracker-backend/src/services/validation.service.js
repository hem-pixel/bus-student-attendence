const { ROLES, BUS_STATUS, GENDER, ATTENDANCE_STATUS, ALERT_STATUS } = require('../config/constants');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

const validatePassword = (password) => {
  // Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(String(password));
};

const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(String(phone).replace(/\D/g, ''));
};

const validateRole = (role) => {
  return Object.values(ROLES).includes(role);
};

const validateBusStatus = (status) => {
  return Object.values(BUS_STATUS).includes(status);
};

const validateGender = (gender) => {
  return Object.values(GENDER).includes(gender);
};

const validateAttendanceStatus = (status) => {
  return Object.values(ATTENDANCE_STATUS).includes(status);
};

const validateAlertStatus = (status) => {
  return Object.values(ALERT_STATUS).includes(status);
};

const validateCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lon)) return false;
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateRole,
  validateBusStatus,
  validateGender,
  validateAttendanceStatus,
  validateAlertStatus,
  validateCoordinates
};
