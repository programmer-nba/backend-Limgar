const mongoose = require("mongoose");
const Joi = require("joi");

const CommissionSchema = new mongoose.Schema({
    orderid: { type: String },
    agent_id: { type: String },
    commission: { type: Number },
    vat: { type: Number },
    net: { type: Number },
    timestamp: { type: Date, required: false, default: Date.now() },
    cutoff: { type: Boolean, required: false, default: false },
});

const Commission = mongoose.model("commission", CommissionSchema);
module.exports = { Commission };