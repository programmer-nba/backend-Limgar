const { Channels } = require("../../model/more/channels.model");

exports.create = async (req, res) => {
  try {
    const channel = await Channels.findOne({
      name: req.body.name,
    });
    if (channel)
      return res.status(401).send({
        status: false,
        message: "มีชื่อช่องทางขายนี้ในระบบเเล้ว",
      });
    await new Channels({
      ...req.body,
    }).save();
    return res
      .status(200)
      .send({ status: true, message: "เพิ่มช่องทางขายสำเร็จ" });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getChannelAll = async (req, res) => {
  try {
    const channel = await Channels.find();
    if (!channel)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: channel });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getChannelById = async (req, res) => {
  try {
    const id = req.params.id;
    const channel = await Channels.findById(id);
    if (!channel)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: channel });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body)
      return res.status(404).send({ status: false, message: "ส่งข้อมูลผิดพลาด" });
    const id = req.params.id;
    Channels.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then((item) => {
        if (!item)
          return res
            .status(404)
            .send({ status: false, message: "แก้ไขข้อมูลไม่สำเร็จ" });
        return res
          .status(200)
          .send({ status: true, message: "แก้ไขข้อมูลสำเร็จ" });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .send({ status: false, message: "มีบางอย่างผิดพลาด" + id });
      });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    Channels.findByIdAndDelete(id, { useFindAndModify: false })
      .then((item) => {
        if (!item)
          return res.status(404).send({ message: "ไม่สามารถลบข้อมูลนี้ได้" });
        return res.status(200).send({ message: "ลบข้อมูลสำเร็จ" });
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามารถลบข้อมูลนี้ได้",
          status: false,
        });
      });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
