const mongoose = require("mongoose");
const Joi = require("joi");

const ProductShema = new mongoose.Schema({
  product_name: { type: String, required: true },
  product_category: { type: String, required: false },
  product_detail: { type: String, required: false },
  product_description: { type: String, required: false },
  product_image: { type: String, required: false },
  product_cost: { type: Number, required: true },
  isOutStock: { type: Boolean, required: true }
});

const Products = mongoose.model("product", ProductShema);

const validate = (data) => {
  const schema = Joi.object({
    product_name: Joi.string().required().label("test_กรอกชื่อสินค้า"),
    product_category: Joi.string().required().label("test_กรอกประเภทสินค้า"),
    product_detail: Joi.string().required().label("test_กรอกรายละเอียดสินค้า"),
    product_description: Joi.string().required().label("test_กรอกคำอธิบายสินค้า"),
    product_cost: Joi.number().required().label("test_กรอกต้นทุนสินค้า"),
    isOutStock: Joi.boolean().required().default(false),
  });
  return schema.validate(data);
};

module.exports = { Products, validate };
