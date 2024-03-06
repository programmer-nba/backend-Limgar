const mongoose = require("mongoose");
const Joi = require("joi");
const dayjs = require("dayjs");

const HistorySchema = new mongoose.Schema({
    stock_id: { type: String, required: true },
    product_id: { type: String, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    detail: { type: String, default: "ไม่มี" },
    timestamp: { type: Date, required: false, default: dayjs(Date.now()).format() }
});

const HistoryProductStocks = mongoose.model("stock_product_history", HistorySchema);

const validateHistory = (data) => {
    const schema = Joi.object({
        stock_id: Joi.string().required().label("ไม่พบไอดีสต๊อก"),
        product_id: Joi.string().required().label("ไม่พบไอดีสินค้า"),
        name: Joi.string().required().label("ไม่พบชื่อรายการ"),
        amount: Joi.number().required().label("ไม่พบจำนวน"),
        detail: Joi.string().default("ไม่มี"),
        timestamp: Joi.date().default(dayjs(Date.now()).format())
    })
    return schema.validate(data);
};

module.exports = { HistoryProductStocks, validateHistory };