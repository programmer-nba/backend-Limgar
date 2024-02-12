const bcrypt = require("bcrypt");
const { Customers, validate } = require("../../model/user/customer.model");

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    const customer = await Customers.findOne({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      tel: req.body.tel,
    });
    if (customer)
      return res.status(401).send({
        status: false,
        message: "มีชื่อลูกค้าหรือเบอร์โทรศัพ์นี้ในระบบเเล้ว",
      });

    //const salt = await bcrypt.genSalt(Number(process.env.SALT));
    //const hashPassword = await bcrypt.hash(req.body.password, salt);

    let last_name = req.body.last_name || "limgar"
    let first_name = req.body.first_name || ""
    const fisrt_nick_name = first_name + " " + last_name.substring(0, 4)

    await new Customers({
      ...req.body,
      name: fisrt_nick_name,
      //password: hashPassword,
      member_position: "member",
      timestamp: Date.now(),
      active: false,
      /*allow_term_con: {
        step1: false,
        step2: false
      },*/
      status: {
        name: "รอตรวจสอบ",
        timestamp: Date.now()
      }
    }).save().then((item) => {
      if (!item) {
        return res
          .status(404)
          .send({ status: false, message: "บันทึกข้อมูลลูกค้าไม่สำเร็จ" });
      }
      return res.status(200)
        .send({ status: true, message: "สมัครสมาชิกสำเร็จ", data: item });
    });

  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getCustomerAll = async (req, res) => {
  try {
    const member = await Customers.find();
    if (!member)
      return res.status(404)
        .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
    return res.status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: member });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getCustomerByTelephone = async (req, res) => {
  try {
    const body = req.body;
    const member = await Customers.findOne({ tel: body.tel });
    if (!member)
      return res.status(404)
        .send({ status: false, message: "ไม่พบข้อมูลลูกค้า" });
    return res.status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: member });
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
      Customers.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
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
      Customers.findByIdAndUpdate(
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
    Customers.findByIdAndDelete(id, { useFindAndModify: false })
      .then((item) => {
        if (!item)
          return res
            .status(404)
            .send({ message: "ไม่สามารถลบข้อมูลลูกค้านี้ได้" });
        return res.status(200).send({ message: "ลบข้อมูลลูกค้าสำเร็จ" });
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามารถลบข้อมูลลูกค้านี้ได้",
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
    const updateStatus = await Customers.findOne({ _id: req.params.id });
    if (updateStatus) {

      updateStatus.active = true

      updateStatus.status.push({
        name: "อนุมัติ",
        timestamp: Date.now(),
      });
      updateStatus.save();
      return res.status(200).send({
        status: true,
        message: "อนุมัติลูกค้าสำเร็จ",
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
    const updateStatus = await Customers.findOne({ _id: req.params.id });
    if (updateStatus) {

      updateStatus.active = false

      updateStatus.status.push({
        name: "ไม่อนุมัติ",
        timestamp: Date.now(),
      });
      updateStatus.save();
      return res.status(200).send({
        status: true,
        message: "ยกเลิกอนุมัติลูกค้าสำเร็จ",
        data: updateStatus,
      });
    } else {
      return res.status(403).send({ message: "เกิดข้อผิดพลาด" });
    }
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};