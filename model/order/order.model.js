const mongoose = require("mongoose");
const Joi = require("joi");

const OrderSchema = new mongoose.Schema({
  timestamp: { type: Date, required: false, default: Date.now() },
  order_id: { type: String, required: false },
  branch_oid: { type: String, required: false },
  branchName: { type: String, required: false },
  isHqAdminOnly: { type: Boolean, required: false },
  payment_type: { type: String, required: false },
  ref_docs_url: { type: String, required: false },
  packages: [{
    count: { type: Number, required: false },
    total_amount: { type: Number, required: false },
    sum_product_price: { type: Number, required: false },
    product_price_info: {
      product_price_oid: { type: String, required: false },
      product_oid: { type: String, required: false },
      product_barcode: { type: String, required: false },
      product_name: { type: String, required: false },
      price: { type: Number, required: false },
      amount: { type: Number, required: false },
    },
  }],
  products_total: { type: Number, required: false },
  vat: { type: Number, required: false },
  discount: { type: Number, required: false },
  customer_info: {
    customer_oid: { type: String, required: false },
    customer_name: { type: String, required: false },
    tel: { type: String, required: false },
    address: { type: String, required: false },
    address_moo: { type: String, required: false },
    address_byway: { type: String, required: false },
    address_street: { type: String, required: false },
    subdistrict: { type: String, required: false },
    district: { type: String, required: false },
    province: { type: String, required: false },
    postcode: { type: String, required: false },
  },
  agent_oid: { type: String, required: false },
  requester_user: { type: String, required: false },
  remark: { type: String, required: false },
  update_status: []
});

const Orders = mongoose.model("orders", OrderSchema);

const validate = (data) => {
  const schema = Joi.object({
    //timestamp: Joi.date().default(Date.now()),
    /*product_barcode_id: Joi.string().required().label("ใส่บาร์โค๊ดสต๊อกสินค้า"),
    product_name: Joi.string().required().label("ใส่ชื่อสต๊อกสินค้า"),
    stock_category: Joi.string().required().label("ใส่แคตตาล็อกต๊อกสินค้า"),
    branch_id: Joi.string().required().label("ใส่รหัสสาขา"),
    branchName: Joi.string().required().label("ใส่ชื่อสาขา"),
    isHqAdminOnly: Joi.boolean().default(true),
    product_cost: Joi.number().required().default(0),
    product_net_weight: Joi.number().required().default(0),
    minimim_alert_qty: Joi.number().default(0),*/

    //order_id: Joi.number().default(0),
    // branch_oid: Joi.string().label("-"),
    //branchName: Joi.string().label("-"),
    payment_type: Joi.string().default("-"),
    //requester_user: Joi.string().label("-"),
    remark: Joi.string().default("-"),
    customer_info: Joi.object({
      tel: Joi.string(),
      customer_name: Joi.string().label("-"),
      address: Joi.string().label("-"),
      address_moo: Joi.string().label("-"),
      address_byway: Joi.string().label("-"),
      address_street: Joi.string().label("-"),
      subdistrict: Joi.string().label("-"),
      district: Joi.string().label("-"),
      province: Joi.string().label("-"),
      postcode: Joi.string().label("-"),
    }),
    packages: Joi.array().items(Joi.object({
      count: Joi.number().default(0),
      product_price_info: Joi.object({
        product_price_oid: Joi.string().label("-"),
        //product_oid: Joi.string().label("-"),
        //product_barcode: Joi.string().label("-"),
        //product_name: Joi.string().label("-"),
        //qty: Joi.number().default(0),
        // amount: Joi.number().default(0),
      }),

    })),
    //products_total: Joi.number().default(0),
    agent_oid: Joi.string().label("-"),
    /* agent_info: Joi.object({
       name: Joi.string().label("-"),
       level: Joi.string().label("-"),
     }),*/
  });
  return schema.validate(data);
};

module.exports = { Orders, validate };
