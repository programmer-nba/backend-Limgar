const { Customers, validate } = require("../../model/user/customer.model");

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    console.log("error");
    if (error)
      return res
        .status(400)
        .send({ message: error.details[0].message, status: false });
    const new_customer = await new Customers({
      ...req.body,
    }).save();
    return res.status(200).send({ status: true, message: "เพิ่มข้อมูลลูกค้าสำเร็จ", data: new_customer })
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