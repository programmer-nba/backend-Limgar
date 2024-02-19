const mongoose = require("mongoose");
const Joi = require("joi");

const ProductStockSchema = new mongoose.Schema({
    product_id: { type: String, required: true },
    stock_id: { type: String, required: true },
    stock: { type: Number, required: false, default: 0 },
    employee: { type: String, required: false },
});

const ProductStock = mongoose.model("product_stock", ProductStockSchema);

const validate = (data) => {
    const schema = Joi.object({
        product_id: Joi.string().required().label('กรอกไอดีสินค้า'),
        stock_id: Joi.string().required().label('กรอกไอดีสต๊อกสินค้า'),
        stock: Joi.number().default(0),
        employee: Joi.string(),
    });
    return schema.validate(data);
};

module.exports = { ProductStock, validate };