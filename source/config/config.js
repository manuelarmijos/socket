require("dotenv").config();

exports.serverPort = 3005;
exports.sessionSecret = process.env.SESSION_SECRET;
exports.rate = {
    windowMs: 5 * 60 * 1000,
    max: 100,
};
