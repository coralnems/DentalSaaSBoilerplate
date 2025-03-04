const mongoose = require('mongoose');

const webAuthnCredentialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  credentialId: {
    type: String,
    required: true,
    unique: true
  },
  publicKey: {
    type: String,
    required: true
  },
  counter: {
    type: Number,
    required: true,
    default: 0
  },
  transports: [{
    type: String,
    enum: ['usb', 'nfc', 'ble', 'internal']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
});

webAuthnCredentialSchema.index({ userId: 1, credentialId: 1 }, { unique: true });

webAuthnCredentialSchema.pre('save', function(next) {
  if (this.isModified('counter')) {
    this.lastUsed = new Date();
  }
  next();
});

const WebAuthnCredential = mongoose.model('WebAuthnCredential', webAuthnCredentialSchema);

module.exports = WebAuthnCredential; 