const Institucion = require('../modelos/Institucion')
const session = require('express-session')

const getAll = async (req, res) => {
    try {

        const usuarioSession = session.usuario
        console.log(usuarioSession);
        const instituciones = await Institucion.find().populate({
            path: 'usuario',
            select: "nombreUsuario correo"
        });

        if (instituciones.length <= 0) return res.status(404).send({ msg: "Informacion no encontrada" });

        return res.status(201).send(instituciones);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error })
    }
};
const getById = async (req, res) => {
    try {

        const { id } = req.params;
        const institucionEncontrada = Institucion.finById({ _id: id });
        if (!institucionEncontrada) return res.status(404).send({ msg: "Informacion no encontrada" });

        return res.status(201).send(institucionEncontrada);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error })
    }
};
const crear = async (req, res) => {
    try {

        const usuarioSession = session.usuario
        console.log(usuarioSession);

        const institcionExistente = await Institucion.findOne({ codigoInstiticion: req.body.codigoInstiticion });
        if (institcionExistente) return res.status(409).send({ msg: "La institucion ya existe" });

        if (!usuarioSession) return res.status(500).send({ msg: "Login necesario" });

        let newInstitucion = new Institucion();

        newInstitucion.codigoInstiticion = req.body.codigoInstiticion
        newInstitucion.nombreInstitucion = req.body.nombreInstitucion
        newInstitucion.ciudad = req.body.ciudad
        newInstitucion.departamento = req.body.departamento
        newInstitucion.resolucion = req.body.resolucion
        newInstitucion.fechaResolucion = req.body.fechaResolucion
        newInstitucion.usuario = usuarioSession?._id

        newInstitucion = await newInstitucion.save();

        return res.status(201).send(newInstitucion);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error })
    }
};
const actualizar = async (req, res) => {
    try {
        
        const usuarioSession = session.usuario
        console.log(usuarioSession);

        const { id } = req.params;

        if (!usuarioSession) return res.status(500).send({ msg: "Login necesario" });

        let institucionEncontrada = await Institucion.findById({_id : id});
        if(!institucionEncontrada) return res.status(409).send({ msg: "La institucion no fue encontrada" });

        const { codigoInstiticion, nombreInstitucion, ciudad, departamento, resolucion, fechaResolucion } = req.body

        let institucionExistente = await Institucion.findOne({ codigoInstiticion: codigoInstiticion, _id:{ $ne: id} });
        if(institucionExistente) return res.status(409).send({ msg: "La institucion ya existe" });

        institucionEncontrada.codigoInstiticion = codigoInstiticion || institucionEncontrada.codigoInstiticion;
        institucionEncontrada.nombreInstitucion = nombreInstitucion || institucionEncontrada.nombreInstitucion;
        institucionEncontrada.ciudad = ciudad || institucionEncontrada.ciudad;
        institucionEncontrada.departamento = departamento || institucionEncontrada.departamento;
        institucionEncontrada.resolucion = resolucion || institucionEncontrada.resolucion;
        institucionEncontrada.fechaResolucion = fechaResolucion || institucionEncontrada.fechaResolucion;

        institucionEncontrada = await institucionEncontrada.save();

        return res.status(201).send(institucionEncontrada);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error })
    }
};


module.exports = {
    getAll,
    getById,
    crear,
    actualizar
}
