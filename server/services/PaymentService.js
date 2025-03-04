const stripe = require('../config/stripe');

class PaymentService {
  constructor() {
    this.paymentMethods = {
      cash: this.processCashPayment.bind(this),
      credit_card: this.processCardPayment.bind(this),
      debit_card: this.processCardPayment.bind(this),
      insurance: this.processInsurancePayment.bind(this),
      bank_transfer: this.processBankTransfer.bind(this)
    };
  }

  async processPayment(paymentData) {
    const { paymentMethod } = paymentData;
    
    if (!this.paymentMethods[paymentMethod]) {
      throw new Error('Invalid payment method');
    }

    try {
      return await this.paymentMethods[paymentMethod](paymentData);
    } catch (error) {
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  async processCashPayment(paymentData) {
    // Simple cash payment processing
    return {
      success: true,
      transactionId: `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      method: 'cash',
      timestamp: new Date()
    };
  }

  async processCardPayment(paymentData) {
    const { amount, paymentMethod, cardToken, currency = 'usd', description } = paymentData;

    try {
      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        payment_method: cardToken,
        description: description || 'Dental treatment payment',
        confirm: true,
        metadata: {
          paymentMethod,
          patientId: paymentData.patient.toString(),
          treatmentId: paymentData.treatment.toString()
        }
      });

      return {
        success: true,
        transactionId: paymentIntent.id,
        method: paymentMethod,
        stripeResponse: {
          status: paymentIntent.status,
          charges: paymentIntent.charges,
          clientSecret: paymentIntent.client_secret
        },
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Stripe payment failed: ${error.message}`);
    }
  }

  async processInsurancePayment(paymentData) {
    const { insuranceDetails } = paymentData;
    
    if (!insuranceDetails || !insuranceDetails.provider || !insuranceDetails.policyNumber) {
      throw new Error('Invalid insurance details');
    }

    // TODO: Integrate with insurance provider's API
    return {
      success: true,
      transactionId: `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      method: 'insurance',
      insuranceDetails: {
        provider: insuranceDetails.provider,
        policyNumber: insuranceDetails.policyNumber,
        coverageAmount: insuranceDetails.coveragePercentage
      },
      timestamp: new Date()
    };
  }

  async processBankTransfer(paymentData) {
    // TODO: Integrate with banking API
    return {
      success: true,
      transactionId: `BT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      method: 'bank_transfer',
      timestamp: new Date()
    };
  }

  async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  async generateInvoice(paymentData) {
    // TODO: Implement invoice generation logic
    return {
      invoiceNumber: paymentData.invoiceNumber,
      patientDetails: paymentData.patient,
      treatmentDetails: paymentData.treatment,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      status: paymentData.status,
      generatedDate: new Date()
    };
  }
}

module.exports = new PaymentService(); 