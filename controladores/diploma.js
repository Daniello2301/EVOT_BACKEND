const Diploma = require('../modelos/Diploma');
const Institucion = require('../modelos/Institucion');
const Graduado = require('../modelos/Graduado');
const session = require('express-session');
const { validationResult } = require('express-validator');

const myValidationResult = validationResult.withDefaults({
    formatter: error => error.msg,
});

/**
 * Listar todos los diplomas en la base de datos.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con una lista de diplomas o un mensaje de error.
 */
const listarTodos = async (req, res) => {
    try {
        // Buscar todos los diplomas y popular las referencias a 'institucion' y 'graduado'
        const diplomas = await Diploma.find().populate({
            path: 'institucion',
            select: 'codigoInstiticion nombreInstitucion ciudad'
        }).populate({
            path: 'graduado',
            select: 'cedula nombreCompleto'
        });

        // Verificar si se encontraron diplomas
        if (diplomas.length <= 0) return res.status(404).send({ msg: "Data no encontrada" });

        // Enviar la lista de diplomas
        return res.status(200).send(diplomas);

    } catch (error) {
        // Manejo de errores
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};

/**
 * Listar un diploma específico por su ID.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con el diploma encontrado o un mensaje de error.
 */
const listarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar el diploma por ID y popular las referencias a 'institucion' y 'graduado'
        const diplomaEncontrado = await Diploma.findById({ _id: id }).populate({
            path: 'institucion',
            select: 'codigoInstiticion nombreInstitucion ciudad'
        }).populate({
            path: 'graduado',
            select: 'cedula nombreCompleto'
        });

        // Verificar si se encontró el diploma
        if (!diplomaEncontrado) return res.status(404).send({ msg: "Diploma no encontrado" });

        // Enviar el diploma encontrado
        return res.status(202).send(diplomaEncontrado);

    } catch (error) {
        // Manejo de errores
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};

/**
 * Listar todos los diplomas asociados a la institución del usuario en sesión.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con los diplomas encontrados o un mensaje de error.
 */
