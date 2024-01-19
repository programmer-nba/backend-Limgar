//const { Products, validate } = require("../../model/product/product.model");
//const { Products, validate } = require("../../test_SplitPriceAndProduct/model/product/product.model");
//const { ProductsPrice, validate } = require("../../model/product/product_price.model")
const { ProductsPrice, validate } = require("../../test_SplitPriceAndProduct/model/product/product_price.model")

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    const product_price = await ProductsPrice.findOne({
      branch_id: req.body.branch_id,
      product_id: req.body.product_id,
      amount: req.body.amount,
    });
    if (product_price)
      if ((product_price.amount === req.body.amount) && (product_price.product_id === req.body.product_id) && (product_price.branch_id === req.body.branch_id)) {
        return res
          .status(401)
          .send({ status: false, message: "ราคาสินค้านี้มีในระบบแล้ว" });
      }
    await new ProductsPrice({
      ...req.body,
      isHqAdminOnly: true,

      /*  isExtraCOD: (amount) => {
          if (amount >= 5)
            return true //แพ็กเกิน 5 ขวด ชาร์จค่าส่งเพิ่ม
        },*/
    }).save();
    return res.status(200).send({ status: true, message: "เพิ่มราคาสินค้าสำเร็จ" });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getProductPriceAll = async (req, res) => {
  try {
    const product = await ProductsPrice.find();
    if (!product)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลราคาสินค้าไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลราคาสินค้าสำเร็จ", data: product });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getProductPriceById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await ProductsPrice.findById(id);
    if (!product)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลราคาสินค้าไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลราคาสินค้าสำเร็จ", data: product });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body)
      return res.status(404).send({ status: false, message: "ส่งข้อมูลราคาสินค้าผิดพลาด" });
    const id = req.params.id;
    ProductsPrice.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
      .then((item) => {
        if (!item)
          return res
            .status(404)
            .send({ status: false, message: "แก้ไขข้อมูลราคาสินค้าไม่สำเร็จ" });
        return res
          .status(200)
          .send({ status: true, message: "แก้ไขข้อมูลราคาสินค้าสำเร็จ" });
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
    ProductsPrice.findByIdAndDelete(id, { useFindAndModify: false })
      .then((item) => {
        if (!item)
          return res.status(404).send({ message: "ไม่สามรถลบราคาสินค้านี้ได้" });
        return res.status(200).send({ message: "ลบข้อมูลราคาสินค้าสำเร็จ" });
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามรถลบราคาสินค้านี้ได้",
          status: false,
        });
      });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
