const { Schema, model } = require('mongoose');

// Define the schema for an Institution
const InstitucionSchema = Schema({
    // The unique code for the institution
    codigoInstitucion: {
        type: Number,
        required: true,
        unique: true
    },
    // The name of the institution
    nombreInstitucion: {
        type: String,
        required: true,
        trim: true
    },
    // The city where the institution is located
    ciudad: {
        type: String,
        required: true
    },
    // The department (state/region) where the institution is located
    departamento: {
        type: String,
        required: true
    },
    // The resolution number for the institution, unique to each institution
    resolucion: {
        type: String,
        required: true,
        unique: true
    },
    // The date of the resolution
    fechaResolucion: {
        type: Date,
        required: true
    },
    // Reference to the user associated with the institution
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    // The status of the institution (true means active)
    estado: {
        type: Boolean,
        default: true
    }
}, {
    // Do not automatically add createdAt and updatedAt fields
    timestamps: false,
    // Do not include the version key (__v) in documents
    versionKey: false
});

// Export the model based on the schema
module.exports = model('Institucion', InstitucionSchema);