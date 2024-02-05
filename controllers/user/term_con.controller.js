const bcrypt = require("bcrypt");
const { Agents } = require("../../model/user/agent.model");
/*
exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    const admin = await Agents.findOne({
      name: req.body.name,
      tel: req.body.tel,
    });
    if (admin)
      return res.status(401).send({
        status: false,
        message: "มีชื่อผู้ใช้งานนี้หรือเบอร์โทรศัพ์นี้ในระบบเเล้ว",
      });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    await new Agents({
      ...req.body,
      password: hashPassword,
      agent_position: "agent",
      timestamp: Date.now(),
      active: false,
      allow_term_con: {
        step1: false,
        step2: false
      },
      status: {
        name: "รอตรวจสอบ",
        timestamp: Date.now()
      }
    }).save();
    return res.status(200).send({ status: true, message: "สมัครสมาชิกสำเร็จ" });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
*/
/*
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
*/
/*
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
*/
exports.update = async (req, res) => {
  //  const val_b = req.body.allow_term_con
  try {
    /*  if (!val_b)
        return res.status(404).send({ status: false, message: "ส่งข้อมูลผิดพลาด" }
        );*/

    const id = req.params.id;
    const agent_me = req.decoded
    if (agent_me) {
      /*const val_a = await Agents.findByIdAndUpdate(id)
      val_a.allow_term_con = {
        step1: val_b.step1,
        step2: val_b.step2
      }
      await val_a.save()*/

      //--force allow true
      Agents.findByIdAndUpdate(id, {
        allow_term_con: {
          step1: true,
          step2: true
        }
      },
        { useFindAndModify: false }
      ).then((item) => {

        if (!item)
          return res
            .status(404)
            .send({ status: false, message: "แก้ไขข้อมูลไม่สำเร็จ" });

        return res
          .status(200)
          .send({ status: true, message: "แก้ไขข้อมูลสำเร็จ" });
      })
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
/*
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
*/
exports.comfirm = async (req, res) => {

  try {
    //const a = req.
    const updateStatus = await Agents.findOne({ _id: req.params.id });

    if (updateStatus.allow_term_con.step1 == true && updateStatus.allow_term_con.step2 == true) {
      updateStatus.active = true,
        updateStatus.status.push({
          name: "เปิดสถานะอนุญาติเข้าใช้งาน",
          timestamp: Date.now(),
        });
      updateStatus.save();
      return res.status(200).send({
        status: true,
        message: "เปิดสถานะอนุญาติเข้าใช้งาน",
        data: updateStatus,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาดเงื่อนไขการยินยอมในข้อตกลง" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
/*
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
};*/