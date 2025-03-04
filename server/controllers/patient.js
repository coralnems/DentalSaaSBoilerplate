const Patient = require('../models/Patient');
const { AppError } = require('../middleware/errorHandler');
const { createAuditLog } = require('../utils/auditLogger');

// Get all patients with pagination and filtering
exports.getPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { tenantId: req.user.tenantId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Get patients with pagination
    const patients = await Patient.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ lastName: 1, firstName: 1 });

    // Get total count for pagination
    const total = await Patient.countDocuments(filter);

    res.json({
      patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    throw new AppError('Failed to fetch patients', 500);
  }
};

// Get single patient by ID
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    res.json(patient);
  } catch (error) {
    throw new AppError('Failed to fetch patient', 500);
  }
};

// Create new patient
exports.createPatient = async (req, res) => {
  try {
    const patientData = {
      ...req.body,
      tenantId: req.user.tenantId,
      createdBy: req.user._id
    };

    const patient = await Patient.create(patientData);

    await createAuditLog({
      userId: req.user._id,
      action: 'PATIENT_CREATED',
      resource: 'patient',
      resourceId: patient._id,
      details: `Created patient: ${patient.firstName} ${patient.lastName}`,
      tenantId: req.user.tenantId
    });

    res.status(201).json(patient);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('A patient with this email already exists', 400);
    }
    throw new AppError('Failed to create patient', 500);
  }
};

// Update patient
exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'PATIENT_UPDATED',
      resource: 'patient',
      resourceId: patient._id,
      details: `Updated patient: ${patient.firstName} ${patient.lastName}`,
      tenantId: req.user.tenantId
    });

    res.json(patient);
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('A patient with this email already exists', 400);
    }
    throw new AppError('Failed to update patient', 500);
  }
};

// Delete patient (soft delete by setting status to archived)
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      { status: 'archived' },
      { new: true }
    );

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'PATIENT_ARCHIVED',
      resource: 'patient',
      resourceId: patient._id,
      details: `Archived patient: ${patient.firstName} ${patient.lastName}`,
      tenantId: req.user.tenantId
    });

    res.json({ message: 'Patient archived successfully' });
  } catch (error) {
    throw new AppError('Failed to archive patient', 500);
  }
};

// Add medical history
exports.addMedicalHistory = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      {
        $push: {
          'medicalHistory.conditions': req.body.condition,
          'medicalHistory.medications': req.body.medication,
          'medicalHistory.surgeries': req.body.surgery,
          'medicalHistory.allergies': req.body.allergy
        }
      },
      { new: true }
    );

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'MEDICAL_HISTORY_UPDATED',
      resource: 'patient',
      resourceId: patient._id,
      details: 'Updated medical history',
      tenantId: req.user.tenantId
    });

    res.json(patient);
  } catch (error) {
    throw new AppError('Failed to update medical history', 500);
  }
};

// Add note
exports.addNote = async (req, res) => {
  try {
    const note = {
      content: req.body.content,
      createdBy: req.user._id
    };

    const patient = await Patient.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      { $push: { notes: note } },
      { new: true }
    );

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'NOTE_ADDED',
      resource: 'patient',
      resourceId: patient._id,
      details: 'Added new note',
      tenantId: req.user.tenantId
    });

    res.json(patient);
  } catch (error) {
    throw new AppError('Failed to add note', 500);
  }
};

// Update insurance information
exports.updateInsurance = async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      { insurance: req.body },
      { new: true }
    );

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    await createAuditLog({
      userId: req.user._id,
      action: 'INSURANCE_UPDATED',
      resource: 'patient',
      resourceId: patient._id,
      details: 'Updated insurance information',
      tenantId: req.user.tenantId
    });

    res.json(patient);
  } catch (error) {
    throw new AppError('Failed to update insurance information', 500);
  }
}; 