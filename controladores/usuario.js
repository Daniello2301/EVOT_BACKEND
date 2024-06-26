const Usuario = require("../modelos/Usuario");
const bcrypt = require("bcryptjs");
const { jwtgenerador, refreshToken } = require("../helpers/JWT");
const session = require("express-session");
const { validationResult } = require("express-validator");

// Customize validation result to format errors
const myValidationResult = validationResult.withDefaults({
    formatter: (error) => error.msg,
  });
  
/**
 * Lists all users in the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a list of users or an error message.
 */
const listarUsuarios = async (req, res) => {
    try {
      // Fetch all users from the database
      const usuarios = await Usuario.find();
  
      // Send the list of users as the response
      return res.status(200).send(usuarios);
    } catch (error) {
  
      // Send an error response if there is a server error
      return res.status(500).send({ msg: "Internal server error", error: error });
    }
};

/**
 * Fetches a user by ID from the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the user data or an error message.
 */
const listPorId = async (req, res) => {
    try {
      // Find the user by ID from the request parameters
      const usuario = await Usuario.findById({ _id: req.params.id });
      
      // Check if the user was found
      if (!usuario) {
        return res.status(401).json({ msg: "El usuario no se encontró" });
      }
  
      // Send the user data in the response
      return res.status(200).send(usuario);
    } catch (error) {
  
      // Send an error response if there is a server error
      return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
  };

/**
 * Authenticates a user based on email and password.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a success message and user data or an error message.
 */
const login = async (req, res) => {
    try {
      // Validate the request inputs
      const errorsValidation = myValidationResult(req);
      if (!errorsValidation.isEmpty()) {
        let errors = errorsValidation.array();
        return res.status(400).json({ errors });
      }
  
      // Find the user by email
      const usuarioEncontrado = await Usuario.findOne({ correo: req.body.correo });
      
      // Check if the user was found
      if (!usuarioEncontrado) {
        return res.status(401).json({ msg: "Correo o Contraseña incorrecta" });
      }
  
      // Validate the password using bcrypt
      const contraseñaComparada = bcrypt.compareSync(req.body.contraseña, usuarioEncontrado.contraseña);
      if (!contraseñaComparada) {
        return res.status(401).json({ msg: "Correo o Contraseña incorrecta" });
      }
  
      // Check the user's active status
      if (!usuarioEncontrado.activo) {
        return res.status(401).json({ msg: "Verifica tu licencia" });
      }
  
      // Generate a token for the user
      const token = jwtgenerador(usuarioEncontrado);
  
      // Create a session object for the user
      const usuarioSession = {
        correo: usuarioEncontrado.correo,
        rol: usuarioEncontrado.rol,
        _id: usuarioEncontrado._id,
        institucion: usuarioEncontrado.institucion,
        token: token,
      };
  
      // Save the session
      session.usuario = usuarioSession;
  
      // Send the success response with user data
      return res.status(200).send({
        msg: "Logueo Exitoso!",
        usuario: {
          nombre: usuarioEncontrado.nombreUsuario,
          correo: usuarioEncontrado.correo,
          rol: usuarioEncontrado.rol,
          token: token,
        },
      });
    } catch (error) {
  
      // Send an error response if there is a server error
      return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
  };

/**
 * Registers a new user in the database.
 *
 * @param {Object} req - The request object containing user data.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a success message and user data or an error message.
 */
const register = async (req, res) => {
    try {
      // Validate the request inputs
      const errorsValidation = myValidationResult(req);
      if (!errorsValidation.isEmpty()) {
        let errors = errorsValidation.array();
        return res.status(400).json({ errors });
      }
  
      // Check if the username already exists
      const nombreEncontrado = await Usuario.findOne({ nombreUsuario: req.body.nombreUsuario });
      if (nombreEncontrado) {
        return res.status(401).json({ msg: "El usuario ya existe" });
      }
  
      // Check if the email already exists
      const correoEncontrado = await Usuario.findOne({ correo: req.body.correo });
      if (correoEncontrado) {
        return res.status(401).json({ msg: "El usuario ya existe" });
      }
  
      // Create a new user
      let nuevoUsuario = new Usuario();
      nuevoUsuario.nombreUsuario = req.body.nombreUsuario;
      nuevoUsuario.correo = req.body.correo;
  
      // Encrypt the password
      const salt = bcrypt.genSaltSync(10);
      nuevoUsuario.contraseña = bcrypt.hashSync(req.body.contraseña, salt);
      nuevoUsuario.rol = req.body.rol;
      nuevoUsuario.activo = req.body.activo || true;
  
      // Save the new user to the database
      nuevoUsuario = await nuevoUsuario.save();
  
      // Send the success response with user data
      return res.status(201).send({
        msg: "Registro Exitoso!",
        usuario: {
          nombreUsuario: nuevoUsuario.nombreUsuario,
          correo: nuevoUsuario.correo,
          rol: nuevoUsuario.rol,
          activo: nuevoUsuario.activo,
        },
      });
    } catch (error) {
  
      // Send an error response if there is a server error
      return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
  };


/**
 * Resets the password for a user.
 *
 * @param {Object} req - The request object containing the old and new passwords.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a success message or an error message.
 */
const resetPassword = async (req, res) => {
    try {
      // Validate the request inputs
      const errorsValidation = myValidationResult(req);
      if (!errorsValidation.isEmpty()) {
        let errors = errorsValidation.array();
        return res.status(400).json({ errors });
      }
  
      // Find the user by session ID
      let usuarioEncontrado = await Usuario.findById({ _id: session.usuario._id });
      if (!usuarioEncontrado) {
        return res.status(401).json({ msg: "El usuario no se encontró" });
      }
  
      // Validate the old password
      const contraseñaComparada = bcrypt.compareSync(req.body.viejaContraseña, usuarioEncontrado.contraseña);
      if (!contraseñaComparada) {
        return res.status(401).json({ msg: "Contraseña incorrecta" });
      }
  
      // Encrypt the new password
      const salt = bcrypt.genSaltSync(10);
      usuarioEncontrado.contraseña = bcrypt.hashSync(req.body.nuevaContraseña, salt);
  
      // Save the updated user to the database
      usuarioEncontrado = await usuarioEncontrado.save();
  
      // Send the success response
      return res.status(200).send({
        msg: "Actualización Exitosa!",
        usuario: {
          nombre: usuarioEncontrado.nombreUsuario,
        },
      });
    } catch (error) {
      console.log(error);
  
      // Send an error response if there is a server error
      return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
  };

/**
 * Refreshes the user token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a new token or an error message.
 */
const refreshUserToken = async (req, res) => {
  if (!session.usuario) {
    return res.status(401).send({ msg: "No hay usuario en sesión" });
  }

  try {
    // Generate a new refresh token
    const token = refreshToken(session.usuario);

    // Send the new token in the response
    return res.status(200).send({
      msg: "Token actualizado",
      token: token,
    });
  } catch (error) {
    // Send an error response if the refresh token is invalid
    return res.status(400).send("Invalid refresh token.");
  }
};

/**
 * Disables a user by setting their "activo" status to false.
 *
 * @param {Object} req - The request object containing the user ID.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a success message and user data or an error message.
 */
const deshabilitarUsuario = async (req, res) => {
    try {
      // Find the user by ID
      let usuarioEncontrado = await Usuario.findById({ _id: req.params.id });
      if (!usuarioEncontrado) {
        return res.status(401).json({ msg: "El usuario no se encontró" });
      }
  
      // Set the "activo" status to false
      usuarioEncontrado.activo = false;
  
      // Save the updated user to the database
      usuarioEncontrado = await usuarioEncontrado.save();
  
      // Send the success response with user data
      return res.status(200).send({
        msg: "Desactivación Exitosa!",
        usuario: {
          nombre: usuarioEncontrado.nombreUsuario,
          correo: usuarioEncontrado.correo,
          rol: usuarioEncontrado.rol,
          activo: usuarioEncontrado.activo,
        },
      });
    } catch (error) {
      console.log(error);
  
      // Send an error response if there is a server error
      return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
  };

/**
 * Enables a user by setting their "activo" status to true.
 *
 * @param {Object} req - The request object containing the user ID.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a success message and user data or an error message.
 */
const activarUsuario = async (req, res) => {
    try {
      // Find the user by ID
      let usuarioEncontrado = await Usuario.findById({ _id: req.params.id });
      if (!usuarioEncontrado) {
        return res.status(401).json({ msg: "El usuario no se encontró" });
      }
  
      // Set the "activo" status to true
      usuarioEncontrado.activo = true;
  
      // Save the updated user to the database
      usuarioEncontrado = await usuarioEncontrado.save();
  
      // Send the success response with user data
      return res.status(200).send({
        msg: "Activación Exitosa!",
        usuario: {
          nombre: usuarioEncontrado.nombreUsuario,
          correo: usuarioEncontrado.correo,
          rol: usuarioEncontrado.rol,
          activo: usuarioEncontrado.activo,
        },
      });
    } catch (error) {
      console.log(error);
  
      // Send an error response if there is a server error
      return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
  };
module.exports = {
    listarUsuarios,
    listPorId,
    login,
    register,
    deshabilitarUsuario,
    activarUsuario,
    resetPassword,
    refreshUserToken,
};
