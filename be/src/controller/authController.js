// controllers/authController.js
const { createUser,
    findByPhone,
    getById,
    updateUser } = require('../services/userServices');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const { phonenumber, password } = req.body;
        if (!phonenumber || !password) return res.status(400).json({ message: 'phonenumber and password required' });

        const user = await findByPhone(phonenumber);
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const payload = { id: user.id, role: user.role, phonenumber: user.phonenumber };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

        res.json({ token, user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const register = async (req, res) => {
    try {
        const { fullname, phonenumber, password, email } = req.body;
        if (!fullname || !phonenumber || !password) return res.status(400).json({ message: 'fullname, phonenumber, password required' });

        const exist = await findByPhone(phonenumber);
        if (exist) return res.status(409).json({ message: 'Số điện thoại đã tồn tại' });

        const newUser = await createUser({ fullname, phonenumber, password, email });
        res.status(201).json({ id: newUser.id, fullname: newUser.fullname, phonenumber: newUser.phonenumber });
    } catch (err) {
        console.error(err);
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ errors: err.errors.map(e => e.message) });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login, register };
