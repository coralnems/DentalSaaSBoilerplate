const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// GET /api/patients - Get all patients (admin, doctor, receptionist)
router.get(
  '/',
  authorizeRoles(['admin', 'doctor', 'receptionist']),
  async (req, res) => {
    try {
      const result = await patientController.findAll(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message,
      });
    }
  }
);

// GET /api/patients/search - Search patients (admin, doctor, receptionist)
router.get(
  '/search',
  authorizeRoles(['admin', 'doctor', 'receptionist']),
  async (req, res) => {
    try {
      const result = await patientController.searchPatients(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message,
      });
    }
  }
);

// GET /api/patients/:id - Get patient by ID (admin, doctor, receptionist, patient)
router.get(
  '/:id',
  authorizeRoles(['admin', 'doctor', 'receptionist', 'patient']),
  async (req, res) => {
    try {
      // If user is a patient, they can only access their own record
      if (req.user.role === 'patient' && req.params.id !== req.user.patientId) {
        return res.status(403).json({
          message: 'Access denied. Patients can only view their own records.',
        });
      }
      
      const result = await patientController.findOne(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message,
      });
    }
  }
);

// POST /api/patients - Create a new patient (admin, receptionist)
router.post(
  '/',
  authorizeRoles(['admin', 'receptionist']),
  async (req, res) => {
    try {
      const result = await patientController.create(req);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message,
      });
    }
  }
);

// PUT /api/patients/:id - Update a patient (admin, receptionist, patient)
router.put(
  '/:id',
  authorizeRoles(['admin', 'receptionist', 'patient']),
  async (req, res) => {
    try {
      // If user is a patient, they can only update their own record
      if (req.user.role === 'patient' && req.params.id !== req.user.patientId) {
        return res.status(403).json({
          message: 'Access denied. Patients can only update their own records.',
        });
      }
      
      const result = await patientController.update(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message,
      });
    }
  }
);

// DELETE /api/patients/:id - Delete a patient (admin only)
router.delete(
  '/:id',
  authorizeRoles(['admin']),
  async (req, res) => {
    try {
      const result = await patientController.delete(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message,
      });
    }
  }
);

// GET /api/patients/:id/medical-history - Get patient medical history
router.get(
  '/:id/medical-history',
  authorizeRoles(['admin', 'doctor', 'receptionist', 'patient']),
  async (req, res) => {
    try {
      // If user is a patient, they can only access their own medical history
      if (req.user.role === 'patient' && req.params.id !== req.user.patientId) {
        return res.status(403).json({
          message: 'Access denied. Patients can only view their own medical history.',
        });
      }
      
      const result = await patientController.getMedicalHistory(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message,
      });
    }
  }
);

// PUT /api/patients/:id/medical-history - Update patient medical history
router.put(
  '/:id/medical-history',
  authorizeRoles(['admin', 'doctor']),
  async (req, res) => {
    try {
      const result = await patientController.updateMedicalHistory(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({
        message: error.message,
      });
    }
  }
);

module.exports = router; 