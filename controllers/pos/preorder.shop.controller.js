const { PreOrderShops, validate } = require("../../model/pos/preorder.shop")
const { ProductStock } = require("../../model/stock/stock.product.model")
const { ProductsPrice } = require("../../model/product/product_price.model")
const dayjs = require("dayjs")

exports.getProductStock = async (req, res) => {
    try {
        const stock_id = req.params.id;
        const product = await ProductStock.find();
        const product_stock = product.filter(
            (el) => el.stock_id === stock_id
        );
        if (!product_stock)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" })
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำรเร็จ", data: product_stock })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};

exports.getProductStockPrice = async (req, res) => {
    try {
        const product_id = req.params.id;
        const product = await ProductsPrice.find();
        const product_price = product.filter(
            (el) => el.product_id === product_id
        );
        if (!product_price)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" })
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำรเร็จ", data: product_price })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
}

exports.create = async (req, res) => {
    console.log("สร้าง POS Shop")
    try {
        const { error } = validate(req.body)
        if (error)
            return res.status(403).send({ status: false, message: error.details[0].message })

        const result = new PreOrderShops({ ...req.body }).save();
        return res.status(200).send({ status: true, message: "บันทึกการขายสำเร็จ", data: result });
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};

exports.getAll = async (req, res) => {
    try {
        const preorder_shop = await PreOrderShops.find();
        if (!preorder_shop)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" })
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำรเร็จ", data: preorder_shop })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};

exports.getById = async (req, res) => {
    try {
        const id = req.params.id;
        const preorder_shop = await PreOrderShops.findOne({ _id: id });
        if (!preorder_shop)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" })
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำรเร็จ", data: preorder_shop })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};

exports.getByStockId = async (req, res) => {
    try {
        const id = req.params.id;
        const preorder = await PreOrderShops.find();
        const preorder_shop = preorder.filter(
            (el) => el.poshop_shop_id === id
        );
        if (!preorder_shop)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" })
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำรเร็จ", data: preorder_shop })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
};

