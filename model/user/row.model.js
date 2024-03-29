const Joi = require("joi");
const mongoose = require("mongoose");

const RowSchema = new mongoose.Schema({
    name: { type: String, require: true },
    position: { type: String, require: false },
    level_name: { type: String, require: false }
});

const Rows = mongoose.model("row", RowSchema);

const validate = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().label("กรอกชื่อระดับ"),
    });
    return schema.validate(data);
};

module.exports = { Rows, validate };