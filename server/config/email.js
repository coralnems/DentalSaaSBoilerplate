const nodemailer = require('nodemailer');
const Queue = require('bull');
const path = require('path');
const fs = require('fs').promises;
const handlebars = require('handlebars');
const env = require('./env');
const logger = require('./logger');

// Email queue configuration
const emailQueue = new Queue('email', {
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD
  }
});

// Email transport configuration
const createTransport = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
};

// Template cache
const templateCache = new Map();

// Load email template
const loadTemplate = async (templateName) => {
  try {
    // Check cache first
    if (templateCache.has(templateName)) {
      return templateCache.get(templateName);
    }

    // Load template file
    const templatePath = path.join(__dirname, '../templates/email', `${templateName}.hbs`);
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    // Compile template
    const template = handlebars.compile(templateContent);
    
    // Cache template
    templateCache.set(templateName, template);
    
    return template;
  } catch (error) {
    logger.error(`Error loading email template ${templateName}:`, error);
    throw error;
  }
};

// Send email
const sendEmail = async (options) => {
  try {
    const transport = createTransport();
    
    // Load and compile template if specified
    let html = options.html;
    if (options.template) {
      const template = await loadTemplate(options.template);
      html = template(options.context || {});
    }

    // Prepare email options
    const mailOptions = {
      from: options.from || env.EMAIL_FROM,
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
      html: html,
      attachments: options.attachments
    };

    // Send email
    const info = await transport.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

// Queue email
const queueEmail = async (options) => {
  try {
    const job = await emailQueue.add(options, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: true
    });
    
    logger.info(`Email queued: ${job.id}`);
    return job;
  } catch (error) {
    logger.error('Error queuing email:', error);
    throw error;
  }
};

// Process email queue
emailQueue.process(async (job) => {
  return await sendEmail(job.data);
});

// Email queue event handlers
emailQueue.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, error) => {
  logger.error(`Email job ${job.id} failed:`, error);
});

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to our platform',
    template: 'welcome'
  },
  resetPassword: {
    subject: 'Reset your password',
    template: 'reset-password'
  },
  verifyEmail: {
    subject: 'Verify your email address',
    template: 'verify-email'
  },
  appointmentReminder: {
    subject: 'Appointment Reminder',
    template: 'appointment-reminder'
  },
  paymentConfirmation: {
    subject: 'Payment Confirmation',
    template: 'payment-confirmation'
  }
};

module.exports = {
  sendEmail,
  queueEmail,
  emailTemplates,
  emailQueue
}; 