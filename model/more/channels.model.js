const mongoose = require("mongoose");
const Joi = require("joi");

const ChannelShema = new mongoose.Schema({
  name: {type: String},
});

const Channels = mongoose.model("channel", ChannelShema);

module.exports = {Channels};
