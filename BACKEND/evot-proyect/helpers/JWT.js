const JWT = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const jwtgenerador = (usuario) => {
    const payload = {
        _id: usuario._id,
        nombreUsuario: usuario.nombreUsuario,
        correo: usuario.correo,
        rol: usuario.rol
    };

    const token = JWT.sign(payload, `${process.env.SECRET_KEY_JWT}`, { expiresIn: '1h'});

    return token;
}

module.exports = { jwtgenerador };