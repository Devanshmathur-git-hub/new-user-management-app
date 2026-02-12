const express = require('express');
const { getUsers, getUser, createUser, updateUser, deleteUser, getAuditLogs } = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, getUsers);
router.get('/audit-logs', auth, getAuditLogs);
router.get('/:id', auth, getUser);
router.post('/', auth, createUser);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, deleteUser);

module.exports = router;