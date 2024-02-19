const mongoose = require("mongoose");
const Joi = require("joi");

//--เลือกรับเอง หรือ จัดส่ง
/*const DeliverySchema_A = mongoose.Schema({
    timestamp: { type: Date, required: false, default: Date.now() },
    createdDatetime: { type: Date, required: false },
    po_id: { type: String, required: false },
    pickup_type: { type: String, required: false },
    branch_oid: { type: String, required: false },
    item_status: { type: String, required: false },
    status: {
        timestamp: { type: String, required: false },
        name: { type: String, required: false }
    }
});*/

/*const DeliverySchema_B = mongoose.Schema({

    product_pickup_type: {
        timestamp: { type: Date, required: false, default: Date.now() },
        createdDatetime: { type: Date, required: false },
        pickup_type: "Delivery",
        po_id: "A240200002",
        customer_info{
            name: "sdsdadsasdasd",
            tel: "13213213213",
            address: { ...adress },
        }
        remark:"",
        Shipping: "flash",
        tracking_number: "12s212ss13",
        item_status: "on the truck"
        status:{
            timestamp:{},
            name:{}
        }
    }
})*/

const DeliverySchema_C = mongoose.Schema({
    timestamp: { type: Date, required: false, default: Date.now() },
    createdDatetime: { type: Date, required: false },
    order_id: { type: String, required: false },
    pickup_type: { type: String, required: false },
    branch_oid: { type: String, required: false },
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
    item_status: { type: String, required: false },
    remark: { type: String, required: false },
    shipping: { type: String, required: false },
    tracking_number: { type: String, required: false },
    status: [{
        timestamp: { type: Date, required: false },
        name: { type: String, required: false }
    }]
});

const Deliverys = mongoose.model("delivery_lists", DeliverySchema_C);

const validate = (data) => {
    /*  const schema = Joi.object({
          pickup_type: Joi.string().required().label("เลือกประเภท การรับสินค้า"),
          po_id: Joi.string().required().label("กรอก เลขใบสั่งซื้อ"),
          branch_oid: Joi.string().label("กรอก branch_oid"),
          //item_status: Joi.string().required().label("เลือก สถานะสินค้า"),
      });*/

    const schema_c = Joi.object({
        pickup_type: Joi.string().required().label("เลือกประเภท การรับสินค้า"),
        order_id: Joi.string().required().label("กรอก เลขใบสั่งซื้อ"),
        remark: Joi.string().label("หมายเหตุ"),
        shipping: Joi.string().label("ใส่ชื่อแบนด์ขนส่ง"),
        tracking_number: Joi.string().required().label("ใส่เลขTrackingพัสดุ"),
        //item_status: Joi.string().required().label("เลือก สถานะสินค้า"),
    });

    return schema_c.validate(data);
}

module.exports = { Deliverys, validate };