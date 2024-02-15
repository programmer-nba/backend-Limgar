const mongoose = require("mongoose");
const Joi = require("joi");

const CommissionSchema = new mongoose.Schema({
    refno:{type:String, required:true},  
    date:{type:Date, default:Date.now()},
    Commissiondetail:[{
        agentid:{type:mongoose.Schema.Types.ObjectId, ref:'agent'},
        agentname:{type:String, required:true},
        amount:{type:Number, default:0},
    }]
});

const Commission = mongoose.model("commission", CommissionSchema);
module.exports = { Commission };