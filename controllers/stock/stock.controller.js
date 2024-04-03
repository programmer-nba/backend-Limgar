const { Stocks, validate } = require("../../model/stock/stock.model")
const dayjs = require("dayjs")

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res.status(403).send({ status: false, message: "มีบางอย่างผิดพลาด" })

    const stock = await new Stocks({
      ...req.body,
      timestamp: dayjs(Date.now()).format()
    });
    stock.save();
    return res.status(201).send({ status: true, message: "เพิ่มสต๊อกสำเร็จ", data: stock });
  } catch (err) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
}

exports.getStockAll = async (req, res) => {
  try {
    const stock = await Stocks.find();
    if (!stock)
      return res.status(403).send({ status: false, message: "ดึงข้อมูลร้านไม่สำเร็จ" })
    return res.status(201).send({ status: true, message: "ดึงข้อมูลร้านสำเร็จ", data: stock });
  } catch (err) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
}

exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    const stock = await Stocks.findOne({ _id: id });
    if (!stock)
      return res.status(403).send({ status: false, message: "ดึงข้อมูลร้านไม่สำเร็จ" })
    return res.status(201).send({ status: true, message: "ดึงข้อมูลร้านสำเร็จ", data: stock });
  } catch (err) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
}

exports.update = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({
        message: "ส่งข้อมูลผิดพลาด",
      });
    }
    const id = req.params.id;
    Stocks.findByIdAndUpdate(id, { ...req.body }, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          return res.status(404).send({
            message: 'แก้ไขข้อมูลไม่สำเร็จ',
            status: false,
          });
        } else {
          return res.send({
            message: "แก้ไขข้อมูลสำเร็จ",
            status: true,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "มีบางอย่างผิดพลาด",
          status: false,
        });
      });
  } catch (err) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
}

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    Stocks.findByIdAndDelete(id, { useFindAndModify: false })
      .then((data) => {
        if (!data) {
          return res.status(404).send({
            message: 'ลบข้อมูลไม่สำเร็จ',
            status: false,
          });
        } else {
          return res.send({
            message: "ลบข้อมูลสำเร็จ",
            status: true,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "มีบางอย่างผิดพลาด",
          status: false,
        });
      });
  } catch (err) {
    return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
  }
}