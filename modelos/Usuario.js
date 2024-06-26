const { Schema, model } = require('mongoose');

// Define the schema for a User
const UsuarioSchema = Schema({
    // The unique username
    nombreUsuario: {
        type: String,
        required: true,
        unique: true
    },
    // The unique email of the user
    correo: {
        type: String,
        required: true,
        unique: true
    },
    // The password of the user
    contraseña: {
        type: String,
        required: true
    },
    // The role of the user, must be either 'INSTITUCION' or 'ADMIN'
    rol: {
        type: String,
        required: true,
        enum: ['INSTITUCION', 'ADMIN']
    },
    // Reference to the associated institution, if any
    institucion: {
        type: Schema.Types.ObjectId,
        ref: 'Institucion'
    },
    // The active status of the user (true means active)
    activo: {
        type: Boolean,
        required: true,
        default: true
    }
}, {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
    // Do not include the version key (__v) in documents
    versionKey: false
});

// Export the model based on the schema
module.exports = model('Usuario', UsuarioSchema);