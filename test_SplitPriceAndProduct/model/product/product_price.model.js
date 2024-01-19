const mongoose = require("mongoose");
const Joi = require("joi");

const ProductPriceShema = new mongoose.Schema({
  product_barcode_id: { type: String, required: true },
  product_name: { type: String, required: true },
  branch_id: { type: String, required: true },
  branchName: { type: String, required: true },
  isHqAdminOnly: { type: Boolean, required: true },
  amount: { type: Number, required: false },
  price: {
    default: { type: Number, required: true },
    flashSale: { type: Number, required: false },
    dealerLv1: { type: Number, required: false },
    dealerLv2: { type: Number, required: false },
    dealerLv3: { type: Number, required: false }
  },
  priceCOD: {
    default: { type: Number, required: true },
    flashSale: { type: Number, required: false },
    dealerLv1: { type: Number, required: false },
    dealerLv2: { type: Number, required: false },
    dealerLv3: { type: Number, required: false }
  },
  isExtraCOD: { type: Boolean, required: false }
});

const ProductsPrice = mongoose.model("product_price", ProductPriceShema);

const validate = (data) => {
  const schema = Joi.object({
    product_barcode_id: Joi.string().required().label("กรอกรหัสสินค้า"),
    product_name: Joi.string().required().label("กรอกชื่อสินค้า"),
    branch_id: Joi.string().required().label("กรอกรหัสสาขา"),
    branchName: Joi.string().required().label("กรอกชื่อสาขา"),
    //isHqAdminOnly: Joi.boolean().required().default(true),
    amount: Joi.number().required().default(1),
    price: {
      default: Joi.number().required().default(0),
      flashSale: Joi.number().required().default(0),
      dealerLv1: Joi.number().required().default(0),
      dealerLv2: Joi.number().required().default(0),
      dealerLv3: Joi.number().required().default(0)
    },
    priceCOD: {
      default: Joi.number().required().default(0),
      flashSale: Joi.number().required().default(0),
      dealerLv1: Joi.number().required().default(0),
      dealerLv2: Joi.number().required().default(0),
      dealerLv3: Joi.number().required().default(0)
    },
    isExtraCOD: Joi.boolean().default(false),
  });
  return schema.validate(data);
};

module.exports = { ProductsPrice, validate };
