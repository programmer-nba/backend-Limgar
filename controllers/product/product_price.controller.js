const { Products } = require("../../model/product/product.model");
const { ProductsPrice, validate } = require("../../model/product/product_price.model");
var _ = require("lodash");
const { StocksSummary } = require("../../model/stock/stock_summary.model");

exports.create = async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error)
      return res
        .status(403)
        .send({ message: error.details[0].message, status: false });
    const product_price = await ProductsPrice.findOne({
      product_id: req.body.product_id,
      amount: req.body.amount,
    });
    if (product_price)
      return res
        .status(401)
        .send({ status: false, message: "แพ็กเกจราคาสินค้านี้มีในระบบแล้ว" });

    const new_product_price = new ProductsPrice({ ...req.body });
    new_product_price.save();
    return res.status(200)
      .send({ status: true, message: "เพิ่มราคาสินค้าสำเร็จ", data: new_product_price });
  } catch (err) {
    return res.status(500)
      .send({ message: "Internal Server Error" });
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
/*exports.getProductPriceByID = async (req, res) => {
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
};*/
exports.getProductPriceByProduct_oid = async (req, res) => {
  try {
    const id = req.params.id;
    // const product_one = await Products.findById(id);
    const priceLists = await ProductsPrice.find({
      product_id: id
    });
    if (!priceLists)
      return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" })
    return res.status(200)
      .send({ status: true, message: "ดึงข้อมูลราคาสินค้าสำเร็จ", data: priceLists });
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
      .then(async (item) => {
        if (!item)
          return res.status(404)
            .send({ status: false, message: "แก้ไขข้อมูลราคาสินค้าไม่สำเร็จ" });

        //--hotfix send new update into response
        const priceList_one = await ProductsPrice.findById(id);
        return res.status(200)
          .send({ status: true, message: "แก้ไขข้อมูลราคาสินค้าสำเร็จ", data: priceList_one });
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

exports.updateByProduct_oid = async (req, res) => {
  try {
    if (!req.body)
      return res.status(404).send({ status: false, message: "ส่งข้อมูลราคาสินค้าผิดพลาด" });
    const product_oid_search = req.params.id;
    const product_amount_search = req.body.amount;

    const result_price_list = await ProductsPrice.findOne({
      product_oid: product_oid_search,
      amount: product_amount_search
    });

    ProductsPrice.findByIdAndUpdate(result_price_list.id, req.body, { useFindAndModify: false })
      .then(async (item) => {
        if (!item)
          return res.status(404)
            .send({ status: false, message: "แก้ไขข้อมูลราคาสินค้าไม่สำเร็จ" });

        //--hotfix send new update into response
        const priceList_one = await ProductsPrice.findById(result_price_list.id);
        return res.status(200)
          .send({ status: true, message: "แก้ไขข้อมูลราคาสินค้าสำเร็จ", data: priceList_one });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .send({ status: false, message: "มีบางอย่างผิดพลาด " + product_oid_search });
      });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    ProductsPrice.findByIdAndDelete(id, { useFindAndModify: false })
      .then(async (item) => {
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

exports.deleteByProduct_oid = async (req, res) => {
  try {
    const product_oid_search = req.params.id;
    const product_amount_search = req.body.amount;

    const result_price_list = await ProductsPrice.findOne({
      product_oid: product_oid_search,
      amount: product_amount_search
    });
    ProductsPrice.findByIdAndDelete(result_price_list.id, { useFindAndModify: false })
      .then(async (item) => {
        if (!item)
          return res.status(404).send({ message: "ไม่สามรถลบราคาสินค้านี้ได้" });

        //--hotfix send new update into response
        const priceLists = await ProductsPrice.find({
          product_oid: product_oid_search
        });
        return res.status(200).send({ message: "ลบข้อมูลราคาสินค้าสำเร็จ", data: priceLists });
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
