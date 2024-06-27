const JWT = require("jsonwebtoken");
const dotenv = require("dotenv").config();

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
    rol: usuario.rol,
  };

  // Generate a JWT token that expires in 1 hour
  const token = JWT.sign(payload, `${process.env.SECRET_KEY_JWT}`, {
    expiresIn: "1h",
  });

  // Generate a refresh token that expires in 1 day
  const refreshToken = JWT.sign(payload, `${process.env.SECRET_KEY_JWT}`, {
    expiresIn: "1d",
  });

  // Return both tokens
  return {
    token,
    refreshToken,
  };
};


/**
 * Generates a new access token for the given user.
 * 
 * @param {Object} user - The user object containing user details.
 * @param {string} user.token.refreshToken - The refresh token of the user.
 * @returns {string} The new access token.
 *  
 * */
const refreshToken = (user) => {

  // Extract the user details from the user object
  const userLogged = user;

  // Decode the refresh token
  const decoded = JWT.verify(
    userLogged.token?.refreshToken,
    `${process.env.SECRET_KEY_JWT}`
  );

  // Generate a new access token
  const accesToken = JWT.sign(
    {
      _id: decoded._id,
      nombreUsuario: decoded.nombreUsuario,
      correo: decoded.correo,
      rol: decoded.rol,
    },
    `${process.env.SECRET_KEY_JWT}`,
    { expiresIn: "1h" }
  );

  // Return the new access token
  return accesToken;
};

module.exports = { jwtgenerador, refreshToken };
