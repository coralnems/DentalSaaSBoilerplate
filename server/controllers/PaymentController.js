const BaseController = require('./BaseController');
const Payment = require('../models/Payment');
const { AppError } = require('../middleware/errorHandler');

class PaymentController extends BaseController {
  constructor() {
    super(Payment, 'payment');
  }

  // Override findAll to add payment-specific search fields
  async findAll(req) {
    // Add searchable fields for payments
    this.model.schema.obj.searchableFields = [
      'receipt.number',
      'gateway.transactionId',
      'gateway.chargeId',
      'insurance.claimNumber',
      'insurance.provider'
    ];
    return super.findAll(req);
  }

  // Process refund
  async processRefund(req) {
    const payment = await this.model.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    const refundData = {
      amount: req.body.amount,
      reason: req.body.reason,
      processedBy: req.user._id
    };

    await payment.processRefund(refundData);
    return payment;
  }

  // Send receipt
  async sendReceipt(req) {
    const payment = await this.model.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!payment) {
      throw new AppError('Payment not found', 404);
    }

    await payment.sendReceipt(req.body.email);
    return payment;
  }

  // Get payments by patient
  async getByPatient(req) {
    const payments = await this.model.find({
      tenantId: req.user.tenantId,
      patientId: req.params.patientId
    }).sort('-createdAt');

    return payments;
  }

  // Get payments by appointment
  async getByAppointment(req) {
    const payments = await this.model.find({
      tenantId: req.user.tenantId,
      appointmentId: req.params.appointmentId
    }).sort('-createdAt');

    return payments;
  }

  // Get payments by date range
  async getByDateRange(req) {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      throw new AppError('Start date and end date are required', 400);
    }

    const payments = await this.model.find({
      tenantId: req.user.tenantId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort('-createdAt');

    return payments;
  }

  // Get payment statistics
  async getStatistics(req) {
    const { startDate, endDate } = req.query;
    const matchQuery = {
      tenantId: req.user.tenantId
    };

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await this.model.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount.total' },
          insuranceAmount: { $sum: '$amount.insurance' },
          patientAmount: { $sum: '$amount.patient' },
          refundedAmount: {
            $sum: {
              $reduce: {
                input: '$refunds',
                initialValue: 0,
                in: {
                  $add: [
                    '$$value',
                    { $cond: [{ $eq: ['$$this.status', 'completed'] }, '$$this.amount', 0] }
                  ]
                }
              }
            }
          },
          paymentMethods: {
            $push: '$method'
          }
        }
      },
      {
        $addFields: {
          paymentMethodStats: {
            $reduce: {
              input: '$paymentMethods',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $literal: {
                      $concat: ['$$this']: { $add: [{ $ifNull: ['$$value.$concat', 0] }, 1] }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    return stats[0] || {
      totalPayments: 0,
      totalAmount: 0,
      insuranceAmount: 0,
      patientAmount: 0,
      refundedAmount: 0,
      paymentMethodStats: {}
    };
  }

  // Get insurance claims statistics
  async getInsuranceStats(req) {
    const { startDate, endDate } = req.query;
    const matchQuery = {
      tenantId: req.user.tenantId,
      'insurance.provider': { $exists: true }
    };

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await this.model.aggregate([
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: '$insurance.provider',
          totalClaims: { $sum: 1 },
          totalAmount: { $sum: '$amount.insurance' },
          approvedClaims: {
            $sum: { $cond: [{ $eq: ['$insurance.status', 'approved'] }, 1, 0] }
          },
          deniedClaims: {
            $sum: { $cond: [{ $eq: ['$insurance.status', 'denied'] }, 1, 0] }
          },
          pendingClaims: {
            $sum: { $cond: [{ $eq: ['$insurance.status', 'pending'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          provider: '$_id',
          totalClaims: 1,
          totalAmount: 1,
          approvedClaims: 1,
          deniedClaims: 1,
          pendingClaims: 1,
          approvalRate: {
            $multiply: [
              { $divide: ['$approvedClaims', '$totalClaims'] },
              100
            ]
          }
        }
      },
      {
        $sort: { totalClaims: -1 }
      }
    ]);

    return stats;
  }

  // Generate receipt number
  async generateReceiptNumber() {
    return this.model.generateReceiptNumber(req.user.tenantId);
  }
}

module.exports = new PaymentController(); 