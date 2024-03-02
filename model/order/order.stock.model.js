const mongoose = require("mongoose");

const OrderStockSchema = new mongoose.Schema({
    receiptnumber: { type: String, required: true },
    stock_id: { type: String, required: true },
    customer: {
        customer_name: { type: String, required: false, default: "ไม่มี" },
        customer_tel: { type: String, required: false, default: "ไม่มี" },
        customer_address: { type: String, required: false, default: "ไม่มี" },
        customer_subdistrict: { type: String, required: false, default: "ไม่มี" },
        customer_district: { type: String, required: false, default: "ไม่มี" },
        customer_province: { type: String, required: false, default: "ไม่มี" },
        customer_postcode: { type: String, required: false, default: "ไม่มี" },
    },
    product_detail: {
        product_id: { type: String, required: true },
        quantity: { type: Number, required: true },
    },
    tracking_number: { type: String, required: false, default: "" },
    status: { type: Array, required: true },
    timestamp: { type: Date, required: false },
    cut_off: { type: Boolean, require: false, default: false }
});

const OrderStocks = mongoose.model("order_stock", OrderStockSchema);

module.exports = { OrderStocks }