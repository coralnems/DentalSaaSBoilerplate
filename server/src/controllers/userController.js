const User = require('../models/User');
const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');
const { httpResponder } = require('../utils/httpResponse');

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
function getProfile(req, res) {
  try {
    const userId = req.user.id;
    
    return User.findById(userId).select('-password')
      .then(function(user) {
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        return res.status(200).json({
          success: true,
          data: user
        });
      })
      .catch(function(error) {
        console.error('Get profile error:', error.message);
        return res.status(500).json({ message: 'Server error' });
      });
  } catch (error) {
    console.error('Get profile error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
function updateProfile(req) {
  return new Promise(function(resolve, reject) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email, phone } = req.body;
      
      // Build update object
      const updateFields = {};
      if (firstName) updateFields.firstName = firstName;
      if (lastName) updateFields.lastName = lastName;
      if (email) updateFields.email = email;
      if (phone) updateFields.phone = phone;
      
      // Update user
      User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('-password')
        .then(function(user) {
          if (!user) {
            return resolve({
              statusCode: 404,
              message: 'User not found'
            });
          }
          
          resolve({
            statusCode: 200,
            success: true,
            data: user
          });
        })
        .catch(function(error) {
          console.error('Update profile error:', error.message);
          reject({
            statusCode: 500,
            message: 'Server error'
          });
        });
    } catch (error) {
      console.error('Update profile error:', error.message);
      reject({
        statusCode: 500,
        message: 'Server error'
      });
    }
  });
}

/**
 * Update user password
 * @route PUT /api/users/password
 * @access Private
 */
function updatePassword(req) {
  return new Promise(function(resolve, reject) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return resolve({
          statusCode: 400,
          message: 'Please provide current and new password'
        });
      }
      
      // Get user with password
      User.findById(userId)
        .then(function(user) {
          if (!user) {
            return resolve({
              statusCode: 404,
              message: 'User not found'
            });
          }
          
          // Check if current password is correct
          return user.comparePassword(currentPassword)
            .then(function(isMatch) {
              if (!isMatch) {
                return resolve({
                  statusCode: 401,
                  message: 'Current password is incorrect'
                });
              }
              
              // Hash new password
              return bcrypt.genSalt(10)
                .then(function(salt) {
                  return bcrypt.hash(newPassword, salt);
                })
                .then(function(hashedPassword) {
                  user.password = hashedPassword;
                  return user.save();
                })
                .then(function() {
                  resolve({
                    statusCode: 200,
                    success: true,
                    message: 'Password updated successfully'
                  });
                });
            });
        })
        .catch(function(error) {
          console.error('Update password error:', error.message);
          reject({
            statusCode: 500,
            message: 'Server error'
          });
        });
    } catch (error) {
      console.error('Update password error:', error.message);
      reject({
        statusCode: 500,
        message: 'Server error'
      });
    }
  });
}

/**
 * Get all users
 * @route GET /api/users
 * @access Private/Admin
 */
function getAllUsers(req) {
  return new Promise(function(resolve, reject) {
    try {
      User.find().select('-password')
        .then(function(users) {
          resolve({
            statusCode: 200,
            success: true,
            count: users.length,
            data: users
          });
        })
        .catch(function(error) {
          console.error('Get all users error:', error.message);
          reject({
            statusCode: 500,
            message: 'Server error'
          });
        });
    } catch (error) {
      console.error('Get all users error:', error.message);
      reject({
        statusCode: 500,
        message: 'Server error'
      });
    }
  });
}

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private/Admin
 */
function getUserById(req) {
  return new Promise(function(resolve, reject) {
    try {
      User.findById(req.params.id).select('-password')
        .then(function(user) {
          if (!user) {
            return resolve({
              statusCode: 404,
              message: 'User not found'
            });
          }
          
          resolve({
            statusCode: 200,
            success: true,
            data: user
          });
        })
        .catch(function(error) {
          console.error('Get user by ID error:', error.message);
          reject({
            statusCode: 500,
            message: 'Server error'
          });
        });
    } catch (error) {
      console.error('Get user by ID error:', error.message);
      reject({
        statusCode: 500,
        message: 'Server error'
      });
    }
  });
}

/**
 * Update user
 * @route PUT /api/users/:id
 * @access Private/Admin
 */
function updateUser(req) {
  return new Promise(function(resolve, reject) {
    try {
      const { firstName, lastName, email, role, isActive } = req.body;
      
      // Build update object
      const updateFields = {};
      if (firstName) updateFields.firstName = firstName;
      if (lastName) updateFields.lastName = lastName;
      if (email) updateFields.email = email;
      if (role) updateFields.role = role;
      if (isActive !== undefined) updateFields.isActive = isActive;
      
      // Update user
      User.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select('-password')
        .then(function(user) {
          if (!user) {
            return resolve({
              statusCode: 404,
              message: 'User not found'
            });
          }
          
          resolve({
            statusCode: 200,
            success: true,
            data: user
          });
        })
        .catch(function(error) {
          console.error('Update user error:', error.message);
          reject({
            statusCode: 500,
            message: 'Server error'
          });
        });
    } catch (error) {
      console.error('Update user error:', error.message);
      reject({
        statusCode: 500,
        message: 'Server error'
      });
    }
  });
}

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
function deleteUser(req) {
  return new Promise(function(resolve, reject) {
    try {
      User.findById(req.params.id)
        .then(function(user) {
          if (!user) {
            return resolve({
              statusCode: 404,
              message: 'User not found'
            });
          }
          
          return user.remove();
        })
        .then(function() {
          resolve({
            statusCode: 200,
            success: true,
            data: {}
          });
        })
        .catch(function(error) {
          console.error('Delete user error:', error.message);
          reject({
            statusCode: 500,
            message: 'Server error'
          });
        });
    } catch (error) {
      console.error('Delete user error:', error.message);
      reject({
        statusCode: 500,
        message: 'Server error'
      });
    }
  });
}

