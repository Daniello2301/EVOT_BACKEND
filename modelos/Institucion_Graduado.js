const { Schema, model } = require('mongoose');

// Define the schema for the relationship between Institution and Graduate
const InstiGraduadoSchema = Schema({
    // Reference to the Institution
    idInstitucion: {
        type: Schema.Types.ObjectId,
        ref: 'Institucion',
        required: true
    },
    // Reference to the Graduate
    idGraduado: {
        type: Schema.Types.ObjectId,
        ref: 'Graduado',
        required: true
    }
}, {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
    // Do not include the version key (__v) in documents
    versionKey: false
});

// Export the model based on the schema
module.exports = model('InstiGraduado', InstiGraduadoSchema);