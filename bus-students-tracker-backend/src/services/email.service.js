// Optional email notifications service
const sendAlertEmail = async ({ to, subject, message }) => {
  try {
    // In production, integrate with SendGrid, Resend, or AWS SES
    console.log(`📧 [Email Service] Sending to: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, error: error.message };
  }
};

const sendAttendanceAlert = async (parentEmail, studentName, status, busNumber) => {
  return sendAlertEmail({
    to: parentEmail,
    subject: `Bus Attendance Update: ${studentName}`,
    message: `Your ward ${studentName} was marked ${status} on bus ${busNumber}.`
  });
};

module.exports = {
  sendAlertEmail,
  sendAttendanceAlert
};
