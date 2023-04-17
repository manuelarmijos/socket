const config = require("../config/config.js");

function enviarEmit(data) {
    let d = JSON.parse(data);
    console.log('DENTRO DE LA FUNCION PARA ENVIAR EMIT')
    config.ejecutarsqlSelect('SELECT socketId FROM  ktaxiSocket.socket where idUsuario = ? ;', [d.idCliente], function (res) {
        if (res.en == 1) {
            console.log('Socket del cliente encontrado')
            if (res.data.length > 0) {
                console.log(res.data)
                console.log(res.data[0])
                console.log(res.data[0].socketId)
                socketio.to(res.data[0].socketId).emit("dataConductor", d);
                console.log('Socket del cliente enviado correctamente')
            }
        }
        else
            console.log('SQL no EJECUTADO - REGISTRO no GUARDADO')
    });
    config.ejecutarsqlSelect('SELECT socketId FROM  ktaxiSocket.socketConductor where idConductor = ? ;', [d.id], function (res) {
        if (res.en == 1) {
            console.log('Socket del conductor encontrado')
            if (res.data.length > 0) {
                console.log(res.data)
                console.log(res.data[0])
                console.log(res.data[0].socketId)
                socketio.to(res.data[0].socketId).emit("dataCliente", d);
                console.log('Socket del conductor enviado correctamente')
            }
        }
        else
            console.log('SQL no EJECUTADO - REGISTRO no GUARDADO')
    })
}

module.exports = {
    enviarEmit: enviarEmit

};
