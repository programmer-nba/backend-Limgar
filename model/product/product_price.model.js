const mongoose = require("mongoose");
const Joi = require("joi");

const ProductPriceShema = new mongoose.Schema({
  product_id: { type: String, required: true },
  product_name: { type: String, required: true },
  branchName: { type: String, required: true },
  hqAdminOnly: { type: Boolean, required: true },
  amount: { type: Number, required: false },
  price: { type: Number, required: false },
  priceCOD: { type: Number, required: false },
  extraCOD: { type: Boolean, required: false }
});

const ProductsPrice = mongoose.model("product_price", ProductPriceShema);

const validate = (data) => {
  const schema = Joi.object({
    product_id: Joi.string().required().label("กรอกรหัสสินค้า"),
    product_name: Joi.string().required().label("กรอกชื่อสินค้า"),
    branchName: Joi.string().required().label("กรอกชื่อสาขา"),
    hqAdminOnly: Joi.boolean().required().label("เลือกกำหนด สิทธิ์hqAdminเท่านั้น"),
    amount: Joi.number().required().default(1),
    price: Joi.number().required().default(0),
    priceCOD: Joi.number().required().default(0),
    extraCOD: Joi.boolean().required().label("เลือกกำหนด ชาร์ทค่าส่งCOD"),
  });
  return schema.validate(data);
};

module.exports = { ProductsPrice, validate };