/**
 * Get user preferences
 * @route GET /api/users/preferences
 * @access Private
 */
function getPreferences(req) {
  return new Promise(function(resolve, reject) {
    try {
      const userId = req.user.id;
      
      User.findById(userId).select('preferences')
        .then(function(user) {
          if (!user) {
            return resolve({
              statusCode: 404,
              message: 'User not found'
            });
          }
          
          resolve({
            statusCode: 200,
            success: true,
            data: user.preferences || {}
          });
        })
        .catch(function(error) {
          console.error('Get preferences error:', error.message);
          reject({
            statusCode: 500,
            message: 'Server error'
          });
        });
    } catch (error) {
      console.error('Get preferences error:', error.message);
      reject({
        statusCode: 500,
        message: 'Server error'
      });
    }
  });
}

/**
 * Update user preferences
 * @route PUT /api/users/preferences
 * @access Private
 */
function updatePreferences(req) {
  return new Promise(function(resolve, reject) {
    try {
      const userId = req.user.id;
      const preferences = req.body;
      
      if (!preferences) {
        return resolve({
          statusCode: 400,
          message: 'Preferences data is required'
        });
      }
      
      User.findByIdAndUpdate(
        userId,
        { $set: { preferences: preferences } },
        { new: true, runValidators: true }
      ).select('preferences')
        .then(function(user) {
          if (!user) {
            return resolve({
              statusCode: 404,
              message: 'User not found'
            });
          }
          
          resolve({
            statusCode: 200,
            success: true,
            data: user.preferences
          });
        })
        .catch(function(error) {
          console.error('Update preferences error:', error.message);
          reject({
            statusCode: 500,
            message: 'Server error'
          });
        });
    } catch (error) {
      console.error('Update preferences error:', error.message);
      reject({
        statusCode: 500,
        message: 'Server error'
      });
    }
  });
}

/**
 * Update user notification preferences
 * @route PUT /api/users/notifications
 * @access Private
 */
function updateNotificationPreferences(req) {
  return new Promise(function(resolve, reject) {
    try {
      const userId = req.user.id;
      const notificationPreferences = req.body;
      
      if (!notificationPreferences) {
        return resolve({
          statusCode: 400,
          message: 'Notification preferences data is required'
        });
      }
      
      User.findByIdAndUpdate(
        userId,
        { $set: { 'preferences.notifications': notificationPreferences } },
        { new: true, runValidators: true }
      ).select('preferences.notifications')
        .then(function(user) {
          if (!user) {
            return resolve({
              statusCode: 404,
              message: 'User not found'
            });
          }
          
          resolve({
            statusCode: 200,
            success: true,
            data: user.preferences && user.preferences.notifications || {}
          });
        })
        .catch(function(error) {
          console.error('Update notification preferences error:', error.message);
          reject({
            statusCode: 500,
            message: 'Server error'
          });
        });
    } catch (error) {
      console.error('Update notification preferences error:', error.message);
      reject({
        statusCode: 500,
        message: 'Server error'
      });
    }
  });
}

/**
 * Update user role-specific settings
 * @route PUT /api/users/role-settings
 * @access Private
 */
function updateRoleSettings(req) {
  return new Promise(function(resolve, reject) {
    try {
      const userId = req.user.id;
      const roleSettings = req.body;
      
      if (!roleSettings) {
        return resolve({
          statusCode: 400,
          message: 'Role settings data is required'
        });
      }
      
      User.findById(userId)
        .then(function(user) {
          if (!user) {
            return resolve({
              statusCode: 404,
              message: 'User not found'
            });
          }
          
          // Get the user's role
          const role = user.role;
          
          // Update role-specific settings
          return User.findByIdAndUpdate(
            userId,
            { $set: { [`preferences.${role}Settings`]: roleSettings } },
            { new: true, runValidators: true }
          ).select(`preferences.${role}Settings`);
        })
        .then(function(updatedUser) {
          const roleSettingsPath = `preferences.${updatedUser.role}Settings`;
          
          resolve({
            statusCode: 200,
            success: true,
            data: updatedUser.preferences && updatedUser.preferences[`${updatedUser.role}Settings`] || {}
          });
        })
        .catch(function(error) {
          console.error('Update role settings error:', error.message);
          reject({
            statusCode: 500,
            message: 'Server error'
          });
        });
    } catch (error) {
      console.error('Update role settings error:', error.message);
      reject({
        statusCode: 500,
        message: 'Server error'
      });
    }
  });
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getPreferences,
  updatePreferences,
  updateNotificationPreferences,
  updateRoleSettings
}; 