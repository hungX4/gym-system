
require('dotenv').config();
const express = require('express');
const configViewEngine = require('./config/viewEngine.js');
const webRoute = require("./routes/web.js");

const app = express();

// config ViewEngine
configViewEngine(app);

//env
const port = process.env.PORT || 8002;
const hostName = process.env.HOST_NAME;

app.use('/', webRoute);
app.listen(port, hostName, () => {
    console.log(`Example app listening on port ${port}, ${hostName}`);
})