const bcrypt = require("bcrypt");
const { Agents, validate } = require("../../model/user/agent.model");
const dayjs = require("dayjs");

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    const admin = await Agents.findOne({
      username: req.body.username,
      tel: req.body.tel,
    });
    if (admin)
      return res.status(401).send({
        status: false,
        message: "มีชื่อผู้ใช้งานนี้หรือเบอร์โทรศัพ์นี้ในระบบเเล้ว",
      });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const data = {
      ...req.body,
      password: hashPassword,
      timestamp: dayjs(Date.now()).format(""),
      active: false,
      status: {
        name: "รอตรวจสอบ",
        timestamp: dayjs(Date.now()).format("")
      },
    };

    const new_agent = new Agents(data);
    new_agent.save();
    return res.status(200).send({ status: true, message: "สมัครสมาชิกสำเร็จ", data: new_agent });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getAgentAll = async (req, res) => {
  try {
    const agent = await Agents.find();
    if (!agent)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: agent });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getAgentById = async (req, res) => {
  try {
    const id = req.params.id;
    const agent = await Agents.findById(id);
    if (!agent)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: agent });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.update = async (req, res) => {
  try {

    if (!req.body)
      return res.status(404).send({ status: false, message: "ส่งข้อมูลผิดพลาด" });

    const id = req.params.id;
    if (!req.body.password) {
      Agents.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
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
    } else {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.password, salt);
      Agents.findByIdAndUpdate(
        id,
        { ...req.body, password: hashPassword },
        { useFindAndModify: false }
      )
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
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    Agents.findByIdAndDelete(id, { useFindAndModify: false })
      .then((item) => {
        if (!item)
          return res
            .status(404)
            .send({ message: "ไม่สามารถลบข้อมูลตัวแทนขายนี้ได้" });
        return res.status(200).send({ message: "ลบข้อมูลตัวแทนขายสำเร็จ" });
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามารถลบข้อมูลตัวแทนขายนี้ได้",
          status: false,
        });
      });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.comfirm = async (req, res) => {
  try {
    //const a = req.
    const updateStatus = await Agents.findOne({ _id: req.params.id });

    updateStatus.active = true
    if (updateStatus) {
      updateStatus.status.push({
        name: "อนุมัติ",
        timestamp: Date.now(),
      });
      updateStatus.save();
      return res.status(200).send({
        status: true,
        message: "อนุมัติตัวแทนขายสำเร็จ",
        data: updateStatus,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.cancel = async (req, res) => {
  try {
    const updateStatus = await Agents.findOne({ _id: req.params.id });
    if (updateStatus) {
      updateStatus.status.push({
        name: "ไม่อนุมัติ",
        timestamp: Date.now(),
      });
      updateStatus.save();
      return res.status(200).send({
        status: true,
        message: "ยกเลิกอนุมัติตัวแทนขายสำเร็จ",
        data: updateStatus,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.confirmBank = async (req, res) => {
  try {
    const updateBank = await Agents.findOne({ _id: req.params.id });
    if (!updateBank)
      return res.status(403).send({ status: false, message: "ไม่พบข้อมูลตัวแทนขาย" })
    updateBank.bank.status = true;
    updateBank.bank.remark = "ผ่านการตรวจสอบ";
    updateBank.save();
    return res.status(200).send({
      status: true,
      message: "อนุมัติสมุดบัญชีธนาคารสำเร็จ",
      data: updateBank,
    });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
}