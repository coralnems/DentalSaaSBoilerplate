const User = require('../models/User');
const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');
const { httpResponder } = require('../utils/httpResponse');
const BaseController = require('./base.controller');

class UserController extends BaseController {
  constructor() {
    super(User);
  }

  async getProfile(req) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return httpResponder.notFound('User not found');
      }

      let profileData = { ...user.toObject() };

      // Get role-specific data
      if (user.role === 'doctor') {
        const doctorProfile = await Doctor.findOne({ userId });
        if (doctorProfile) {
          profileData = { ...profileData, ...doctorProfile.toObject() };
        }
      } else if (user.role === 'patient') {
        const patientProfile = await Patient.findOne({ userId });
        if (patientProfile) {
          profileData = { ...profileData, ...patientProfile.toObject() };
        }
      } else if (user.role === 'receptionist') {
        const receptionistProfile = await Receptionist.findOne({ userId });
        if (receptionistProfile) {
          profileData = { ...profileData, ...receptionistProfile.toObject() };
        }
      }

      return httpResponder.success(profileData);
    } catch (error) {
      console.error('Error in getProfile:', error);
      return httpResponder.serverError('Error retrieving user profile');
    }
  }

  async updateProfile(req) {
    try {
      const userId = req.user.id;
      const updates = req.body;
      
      // Fields that are allowed to be updated
      const allowedUpdates = ['firstName', 'lastName', 'email', 'phone', 'address'];
      
      // Filter out any fields that are not allowed to be updated
      const filteredUpdates = {};
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });
      
      // Update the user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        filteredUpdates,
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!updatedUser) {
        return httpResponder.notFound('User not found');
      }
      
      return httpResponder.success(updatedUser);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return httpResponder.serverError('Error updating user profile');
    }
  }

  async updatePassword(req) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return httpResponder.badRequest('Current password and new password are required');
      }
      
      // Get the user
      const user = await User.findById(userId);
      if (!user) {
        return httpResponder.notFound('User not found');
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return httpResponder.unauthorized('Current password is incorrect');
      }
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update the password
      user.password = hashedPassword;
      await user.save();
      
      return httpResponder.success({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error in updatePassword:', error);
      return httpResponder.serverError('Error updating password');
    }
  }

  async updatePreferences(req) {
    try {
      const userId = req.user.id;
      const { preferences } = req.body;
      const user = await User.findById(userId);
      
      if (!user) {
        return httpResponder.notFound('User not found');
      }
      
      // Update user preferences based on role
      if (user.role === 'admin') {
        // Update admin preferences
        // This would normally update a separate AdminPreferences model
        return httpResponder.success({ message: 'Admin preferences updated' });
      } else if (user.role === 'doctor') {
        // Update doctor preferences
        const doctor = await Doctor.findOne({ userId });
        if (!doctor) {
          return httpResponder.notFound('Doctor profile not found');
        }
        
        doctor.preferences = { ...doctor.preferences, ...preferences };
        await doctor.save();
        return httpResponder.success({ message: 'Doctor preferences updated' });
      } else if (user.role === 'receptionist') {
        // Update receptionist preferences
        const receptionist = await Receptionist.findOne({ userId });
        if (!receptionist) {
          return httpResponder.notFound('Receptionist profile not found');
        }
        
        receptionist.preferences = { ...receptionist.preferences, ...preferences };
        await receptionist.save();
        return httpResponder.success({ message: 'Receptionist preferences updated' });
      } else if (user.role === 'patient') {
        // Update patient preferences
        const patient = await Patient.findOne({ userId });
        if (!patient) {
          return httpResponder.notFound('Patient profile not found');
        }
        
        patient.preferences = { ...patient.preferences, ...preferences };
        await patient.save();
        return httpResponder.success({ message: 'Patient preferences updated' });
      }
      
      return httpResponder.badRequest('Invalid user role');
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      return httpResponder.serverError('Error updating preferences');
    }
  }

  async getPreferences(req) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return httpResponder.notFound('User not found');
      }
      
      let preferences = {};
      
      // Get preferences based on role
      if (user.role === 'admin') {
        // Get admin preferences
        // This would normally come from a separate AdminPreferences model
        preferences = { /* default admin preferences */ };
      } else if (user.role === 'doctor') {
        // Get doctor preferences
        const doctor = await Doctor.findOne({ userId });
        if (doctor) {
          preferences = doctor.preferences || {};
        }
      } else if (user.role === 'receptionist') {
        // Get receptionist preferences
        const receptionist = await Receptionist.findOne({ userId });
        if (receptionist) {
          preferences = receptionist.preferences || {};
        }
      } else if (user.role === 'patient') {
        // Get patient preferences
        const patient = await Patient.findOne({ userId });
        if (patient) {
          preferences = patient.preferences || {};
        }
      }
      
      return httpResponder.success(preferences);
    } catch (error) {
      console.error('Error in getPreferences:', error);
      return httpResponder.serverError('Error retrieving preferences');
    }
  }

  async getAllUsers(req) {
    try {
      // Only admin can access this
      if (req.user.role !== 'admin') {
        return httpResponder.forbidden('Not authorized to access this resource');
      }
      
      const { page = 1, limit = 10, role } = req.query;
      
      // Build query
      const query = {};
      if (role) {
        query.role = role;
      }
      
      // Get users
      const users = await User.find(query)
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });
      
      // Get total documents
      const total = await User.countDocuments(query);
      
      return httpResponder.success({
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return httpResponder.serverError('Error retrieving users');
    }
  }
}

module.exports = new UserController(); 