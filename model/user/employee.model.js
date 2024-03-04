const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const Joi = require("joi")
const passwordComplexity = require("joi-password-complexity")

const complexityOptions = {
    min: 6,
    max: 30,
    lowerCase: 0,
    upperCase: 0,
    numeric: 0,
    symbol: 0,
    requirementCount: 2,
};

const EmployeeSchema = new mongoose.Schema({
    stock_id: { type: String, require: true },
    prefix: { type: String, require: true },
    first_name: { type: String, require: true },
    last_name: { type: String, require: true },
    tel: { type: String, required: true },
    iden: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    position: { type: String, require: true },
    active: { type: Boolean, require: false, default: true },
    timestamp: { type: Date, required: false, default: Date.now() },
    emp: { type: String, required: false, default: "" }
});

EmployeeSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        {
            _id: this._id,
            name: this.first_name,
            row: 'employee',
            position: this.position,
            status: this.active
        },
        process.env.JWTPRIVATEKEY,
        {
            expiresIn: '1h'
        }
    );
    return token;
};

const Employees = mongoose.model("employee", EmployeeSchema);

const validate = (data) => {
    const schema = Joi.object({
        stock_id: Joi.string().required().label("ไม่พบไอดีสต๊อกสินค้า"),
        prefix: Joi.string().required().label("ไม่พบคำนำหน้าชื่อ"),
        first_name: Joi.string().required().label("ไม่พบชื่อหลัก"),
        last_name: Joi.string().required().label("ไม่พบชื่อสกุล"),
        tel: Joi.string().required().label("ไม่พบเบอร์โทร"),
        iden: Joi.string().required().label("ไม่พบเลขบัตรประชาชน"),
        username: Joi.string().required().label("ไม่พบชื่อผู้ใช้งาน"),
        password: passwordComplexity(complexityOptions)
            .required()
            .label("agent_password"),
        position: Joi.string().required().label("ไม่พบระดับพนักงาน"),
        active: Joi.boolean().default(true),
    });
    return schema.validate(data);
};

module.exports = { Employees, validate };