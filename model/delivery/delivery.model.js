const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

//--เลือกรับเอง หรือ จัดส่ง
const DeliverySchema_A = mongoose.Schema({
    type: { type: String, required: false },
    po_id: { type: String, required: false },
    branch_oid: { type: String, required: false },
    item_status: { type: String, required: false },
});

DeliverySchema_A.methods.generateAuthToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
            name: this.agent_name,
            position: this.agent_position,
            row: "agent",
            active: this.active,
        },
        process.env.JWTPRIVATEKEY,
        {
            expiresIn: "60d",
        }
    );
    return token;
};

/*const DeliverySchema_B = mongoose.Schema({

    product_pickup_type: {
        type: "Delivery",
        po_id: "A240200002",
        customer_name: "sdsdadsasdasd",
        tel: "13213213213",
        address: { ...adress },
        packages: [
            {
                package_no: "0",
                po_id: "A240200002",
                Shipping: "flash",
                tracking_number: "12s212ss13",
                item_status: "on the truck"
            }, {
                package_no: "1",
                po_id: "A240200002",
                Shipping: "kerry",
                tracking_number: "12s212ss13",
                item_status: "on the truck"
            }, {
                package_no: "2",
                po_id: "A240200002",
                Shipping: "thaipost",
                tracking_number: "12s212ss13",
                item_status: "on the truck"
            }, {
                package_no: "3",
                po_id: "A240200002",
                Shipping: "etc.",
                tracking_number: "-",
                item_status: "on the truck",
                rider_name: "asdasdka;skd;l",
                tel: "056516516"
            }
        ],

    }
})*/

const Delivery_A = mongoose.model("delivery_lists", DeliverySchema_A);

const validate = (data) => {
    const schema = Joi.object({
        type: Joi.string().required().label("เลือกประเภท การรับสินค้า"),
        po_id: Joi.string().required().label("กรอก เลขใบสั่งซื้อ"),
        branch_oid: Joi.string().required().label("กรอก branch_oid"),
        item_status: Joi.string().required().label("เลือก สถานะสินค้า"),
    });
    return schema.validate(data);
}

module.exports = { Delivery_A, validate };