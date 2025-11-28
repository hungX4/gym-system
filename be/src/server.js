
require('dotenv').config();
const express = require('express');
const configViewEngine = require('./config/viewEngine.js');
const webRoute = require("./routes/auth.js");
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const booking = require('./routes/booking');
const specialty = require('./routes/specialty.js');
const registrationRoutes = require('./routes/registrationRoutes.js');
const connection = require('./config/connectDb.js');
const app = express();

const cors = require('cors');
// config ViewEngine
configViewEngine(app);

//env
const port = process.env.PORT || 8002;
const hostName = process.env.HOST_NAME;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // cho phép cookie httpOnly
    allowedHeaders: ['Content-Type', 'Authorization'] // tùy chỉnh nếu cần
}));

// app.use('/', webRoute);
//route
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/bookings', booking);
app.use('/', specialty);
app.use('/registration', registrationRoutes);
connection();
app.listen(port, hostName, () => {
    console.log(`Example app listening on port ${port}, ${hostName}`);
})