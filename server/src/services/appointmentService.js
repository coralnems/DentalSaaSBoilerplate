const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const redis = require('../utils/redis');
const { NotFoundError, BadRequestError } = require('../utils/errors');

// Redis cache keys and TTL
const REDIS_KEYS = {
  ALL_APPOINTMENTS: 'appointments:all',
  APPOINTMENT_DETAIL: (id) => `appointment:${id}`,
  PATIENT_APPOINTMENTS: (patientId) => `appointments:patient:${patientId}`,
  DENTIST_APPOINTMENTS: (dentistId) => `appointments:dentist:${dentistId}`,
};

const CACHE_TTL = {
  ALL_APPOINTMENTS: 300, // 5 minutes
  APPOINTMENT_DETAIL: 600, // 10 minutes
  PATIENT_APPOINTMENTS: 300, // 5 minutes
  DENTIST_APPOINTMENTS: 300, // 5 minutes
};

/**
 * Service for handling appointment-related operations
 */
class AppointmentService {
  /**
   * Get all appointments with optional filtering
   * @param {Object} filters - Query filters
   * @returns {Promise<Array>} - List of appointments
   */
  async getAllAppointments(filters = {}) {
    try {
      // Try to get from cache first
      const cacheKey = REDIS_KEYS.ALL_APPOINTMENTS;
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        console.log('Retrieved appointments from cache');
        const appointments = JSON.parse(cachedData);
        
        // Apply filters if any
        if (Object.keys(filters).length > 0) {
          return this.filterAppointments(appointments, filters);
        }
        
        return appointments;
      }
      
      // Not found in cache, get from database
      let query = Appointment.find();
      
      // Apply filters to query
      if (filters.startDate) {
        query = query.where('startTime').gte(new Date(filters.startDate));
      }
      
      if (filters.endDate) {
        query = query.where('endTime').lte(new Date(filters.endDate));
      }
      
      if (filters.patientId) {
        query = query.where('patient', filters.patientId);
      }
      
      if (filters.dentistId) {
        query = query.where('dentist', filters.dentistId);
      }
      
      if (filters.status) {
        query = query.where('status', filters.status);
      }
      
      // Populate related fields
      query = query.populate({
        path: 'patient',
        select: 'firstName lastName email phone',
      }).populate({
        path: 'dentist',
        select: 'firstName lastName email',
      });
      
      const appointments = await query.exec();
      
      // Process appointments to include full names
      const processedAppointments = appointments.map(appointment => {
        const appointmentObj = appointment.toObject();
        
        // Add patient and dentist names for easier display
        if (appointmentObj.patient) {
          appointmentObj.patientName = `${appointmentObj.patient.firstName} ${appointmentObj.patient.lastName}`;
          appointmentObj.patientId = appointmentObj.patient._id;
        }
        
        if (appointmentObj.dentist) {
          appointmentObj.dentistName = `${appointmentObj.dentist.firstName} ${appointmentObj.dentist.lastName}`;
          appointmentObj.dentistId = appointmentObj.dentist._id;
        }
        
        return appointmentObj;
      });
      
      // Cache the processed results
      await redis.set(
        cacheKey,
        JSON.stringify(processedAppointments),
        'EX',
        CACHE_TTL.ALL_APPOINTMENTS
      );
      
      return processedAppointments;
    } catch (error) {
      console.error('Error in getAllAppointments:', error);
      throw error;
    }
  }
  
  /**
   * Filter cached appointments based on query parameters
   * @param {Array} appointments - Cached appointments
   * @param {Object} filters - Query filters
   * @returns {Array} - Filtered appointments
   */
  filterAppointments(appointments, filters) {
    return appointments.filter(appointment => {
      let match = true;
      
      if (filters.startDate) {
        match = match && new Date(appointment.startTime) >= new Date(filters.startDate);
      }
      
      if (filters.endDate) {
        match = match && new Date(appointment.endTime) <= new Date(filters.endDate);
      }
      
      if (filters.patientId) {
        match = match && appointment.patientId.toString() === filters.patientId;
      }
      
      if (filters.dentistId) {
        match = match && appointment.dentistId.toString() === filters.dentistId;
      }
      
      if (filters.status) {
        match = match && appointment.status === filters.status;
      }
      
      return match;
    });
  }
  
  /**
   * Get a specific appointment by ID
   * @param {string} id - Appointment ID
   * @returns {Promise<Object>} - Appointment details
   */
  async getAppointmentById(id) {
    try {
      // Try to get from cache first
      const cacheKey = REDIS_KEYS.APPOINTMENT_DETAIL(id);
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        console.log('Retrieved appointment from cache');
        return JSON.parse(cachedData);
      }
      
      // Not found in cache, get from database
      const appointment = await Appointment.findById(id)
        .populate({
          path: 'patient',
          select: 'firstName lastName email phone',
        })
        .populate({
          path: 'dentist',
          select: 'firstName lastName email',
        });
      
      if (!appointment) {
        throw new NotFoundError('Appointment not found');
      }
      
      const appointmentObj = appointment.toObject();
      
      // Add patient and dentist names
      if (appointmentObj.patient) {
        appointmentObj.patientName = `${appointmentObj.patient.firstName} ${appointmentObj.patient.lastName}`;
        appointmentObj.patientId = appointmentObj.patient._id;
      }
      
      if (appointmentObj.dentist) {
        appointmentObj.dentistName = `${appointmentObj.dentist.firstName} ${appointmentObj.dentist.lastName}`;
        appointmentObj.dentistId = appointmentObj.dentist._id;
      }
      
      // Cache the processed result
      await redis.set(
        cacheKey,
        JSON.stringify(appointmentObj),
        'EX',
        CACHE_TTL.APPOINTMENT_DETAIL
      );
      
      return appointmentObj;
    } catch (error) {
      console.error('Error in getAppointmentById:', error);
      throw error;
    }
  }
  
  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} - Created appointment
   */
  async createAppointment(appointmentData) {
    try {
      // Validate that patient and dentist exist
      const patient = await Patient.findById(appointmentData.patientId);
      if (!patient) {
        throw new NotFoundError('Patient not found');
      }
      
      const dentist = await User.findById(appointmentData.dentistId);
      if (!dentist || dentist.role !== 'dentist') {
        throw new NotFoundError('Dentist not found');
      }
      
      // Check for appointment conflicts
      const conflictingAppointment = await Appointment.findOne({
        dentist: appointmentData.dentistId,
        $or: [
          {
            startTime: { $lt: appointmentData.endTime },
            endTime: { $gt: appointmentData.startTime }
          }
        ],
        _id: { $ne: appointmentData._id } // Skip the current appointment in case of update
      });
      
      if (conflictingAppointment) {
        throw new BadRequestError('There is already an appointment scheduled for this time slot');
      }
      
      // Create the appointment
      const appointment = new Appointment({
        patient: appointmentData.patientId,
        dentist: appointmentData.dentistId,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        status: appointmentData.status || 'scheduled',
        type: appointmentData.type,
        notes: appointmentData.notes
      });
      
      const savedAppointment = await appointment.save();
      
      // Invalidate relevant cache entries
      await this.invalidateAppointmentCache(savedAppointment._id, savedAppointment.patient, savedAppointment.dentist);
      
      return savedAppointment;
    } catch (error) {
      console.error('Error in createAppointment:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing appointment
   * @param {string} id - Appointment ID
   * @param {Object} updateData - Updated appointment data
   * @returns {Promise<Object>} - Updated appointment
   */
  async updateAppointment(id, updateData) {
    try {
      // Get the original appointment for cache invalidation
      const originalAppointment = await Appointment.findById(id);
      if (!originalAppointment) {
        throw new NotFoundError('Appointment not found');
      }
      
      // Check for appointment conflicts if time is changed
      if (updateData.startTime || updateData.endTime) {
        const startTime = updateData.startTime || originalAppointment.startTime;
        const endTime = updateData.endTime || originalAppointment.endTime;
        const dentistId = updateData.dentistId || originalAppointment.dentist;
        
        const conflictingAppointment = await Appointment.findOne({
          dentist: dentistId,
          $or: [
            {
              startTime: { $lt: endTime },
              endTime: { $gt: startTime }
            }
          ],
          _id: { $ne: id } // Skip the current appointment
        });
        
        if (conflictingAppointment) {
          throw new BadRequestError('There is already an appointment scheduled for this time slot');
        }
      }
      
      // Update the appointment
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      if (!updatedAppointment) {
        throw new NotFoundError('Appointment not found');
      }
      
      // Invalidate relevant cache entries
      const patientId = updateData.patientId || originalAppointment.patient;
      const dentistId = updateData.dentistId || originalAppointment.dentist;
      await this.invalidateAppointmentCache(id, patientId, dentistId);
      
      // If patient or dentist changed, also invalidate the old caches
      if (updateData.patientId && originalAppointment.patient.toString() !== updateData.patientId) {
        await redis.del(REDIS_KEYS.PATIENT_APPOINTMENTS(originalAppointment.patient));
      }
      
      if (updateData.dentistId && originalAppointment.dentist.toString() !== updateData.dentistId) {
        await redis.del(REDIS_KEYS.DENTIST_APPOINTMENTS(originalAppointment.dentist));
      }
      
      return updatedAppointment;
    } catch (error) {
      console.error('Error in updateAppointment:', error);
      throw error;
    }
  }
  
  /**
   * Delete an appointment
   * @param {string} id - Appointment ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteAppointment(id) {
    try {
      // Get the appointment for cache invalidation
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        throw new NotFoundError('Appointment not found');
      }
      
      // Delete the appointment
      await Appointment.findByIdAndDelete(id);
      
      // Invalidate cache
      await this.invalidateAppointmentCache(id, appointment.patient, appointment.dentist);
      
      return true;
    } catch (error) {
      console.error('Error in deleteAppointment:', error);
      throw error;
    }
  }
  
  /**
   * Invalidate cache entries related to an appointment
   * @param {string} appointmentId - Appointment ID
   * @param {string} patientId - Patient ID
   * @param {string} dentistId - Dentist ID
   */
  async invalidateAppointmentCache(appointmentId, patientId, dentistId) {
    try {
      // Delete specific caches
      const cacheKeys = [
        REDIS_KEYS.ALL_APPOINTMENTS,
        REDIS_KEYS.APPOINTMENT_DETAIL(appointmentId),
        REDIS_KEYS.PATIENT_APPOINTMENTS(patientId),
        REDIS_KEYS.DENTIST_APPOINTMENTS(dentistId)
      ];
      
      await Promise.all(cacheKeys.map(key => redis.del(key)));
      console.log('Appointment cache invalidated');
    } catch (error) {
      console.error('Error invalidating appointment cache:', error);
      // Don't throw - cache invalidation shouldn't fail the operation
    }
  }
  
  /**
   * Get appointments for a specific patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} - List of patient appointments
   */
  async getPatientAppointments(patientId) {
    try {
      // Try to get from cache first
      const cacheKey = REDIS_KEYS.PATIENT_APPOINTMENTS(patientId);
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData) {
        console.log('Retrieved patient appointments from cache');
        return JSON.parse(cachedData);
      }
      
      // Not found in cache, get from database
      const appointments = await Appointment.find({ patient: patientId })
        .populate({
          path: 'dentist',
          select: 'firstName lastName email',
        })
        .sort({ startTime: 1 });
      
      // Process appointments to include full names
      const processedAppointments = appointments.map(appointment => {
        const appointmentObj = appointment.toObject();
        
        // Add dentist name
        if (appointmentObj.dentist) {
          appointmentObj.dentistName = `${appointmentObj.dentist.firstName} ${appointmentObj.dentist.lastName}`;
          appointmentObj.dentistId = appointmentObj.dentist._id;
        }
        
        return appointmentObj;
      });
      
      // Cache the processed results
      await redis.set(
        cacheKey,
        JSON.stringify(processedAppointments),
        'EX',
        CACHE_TTL.PATIENT_APPOINTMENTS
      );
      
      return processedAppointments;
    } catch (error) {
      console.error('Error in getPatientAppointments:', error);
      throw error;
    }
  }
  
  /**
   * Get appointments for a specific dentist
   * @param {string} dentistId - Dentist ID
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} - List of dentist appointments
   */
  async getDentistAppointments(dentistId, filters = {}) {
    try {
      // Try to get from cache first
      const cacheKey = REDIS_KEYS.DENTIST_APPOINTMENTS(dentistId);
      const cachedData = await redis.get(cacheKey);
      
      if (cachedData && Object.keys(filters).length === 0) {
        console.log('Retrieved dentist appointments from cache');
        return JSON.parse(cachedData);
      }
      
      // Not found in cache, get from database
      let query = Appointment.find({ dentist: dentistId });
      
      // Apply filters
      if (filters.date) {
        const date = new Date(filters.date);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        
        query = query.where('startTime').gte(startOfDay).lte(endOfDay);
      }
      
      if (filters.status) {
        query = query.where('status', filters.status);
      }
      
      query = query.populate({
        path: 'patient',
        select: 'firstName lastName email phone',
      }).sort({ startTime: 1 });
      
      const appointments = await query.exec();
      
      // Process appointments to include patient names
      const processedAppointments = appointments.map(appointment => {
        const appointmentObj = appointment.toObject();
        
        // Add patient name
        if (appointmentObj.patient) {
          appointmentObj.patientName = `${appointmentObj.patient.firstName} ${appointmentObj.patient.lastName}`;
          appointmentObj.patientId = appointmentObj.patient._id;
        }
        
        return appointmentObj;
      });
      
      // Only cache if no filters are applied
      if (Object.keys(filters).length === 0) {
        await redis.set(
          cacheKey,
          JSON.stringify(processedAppointments),
          'EX',
          CACHE_TTL.DENTIST_APPOINTMENTS
        );
      }
      
      return processedAppointments;
    } catch (error) {
      console.error('Error in getDentistAppointments:', error);
      throw error;
    }
  }
}

module.exports = new AppointmentService(); 