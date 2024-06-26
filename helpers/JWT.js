const JWT = require('jsonwebtoken');
const dotenv = require('dotenv').config();

/**
 * Generates a JWT token and a refresh token for the given user.
 *
 * @param {Object} usuario - The user object containing user details.
 * @param {string} usuario._id - The unique identifier of the user.
 * @param {string} usuario.nombreUsuario - The username of the user.
 * @param {string} usuario.correo - The email of the user.
 * @param {string} usuario.rol - The role of the user.
 * @returns {Object} An object containing the JWT token and the refresh token.
 */
const jwtgenerador = (usuario) => {
    // Define the payload with user details
    const payload = {
        _id: usuario._id,
        nombreUsuario: usuario.nombreUsuario,
        correo: usuario.correo,
        rol: usuario.rol
    };

    // Generate a JWT token that expires in 1 hour
    const token = JWT.sign(payload, `${process.env.SECRET_KEY_JWT}`, { expiresIn: '1h' });

    // Generate a refresh token that expires in 1 day
    const refreshToken = JWT.sign(payload, `${process.env.SECRET_KEY_JWT}`, { expiresIn: '1d' });

    // Return both tokens
    return {
        token,
        refreshToken
    };
}

module.exports = { jwtgenerador };