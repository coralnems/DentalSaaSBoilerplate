const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://jperales:L9i1ow7TpG2hlruj@cluster0.zfknd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Define schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'dentist', 'staff'], default: 'staff' },
  isEmailVerified: { type: Boolean, default: false }
});

const patientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  }
});

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  dentist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  type: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  notes: String
});

const treatmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  type: { type: String, required: true },
  date: { type: Date, required: true },
  cost: { type: Number, required: true },
  notes: String,
  dentist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Hash password middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

async function resetDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB...');

    // Get all collections
    const collections = await mongoose.connection.db.collections();

    // Drop all collections
    for (let collection of collections) {
      try {
        await collection.drop();
        console.log(`Dropped collection: ${collection.collectionName}`);
      } catch (error) {
        console.log(`Error dropping collection ${collection.collectionName}:`, error.message);
      }
    }

    // Register models
    const User = mongoose.model('User', userSchema);
    const Patient = mongoose.model('Patient', patientSchema);
    const Appointment = mongoose.model('Appointment', appointmentSchema);
    const Treatment = mongoose.model('Treatment', treatmentSchema);

    // Create collections and indexes
    await Promise.all([
      User.createCollection(),
      Patient.createCollection(),
      Appointment.createCollection(),
      Treatment.createCollection()
    ]);

    console.log('Collections and indexes created');

    // Create default admin user
    await User.create({
      email: 'admin@dentalclinic.com',
      password: 'Admin@123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true
    });

    console.log('Default admin user created');
    console.log('Database reset and initialized successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the reset function
resetDatabase(); 