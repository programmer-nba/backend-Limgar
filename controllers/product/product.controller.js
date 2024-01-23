//const { Products, validate } = require("../../model/product/product.model");
const { Products, validate } = require("../../test_SplitPriceAndProduct/model/product/product.model");
const { ProductsPrice } = require("../../test_SplitPriceAndProduct/model/product/product_price.model");
var _ = require("lodash");


exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    const product = await Products.findOne({
      //product_name: req.body.product_name,
      product_barcode: req.body.product_barcode,
    });
    if (product)
      if (product.name === req.body.product_name) {
        return res
          .status(401)
          .send({ status: false, message: "สินค้านี้มีในระบบแล้ว" });
      }
    await new Products({
      ...req.body,
      isOutStock: false,
    }).save();
    return res.status(200).send({ status: true, message: "เพิ่มสินค้าสำเร็จ" });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getProductAll = async (req, res) => {
  //const branchName = req.body.branchName
  try {
    const product = await Products.find();
    const priceLists = await ProductsPrice.find();

    let newData = [];
    _.forEach(priceLists, (value, key) => {
      if (value.branchName == "HQ") {
        newData.push({
          "amount": value.amount,
          "price": value.price,
          "priceCOD": value.priceCOD,
          "product_id": value.product_id,
          "product_name": value.product_name,
          "branchName": value.branchName,
          "extraCOD": value.extraCOD
        });
      }
    });

    /* let newData2 = _.reduce(priceLists.price["key"], (result, value, key) => {
       result[value] = key;
       return result;
     }, {});*/
    debugger

    if (!product)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Products.findById(id);
    if (!product)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body)
      return res.status(404).send({ status: false, message: "ส่งข้อมูลผิดพลาด" });
    const id = req.params.id;
    Products.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
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
    Products.findByIdAndDelete(id, { useFindAndModify: false })
      .then((item) => {
        if (!item)
          return res.status(404).send({ message: "ไม่สามรถลบสินค้านี้ได้" });
        return res.status(200).send({ message: "ลบข้อมูลสินค้าสำเร็จ" });
      })
      .catch((err) => {
        res.status(500).send({
          message: "ไม่สามรถลบสินค้านี้ได้",
          status: false,
        });
      });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
