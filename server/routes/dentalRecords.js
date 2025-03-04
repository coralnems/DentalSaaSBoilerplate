const express = require('express');
const router = express.Router();
const { auth } = require('./middleware');
const DentalRecord = require('../models/DentalRecord');
const Treatment = require('../models/Treatment');

// Get dental record for a patient
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    const dentalRecord = await DentalRecord.findOne({ patient: req.params.patientId })
      .populate('treatments');
    
    if (!dentalRecord) {
      return res.status(404).json({ message: 'Dental record not found' });
    }
    
    res.json(dentalRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update dental chart
router.patch('/chart/:patientId', auth, async (req, res) => {
  try {
    const dentalRecord = await DentalRecord.findOne({ patient: req.params.patientId });
    if (!dentalRecord) {
      return res.status(404).json({ message: 'Dental record not found' });
    }

    // Update teeth conditions
    if (req.body.teeth) {
      dentalRecord.dentalChart.teeth = req.body.teeth.map(tooth => ({
        ...tooth,
        lastUpdated: new Date()
      }));
    }

    if (req.body.lastFullExam) {
      dentalRecord.dentalChart.lastFullExam = req.body.lastFullExam;
    }

    const updatedRecord = await dentalRecord.save();
    res.json(updatedRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add X-ray record
router.post('/xray/:patientId', auth, async (req, res) => {
  try {
    const dentalRecord = await DentalRecord.findOne({ patient: req.params.patientId });
    if (!dentalRecord) {
      return res.status(404).json({ message: 'Dental record not found' });
    }

    dentalRecord.xrays.push({
      type: req.body.type,
      date: new Date(),
      imageUrl: req.body.imageUrl,
      notes: req.body.notes,
      takenBy: req.body.takenBy
    });

    const updatedRecord = await dentalRecord.save();
    res.status(201).json(updatedRecord.xrays[updatedRecord.xrays.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update periodontal chart
router.patch('/periodontal/:patientId', auth, async (req, res) => {
  try {
    const dentalRecord = await DentalRecord.findOne({ patient: req.params.patientId });
    if (!dentalRecord) {
      return res.status(404).json({ message: 'Dental record not found' });
    }

    if (req.body.pocketDepths) {
      dentalRecord.periodontalChart.pocketDepths.push({
        date: new Date(),
        measurements: req.body.pocketDepths,
        notes: req.body.notes
      });
    }

    if (req.body.bleedingPoints) {
      dentalRecord.periodontalChart.bleedingPoints.push({
        date: new Date(),
        points: req.body.bleedingPoints
      });
    }

    const updatedRecord = await dentalRecord.save();
    res.json(updatedRecord.periodontalChart);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add treatment record
router.post('/treatment/:patientId', auth, async (req, res) => {
  try {
    const dentalRecord = await DentalRecord.findOne({ patient: req.params.patientId });
    if (!dentalRecord) {
      return res.status(404).json({ message: 'Dental record not found' });
    }

    const treatment = new Treatment({
      patient: req.params.patientId,
      appointment: req.body.appointment,
      type: req.body.type,
      teeth: req.body.teeth,
      diagnosis: req.body.diagnosis,
      procedure: req.body.procedure,
      materials: req.body.materials,
      cost: req.body.cost,
      notes: req.body.notes,
      attachments: req.body.attachments,
      status: req.body.status || 'Planned'
    });

    const newTreatment = await treatment.save();
    dentalRecord.treatments.push(newTreatment._id);
    await dentalRecord.save();

    res.status(201).json(newTreatment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add medical alert
router.post('/alert/:patientId', auth, async (req, res) => {
  try {
    const dentalRecord = await DentalRecord.findOne({ patient: req.params.patientId });
    if (!dentalRecord) {
      return res.status(404).json({ message: 'Dental record not found' });
    }

    dentalRecord.medicalAlerts.push({
      type: req.body.type,
      priority: req.body.priority,
      notes: req.body.notes,
      date: new Date()
    });

    const updatedRecord = await dentalRecord.save();
    res.status(201).json(updatedRecord.medicalAlerts[updatedRecord.medicalAlerts.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add clinical note
router.post('/note/:patientId', auth, async (req, res) => {
  try {
    const dentalRecord = await DentalRecord.findOne({ patient: req.params.patientId });
    if (!dentalRecord) {
      return res.status(404).json({ message: 'Dental record not found' });
    }

    dentalRecord.notes.push({
      content: req.body.content,
      author: req.body.author
    });

    const updatedRecord = await dentalRecord.save();
    res.status(201).json(updatedRecord.notes[updatedRecord.notes.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router; 