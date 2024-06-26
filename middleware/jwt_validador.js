const JWT = require('jsonwebtoken');
const dotenv = require('dotenv').config();

/**
 * Middleware to validate JWT token from the Authorization header.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} The response object with error message if validation fails.
 */
const jwtValidador = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.header('Authorization');
    if (!token) {
        return res.status(400).send({ msg: "Error, no autorizado" });
    }
    try {
        // Verify the token
        const payload = JWT.verify(token, `${process.env.SECRET_KEY_JWT}`);
        // Attach the payload to the request object
        req.payload = payload;
        // Proceed to the next middleware function
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
}

/**
 * Middleware to check if the user has the 'ADMIN' role.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {Object} The response object with error message if validation fails.
 */
const isAdmin = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.header('Authorization');
    if (!token) {
        return res.status(400).send({ msg: "Error, no autorizado" });
    }
    try {
        // Verify the token
        const payload = JWT.verify(token, `${process.env.SECRET_KEY_JWT}`);
        // Check if the user has the 'ADMIN' role
        if (payload.rol !== 'ADMIN') {
            return res.status(403).send({ msg: 'Desautorizado, no tienes el rol para ejecutar esta función.' });
        }
        // Proceed to the next middleware function
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
}

module.exports = { jwtValidador, isAdmin };
