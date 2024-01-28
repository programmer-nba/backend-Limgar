//const { ProductOlds } = require("../../model/product/product.model");
const { Products, validate } = require("../../test_SplitPriceAndProduct/model/product/product.model");
const { ProductsPrice } = require("../../test_SplitPriceAndProduct/model/product/product_price.model");
var _ = require("lodash");

exports.create = async (req, res) => {
  //const newProduct = req.body;
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
      product_image: "16_4k32_P7uDWvZMflvVXUKcI5jRNLfu_", //--HotFix
    }).save();

    //--hotfix add data to product_price
    const product2 = await Products.findOne({
      //product_name: req.body.product_name,
      product_barcode: req.body.product_barcode,
    });

    await new ProductsPrice({
      //--hotfix initial first product's Price
      ...req.body,
      isHqAdminOnly: true,
      product_oid: product2.id,
      branch_oid: "65aa1506f866895c9585e033",
      branchName: "HQ",
      amount: 1,
      price: {
        price_one: 0,
        price_two: 0,
        price_three: 0,
        price_four: 0,
        price_five: 0
      },
      priceCOD: {
        price_one: 0,
        price_two: 0,
        price_three: 0,
        price_four: 0,
        price_five: 0
      },
      isExtraCOD: false

    }).save();

    return res.status(200).send({ status: true, message: "เพิ่มสินค้าสำเร็จ" });
  } catch (err) {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.getProductAll = async (req, res) => {
  //const branchName = req.body.branchName

  //--ค้นเฉพาะ ราคาจากHQ
  const searchByBranchName = "HQ"
  try {
    const product = await Products.find();
    const priceLists = await ProductsPrice.find();

    if (!product)
      return res
        .status(404)
        .send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" });

    //--HotFix obj test
    let newData = [];
    let newProduct;
    let data_a;
    _.forEach(priceLists, (value, key) => {

      if (value.branchName == searchByBranchName) {

        data_a = {
          product_oid: value.product_oid,
          amount: value.amount,
          product_price_oid: value.id,
          price: value.price,
          priceCOD: value.priceCOD,
          product_barcode: value.product_barcode,
          product_name: value.product_name,
          branchName: value.branchName,
          isExtraCOD: value.isExtraCOD,

          product_image: "",
          product_barcode: "",
          product_name: "",
          product_category: "",
          product_detail: "",
          product_description: "",
          product_cost: "",
          product_net_weight: "",
          product_pack: {
            name: "ชิ้น/Pack",
            amount: value.amount
          }
        }

        newProduct = _.find(product, (value2, key2) => {
          if (value2.id == value.product_oid) {
            return true
          }
        });
        if (newProduct == undefined) {
          //--hotFix unidentified productInfo
          data_a.product_image = "-";
          data_a.product_barcode = "-";
          data_a.product_name = "-";
          data_a.product_category = "-";
          data_a.product_detail = "-";
          data_a.product_description = "-";
          data_a.product_cost = 0;
          data_a.product_net_weight = 0;
        }
        else {
          //--hotFix unidentified productInfo
          data_a.product_image = newProduct.product_image;
          data_a.product_barcode = newProduct.product_barcode;
          data_a.product_name = newProduct.product_name;
          data_a.product_category = newProduct.product_category;
          data_a.product_detail = newProduct.product_detail;
          data_a.product_description = newProduct.product_description;
          data_a.product_cost = newProduct.product_cost;
          data_a.product_net_weight = newProduct.product_net_weight;
        }
      }
      newData.push(data_a)
    }
    );
    return res
      .status(200)
      .send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: newData });
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
      .then(async (item) => {
        if (!item)
          return res
            .status(404)
            .send({ status: false, message: "แก้ไขข้อมูลไม่สำเร็จ" });

        const oneProduct = await this.getProductById(req, res);
        return res
          .status(200) //--hotfix
          .send({ status: true, message: "แก้ไขข้อมูลสำเร็จ" + "product_id : " + id + "data :" + oneProduct });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(500)
          .send({ status: false, message: "มีบางอย่างผิดพลาด " + id });
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
