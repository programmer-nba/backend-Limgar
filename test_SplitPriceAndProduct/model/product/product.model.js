const mongoose = require("mongoose");
const Joi = require("joi");

const ProductShema = new mongoose.Schema({
  product_name: { type: String, required: true },
  product_category: { type: String, required: false },
  product_detail: { type: String, required: false },
  product_description: { type: String, required: false },
  product_image: { type: String, required: false },
  product_cost: { type: Number, required: true },
  product_price: [{
    id: { type: Number, required: true },
    name: { type: String, required: false },
    amount: { type: Number, required: false },
    price: { type: Number, required: false },
    priceCOD: { type: Number, required: false },
    extraCOD: { type: Boolean, required: false }
  }],
});

const Products = mongoose.model("product", ProductShema);

const validate = (data) => {
  const schema = Joi.object({
    product_name: Joi.string().required().label("test_กรอกชื่อสินค้า"),
    product_category: Joi.string().required().label("test_กรอกประเภทสินค้า"),
    product_detail: Joi.string().required().label("test_กรอกรายละเอียดสินค้า"),
    product_description: Joi.string().required().label("test_กรอกคำอธิบายสินค้า"),
    product_cost: Joi.number().required().label("test_กรอกต้นทุนสินค้า"),
    product_price: Joi.array().items(
      Joi.object({
        id: Joi.number().required().label("test_productPrice[id] unidentified"),
        name: Joi.string().required().label("test_productPrice[name] unidentified"),
        amount: Joi.number().required().default(0),
        price: Joi.number().required().default(0),
        priceCOD: Joi.number().required().default(0),
        extraCOD: Joi.boolean().required().default(false)
      })),
  });
  return schema.validate(data);
};

module.exports = { Products, validate };