const listarPorInstitucion = async (req, res) => {
    try {
        const usuarioSession = session.usuario;

        // Verificar si el usuario ha iniciado sesión
        if (!usuarioSession) return res.status(400).send({ msg: "Login necesario" });

        // Buscar los diplomas asociados a la institución del usuario
        const diplomasEncontrado = await Diploma.find({
            institucion: usuarioSession.institucion
        }).populate({
            path: 'graduado',
            select: 'cedula nombreCompleto'
        });

        // Verificar si se encontraron diplomas
        if (diplomasEncontrado.length === 0) {
            return res.status(404).send({ msg: "La institucion actual no tiene diplomas registrados" });
        }

        // Enviar los diplomas encontrados
        return res.status(200).send(diplomasEncontrado);

    } catch (error) {
        // Manejo de errores
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};

/**
 * Listar todos los diplomas asociados a un graduado específico por su número de cédula.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con los diplomas encontrados o un mensaje de error.
 */
const listarPorGraduado = async (req, res) => {
    try {
        const { cedula } = req.params;

        // Buscar el graduado por su número de cédula
        const graduadoEncontrado = await Graduado.findOne({ cedula: cedula });
        
        // Verificar si el graduado existe
        if (!graduadoEncontrado) {
            return res.status(400).send({ msg: "Graduado no encontrado" });
        }

        console.log(graduadoEncontrado)
        
        // Buscar los diplomas asociados al graduado encontrado
        const diplomasEncontrados = await Diploma.aggregate([
            {
                $lookup: {
                    from: 'graduados',  // Colección a unir
                    let: { graduadoId: '$graduado' },  // Variable local (id del graduado en Diploma)
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$graduadoId'] } } },  // Coincidencia con el id del graduado
                        { $project: { cedula: 1, nombreCompleto: 1 } }  // Proyección selectiva de campos
                    ],
                    as: 'graduado'  // Nombre del campo donde se almacenarán los resultados
                }
            },
            {
                $lookup: {
                    from: 'institucions',  // Colección a unir
                    let: { institucionId: '$institucion' },  // Variable local (id de la institución en Diploma)
                    pipeline: [
                        { $match: { $expr: { $eq: ['$_id', '$$institucionId'] } } },  // Coincidencia con el id de la institución
                        { $project: { codigoInstiticion: 1, nombreInstitucion: 1, ciudad: 1, departamento: 1 } }  // Proyección selectiva de campos
                    ],
                    as: 'institucion'  // Nombre del campo donde se almacenarán los resultados
                }
            },
            {
                $match: {
                    'graduado.cedula': parseInt(graduadoEncontrado.cedula) // Filtrar por el número de cédula del graduado encontrado
                }
            },
            {
                $unwind: '$graduado' // Desenrollar el array 'graduado' para obtener un objeto por cada documento de 'Diploma'
            },
            {
                $unwind: '$institucion' // Desenrollar el array 'institucion' para obtener un objeto por cada documento de 'Diploma'
            },
            {
                $project: {
                    codigoDiloma: 1, // Incluir el campo 'codigoDiloma' en el resultado final
                    nombrePrograma: 1, // Incluir el campo 'nombrePrograma' en el resultado final
                    nivelPrograma: 1, // Incluir el campo 'nivelPrograma' en el resultado final
                    registroPrograma: 1, // Incluir el campo 'registroPrograma' en el resultado final
                    libro: 1, // Incluir el campo 'libro' en el resultado final
                    fechaGrados: 1, // Incluir el campo 'fechaGrados' en el resultado final
                    estado: 1, // Incluir el campo 'estado' en el resultado final
                    graduado: 1,
                    institucion: 1
                }
            }
        ]);

        console.log(diplomasEncontrados)

        // Verificar si se encontraron diplomas asociados al graduado
        if (diplomasEncontrados.length <= 0) {
            return res.status(404).send({ msg: "Diplomas no encontrados" });
        }

        // Enviar los diplomas encontrados
        return res.status(200).send(diplomasEncontrados);

    } catch (error) {
        // Manejo de errores
        console.log(error);
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};


/**
 *  Crear un nuevo diploma en la base de datos.
 * 
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con el diploma creado o un mensaje de error.
 *   
 **/
const crear = async (req, res) => {
    try {
        // Validación de errores utilizando la función myValidationResult
        const errorsValidation = myValidationResult(req);

        if (!errorsValidation.isEmpty()) {
            let errors = errorsValidation.array();
            console.log(errors); // Mostrar errores en consola para debug
            return res.status(500).json({ errors });
        }

        // Verificar si hay un usuario en sesión
        const usuarioSession = session.usuario;
        if (!usuarioSession) return res.status(400).send({ msg: "Login Necesario" });

        // Crear una nueva instancia de Diploma
        let nuevoDiploma = new Diploma();

        // Verificar si ya existe un diploma con el mismo código
        const diplomaExistente = await Diploma.findOne({ codigoDiploma: req.body.codigoDiploma });
        if (diplomaExistente) {
            return res.status(400).send({ msg: "El diploma ya existe" });
        }

        // Buscar el graduado asociado al diploma por su número de cédula
        const graduado = await Graduado.findOne({ cedula: req.body.cedula });
        if (!graduado) {
            return res.status(404).send({ msg: "El graduado no existe, por favor regístralo" });
        }

        // Asignar los valores del cuerpo de la solicitud al nuevo diploma
        nuevoDiploma.codigoDiploma = req.body.codigoDiploma;
        nuevoDiploma.nombrePrograma = req.body.nombrePrograma;
        nuevoDiploma.nivelPrograma = req.body.nivelPrograma;
        nuevoDiploma.registroPrograma = req.body.registroPrograma;
        nuevoDiploma.libro = req.body.libro;
        nuevoDiploma.fechaGrados = req.body.fechaGrados;
        nuevoDiploma.estado = true || req.body.estado;
        nuevoDiploma.graduado = graduado._id;
        nuevoDiploma.institucion = usuarioSession.institucion ?? req.body.institucion;

        // Guardar el nuevo diploma en la base de datos
        nuevoDiploma = await nuevoDiploma.save();

        // Devolver una respuesta con estado 201 (Created) y el objeto del diploma creado
        return res.status(201).send({ msg: "Diploma creado correctamente", diploma: nuevoDiploma });

    } catch (error) {
        console.log(error); // Mostrar errores en consola para debug
        // Devolver una respuesta con estado 500 (Internal Server Error) y detalles del error
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};

/** 
 * Actualizar un diploma en la base de datos.
 * 
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con el diploma actualizado o un mensaje de error.
 * 
 */
const actualizar = async (req, res) => {
    try {
        // Verificar si hay un usuario en sesión
        const usuarioSession = session.usuario;
        if (!usuarioSession) return res.status(400).send({ msg: "Login Necesario" });

        // Obtener el ID del diploma a actualizar desde los parámetros de la solicitud
        const { id } = req.params;

        // Extraer el código de diploma y el resto de datos del cuerpo de la solicitud
        const { codigoDiploma, ...data } = req.body;

        // Buscar el diploma a actualizar por su ID
        let diplomaEncontrado = await Diploma.findById(id);
        if (!diplomaEncontrado) {
            return res.status(404).send({ msg: "El diploma no existe" });
        }

        // Buscar el graduado asociado al diploma por su número de cédula
        const graduado = await Graduado.findOne({ cedula: data.graduado });
        if (!graduado) {
            return res.status(404).send({ msg: "El graduado no existe" });
        }

        // Verificar si ya existe un diploma con el mismo código, excluyendo el diploma actual
        const diplomaExistente = await Diploma.findOne({ codigoDiploma: codigoDiploma, _id: { $ne: id } });
        if (diplomaExistente) {
            return res.status(400).send({ msg: "El diploma ya existe" });
        }

        // Actualizar los campos del diploma encontrado con los datos proporcionados
        diplomaEncontrado.codigoDiploma = codigoDiploma ?? diplomaEncontrado.codigoDiploma;
        diplomaEncontrado.nombrePrograma = data.nombrePrograma ?? diplomaEncontrado.nombrePrograma;
        diplomaEncontrado.nivelPrograma = data.nivelPrograma ?? diplomaEncontrado.nivelPrograma;
        diplomaEncontrado.registroPrograma = data.registroPrograma ?? diplomaEncontrado.registroPrograma;
        diplomaEncontrado.libro = data.libro ?? diplomaEncontrado.libro;
        diplomaEncontrado.fechaGrados = data.fechaGrados ?? diplomaEncontrado.fechaGrados;
        diplomaEncontrado.estado = data.estado ?? diplomaEncontrado.estado;
        diplomaEncontrado.graduado = graduado._id ?? diplomaEncontrado.graduado;
        diplomaEncontrado.institucion = usuarioSession.institucion ?? diplomaEncontrado.institucion;

        // Guardar los cambios actualizados del diploma en la base de datos
        diplomaEncontrado = await diplomaEncontrado.save();

        // Devolver una respuesta con estado 201 (Created) y el objeto del diploma actualizado
        return res.status(201).send(diplomaEncontrado);

    } catch (error) {
        console.log(error); // Mostrar errores en consola para propósitos de depuración
        // Devolver una respuesta con estado 500 (Internal Server Error) y detalles del error
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};

/** 
 * Eliminar un diploma de la base de datos.
 * 
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con el diploma eliminado o un mensaje de error.
 * 
 */
const eliminar = async (req, res) => {

    try {
        // Verificar si hay un usuario en sesión
        const { id } = req.params;

        // Buscar el diploma por ID
        const diplomaBorrado = await Diploma.findByIdAndDelete({ _id: id });

        // Verificar si el diploma existe
        if (!diplomaBorrado) res.status(404).send({ msg: "Diploma No encontrado" });

        // Enviar una respuesta con estado 202 (Accepted) y el objeto del diploma eliminado
        res.status(202).send({ msg: "Diploma borrado correctamente ", diploma: diplomaBorrado });

    } catch (error) {
        // Manejo de errores
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