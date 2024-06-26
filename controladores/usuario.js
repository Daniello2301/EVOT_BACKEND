const Usuario = require('../modelos/Usuario');
const bcrypt = require('bcryptjs');
const {jwtgenerador} = require('../helpers/JWT');
const session = require('express-session');
const Institucion = require('../modelos/Institucion');
const { validationResult } =require('express-validator')

const myValidationResult = validationResult.withDefaults({
    formatter: error => error.msg,
});

const listarUsarios = async(req, res) => {
    try {
        
        const usuarios = await Usuario.find();

        return res.status(200).send(usuarios)

    } catch (error) {
        console.log(error);
        return res.status(500).send({msg:"Error interno del servidor", error: error})
    }
}

const listPorId = async(req, res) => {
    try {
        
        const usuario = await Usuario.findById({ _id: req.params.id});
        if(!usuario){
            return res.status(401).json({msg: 'El usuario no se encontro'});
        }

        return res.status(200).send(usuario)

    } catch (error) {
        console.log(error);
        return res.status(500).send({msg:"Error interno del servidor", error: error})
    }
}

const login = async(req, res) => {
    try {
        
        const errorsValidation = myValidationResult(req);
        if (!errorsValidation.isEmpty()) {
            let errors = errorsValidation.array()
            return res.status(500).json({
                errors
            });
        }

        // Validamos que el correo exista
        const usuarioEncontrado = await Usuario.findOne({ correo: req.body.correo});
        if(!usuarioEncontrado){
            return res.status(401).json({msg: 'Correo o Contraseña incorrecta'});
        }

        // Validamos que la contraseña este bien usando bcryptjs para comparar
        const contraseñaComparada = bcrypt.compareSync(req.body.contraseña, usuarioEncontrado.contraseña);
        if(!contraseñaComparada){
            return res.status(401).json({msg: 'Correo o Contraseña incorrecta'});
        }

        // Validamos estado del usuario antes de ingresar el usuario
        if(!usuarioEncontrado.activo){
            return res.status(401).json({msg: 'Verifica tu licencia'});
        }

        //Generar el token
        const token = jwtgenerador(usuarioEncontrado);
        /* console.log(usuarioEncontrado); */

        const usuarioSession = {
            correo: usuarioEncontrado.correo,
            rol: usuarioEncontrado.rol,
            _id: usuarioEncontrado._id,
            institucion: usuarioEncontrado.institucion
        }

        session.usuario = usuarioSession;

        return res.status(200).send({
            msg:"Logueo Existos!",
            usuario:{
                nombre: usuarioEncontrado.nombreUsuario,
                correo:usuarioEncontrado.correo,
                rol: usuarioEncontrado.rol,
                token: token
            },
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({msg:"Error interno del servidor", error: error})
    }
}

const register = async(req, res) => {
    try {
        
        const errorsValidation = myValidationResult(req);
        if (!errorsValidation.isEmpty()) {
            let errors = errorsValidation.array()
            return res.status(500).json({
                errors
            });
        }

        // Que no exista el nombre
        const nombreEncontrado = await Usuario.findOne({ nombreUsuario: req.body.nombreUsuario});
        if(nombreEncontrado){
            return res.status(401).json({msg: 'El usuario ya existe'});
        }

        // Que no exista el correo
        const correoEncontrado = await Usuario.findOne({ correo: req.body.correo});
        if(correoEncontrado){
            return res.status(401).json({msg: 'El usuario ya existe'});
        }

        let nuevoUsuario = new Usuario();

        nuevoUsuario.nombreUsuario = req.body.nombreUsuario;
        nuevoUsuario.correo = req.body.correo;
        // Encriptamos la contraseña
        const salt = bcrypt.genSaltSync(10);
        const contraseñaEncriptada = bcrypt.hashSync(req.body.contraseña, salt);

        nuevoUsuario.contraseña = contraseñaEncriptada;
        nuevoUsuario.rol = req.body.rol;
        nuevoUsuario.activo = req.body.activo || true;

        nuevoUsuario = await nuevoUsuario.save();

        return res.status(201).send({
            msg:"Registro Existos!",
            usuario:{
                nombreUsuario: nuevoUsuario.nombreUsuario,
                correo:nuevoUsuario.correo,
                rol: nuevoUsuario.rol,
                activo: nuevoUsuario.activo
            }
        });

        
    } catch (error) {
        console.log(error);
        return res.status(500).send({msg:"Error interno del servidor", error: error})
    }
}

const resetPassword = async(req, res) => {

    try {
        
        // Validamos los inputs de entrada
        const errorsValidation = myValidationResult(req);
        if (!errorsValidation.isEmpty()) {
            let errors = errorsValidation.array()
            return res.status(500).json({
                errors
            });
        }

        // Search usr by session id
        let usuarioEncontrado = await Usuario.findById({ _id: session.usuario._id});
        console.log(usuarioEncontrado);
        if(!usuarioEncontrado){
            return res.status(401).json({msg: 'El usuario no se encontro'});
        }

        // Encriptamos la contraseña
        const salt = bcrypt.genSaltSync(10);
        const contraseñaEncriptada = bcrypt.hashSync(req.body.nuevaContraseña, salt);

        // Validate old password
        const contraseñaComparada = bcrypt.compareSync(req.body.viejaContraseña, usuarioEncontrado.contraseña);
        if(!contraseñaComparada){
            return res.status(401).json({msg: 'Contraseña incorrecta'});
        }

        // Update password
        usuarioEncontrado.contraseña = contraseñaEncriptada;

        usuarioEncontrado = await usuarioEncontrado.save();

        return res.status(200).send({
            msg:"Actualizacion Existos!",
            usuario: {
                nombre: usuarioEncontrado.nombreUsuario
            }
        
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({msg:"Error interno del servidor", error: error})
    }

}

const deshabilitarUsuario = async(req, res) => {

    try {
        
        // Buscamos por id el usuario
        let usuarioEncontrado = await Usuario.findById({ _id: req.params.id })
        if(!usuarioEncontrado){
            return res.status(401).json({msg: 'El usuario no se encontro'});
        }

        // Cambiamos el estado
        usuarioEncontrado.activo = false;

        usuarioEncontrado = await usuarioEncontrado.save();

        return res.status(200).send({
            msg:"Desactivacion Existos!",
            usuario:{
                nombre: usuarioEncontrado.nombreUsuario,
                correo:usuarioEncontrado.correo,
                rol: usuarioEncontrado.rol,
                activo: usuarioEncontrado.activo
            }
        });

        
    } catch (error) {
        console.log(error);
        return res.status(500).send({msg:"Error interno del servidor", error: error})
    }

}

const activarUsuario = async(req, res) =>{
    try {
        
        // Buscamos por id el usuario
        let usuarioEncontrado = await Usuario.findById({ _id: req.params.id })
        if(!usuarioEncontrado){
            return res.status(401).json({msg: 'El usuario no se encontro'});
        }

        // Cambiamos el estado
        usuarioEncontrado.activo = true;

        usuarioEncontrado = await usuarioEncontrado.save();

        return res.status(200).send({
            msg:"Activacion Existos!",
            usuario:{
                nombre: usuarioEncontrado.nombreUsuario,
                correo:usuarioEncontrado.correo,
                rol: usuarioEncontrado.rol,
                activo: usuarioEncontrado.activo
            }
        });

        
    } catch (error) {
        console.log(error);
        return res.status(500).send({msg:"Error interno del servidor", error: error})
    }
}
module.exports = { 
    listarUsarios,
    listPorId,
    login,
    register,
    deshabilitarUsuario,
    activarUsuario,
    resetPassword
}