const {Schema, model} = require('mongoose');

const DiplomaSchema = Schema({
    codigoDiploma:{
        type: String,
        require: true,
        unique:true
    },
    nombrePrograma:{
        type :String ,
        require: true
    },
    nivelPrograma:{
        type : String,
        require:true
    },
    registroPrograma:{
        type: String,
        require:true
    },
    libro:{
        type:String,
        require: true
    },
    fechaGrados:{
        type: Date,
        require: true
    },
    graduado:{
        type:Schema.Types.ObjectId,
        ref: 'Graduado',
        require:true
    },
    institucion:{
        type:Schema.Types.ObjectId,
        ref:'Institucion',
        require:true
    },
    estado:{
        type: Boolean,
        default:true
    }
},{
    timestamp: true,
    versionKey: false
});


module.exports = model('Diploma', DiplomaSchema);

