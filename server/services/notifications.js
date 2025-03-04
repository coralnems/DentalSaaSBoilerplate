const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// Configure email transport
const emailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Configure Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send email notification
const sendEmail = async (to, subject, html) => {
  try {
    await emailTransport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Send SMS notification
const sendSMS = async (to, message) => {
  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
};

// Send appointment reminder
const sendAppointmentReminder = async (appointment) => {
  try {
    const patient = await Patient.findById(appointment.patient);
    if (!patient) return false;

    const appointmentDate = new Date(appointment.dateTime);
    const formattedDate = appointmentDate.toLocaleDateString();
    const formattedTime = appointmentDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Email reminder
    const emailHtml = `
      <h2>Appointment Reminder</h2>
      <p>Dear ${patient.firstName} ${patient.lastName},</p>
      <p>This is a reminder for your dental appointment:</p>
      <ul>
        <li>Date: ${formattedDate}</li>
        <li>Time: ${formattedTime}</li>
        <li>Type: ${appointment.type}</li>
      </ul>
      <p>If you need to reschedule, please contact us as soon as possible.</p>
    `;

    await sendEmail(
      patient.email,
      'Dental Appointment Reminder',
      emailHtml
    );

    // SMS reminder
    const smsMessage = 
      `Reminder: Your dental appointment is scheduled for ${formattedDate} at ${formattedTime}. ` +
      `Type: ${appointment.type}. Please call us if you need to reschedule.`;

    await sendSMS(patient.phone, smsMessage);

    // Update appointment reminder status
    appointment.reminders.push({
      type: new Date(),
      sent: true
    });
    await appointment.save();

    return true;
  } catch (error) {
    console.error('Reminder sending failed:', error);
    return false;
  }
};

// Check and send appointment reminders
const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find appointments for tomorrow that haven't received reminders
    const appointments = await Appointment.find({
      dateTime: {
        $gte: tomorrow,
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      },
      status: 'Scheduled',
      'reminders.sent': { $ne: true }
    });

    for (const appointment of appointments) {
      await sendAppointmentReminder(appointment);
    }
  } catch (error) {
    console.error('Reminder check failed:', error);
  }
};

// Send treatment follow-up
const sendTreatmentFollowUp = async (treatment) => {
  try {
    const patient = await Patient.findById(treatment.patient);
    if (!patient) return false;

    const emailHtml = `
      <h2>Treatment Follow-up</h2>
      <p>Dear ${patient.firstName} ${patient.lastName},</p>
      <p>We hope you're doing well after your recent dental treatment:</p>
      <ul>
        <li>Treatment: ${treatment.type}</li>
        <li>Date: ${new Date(treatment.createdAt).toLocaleDateString()}</li>
      </ul>
      <p>Please let us know if you're experiencing any issues or have questions.</p>
    `;

    await sendEmail(
      patient.email,
      'Dental Treatment Follow-up',
      emailHtml
    );

    const smsMessage = 
      `How are you feeling after your ${treatment.type} treatment? ` +
      `Please let us know if you have any concerns.`;

    await sendSMS(patient.phone, smsMessage);

    return true;
  } catch (error) {
    console.error('Follow-up sending failed:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendSMS,
  sendAppointmentReminder,
  checkAndSendReminders,
  sendTreatmentFollowUp
}; 