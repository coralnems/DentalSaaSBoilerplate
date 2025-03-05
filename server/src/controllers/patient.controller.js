const BaseController = require('./base.controller');
const Patient = require('../models/Patient');

class PatientController extends BaseController {
  constructor() {
    super(Patient);
  }

  // Custom method to search patients by name or email
  async searchPatients(req) {
    try {
      const { query } = req.query;
      
      if (!query) {
        return await this.findAll(req);
      }

      const searchRegex = new RegExp(query, 'i');
      
      const patients = await this.model.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      });

      return {
        data: patients,
        pagination: {
          total: patients.length,
          page: 1,
          limit: patients.length,
          pages: 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get patient medical history
  async getMedicalHistory(req) {
    const patient = await this.model.findById(req.params.id);
    
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    return patient.medicalHistory;
  }

  // Update patient medical history
  async updateMedicalHistory(req) {
    const patient = await this.model.findById(req.params.id);
    
    if (!patient) {
      const error = new Error('Patient not found');
      error.statusCode = 404;
      throw error;
    }

    patient.medicalHistory = req.body.medicalHistory;
    await patient.save();

    return patient;
  }
}

module.exports = new PatientController(); 