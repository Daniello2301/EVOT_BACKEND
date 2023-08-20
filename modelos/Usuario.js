const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    
    nombreUsuario:{
        type: String,
        require: true,
        unique: true
    },
    correo:{
        type: String,
        require: true,
        unique: true
    },
    contraseña:{
        type: String,
        require: true
    },
    rol:{
        type:String,
        require: true,
        enum: ['INSTITUCION', 'ADMIN']
    },
    activo:{
        type:Boolean,
        require: true,
        default: true
    }

    
},{    
    timestamp: true,
    versionKey: false
});

module.exports = model('Usuario', UsuarioSchema);