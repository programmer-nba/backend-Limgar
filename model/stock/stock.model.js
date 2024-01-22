const mongoose = require("mongoose");
const Joi = require("joi");

const StockSchema = new mongoose.Schema({
  timestamp: { type: Date, required: false, default: Date.now() },
  createdDatetime: { type: Date, required: false },
  product_barcode_id: { type: String, required: true },
  product_name: { type: String, required: true },
  stock_category: { type: String, required: false },
  branch_id: { type: String, required: false },
  branchName: { type: String, required: false },
  isHqAdminOnly: { type: Boolean, required: false },
  product_cost: { type: Number, required: false },
  product_net_weight: { type: Number, required: false },
  minimim_alert_qty: { type: Number, required: false },
  balance: { type: Number, required: false },
  reserved_qty: { type: Number, required: false },
  transactions: [{
    timestamp: { type: Date, required: false, default: Date.now() },
    approver_user: { type: String, required: false },
    remark: { type: String, required: false },
    order_status: { type: String, required: false },
    detail: {
      order_id: { type: String, required: false },
      createdDatetime: { type: String, required: false },
      branch_id: { type: String, required: false },
      branchName: { type: String, required: false },
      isHqAdminOnly: { type: Boolean, required: false },
      product_barcode_id: { type: String, required: false },
      product_name: { type: String, required: false },
      stock_category: { type: String, required: false },
      item_status: { type: String, required: false },
      qty: { type: Number, required: false },
      requester_user: { type: String, required: false },
    },
  }],
});

const Stocks = mongoose.model("stocks", StockSchema);

const validate = (data) => {
  const schema = Joi.object({
    timestamp: Joi.date().default(Date.now()),
    product_barcode_id: Joi.string().required().label("ใส่บาร์โค๊ดสต๊อกสินค้า"),
    product_name: Joi.string().required().label("ใส่ชื่อสต๊อกสินค้า"),
    stock_category: Joi.string().required().label("ใส่แคตตาล็อกต๊อกสินค้า"),
    branch_id: Joi.string().required().label("ใส่รหัสสาขา"),
    branchName: Joi.string().required().label("ใส่ชื่อสาขา"),
    isHqAdminOnly: Joi.boolean().default(true),
    product_cost: Joi.number().required().default(0),
    product_net_weight: Joi.number().required().default(0),
    minimim_alert_qty: Joi.number().default(0),
  });
  return schema.validate(data);
};

module.exports = { Stocks, validate };
