const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { roleCheck } = require('../middleware/roleCheck.middleware');

// Protect all admin routes
router.use(verifyToken);
router.use(roleCheck(['ADMIN']));

// ==========================================
// Dashboard Summary
// ==========================================
router.get('/dashboard/summary', adminController.getDashboardSummary);

// ==========================================
// User Management Routes
// ==========================================
router.post('/users', adminController.createUser);
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/status', adminController.changeUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// ==========================================
// Bus Management Routes
// ==========================================
router.post('/buses', adminController.createBus);
router.get('/buses', adminController.listBuses);
router.get('/buses/:id', adminController.getBusById);
router.put('/buses/:id', adminController.updateBus);
router.patch('/buses/:id/status', adminController.changeBusStatus);
router.delete('/buses/:id', adminController.deleteBus);
router.put('/buses/:id/assign-driver', adminController.assignDriverToBus);
router.put('/buses/:id/assign-incharge', adminController.assignInchargeToBus);

// ==========================================
// Student Management Routes
// ==========================================
router.post('/students', adminController.createStudent);
router.get('/students', adminController.listStudents);
router.get('/students/count/summary', adminController.getStudentCountSummary);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id', adminController.updateStudent);
router.put('/students/:id/assign-bus', adminController.assignBusToStudent);
router.patch('/students/:id/status', adminController.changeStudentStatus);

// ==========================================
// Driver Management Routes
// ==========================================
router.post('/drivers', adminController.createDriver);
router.get('/drivers', adminController.listDrivers);
router.get('/drivers/:id', adminController.getDriverById);
router.put('/drivers/:id', adminController.updateDriver);
router.delete('/drivers/:id', adminController.deleteDriver);

// ==========================================
// Bus In-Charge Management Routes
// ==========================================
router.post('/bus-incharges', adminController.createBusIncharge);
router.get('/bus-incharges', adminController.listBusIncharges);
router.get('/bus-incharges/:id', adminController.getBusInchargeById);
router.put('/bus-incharges/:id', adminController.updateBusIncharge);
router.put('/bus-incharges/:id/assign-bus', adminController.assignBusToIncharge);
router.delete('/bus-incharges/:id', adminController.deleteBusIncharge);

module.exports = router;
