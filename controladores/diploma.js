const Diploma = require('../modelos/Diploma');
const Institucion = require('../modelos/Institucion');
const Graduado = require('../modelos/Graduado');
const session = require('express-session');

const listarTodos = async(req, res) => {
    try {
        
        const diplomas = await Diploma.find().populate({
            path:'institucion',
            select: 'codigoInstiticion nombreInstitucion ciudad'
        },
        {
            path:'graduado',
            select:'cedula nombreCompleto '
        });

        if(diplomas.lenght <= 0) return res.status(404).send({msg:"Data no encontrada"});
        
        return res.status(201).send(diplomas)

    } catch (error) {
        console.log(error);
        res.statu(500).send({msg:"Error interno del servidor",error: error});
    }
};
const listarPorId = async(req, res) =>{
    try {
        const { id } = req.params;

        const diplomaEncontrado = await Diploma.findById({_id: id}).populate({
            path:'institucion',
            select: 'codigoInstiticion nombreInstitucion ciudad'
        },
        {
            path:'graduado',
            select:'cedula nombreCompleto '
        });
        if(!diplomaEncontrado) res.statu(404).send({msg:"Diploma no encontrado"});

        return res.status(201).send(diplomaEncontrado);

    } catch (error) {
        console.log(error);
        res.statu(500).send({msg:"Error interno del servidor",error: error});
    }
};
const listarPorInstitucion = async(req, res) =>{
    try {
        
        const usuarioSession = session.usuario;
        console.log(usuarioSession);

        if(!usuarioSession) return res.status(400).send({msg:"Login necesario"});
        
        /* const diplomaEncontrado = await Diploma. */

    } catch (error) {
        console.log(error);
        res.statu(500).send({msg:"Error interno del servidor",error: error});
    }
};
const listarPorGraduado = async(req, res) => {};
const crear = async(req, res) => {};
const actualizar = async(req, res) => {};
const eliminar = async (req ,res )=> {};

module.exports = {
    listarTodos,
    listarPorId,
    listarPorGraduado,
    listarPorInstitucion,
    crear,
    actualizar,
    eliminar
}