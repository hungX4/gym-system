const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../models/index'); // Sequelize index exports models

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

router.post('/register', [
    body('fullname').notEmpty(),
    body('phonenumber').notEmpty(),
    body('email').notEmpty(),
    body('password').isLength({ min: 6 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fullname, email, phonenumber, password } = req.body;
    try {
        const existing = await db.Users.findOne({ where: { phonenumber } });
        if (existing) return res.status(409).json({ message: 'Số điện thoại đã tồn tại' });

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await db.Users.create({ fullname, email, phonenumber, password: hashed });
        return res.status(201).json({ id: user.id, message: 'Registered' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', [
    body('phonenumber').notEmpty(),
    body('password').notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { phonenumber, password } = req.body;
    try {
        const user = await db.Users.findOne({ where: { phonenumber } });
        if (!user) return res.status(401).json({ message: 'Sai số điện thoại hoặc mật khẩu' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ message: 'Sai số điện thoại hoặc mật khẩu' });

        // tạo access token (ngắn hạn) và refresh token (dài hạn)
        const payload = { id: user.id, role: user.role };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d' });

        // Option A (recommended): set httpOnly secure cookie for refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 3600 * 1000
        });

        // trả accessToken cho frontend
        return res.json({ accessToken, user: { id: user.id, name: user.name, phone: user.phone } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
