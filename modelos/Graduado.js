const { Schema, model } = require('mongoose');

// Define the schema for a Graduado (Graduate)
const GraduadoSchema = Schema({
    // The unique ID number (cedula) of the graduate
    cedula: {
        type: Number,
        required: true,
        unique: true
    },
    // The full name of the graduate
    nombreCompleto: {
        type: String,
        required: true
    },
    // The date of birth of the graduate
    fechaNacimiento: {
        type: Date,
        required: true
    },
    // The status of the graduate (true means active)
    estado: {
        type: Boolean,
        default: true
    }
}, {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
    // Do not include the version key (__v) in documents
    versionKey: false
});

// Export the model based on the schema
module.exports = model('Graduado', GraduadoSchema);