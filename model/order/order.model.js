const mongoose = require("mongoose");
const Joi = require("joi");

const OrderSchema = new mongoose.Schema({
  /* timestamp: { type: Date, required: false, default: Date.now() },
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
   remark: { type: String, required: false },
   update_status: []*/

  timestamp: { type: Date, required: false, default: Date.now() },
  order_id: { type: Number, required: false },
  branch_oid: { type: String, required: false },
  branchName: { type: String, required: false },
  isHqAdminOnly: { type: Boolean, required: false },
  payment_type: { type: String, required: false },
  ref_docs_url: { type: String, required: false },
  products: [
    {
      product_price_oid: { type: String, required: false },
      product_oid: { type: String, required: false },
      product_barcode: { type: String, required: false },
      product_name: { type: String, required: false },
      qty: { type: Number, required: false },
      amount: { type: Number, required: false },
    }
  ],
  products_total: { type: Number, required: false },
  agent_info: {
    name: { type: String, required: false },
    level: { type: String, required: false },
  },
  requester_user: { type: String, required: false },
  remark: { type: String, required: false },
  update_status: []
});

const Orders = mongoose.model("orders", OrderSchema);

const validate = (data) => {
  const schema = Joi.object({
    timestamp: Joi.date().default(Date.now()),
    /*product_barcode_id: Joi.string().required().label("ใส่บาร์โค๊ดสต๊อกสินค้า"),
    product_name: Joi.string().required().label("ใส่ชื่อสต๊อกสินค้า"),
    stock_category: Joi.string().required().label("ใส่แคตตาล็อกต๊อกสินค้า"),
    branch_id: Joi.string().required().label("ใส่รหัสสาขา"),
    branchName: Joi.string().required().label("ใส่ชื่อสาขา"),
    isHqAdminOnly: Joi.boolean().default(true),
    product_cost: Joi.number().required().default(0),
    product_net_weight: Joi.number().required().default(0),
    minimim_alert_qty: Joi.number().default(0),*/

    order_id: Joi.number().default(0),
    branch_oid: Joi.string().label("-"),
    //branchName: Joi.string().label("-"),
    payment_type: Joi.string().default("-"),
    requester_user: Joi.string().label("-"),
    remark: Joi.string().default("-"),
    products: Joi.array().items(Joi.object({
      product_price_oid: Joi.string().label("-"),
      //product_oid: Joi.string().label("-"),
      //product_barcode: Joi.string().label("-"),
      //product_name: Joi.string().label("-"),
      //qty: Joi.number().default(0),
      // amount: Joi.number().default(0),
    })),
    products_total: Joi.number().default(0),
    /* agent_info: Joi.object({
       name: Joi.string().label("-"),
       level: Joi.string().label("-"),
     }),*/
  });
  return schema.validate(data);
};

module.exports = { Orders, validate };
