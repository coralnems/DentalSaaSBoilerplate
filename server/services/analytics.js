const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Treatment = require('../models/Treatment');
const Patient = require('../models/Patient');

// Get appointment statistics
const getAppointmentStats = async (startDate, endDate) => {
  try {
    const stats = await Appointment.aggregate([
      {
        $match: {
          dateTime: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Appointment.aggregate([
      {
        $match: {
          dateTime: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      statusDistribution: stats,
      typeDistribution: typeStats
    };
  } catch (error) {
    console.error('Error getting appointment stats:', error);
    throw error;
  }
};

// Get treatment statistics
const getTreatmentStats = async (startDate, endDate) => {
  try {
    const stats = await Treatment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$cost.amount' },
          averageCost: { $avg: '$cost.amount' }
        }
      }
    ]);

    const insuranceStats = await Treatment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$cost.insurance.covered',
          count: { $sum: 1 },
          totalAmount: { $sum: '$cost.insurance.amount' }
        }
      }
    ]);

    return {
      treatmentDistribution: stats,
      insuranceCoverage: insuranceStats
    };
  } catch (error) {
    console.error('Error getting treatment stats:', error);
    throw error;
  }
};

// Get patient demographics
const getPatientDemographics = async () => {
  try {
    const ageGroups = await Patient.aggregate([
      {
        $project: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 30, 45, 60, 75, 100],
          default: '100+',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    return {
      ageDistribution: ageGroups
    };
  } catch (error) {
    console.error('Error getting patient demographics:', error);
    throw error;
  }
};

// Get revenue analysis
const getRevenueAnalysis = async (startDate, endDate) => {
  try {
    const monthlyRevenue = await Treatment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$cost.amount' },
          insuranceCovered: { $sum: '$cost.insurance.amount' },
          patientPaid: {
            $sum: {
              $subtract: ['$cost.amount', '$cost.insurance.amount']
            }
          }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);

    return {
      monthlyRevenue
    };
  } catch (error) {
    console.error('Error getting revenue analysis:', error);
    throw error;
  }
};

// Get appointment scheduling efficiency
const getSchedulingEfficiency = async (startDate, endDate) => {
  try {
    const stats = await Appointment.aggregate([
      {
        $match: {
          dateTime: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$dateTime' },
            month: { $month: '$dateTime' },
            day: { $dayOfMonth: '$dateTime' }
          },
          totalAppointments: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          noShows: {
            $sum: {
              $cond: [{ $eq: ['$status', 'No Show'] }, 1, 0]
            }
          },
          cancellations: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          date: '$_id',
          totalAppointments: 1,
          totalDuration: 1,
          noShows: 1,
          cancellations: 1,
          utilizationRate: {
            $divide: ['$totalDuration', 480] // 8 hours = 480 minutes
          }
        }
      }
    ]);

    return {
      dailyStats: stats
    };
  } catch (error) {
    console.error('Error getting scheduling efficiency:', error);
    throw error;
  }
};

module.exports = {
  getAppointmentStats,
  getTreatmentStats,
  getPatientDemographics,
  getRevenueAnalysis,
  getSchedulingEfficiency
}; 