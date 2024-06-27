const Institucion = require('../modelos/Institucion')
const Usuario = require('../modelos/Usuario')
const session = require('express-session')
const { validationResult } = require('express-validator');

const myValidationResult = validationResult.withDefaults({
    formatter: error => error.msg,
});

/**
 * Retrieves all institutions from the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a list of institutions or an error message.
 */
const getAll = async (req, res) => {
    try {
        // Retrieve all institutions and populate the 'usuario' field with selected user information
        const instituciones = await Institucion.find().populate({
            path: 'usuario',
            select: "nombreUsuario correo activo",
        });

        // Check if no institutions are found
        if (instituciones.length <= 0) {
            return res.status(404).send({ msg: "Informacion no encontrada" });
        }

        // Send the retrieved institutions in the response
        return res.status(200).send(instituciones);

    } catch (error) {

        // Send an error response if there is a server error
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};

/**
 * Retrieves an institution by its ID from the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the institution data or an error message.
 */
const getById = async (req, res) => {
    try {
        const { id } = req.params;

        // Retrieve the institution by its ID
        const institucionEncontrada = await Institucion.findById({ _id: id });

        // Check if the institution is not found
        if (!institucionEncontrada) {
            return res.status(404).send({ msg: "Informacion no encontrada" });
        }

        // Check if the institution's state is true
        if (!institucionEncontrada.estado) {
            return res.status(404).send({ msg: "Verfica el estado de tu licencia" });
        }

        // Send the found institution in the response
        return res.status(201).send(institucionEncontrada);

    } catch (error) {
        // Send an error response if there is a server error
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};

/**
 * Retrieves all institutions with active users from the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a list of institutions or an error message.
 */
const getWithActiveUser = async (req, res) => {
    try {
        // Retrieve all institutions with active users using aggregation
        const institucionesActivas = await Institucion.aggregate([
            {
                $lookup: {
                    from: 'usuarios', // Collection to join
                    localField: 'usuario', // Field from the current document
                    foreignField: '_id', // Field from the joined collection
                    as: 'usuario' // Alias for the joined documents
                }
            },
            {
                $match: {
                    'usuario.activo': true // Match only documents where the user is active
                }
            },
            {
                $project: {
                    estado: 1, // Include the 'estado' field
                    codigoInstitucion: 1, // Include the 'codigoInstitucion' field
                    nombreInstitucion: 1, // Include the 'nombreInstitucion' field
                    ciudad: 1, // Include the 'ciudad' field
                    departamento: 1, // Include the 'departamento' field
                    resolucion: 1, // Include the 'resolucion' field
                    fechaResolucion: 1, // Include the 'fechaResolucion' field
                    logo: 1, // Include the 'logo' field
                    usuario: {
                        nombreUsuario: 1, // Include the 'nombreUsuario' field from the joined document
                        correo: 1, // Include the 'correo' field from the joined document
                        rol: 1, // Include the 'rol' field from the joined document
                        activo: 1 // Include the 'activo' field from the joined document
                        // Add other user attributes if needed
                    }
                }
            }
        ]);


        // Check if no active institutions are found
        if (institucionesActivas.length <= 0) {
            return res.status(404).send({ msg: "Informacion no encontrada" });
        }

        // Send the active institutions in the response
        return res.status(201).send(institucionesActivas);

    } catch (error) {
        console.log(error);

        // Send an error response if there is a server error
        return res.status(500).send({ msg: "Error interno del servidor", error: error });
    }
};

/**
 * Creates a new institution and associates it with the logged-in user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the created institution or an error message.
 */
const crear = async (req, res) => {
    try {
        // Validate input data
        const errorsValidation = myValidationResult(req);
        if (!errorsValidation.isEmpty()) {
            let errors = errorsValidation.array();
            return res.status(500).json({ errors });
        }

        const usuarioSession = session.usuario;

        // Check if the institution already exists
        const institucionExistente = await Institucion.findOne({ codigoInstitucion: req.body.codigoInstitucion });
        if (institucionExistente) return res.status(409).send({ msg: "La institucion ya existe" });

        // Ensure the user is logged in
        if (!usuarioSession) return res.status(400).send({ msg: "Login necesario" });

        // Find the logged-in user
        let usuarioRegistrado = await Usuario.findById({ _id: usuarioSession._id });
        if (!usuarioRegistrado) return res.status(500).send({ msg: "Login necesario" });


        usuarioInstitucion = usuarioSession?.rol === "ADMIN" ? req.body.usuario : usuarioSession._id;

        // Create a new institution
        let newInstitucion = new Institucion({
            codigoInstitucion: req.body.codigoInstitucion,
            nombreInstitucion: req.body.nombreInstitucion,
            ciudad: req.body.ciudad,
            departamento: req.body.departamento,
            resolucion: req.body.resolucion,
            fechaResolucion: req.body.fechaResolucion,
            usuario: usuarioInstitucion
        });

        newInstitucion = await newInstitucion.save();

        // Associate the new institution with the user
        usuarioRegistrado.institucion = newInstitucion._id;
        await usuarioRegistrado.save();

        if (!session.usuario?.institucion) {
            session.usuario.institucion = newInstitucion._id;
        }

        return res.status(201).send(newInstitucion);

    } catch (error) {
        return res.status(500).send({ msg: "Error interno del servidor", error });
    }
};

/**
 * Updates an existing institution based on the provided ID and new data.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with the updated institution or an error message.
 */
const actualizar = async (req, res) => {
    try {
        const usuarioSession = session.usuario;

        const { id } = req.params;

        // Ensure the user is logged in
        if (!usuarioSession) return res.status(500).send({ msg: "Login necesario" });

        // Find the institution by ID
        let institucionEncontrada = await Institucion.findById({ _id: id });
        if (!institucionEncontrada) return res.status(409).send({ msg: "La institucion no fue encontrada" });

        // Check for duplicate institution code
        const { codigoInstiticion, nombreInstitucion, ciudad, departamento, resolucion, fechaResolucion, estado } = req.body;
        let institucionExistente = await Institucion.findOne({ codigoInstiticion, _id: { $ne: id } });
        if (institucionExistente) return res.status(409).send({ msg: "La institucion ya existe" });

        // Update the institution with new data
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
        return res.status(500).send({ msg: "Error interno del servidor", error });
    }
};

/**
 * Deshabilita una institución existente según el ID proporcionado.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con la institución deshabilitada o un mensaje de error.
 */
const desahabilitar = async (req, res) => {
    try {
        const { id } = req.params;

        // Busca la institución por ID
        let institucionEncontrada = await Institucion.findById({ _id: id });
        if (!institucionEncontrada) return res.status(409).send({ msg: "La institucion no fue encontrada" });

        // Cambia el estado de la institución a false (deshabilitada)
        institucionEncontrada.estado = false;

        institucionEncontrada = await institucionEncontrada.save();

        return res.status(201).send(institucionEncontrada);

    } catch (error) {
        return res.status(500).send({ msg: "Error interno del servidor", error });
    }
};

/**
 * Activa una institución existente según el ID proporcionado.
 *
 * @param {Object} req - El objeto de solicitud.
 * @param {Object} res - El objeto de respuesta.
 * @returns {Object} El objeto de respuesta con la institución activada o un mensaje de error.
 */
const activar = async (req, res) => {
    try {
        const { id } = req.params;

        // Busca la institución por ID
        let institucionEncontrada = await Institucion.findById({ _id: id });
        if (!institucionEncontrada) return res.status(409).send({ msg: "La institucion no fue encontrada" });

        // Cambia el estado de la institución a true (activada)
        institucionEncontrada.estado = true;

        institucionEncontrada = await institucionEncontrada.save();

        return res.status(201).send(institucionEncontrada);

    } catch (error) {
        return res.status(500).send({ msg: "Error interno del servidor", error });
    }
};

module.exports = {
    getAll,
    getById,
    crear,
    actualizar,
    desahabilitar,
    getWithActiveUser,
    activar
}
