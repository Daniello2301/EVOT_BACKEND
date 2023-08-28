const { Schema, model } = require('mongoose');

const InstitucionSchema = Schema({
    codigoInstiticion:{
        type: Number,
        require: true,
        unique: true
    },
    nombreInstitucion:{
        type: String,
        required: true,
        trim: true,
    },
    ciudad:{
        type:String,
        required:true,
    },
    departamento:{
        type:String,
        required:true,
    },
    resolucion:{
        type:String,
        required:true,
        unique: true
    },
    fechaResolucion:{
        type:Date,
        require: true
    },
    usuario:{
        type:Schema.Types.ObjectId,
        ref:'Usuario',
        require:true
    },
    estado:{
        type : Boolean ,
        default  : true
    }
},{
    timestamps: false,
    versionKey: false
});

module.exports = model('Institucion', InstitucionSchema)