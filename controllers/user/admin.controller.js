const bcrypt = require("bcrypt");
const {Admins, validate} = require("../../model/user/admin.model");

exports.create = async (req, res) => {
  try {
    const {error} = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({message: error.details[0].message, status: false});
    const admin = await Admins.findOne({
      admin_username: req.body.admin_username,
    });
    if (admin)
      return res
        .status(401)
        .send({status: false, message: "มีชื่อผู้ใช้งานนี้ในระบบเเล้ว"});

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(req.body.admin_password, salt);

    await new Admins({
      ...req.body,
      admin_password: hashPassword,
      admin_date_start: Date.now(),
    }).save();
    return res.status(200).send({status: true, message: "เพิ่มแอดมินสำเร็จ"});
  } catch (err) {
    return res.status(500).send({message: "Internal Server Error"});
  }
};

exports.getAdminAll = async (req, res) => {
  try {
    const admin = await Admins.find();
    if (!admin)
      return res
        .status(404)
        .send({status: false, message: "ดึงข้อมูลไม่สำเร็จ"});
    return res
      .status(200)
      .send({status: true, message: "ดึงข้อมูลสำเร็จ", data: admin});
  } catch (err) {
    return res.status(500).send({message: "Internal Server Error"});
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const id = req.params.id;
    const admin = await Admins.findById(id);
    if (!admin)
      return res
        .status(404)
        .send({status: false, message: "ดึงข้อมูลไม่สำเร็จ"});
    return res
      .status(200)
      .send({status: true, message: "ดึงข้อมูลสำเร็จ", data: admin});
  } catch (err) {
    return res.status(500).send({message: "Internal Server Error"});
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body)
      return res.status(404).send({status: false, message: "ส่งข้อมูลผิดพลาด"});
    const id = req.params.id;
    if (!req.body.admin_password) {
      Admins.findByIdAndUpdate(id, req.body, {useFindAndModify: false})
        .then((item) => {
          if (!item)
            return res
              .status(404)
              .send({status: false, message: "แก้ไขข้อมูลไม่สำเร็จ"});
          return res
            .status(200)
            .send({status: true, message: "แก้ไขข้อมูลสำเร็จ"});
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(500)
            .send({status: false, message: "มีบางอย่างผิดพลาด" + id});
        });
    } else {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      const hashPassword = await bcrypt.hash(req.body.admin_password, salt);
      Admins.findByIdAndUpdate(
        id,
        {...req.body, admin_password: hashPassword},
        {useFindAndModify: false}
      )
        .then((item) => {
          if (!item)
            return res
              .status(404)
              .send({status: false, message: "แก้ไขข้อมูลไม่สำเร็จ"});
          return res
            .status(200)
            .send({status: true, message: "แก้ไขข้อมูลสำเร็จ"});
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(500)
            .send({status: false, message: "มีบางอย่างผิดพลาด" + id});
        });
    }
  } catch (err) {
    return res.status(500).send({message: "Internal Server Error"});
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    Admins.findByIdAndDelete(id, {useFindAndModify: false})
      .then((item) => {
        if (!item)
          return res
            .status(404)
            .send({message: "ไม่สามารถลบข้อมูลแอดมินนี้ได้"});
        return res.status(200).send({message: "ลบข้อมูลแอดมินสำเร็จ"});
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามารถลบข้อมูลแอดมินนี้ได้",
          status: false,
        });
      });
  } catch (err) {
    return res.status(500).send({message: "Internal Server Error"});
  }
};
