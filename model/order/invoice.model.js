const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
    agent_id: { type: String, required: true },
    receiptnumber: { type: String, required: true },
    slip_image: { type: String, required: false, default: "" },
    total: { type: Number, required: false, default: 0 },
    status: { type: Array, required: true },
    timestamp: { type: Date, required: false, default: Date.now() },
});

const Invoices = mongoose.model("invoice", InvoiceSchema);

module.exports = { Invoices };