const mongoose = require('mongoose')
const Graduado = require('../modelos/Graduado');

const getGraduados = async(req, res) => {
    try {
        
        const graduados = await Graduado.find();
        if(graduados.length > 0){
            res.status(200).json(graduados);
        }else{
            res.status(404).json({ msg: "No informacion disponible"});
        }

    } catch (error) {
        res.statu(500).send(error);
    }
}

const getById = async(req, res) => {
    try {
        
        const { id } = req.params;

        const graduadoEncontrado = await Graduado.findById({ _id: id });
        if(graduadoEncontrado){
            return res.status(200).json({ msg: "Graduado encontrado", gradudo: graduadoEncontrado });
        }else{
            return res.status(404).json({ msg: "Graduado no econtrado" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({error});
    }
}

const createGraduado = async(req, res) => {
    try {
        
        const { ...data } = req.body;

        const graduadoExistente = await Graduado.findOne({ cedula: data.cedula });
        if(graduadoExistente){
            return res.status(400).json({ msg: "El graduado ya existe"});
        }

        let nuevoGraduado = new Graduado();
        
        nuevoGraduado.cedula = data.cedula;
        nuevoGraduado.nombreCompleto = data.nombreCompleto;
        nuevoGraduado.fechaNacimiento = data.fechaNacimiento || "0000-00-00T00:00:00.000Z";

        nuevoGraduado = await nuevoGraduado.save();

        return res.status(200).json({ msg: "El graduado se guardo correctamtene", graduado: nuevoGraduado});
        
    } catch (error) {
        console.log(error);
        return res.status(500).send({msg:"Error interno del servidor", error: error})
    }
}

const updateGraduado = async(req, res) => {
    try {
        
        const { id } = req.params;

        let gradudoEncontrado = await Graduado.findById({ _id: id });
        if(!gradudoEncontrado){
            return res.status(404).json({ msg: "Graduado no encontrado"});
        }

        const { cedula, nombreCompleto, fechaNacimiento } = req.body;

        const graduadoExistente = await Graduado.findOne({ cedula: cedula, _id: {$ne: id}});
        if(graduadoExistente){
            return res.status(400).json({ msg: "El graduado ya existe"});
        }
        
        /* if(cedula){
            gradudoEncontrado.cedula = cedula;
        }else{
            gradudoEncontrado.cedula = gradudoEncontrado.cedula;            
        } */
        gradudoEncontrado.cedula = cedula ? cedula : gradudoEncontrado.cedula;
        gradudoEncontrado.nombreCompleto = nombreCompleto ? nombreCompleto : gradudoEncontrado.nombreCompleto;
        gradudoEncontrado.fechaNacimiento = fechaNacimiento ? fechaNacimiento : gradudoEncontrado.fechaNacimiento ;

        gradudoEncontrado = await gradudoEncontrado.save();

        return res.status(200).json({ msg: "El graduado se actualizo correctamente", graduado: gradudoEncontrado});


    } catch (error) {
        console.log(error);
        return res.status(404).json({ msg: "Internal server error!" });
    }
}

const deleteGraduado = async(req, res) => {
    try {
        
        const { id } = req.params;
        
        const response = await Graduado.findByIdAndDelete(id);
        
        return res.status(200).json({ msg: "Graduado eliminado correctamente!", data: response});

    } catch (error) {
        console.log(error);
        return res.status(404).json({ msg: "Internal server error!" });
    }
}

module.exports ={
    getGraduados,
    getById,
    createGraduado,
    updateGraduado,
    deleteGraduado,
}