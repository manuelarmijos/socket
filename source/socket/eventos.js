const config = require("../config/config.js");

function enviarEmit(data) {
    let d = JSON.parse(data);
    console.log('DENTRO DE LA FUNCION PARA ENVIAR EMIT')
    config.ejecutarsqlSelect('SELECT socketId FROM  ktaxiSocket.socket where idUsuario = ? ;', [d.idCliente], function (res) {
        if (res.en == 1) {
            console.log('Socket del cliente encontrado')
            console.log(res.data)
            console.log(res.data[0])
            //socketio.to('').emit("dataConductor", JSON.stringify({ name: "John" }));
            console.log('Socket del cliente enviado correctamente')
        }
        else
            console.log('SQL no EJECUTADO - REGISTRO no GUARDADO')
    })
}

module.exports = {
    enviarEmit: enviarEmit

};