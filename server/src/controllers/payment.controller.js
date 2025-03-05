const BaseController = require('./base.controller');
const Payment = require('../models/Payment');

class PaymentController extends BaseController {
  constructor() {
    super(Payment);
  }

  // Find payments by patient
  async findByPatient(req) {
    const { patientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const payments = await this.model.find({ patientId })
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('patientId', 'firstName lastName email')
      .populate('appointmentId', 'start end status');
      
    const total = await this.model.countDocuments({ patientId });
    
    return {
      data: payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Find payments by appointment
  async findByAppointment(req) {
    const { appointmentId } = req.params;
    
    const payments = await this.model.find({ appointmentId })
      .sort({ paymentDate: -1 })
      .populate('patientId', 'firstName lastName email')
      .populate('appointmentId', 'start end status');
    
    return {
      data: payments,
      pagination: {
        total: payments.length,
        page: 1,
        limit: payments.length,
        pages: 1
      }
    };
  }

  // Find payments by date range
  async findByDateRange(req) {
    const { startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = {};
    
    if (startDate && endDate) {
      query.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.paymentDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.paymentDate = { $lte: new Date(endDate) };
    }
    
    const payments = await this.model.find(query)
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('patientId', 'firstName lastName email')
      .populate('appointmentId', 'start end status');
      
    const total = await this.model.countDocuments(query);
    
    return {
      data: payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Create a new payment
  async create(req) {
    // Calculate totals
    const { items, tax = 0, discount = 0, insuranceCoverage = 0 } = req.body;
    
    // Calculate subtotal from items
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    
    // Calculate final amount
    const amount = subtotal + tax - discount - insuranceCoverage;
    
    // Create payment with calculated values
    const payment = new this.model({
      ...req.body,
      subtotal,
      amount,
      createdBy: req.user._id // Assuming user is attached to req by auth middleware
    });
    
    await payment.save();
    
    return payment;
  }
}

module.exports = new PaymentController(); 