const mongoose = require("mongoose");
const Joi = require("joi");

const ReciptCommissionSchema = new mongoose.Schema({
    receipt_ref: { type: String, required: true },
    receipt_agent_id: { type: String, required: true },
    receipt_detail: { type: Array, required: false, default: [] },
    receipt_status: { type: String, required: false, default: "ดำเนินการจ่ายค่าคอมมิชชั่น" },
    // invoice_image: { type: String, required: false, default: "" },
    receipt_timestamp: { type: Date, required: false, default: Date.now() },
    // invoice_emp: { type: String, required: false, default: "ไม่มี" },
    // receipt_commission: { type: Array, required: false, default: [] }
    // --------------------------------
});

const CommissionAgents = mongoose.model("recipt_commission", ReciptCommissionSchema);

module.exports = { CommissionAgents };