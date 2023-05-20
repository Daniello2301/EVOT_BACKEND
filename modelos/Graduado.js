const { Schema, model } = require('mongoose');

const GraduadoSchema = Schema({
    cedula:{
        type: Number,
        require: true,
        unique: true
    },
    nombreCompleto:{
        type: String,
        require: true
    },
    fechaNacimiento:{
        type: Date,
        require: true
    }
},{    
    timestamp: true,
    versionKey: false
});

module.exports = model('Graduado', GraduadoSchema);