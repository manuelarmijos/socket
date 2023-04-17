const express = require('express')
const app = express()
const config = require("./source/config/config.js");
const port = config.serverPort;
const bodyParser = require('body-parser');
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const winston = require("winston");
const expressWinston = require("express-winston");
const responseTime = require("response-time");
const secret = config.sessionSecret;
const store = new session.MemoryStore();
const cors = require("cors");
const helmet = require("helmet");
var amqp = require('amqplib/callback_api');
var jwt = require('jsonwebtoken');


app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}))

app.use(helmet());

app.use(responseTime());

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.json(),
    statusLevels: true,
    meta: false,
    msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    expressFormat: true,
    ignoreRoute() {
      return false;
    },
  })
);

const alwaysAllow = (_1, _2, next) => {
  console.log('permitir acceso a todos')
  next();
};

const protect = (req, res, next) => {
  console.log('Dentro de protect')
  const { authenticated } = req.session;
  if (!authenticated) {
    res.sendStatus(401);
  } else {
    next();
  }
};

app.use(
  rateLimit(config.rate)
);

//Cofiguraciones de servidor
app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ limit: "1mb", extended: false, parameterLimit: 50 }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let oneof = false
  if (req.headers.origin) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    oneof = true;
  }
  if (req.headers['access-control-request-method']) {
    res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
    oneof = true;
  }
  if (req.headers['access-control-request-headers']) {
    res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
    oneof = true;
  }
  if (oneof) {
    res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
  }
  return next();
});

app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: true,
    store,
  })
);

app.get('/', (req, res) => {
  res.send('Hola bienvenido al microservicio de socket.io') //
})



// app.use('/s/solicitud/', solicitud);

config.coneccionBase(function (res) {
  if (res) {
    console.log('Exito en la conección a la base de datos')
  } else {
    console.log('Revisar urgentr no se logró conectarse a la base')
  }
});

global.rabbit;

amqp.connect('amqp://admin:admin@127.0.0.1:5672', function (error0, connection) {
  if (error0) {
    console.log('ERROR AL conectarse a rabbit')
    console.log(error0)
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      console.log('error 1 al conectarse a rabit 1')
      console.log(error1)
      throw error1;
    }
    rabbit = channel;
    console.log('Coneccion exitosa a rabbit')
    var queue = 'enviarEmit';

    channel.assertQueue(queue, {
      durable: true
    });

    rabbit.consume(queue1, function (msg) {
      var secs = msg.content.toString().split('.').length - 1;
      console.log('Recibiendo mensaje de condutor con la data del conductor')
      console.log(" Data recibida", msg.content.toString());
      //conductor.buscarCondcutorLibre();
      setTimeout(function () {
        console.log(" [x] Done");
        rabbit.ack(msg); // ACK permite avisar a rabbit que el mensaje ya fue procesado y se puede eliminar
      }, 10000);
    }, {
      // noAck: true Una vez que llego el mensaje no se vuelve a notificar si pasa algo
      noAck: false // Recuperar mensajes perdidos si por A o B razones se desconecta automaticamente se vuelven a enviar
    });
  });
});

var server = app.listen(port, (err) => {
  if (err) throw new Error(err);
  console.log(`SERVIDOR CORRIENDO PUERTO: ${port}`);
});

var socketIO = require('socket.io')(server, {
  allowEIO3: true
});

socketIO.on('connection',
  (socket) => {
    console.log('a user connected');
    console.log(socket.id)

    socket.on('autenticar', (token, callback) => {
      console.log('Se envio un emit para autenticar al cliente')
      console.log(token)
      if (token) {
        jwt.verify(token.token, process.env.SECRETTOKEN, function (err, decoded) {
          if (err) {
            console.log(err)
            console.log('Token invalido');
            return callback({
              en: -1,
              m: 'No se pudo autenticar'
            })
          }
          console.log(decoded) // bar
          socket.auth = true;
          console.log('verificado el token: ' + token);
          console.log('token');
          if (decoded.cliente) {
            ///let data = JSON.parse(decoded.cliente);
            config.ejecutarsql('INSERT INTO ktaxiSocket.socket (idUsuario, socketId, fecha_registro) VALUES (?,?, now()) ON DUPLICATE KEY UPDATE socketId = ?  ;', [decoded.cliente[0].id, socket.id, socket.id], function (res) {
              if (res.en == 1)
                console.log('SQL EJECUTADO - REGISTRO GUARDADO')
              else
                console.log('SQL no EJECUTADO - REGISTRO no GUARDADO')
            })
          }
          callback({
            en: 1,
            m: 'Autenticado con éxito'
          })
        });
      } else {
        callback({
          en: -1,
          m: 'No se pudo autenticar'
        })
      }
    });
  });

// app.use(
//     "/search",
//     createProxyMiddleware({
//         target: "http://api.duckduckgo.com/",
//         changeOrigin: true,
//         pathRewrite: {
//             [`^/search`]: "",
//         },
//     })
// );

module.exports = { app, server };
