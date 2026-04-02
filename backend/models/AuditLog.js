const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, enum: ['create', 'update', 'delete'] },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  details: { type: Object },
  ipAddress: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);

