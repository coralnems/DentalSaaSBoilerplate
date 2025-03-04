const express = require('express');
const router = express.Router();
const { auth } = require('./middleware');
const checkPermission = require('../middleware/checkPermission');
const analytics = require('../services/analytics');

// Get appointment statistics
router.get('/appointments', auth, checkPermission('view_reports'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await analytics.getAppointmentStats(startDate, endDate);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get treatment statistics
router.get('/treatments', auth, checkPermission('view_reports'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await analytics.getTreatmentStats(startDate, endDate);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get patient demographics
router.get('/demographics', auth, checkPermission('view_reports'), async (req, res) => {
  try {
    const demographics = await analytics.getPatientDemographics();
    res.json(demographics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get revenue analysis
router.get('/revenue', auth, checkPermission('view_reports'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analysis = await analytics.getRevenueAnalysis(startDate, endDate);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get scheduling efficiency
router.get('/efficiency', auth, checkPermission('view_reports'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const efficiency = await analytics.getSchedulingEfficiency(startDate, endDate);
    res.json(efficiency);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 