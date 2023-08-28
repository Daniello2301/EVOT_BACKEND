const Institucion = require('../modelos/Institucion')
const Usuario = require('../modelos/Usuario')
const session = require('express-session')

const getAll = async (req, res) => {
    try {

        const usuarioSession = session.usuario
        console.log(usuarioSession);
        /*  const instituciones = await Institucion.aggregate([
            {
                $lookup: {
                    from: 'usuarios', // Name of the Usuario collection
                    localField: 'usuario',
                    foreignField: '_id',
                    as: 'usuarioInfo'
                }
            },
            {
                $match: {
                    'usuarioInfo.activo': true
                }
            },
            {
                $project: {
                    codigoInstiticion: 1,
                    nombreInstitucion: 1,
                    ciudad: 1,
                    departamento: 1,
                    resolucion: 1,
                    fechaResolucion: 1,
                    estado: 1,
                    usuarioInfo: {
                        nombreUsuario: 1,
                        correo: 1,
                        rol: 1,
                        activo: 1
                        // Include other user attributes you want
                    }
                }
            }

        ]); */
        const instituciones = await Institucion.find().populate({
            path: 'usuario',
            select: "nombreUsuario correo activo",
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
        const institucionEncontrada = await Institucion.findById({ _id: id });
        if (!institucionEncontrada) return res.status(404).send({ msg: "Informacion no encontrada" });
        if (!institucionEncontrada.estado == true) return res.status(404).send({ msg: "Verfica el estado de tu licencia" });

        return res.status(201).send(institucionEncontrada);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error })
    }
};
const getWithActveUser = async(req, res) =>{
    try {
        const usuarioSession = session.usuario
        console.log(usuarioSession);
        const institucionesActivas = await Institucion.aggregate([
            {
                $lookup: {
                    from: 'usuarios', // Name of the Usuario collection
                    localField: 'usuario',
                    foreignField: '_id',
                    as: 'usuario'
                }
            },
            {
                $match: {
                    'usuario.activo': true
                }
            },
            {
                $project: {
                    estado: 1,
                    codigoInstiticion: 1,
                    nombreInstitucion: 1,
                    ciudad: 1,
                    departamento: 1,
                    resolucion: 1,
                    fechaResolucion: 1,
                    usuario: {
                        nombreUsuario: 1,
                        correo: 1,
                        rol: 1,
                        activo: 1
                        // Include other user attributes you want
                    }
                }
            }

        ]);

        if (institucionesActivas.length <= 0) return res.status(404).send({ msg: "Informacion no encontrada" });

        return res.status(201).send(institucionesActivas);

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

        let usuarioRegistrado = await Usuario.findById({_id: usuarioSession._id});
        if (!usuarioRegistrado) return res.status(500).send({ msg: "Login necesario" });

        let newInstitucion = new Institucion();

        newInstitucion.codigoInstiticion = req.body.codigoInstiticion
        newInstitucion.nombreInstitucion = req.body.nombreInstitucion
        newInstitucion.ciudad = req.body.ciudad
        newInstitucion.departamento = req.body.departamento
        newInstitucion.resolucion = req.body.resolucion
        newInstitucion.fechaResolucion = req.body.fechaResolucion
        newInstitucion.usuario = usuarioSession?._id

        newInstitucion = await newInstitucion.save();

        usuarioRegistrado.institucion = newInstitucion._id;
        usuarioRegistrado.save();
        if(!session.usuario?.institucion){
            session.usuario.institucion = newInstitucion._id;
        }

        console.log(session.usuario);

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

        let institucionEncontrada = await Institucion.findById({ _id: id });
        if (!institucionEncontrada) return res.status(409).send({ msg: "La institucion no fue encontrada" });

        const { codigoInstiticion, nombreInstitucion, ciudad, departamento, resolucion, fechaResolucion, estado } = req.body

        let institucionExistente = await Institucion.findOne({ codigoInstiticion: codigoInstiticion, _id: { $ne: id } });
        if (institucionExistente) return res.status(409).send({ msg: "La institucion ya existe" });

        institucionEncontrada.codigoInstiticion = codigoInstiticion || institucionEncontrada.codigoInstiticion;
        institucionEncontrada.nombreInstitucion = nombreInstitucion || institucionEncontrada.nombreInstitucion;
        institucionEncontrada.ciudad = ciudad || institucionEncontrada.ciudad;
        institucionEncontrada.departamento = departamento || institucionEncontrada.departamento;
        institucionEncontrada.resolucion = resolucion || institucionEncontrada.resolucion;
        institucionEncontrada.fechaResolucion = fechaResolucion || institucionEncontrada.fechaResolucion;
        institucionEncontrada.usuario = usuarioSession._id || institucionEncontrada.usuario;
        institucionEncontrada.estado = estado || institucionEncontrada.estado;

        institucionEncontrada = await institucionEncontrada.save();

        return res.status(201).send(institucionEncontrada);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error })
    }
};
const desahabilitar = async (req, res) => {
    try {
        const { id } = req.params;

        let institucionEncontrada = await Institucion.findById({ _id: id });
        if (!institucionEncontrada) return res.status(409).send({ msg: "La institucion no fue encontrada" });

        institucionEncontrada.estado = false;

        institucionEncontrada = await institucionEncontrada.save();

        return res.status(201).send(institucionEncontrada);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error })
    }
};
const activar = async (req, res) => {
    try {
        const { id } = req.params;

        let institucionEncontrada = await Institucion.findById({ _id: id });
        if (!institucionEncontrada) return res.status(409).send({ msg: "La institucion no fue encontrada" });

        institucionEncontrada.estado = true;

        institucionEncontrada = await institucionEncontrada.save();

        console.log(institucionEncontrada);

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
    actualizar,
    desahabilitar,
    getWithActveUser,
    activar
}
