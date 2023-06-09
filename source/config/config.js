require("dotenv").config();

var serverPort = 3005;
var sessionSecret = process.env.SESSION_SECRET;
var rate = {
    windowMs: 5 * 60 * 1000,
    max: 100,
};

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 100,
    host: '169.62.217.189',
    user: 'M4nu3l4rm1j0s',
    password: 'UayN7X**J8YsH3!q*9W_wirk_ALHCM',
    database: 'ktaxiSocket'
});


function coneccionBase(callback) {
    var connection = mysql.createConnection({
        host: '169.62.217.189',
        user: 'M4nu3l4rm1j0s',
        password: 'UayN7X**J8YsH3!q*9W_wirk_ALHCM',
        database: 'ktaxiSocket'
    });

    connection.connect(function (err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return callback(false);
        }

        console.log('connected as id ' + connection.threadId);
        callback(true)
    });
}

function ejecutarsql(query, valores, callback) {
    pool.query(query, valores, function (error, results, fields) {
        if (error) {
            console.log(error);
            callback({
                en: -1,
                m: 'Error mysql'
            })
        };
        callback({
            en: 1,
            m: 'Mysql ejecutado'
        })
        // ...
    });
}
function ejecutarsqlSelect(query, valores, callback) {
    pool.query(query, valores, function (error, results, fields) {
        if (error) {
            console.log(error);
            callback({
                en: -1,
                m: 'Error mysql'
            })
        };
        callback({
            en: 1,
            m: 'Mysql ejecutado',
            data: results
        })
        // ...
    });
}

module.exports = {
    coneccionBase: coneccionBase,
    ejecutarsql: ejecutarsql,
    ejecutarsqlSelect: ejecutarsqlSelect,
    serverPort,
    rate,
    sessionSecret

};
