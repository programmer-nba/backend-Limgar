const mongoose = require("mongoose");
const Joi = require("joi");

const ProductShema = new mongoose.Schema({
  product_name: {type: String, required: true},
  product_category: {type: String, required: false},
  product_detail: {type: String, required: false},
  product_description: {type: String, required: false},
  product_image: {type: String, required: false},
  product_price: {
    price_one: {type: Number, required: false},
    price_two: {type: Number, required: false},
    price_tree: {type: Number, required: false},
    price_four: {type: Number, required: false},
    price_five: {type: Number, required: false},
  },
  product_cost: {type: Number, required: true},
  product_pack: {
    name: {type: String, required: false},
    amount: {type: Number, required: false},
  },
});

const Products = mongoose.model("product", ProductShema);

const validate = (data) => {
  const schema = Joi.object({
    product_name: Joi.string().required().label("กรอกชื่อสินค้า"),
    product_category: Joi.string().required().label("กรอกประเภทสินค้า"),
    product_detail: Joi.string().required().label("กรอกรายละเอียดสินค้า"),
    product_description: Joi.string().required().label("กรอกคำอธิบายสินค้า"),
    product_price: {
      price_one: Joi.number().required().default(0),
      price_two: Joi.number().required().default(0),
      price_tree: Joi.number().required().default(0),
      price_four: Joi.number().required().default(0),
      price_five: Joi.number().required().default(0),
    },
    product_cost: Joi.number().required().label("กรอกต้นทุนสินค้า"),
    product_pack: {
      name: Joi.string().required().label("กรอกแพ็คสินค้า"),
      amount: Joi.number().required().label("กรอกจำนวนต่อแพ็ค"),
    },
  });
  return schema.validate(data);
};

module.exports = {Products, validate};
