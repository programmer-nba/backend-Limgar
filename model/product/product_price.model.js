const mongoose = require("mongoose");
const Joi = require("joi");

const ProductPriceShema = new mongoose.Schema({
  product_id: { type: String, required: true },
  amount: { type: Number, required: false, default: 0 },
  price: {
    price_one: { type: Number, required: false, default: 0 },
    price_two: { type: Number, required: false, default: 0 },
    price_three: { type: Number, required: false, default: 0 },
    price_four: { type: Number, required: false, default: 0 },
    price_five: { type: Number, required: false, default: 0 },
  },
  cost: { type: Number, required: true },
});

const ProductsPrice = mongoose.model("product_price", ProductPriceShema);

const validate = (data) => {
  const schema = Joi.object({
    product_id: Joi.string().required().label('กรอกไอดีสินค้า'),
    amount: Joi.number().label("กรอกจำนวนสินค้า/แพ็ค"),
    price: {
      price_one: Joi.number().required().default(0),
      price_two: Joi.number().required().default(0),
      price_three: Joi.number().required().default(0),
      price_four: Joi.number().required().default(0),
      price_five: Joi.number().required().default(0)
    },
    cost: Joi.number().required().label("กรอกราคาต้นทุนสินค้า"),
  });
  return schema.validate(data);
};

module.exports = { ProductsPrice, validate };
