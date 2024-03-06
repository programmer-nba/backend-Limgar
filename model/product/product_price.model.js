const mongoose = require("mongoose");
const Joi = require("joi");

const ProductPriceShema = new mongoose.Schema({
  product_id: { type: String, required: true },
  amount: { type: Number, required: false, default: 0 },
  cost: {
    cost_one: { type: Number, required: false, default: 0 },
    cost_two: { type: Number, required: false, default: 0 },
    cost_three: { type: Number, required: false, default: 0 },
    cost_four: { type: Number, required: false, default: 0 },
    cost_five: { type: Number, required: false, default: 0 },
  },
  price: { type: Number, required: true },
  weight: { type: Number, required: false, default: 0 },
  size: {
    width: { type: Number, required: false, default: 0 },
    height: { type: Number, required: false, default: 0 },
    length: { type: Number, required: false, default: 0 },
  },
  freight: { type: Number, required: false, default: 0 },
  freight_cod: { type: Number, required: false, default: 0 },
});

const ProductsPrice = mongoose.model("product_price", ProductPriceShema);

const validate = (data) => {
  const schema = Joi.object({
    product_id: Joi.string().required().label('กรอกไอดีสินค้า'),
    amount: Joi.number().label("กรอกจำนวนสินค้า/แพ็ค"),
    cost: {
      cost_one: Joi.number().required().default(0),
      cost_two: Joi.number().required().default(0),
      cost_three: Joi.number().required().default(0),
      cost_four: Joi.number().required().default(0),
      cost_five: Joi.number().required().default(0)
    },
    price: Joi.number().required().label("กรอกราคาต้นทุนสินค้า"),
    weight: Joi.number().required().default(0),
    size: {
      width: Joi.number().required().default(0),
      height: Joi.number().required().default(0),
      length: Joi.number().required().default(0),
    },
    freight: Joi.number().required().default(0),
    freight_cod: Joi.number().required().default(0),
  });
  return schema.validate(data);
};

module.exports = { ProductsPrice, validate };
