const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

async function resolveRoleId(role) {
  if (!role) return null;
  if (typeof role === 'object' && role._id) return role._id;
  if (typeof role === 'string' && role.length > 0) {
    const r = await Role.findOne({ name: role.trim() });
    return r ? r._id : null;
  }
  return role;
}

exports.getUsers = async (req, res) => {
  const { page = 1, limit = 10, search = '', status } = req.query;
  try {
    const query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phoneNo: new RegExp(search, 'i') },
      ];
    }
    if (status !== undefined && status !== '' && status !== 'all') {
      query.isActive = status === 'active';
    }
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const users = await User.find(query).populate('role').select('-password -resetToken -resetTokenExpiry').skip(skip).limit(parseInt(limit, 10));
    const total = await User.countDocuments(query);
    res.json({ users, total, page: parseInt(page, 10), limit: parseInt(limit, 10), pages: Math.ceil(total / parseInt(limit, 10)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('role').select('-password -resetToken -resetTokenExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password, phoneNo, role } = req.body;
  try {
    const roleId = await resolveRoleId(role);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, phoneNo: phoneNo || '', role: roleId });
    await user.save();

    await AuditLog.create({
      userId: req.user.id,
      action: 'create',
      targetUserId: user._id,
      details: { newUser: { name, email, phoneNo, role } },
      ipAddress: req.ip,
    });

    const safe = user.toJSON();
    res.status(201).json(safe);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const oldUser = await User.findById(req.params.id).select('-password');
    if (!oldUser) return res.status(404).json({ message: 'User not found' });

    const update = { ...req.body };
    if (update.password && update.password.trim() !== '') {
      update.password = await bcrypt.hash(update.password, 10);
    } else {
      delete update.password;
    }
    if (update.role !== undefined) {
      update.role = await resolveRoleId(update.role);
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).populate('role').select('-password -resetToken -resetTokenExpiry');

    await AuditLog.create({
      userId: req.user.id,
      action: 'update',
      targetUserId: user._id,
      details: { oldValues: oldUser.toObject(), newValues: user.toObject() },
      ipAddress: req.ip,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      userId: req.user.id,
      action: 'delete',
      targetUserId: user._id,
      details: { deletedUser: user },
      ipAddress: req.ip,
    });

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('userId', 'name email').populate('targetUserId', 'name email').sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

