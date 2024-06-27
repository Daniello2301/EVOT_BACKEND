const Graduado = require('../modelos/Graduado');
const session = require('express-session');
const InstuGraduados = require('../modelos/Institucion_Graduado');
const { validationResult } = require('express-validator');

/**
 * Obtiene todos los graduados de la base de datos.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con la lista de graduados o un mensaje de error.
 */
const getGraduados = async (req, res) => {
    try {
        // Busca todos los graduados en la base de datos
        const graduados = await Graduado.find();

        // Verifica si hay graduados disponibles
        if (graduados.length > 0) {
            // Si hay graduados, envía la lista con un estado 200
            res.status(200).json(graduados);
        } else {
            // Si no hay graduados, envía un estado 404 con un mensaje
            res.status(404).json({ msg: "No informacion disponible" });
        }
    } catch (error) {
        // Si ocurre un error, envía un estado 500 con el error
        res.status(500).send(error);
    }
}

/**
 * Obtiene la lista de graduados por ID de institución.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con la lista de graduados o un mensaje de error.
 */
const graduadosPorIddeInstitucion = async (req, res) => {
    try {
        // Obtiene la sesión del usuario
        const usuarioSession = session.usuario;

        // Verifica si el usuario está logueado
        if (!usuarioSession) return res.status(500).send({ msg: "Login necesario" });

        // Realiza una agregación en la colección de InstuGraduados
        const graduados = await InstuGraduados.aggregate([
            {
                $lookup: {
                    from: 'graduados', // Nombre de la colección de graduados
                    localField: 'idGraduado', // Campo local para unir
                    foreignField: '_id', // Campo de la colección de graduados para unir
                    as: 'graduado' // Nombre del campo resultante
                },
            },
            {
                $match: {
                    'idInstitucion': usuarioSession.institucion // Filtra por ID de institución del usuario
                }
            },
            {
                $unwind: '$graduado' // Descomprime el array de graduados
            },
            {
                $project: {
                    _id: 0, // Excluye el campo _id del resultado
                    graduado: {
                        cedula: 1, // Incluye el campo cedula del graduado
                        nombreCompleto: 1, // Incluye el campo nombreCompleto del graduado
                        fechaNacimiento: 1, // Incluye el campo fechaNacimiento del graduado
                    }
                }
            }
        ]);

        // Verifica si hay graduados disponibles
        if (graduados.length > 0) {
            res.status(200).json(graduados); // Responde con la lista de graduados
        } else {
            res.status(404).json({ msg: "No informacion disponible" }); // Responde con un mensaje si no hay datos
        }

    } catch (error) {
        res.status(500).send({ error: error }); // Responde con un error interno del servidor
    }
}

/**
 * Obtiene un graduado por su ID.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con los datos del graduado o un mensaje de error.
 */
const getById = async (req, res) => {
    try {
        // Obtiene el ID del graduado desde los parámetros de la solicitud
        const { id } = req.params;

        // Busca el graduado por ID en la base de datos
        const graduadoEncontrado = await Graduado.findById({ _id: id });
        
        // Verifica si el graduado fue encontrado
        if (graduadoEncontrado) {
            return res.status(200).json({ msg: "Graduado encontrado", graduado: graduadoEncontrado });
        } else {
            return res.status(404).json({ msg: "Graduado no encontrado" });
        }
    } catch (error) {
        return res.status(500).send({ error }); // Responde con un error interno del servidor
    }
}

/**
 * Crea un nuevo graduado y establece una relación con una institución.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con los datos del graduado o un mensaje de error.
 */
