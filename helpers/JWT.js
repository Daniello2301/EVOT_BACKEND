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
    const refreshToken = JWT.sign(payload, `${process.env.SECRET_KEY_JWT}`, { expiresIn: '1d'});

    return {
        token,
        refreshToken
    };
}

module.exports = { jwtgenerador };