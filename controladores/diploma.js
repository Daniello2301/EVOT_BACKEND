const Diploma = require('../modelos/Diploma');
const Institucion = require('../modelos/Institucion');
const Graduado = require('../modelos/Graduado');
const session = require('express-session');
const { validationResult } = require('express-validator');

const myValidationResult = validationResult.withDefaults({
    formatter: error => error.msg,
});

const listarTodos = async (req, res) => {
    try {

        const diplomas = await Diploma.find().populate({
            path: 'institucion',
            select: 'codigoInstiticion nombreInstitucion ciudad'
        }).populate(
            {
                path: 'graduado',
                select: 'cedula nombreCompleto '
            });

        if (diplomas.length <= 0) return res.status(404).send({ msg: "Data no encontrada" });

        return res.status(200).send(diplomas)

    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};
const listarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const diplomaEncontrado = await Diploma.findById({ _id: id }).populate({
            path: 'institucion',
            select: 'codigoInstiticion nombreInstitucion ciudad'
        }).populate(
            {
                path: 'graduado',
                select: 'cedula nombreCompleto '
            });
        if (!diplomaEncontrado) return res.status(404).send({ msg: "Diploma no encontrado" });

        return res.status(202).send(diplomaEncontrado);

    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};
const listarPorInstitucion = async (req, res) => {
    try {

        const usuarioSession = session.usuario;

        if (!usuarioSession) return res.status(400).send({ msg: "Login necesario" });

        const diplomasEncontrado = await Diploma.find({
            institucion: usuarioSession.institucion
        }).populate(
            {
                path: 'graduado',
                select: 'cedula nombreCompleto '
            });

        if (!diplomasEncontrado) return res.status(404).send({ msg: "La institucion actual no tiene diplomas registrados" });

        return res.status(200).send(diplomasEncontrado);

    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};
const listarPorGraduado = async (req, res) => {
    try {
        const {cedula}  = req.params;

        const graduadoEncontrado = await Graduado.findOne({ cedula: cedula});
        if(!graduadoEncontrado)  return res.status(400).send({ msg: "Graduado no encontrado" });

        const diplomasEncontrado = await Diploma.aggregate([
            {
                $lookup: {
                    from: 'graduados',
                    localField: 'graduado',
                    foreignField: '_id',
                    as: 'graduado'
                },
            },
            {
                $lookup: {
                    from: 'institucions',
                    localField: 'institucion',
                    foreignField: '_id',
                    as: 'institucion'
                },
            },
            {
                $match: {
                    'graduado.cedula': parseInt(graduadoEncontrado.cedula)
                }
            },
            {
                $unwind: '$graduado'
            },
            {
                $unwind: '$institucion'
            },
            {
                $project: {
                    codigoDiloma: 1,
                    nombrePrograma: 1,
                    nivelPrograma: 1,
                    registroPrograma: 1,
                    libro: 1,
                    fechaGrados: 1,
                    estado: 1,
                    graduado: {
                        cedula: 1,
                        nombreCompleto: 1,
                        fechaNacimiento: 1,
                    },
                    institucion: {
                        codigoInstiticion: 1,
                        nombreInstitucion: 1,
                        ciudad: 1,
                        departamento: 1,
                        resolucion: 1,
                        fechaResolucion: 1,
                    }
                }
            }
        ]);
        console.log(diplomasEncontrado); 
        if (diplomasEncontrado.length <= 0) return res.status(404).send({ msg: "Diplomas no encontradoss" });

        return res.status(200).send(diplomasEncontrado);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};
const crear = async (req, res) => {
    try {

        const errorsValidation = myValidationResult(req);

        if (!errorsValidation.isEmpty()) {
            let errors = errorsValidation.array()
            console.log(errors)
            return res.status(500).json({
                errors
            });
        }

        const usuarioSession = session.usuario;
        if (!usuarioSession) return res.status(400).send({ msg: "Login Necesario" });

        let nuevoDiploma = new Diploma();

        const diplomaExistente = await Diploma.findOne({ codigoDiploma: req.body.codigoDiploma });
        if (diplomaExistente) {
            return res.status(400).send({ msg: "El diploma ya existe" });
        }
        const graduado = await Graduado.findOne({
            cedula: req.body.graduado
        });
        console.log("Usuario: ", graduado._id);
        if (!graduado) return res.statu(404).send({ msg: "El graduado no existe, por favor registralo" });


        nuevoDiploma.codigoDiploma = req.body.codigoDiploma;
        nuevoDiploma.nombrePrograma = req.body.nombrePrograma;
        nuevoDiploma.nivelPrograma = req.body.nivelPrograma;
        nuevoDiploma.registroProgramas = req.body.registroPrograma;
        nuevoDiploma.libro = req.body.libro;
        nuevoDiploma.fechaGrados = req.body.fechaGrados;
        nuevoDiploma.estado = true || req.body.estado
        nuevoDiploma.graduado = graduado._id;
        nuevoDiploma.institucion = usuarioSession.institucion ?? req.body.institucion;

        nuevoDiploma = await nuevoDiploma.save();

        return res.status(201).send(nuevoDiploma);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};
const actualizar = async (req, res) => {
    try {
        const usuarioSession = session.usuario;
        if (!usuarioSession) return res.status(400).send({ msg: "Login Necesario" });

        const { id } = req.params;
        const { codigoDiploma, ...data } = req.body;

        let diplomaEncontrado = await Diploma.findById({ _id: id });
        if (!diplomaEncontrado) {
            return res.status(404).send({ msg: "El diploma no existe" });
        }

        const graduado = await Graduado.findOne({
            cedula: data.graduado
        });
        if (!graduado) return res.statu(404).send({ msg: "El graduado no existe" });


        const diplomaExistente = await Diploma.findOne({ codigoDiploma: codigoDiploma, _id: { $ne: id } });
        if (diplomaExistente) return res.status(400).send({ msg: "El diploma ya existe" });

        diplomaEncontrado.codigoDiploma = codigoDiploma ?? diplomaEncontrado.codigoDiploma;
        diplomaEncontrado.nombrePrograma = data.nombrePrograma ?? diplomaEncontrado.nombrePrograma;
        diplomaEncontrado.nivelPrograma = data.nivelPrograma ?? diplomaEncontrado.nivelPrograma;
        diplomaEncontrado.registroProgramas = data.registroPrograma ?? diplomaEncontrado.registroProgramas;
        diplomaEncontrado.libro = data.libro ?? diplomaEncontrado.libro;
        diplomaEncontrado.fechaGrados = data.fechaGrados ?? diplomaEncontrado.fechaGrados;
        diplomaEncontrado.estado = data.estado ?? diplomaEncontrado.estado;
        diplomaEncontrado.graduado = graduado._id ?? diplomaEncontrado.graduado;
        diplomaEncontrado.institucion = usuarioSession.institucion ?? diplomaEncontrado.institucion;

        diplomaEncontrado = await diplomaEncontrado.save();

        return res.status(201).send(diplomaEncontrado);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};
const eliminar = async (req, res) => {

    try {

        const { id } = req.params;

        const diplomaBorrado = await Diploma.findByIdAndDelete({ _id: id });

        if (!diplomaBorrado) res.status(404).send({ msg: "Diploma No encontrado" });

        res.status(202).send({ msg: "Diploma borrado correctamente ", diploma: diplomaBorrado });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }

};

module.exports = {
    listarTodos,
    listarPorId,
    listarPorGraduado,
    listarPorInstitucion,
    crear,
    actualizar,
    eliminar
}