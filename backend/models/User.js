const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNo: { type: String, default: '' },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
}, { timestamps: true });

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.resetToken;
    delete ret.resetTokenExpiry;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);