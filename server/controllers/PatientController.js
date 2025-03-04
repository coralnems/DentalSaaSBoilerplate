const BaseController = require('./BaseController');
const Patient = require('../models/Patient');
const { AppError } = require('../middleware/errorHandler');

class PatientController extends BaseController {
  constructor() {
    super(Patient, 'patient');
  }

  // Override findAll to add patient-specific search fields
  async findAll(req) {
    // Add searchable fields for patients
    this.model.schema.obj.searchableFields = [
      'firstName',
      'lastName',
      'contact.email',
      'contact.phone',
      'insurance.policyNumber'
    ];
    return super.findAll(req);
  }

  // Get patient medical history
  async getMedicalHistory(req) {
    const patient = await this.model.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    return {
      allergies: patient.medicalHistory.allergies,
      medications: patient.medicalHistory.medications,
      conditions: patient.medicalHistory.conditions,
      surgeries: patient.medicalHistory.surgeries,
      familyHistory: patient.medicalHistory.familyHistory
    };
  }

  // Update patient medical history
  async updateMedicalHistory(req) {
    const patient = await this.model.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      {
        $set: {
          'medicalHistory': req.body
        }
      },
      { new: true }
    );

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    return patient;
  }

  // Get patient dental history
  async getDentalHistory(req) {
    const patient = await this.model.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    return patient.dentalHistory;
  }

  // Update patient dental history
  async updateDentalHistory(req) {
    const patient = await this.model.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      {
        $set: {
          'dentalHistory': req.body
        }
      },
      { new: true }
    );

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    return patient;
  }

  // Add document to patient records
  async addDocument(req) {
    const patient = await this.model.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      {
        $push: {
          documents: {
            ...req.body,
            uploadedBy: req.user._id,
            uploadedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    return patient.documents[patient.documents.length - 1];
  }

  // Remove document from patient records
  async removeDocument(req) {
    const patient = await this.model.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId,
        'documents._id': req.params.documentId
      },
      {
        $pull: {
          documents: { _id: req.params.documentId }
        }
      },
      { new: true }
    );

    if (!patient) {
      throw new AppError('Patient or document not found', 404);
    }

    return { message: 'Document removed successfully' };
  }

  // Get patients by insurance provider
  async getByInsuranceProvider(req) {
    const patients = await this.model.find({
      tenantId: req.user.tenantId,
      'insurance.provider': req.params.provider
    });

    return patients;
  }

  // Update patient insurance information
  async updateInsurance(req) {
    const patient = await this.model.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    await patient.updateInsurance(req.body);
    return patient;
  }

  // Add note to patient records
  async addNote(req) {
    const patient = await this.model.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      {
        $push: {
          notes: {
            ...req.body,
            createdBy: req.user._id,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    return patient.notes[patient.notes.length - 1];
  }

  // Get patient statistics
  async getStatistics(req) {
    const stats = await this.model.aggregate([
      {
        $match: { tenantId: req.user.tenantId }
      },
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          activePatients: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactivePatients: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          archivedPatients: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          }
        }
      }
    ]);

    return stats[0] || {
      totalPatients: 0,
      activePatients: 0,
      inactivePatients: 0,
      archivedPatients: 0
    };
  }
}

module.exports = new PatientController(); 