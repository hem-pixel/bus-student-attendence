const getStudentStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      student: {
        name: 'Arun Vijay',
        registerNumber: '910021104001',
        assignedBus: 'BUS-05',
        stopName: 'Chromepet',
        currentBusStatus: 'EN_ROUTE',
        todayAttendance: 'NOT_YET_MARKED'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getStudentStatus
};