const createGraduado = async (req, res) => {
    try {
        // Validar los inputs de la solicitud
        const errorsValidation = myValidationResult(req);
        if (!errorsValidation.isEmpty()) {
            let errors = errorsValidation.array();
            return res.status(500).json({ errors });
        }

        const usuarioSession = session.usuario;
        const { ...data } = req.body;

        // Verificar si el usuario está en sesión
        if (!usuarioSession) return res.status(500).send({ msg: "Login necesario" });

        // Verificar si el graduado ya existe en la base de datos
        const graduadoExistente = await Graduado.findOne({ cedula: data.cedula });

        let instuGraduado = new InstuGraduados();

        // Si el graduado ya existe, verificar si ya está relacionado con la institución
        if (graduadoExistente) {
            const existeRelacion = await InstuGraduados.exists({
                idInstitucion: usuarioSession.institucion,
                idGraduado: graduadoExistente._id
            });

            // Si la relación ya existe, devolver un mensaje indicando que el estudiante ya existe
            if (existeRelacion) {
                return res.status(200).json({ msg: "El estudiante ya existe", estudiante: graduadoExistente });
            }

            // Crear la relación entre el graduado existente y la institución
            instuGraduado.idInstitucion = usuarioSession.institucion ?? req.body.institucion;
            instuGraduado.idGraduado = graduadoExistente._id;

            await instuGraduado.save();

            return res.status(200).json({ msg: "El estudiante ya existe en la base de datos, se creó la relación con la institución", estudiante: graduadoExistente });
        }

        // Crear un nuevo graduado
        let nuevoGraduado = new Graduado();

        nuevoGraduado.cedula = data.cedula;
        nuevoGraduado.nombreCompleto = data.nombreCompleto;
        nuevoGraduado.fechaNacimiento = data.fechaNacimiento || "0000-00-00T00:00:00.000Z";

        nuevoGraduado = await nuevoGraduado.save();

        // Crear la relación entre el nuevo graduado y la institución
        instuGraduado.idInstitucion = usuarioSession.institucion ?? req.body.institucion;
        instuGraduado.idGraduado = nuevoGraduado._id;
        await instuGraduado.save();

        return res.status(200).json({ msg: "El estudiante se guardó correctamente", graduado: nuevoGraduado });

    } catch (error) {
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
}

/**
 * Actualiza los datos de un graduado existente.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con los datos del graduado actualizado o un mensaje de error.
 */
const updateGraduado = async (req, res) => {
    try {
        // Obtener el ID del graduado de los parámetros de la solicitud
        const { id } = req.params;

        // Buscar el graduado por ID en la base de datos
        let graduadoEncontrado = await Graduado.findById({ _id: id });
        if (!graduadoEncontrado) {
            return res.status(404).json({ msg: "Graduado no encontrado" });
        }

        // Desestructurar los datos del cuerpo de la solicitud
        const { cedula, nombreCompleto, fechaNacimiento } = req.body;

        // Verificar si ya existe otro graduado con la misma cédula
        const graduadoExistente = await Graduado.findOne({ cedula: cedula, _id: { $ne: id } });
        if (graduadoExistente) {
            return res.status(400).json({ msg: "El graduado ya existe" });
        }

        // Actualizar los campos del graduado si se proporcionaron nuevos valores
        graduadoEncontrado.cedula = cedula ? cedula : graduadoEncontrado.cedula;
        graduadoEncontrado.nombreCompleto = nombreCompleto ? nombreCompleto : graduadoEncontrado.nombreCompleto;
        graduadoEncontrado.fechaNacimiento = fechaNacimiento ? fechaNacimiento : graduadoEncontrado.fechaNacimiento;

        // Guardar los cambios en la base de datos
        graduadoEncontrado = await graduadoEncontrado.save();

        // Enviar una respuesta con el graduado actualizado
        return res.status(200).json({ msg: "El graduado se actualizó correctamente", graduado: graduadoEncontrado });

    } catch (error) {
        // Manejo de errores
        console.log(error);
        return res.status(500).json({ msg: "Internal server error!" });
    }
}

/**
 * Elimina un graduado de la base de datos.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con un mensaje de éxito o un mensaje de error.
 */
const deleteGraduado = async (req, res) => {
    try {
        // Obtener el ID del graduado de los parámetros de la solicitud
        const { id } = req.params;

        // Buscar y eliminar el graduado por ID en la base de datos
        const response = await Graduado.findByIdAndDelete(id);

        // Verificar si se encontró y eliminó el graduado
        if (!response) {
            return res.status(404).json({ msg: "Graduado no encontrado" });
        }

        // Enviar una respuesta con el graduado eliminado
        return res.status(200).json({ msg: "Graduado eliminado correctamente!", data: response });

    } catch (error) {
        // Manejo de errores
        return res.status(500).json({ msg: "Internal server error!" });
    }
}

module.exports = {
    getGraduados,
    getById,
    graduadosPorIddeInstitucion,
    createGraduado,
    updateGraduado,
    deleteGraduado,
}