const express = require('express');
const router = express.Router();
const { create, exportExcel, updateRegistration, getList } = require('../controller/registrationController');
const { auth, isAdmin } = require('../middleware/auth');

// 1. Route Public (Ai cũng được gọi)
// Dùng cho khách hàng điền form
router.post('/', create);


// 2. Route Bảo Mật (Chỉ Admin)
// Cần đi qua 2 cửa: 'auth' (có token) -> 'requireAdmin' (có role admin)

// Xuất Excel
router.get('/export', auth, isAdmin, exportExcel);

// Cập nhật thông tin (Status, Turn, Note)
router.put('/:id', auth, isAdmin, updateRegistration);

// Thêm route này (Admin only)
router.get('/', auth, isAdmin, getList);
module.exports = router;