const mongoose = require("mongoose");
const Joi = require("joi");

const StockOrderSchema = new mongoose.Schema({
  timestamp: { type: Date, required: false, default: Date.now() },
  order_status: { type: String, required: false },
  order_id: { type: String, required: false },
  branch_oid: { type: String, required: false },
  branchName: { type: String, required: false },
  isHqAdminOnly: { type: Boolean, required: false },
  product_oid: { type: String, required: false },
  product_barcode: { type: String, required: false },
  product_name: { type: String, required: false },
  stock_category: { type: String, required: false },
  item_status: { type: String, required: false },
  qty: { type: Number, required: false },
  requester_user: { type: String, required: false },
  approver_user: { type: String, required: false },
  remark: { type: String, required: false }
});

const StockOrders = mongoose.model("stock_orders", StockOrderSchema);

const validate = (data) => {
  const schema = Joi.object({
    timestamp: Joi.date().default(Date.now()),
    order_id: Joi.string().default("0").label("ใส่รหัสบันทึกสต๊อกสินค้า")
    /*product_barcode_id: Joi.string().required().label("ใส่บาร์โค๊ดสต๊อกสินค้า"),
    product_name: Joi.string().required().label("ใส่ชื่อสต๊อกสินค้า"),
    stock_category: Joi.string().required().label("ใส่แคตตาล็อกต๊อกสินค้า"),
    branch_id: Joi.string().required().label("ใส่รหัสสาขา"),
    branchName: Joi.string().required().label("ใส่ชื่อสาขา"),
    isHqAdminOnly: Joi.boolean().default(true),
    product_cost: Joi.number().required().default(0),
    product_net_weight: Joi.number().required().default(0),
    minimim_alert_qty: Joi.number().default(0),*/
  });
  return schema.validate(data);
};

module.exports = { StockOrders, validate };
