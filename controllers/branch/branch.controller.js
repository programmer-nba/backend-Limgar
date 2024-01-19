const { Branchs, validate } = require("../../model/branch/branch.model");

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    const listBranch = await Branchs.findOne({
      name: req.body.name,
      tel: req.body.tel,
    });
    if ((listBranch.name === req.body.name) && (listBranch.name === req.body.tel))
      return res.status(401).send({
        status: false,
        message: "สาขานี้มีชื่อผู้ใช้งานนี้หรือเบอร์โทรศัพ์นี้ในระบบเเล้ว",
      });

    await new Branchs({
      ...req.body,
      timestamp: Date.now(),
      isActive: false,
      status: {
        name: "รอตรวจสอบ",
        timestamp: Date.now()
      }
    }).save();

    return res.status(200).send({ status: true, message: "ลงทะเบียนสาขานี้สำเร็จ" });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getAgentAll = async (req, res) => {
  try {
    const agent = await Branchs.find();
    if (!agent)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลสาขาไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสาขาสำเร็จ", data: agent });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getAgentById = async (req, res) => {
  try {
    const id = req.params.id;
    const agent = await Branchs.findById(id);
    if (!agent)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลสาขานี้ไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสาขานี้สำเร็จ", data: agent });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body)
      return res.status(404).send({ status: false, message: "ส่งข้อมูลสาขานี้ผิดพลาด" });
    const id = req.params.id;
    if (!req.body.password) {
      Branchs.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then((item) => {
          if (!item)
            return res
              .status(404)
              .send({ status: false, message: "แก้ไขข้อมูลสาขานี้ไม่สำเร็จ" });
          return res
            .status(200)
            .send({ status: true, message: "แก้ไขข้อมูลสาขานี้สำเร็จ" });
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
      Branchs.findByIdAndUpdate(
        id,
        { ...req.body, password: hashPassword },
        { useFindAndModify: false }
      )
        .then((item) => {
          if (!item)
            return res
              .status(404)
              .send({ status: false, message: "แก้ไขข้อมูลสาขานี้ไม่สำเร็จ" });
          return res
            .status(200)
            .send({ status: true, message: "แก้ไขข้อมูลสาขานี้สำเร็จ" });
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
    Branchs.findByIdAndDelete(id, { useFindAndModify: false })
      .then((item) => {
        if (!item)
          return res
            .status(404)
            .send({ message: "ไม่สามารถลบข้อมูลสาขานี้ได้" });
        return res.status(200).send({ message: "ลบข้อมูลสาขานี้สำเร็จ" });
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามารถลบข้อมูลสาขานี้ได้",
          status: false,
        });
      });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};