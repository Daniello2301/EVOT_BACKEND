const { Schema, model } = require('mongoose');

const InstiGraduadoSchema = Schema({
    idInstitucion:{
        type: Schema.Types.ObjectId,
        ref:'Institucion',
        require: true
    },
    idGraduado:{
        type: Schema.Types.ObjectId,
        ref:'Graduado',
        require: true
    }
},
{
    timestamp: true,
    versionKey: false
});

module.exports= model('InstuGraduados', InstiGraduadoSchema);