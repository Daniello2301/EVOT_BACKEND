const {Schema, model} = require('mongoose');

// Define the schema for a Diploma
const DiplomaSchema = Schema({
    // The unique code for the diploma
    codigoDiploma: {
        type: String,
        required: true,
        unique: true
    },
    // The name of the program
    nombrePrograma: {
        type: String,
        required: true
    },
    // The level of the program (e.g., Bachelor's, Master's)
    nivelPrograma: {
        type: String,
        required: true
    },
    // The registration number of the program
    registroPrograma: {
        type: String,
        required: true
    },
    // The book number where the diploma is recorded
    libro: {
        type: String,
        required: true
    },
    // The date of graduation
    fechaGrados: {
        type: Date,
        required: true
    },
    // Reference to the graduated person
    graduado: {
        type: Schema.Types.ObjectId,
        ref: 'Graduado',
        required: true
    },
    // Reference to the institution
    institucion: {
        type: Schema.Types.ObjectId,
        ref: 'Institucion',
        required: true
    },
    // The status of the diploma (true means active)
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
module.exports = model('Diploma', DiplomaSchema);