const { ProductStock, validate } = require("../../model/stock/stock.product.model")
const { Stocks } = require("../../model/stock/stock.model");
const { Products } = require("../../model/product/product.model");

exports.create = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error)
            return res.status(403).send({ status: false, message: "มีบางอย่างผิดพลาด" })
        const product = await Products.findOne({ _id: req.body.product_id });
        if (!product)
            return res.status(401).send({
                status: false,
                message: "ไม่มีสินค้าในระบบ",
            });
        const stock = await Stocks.findOne({ _id: req.body.stock_id });
        if (!stock)
            return res.status(401).send({
                status: false,
                message: "ไม่พบสต๊อกที่ต้องการเพิ่มสินค้า",
            });
        const product_stock = await ProductStock.findOne({ product_id: req.body.product_id, stock_id: req.body.stock_id });
        if (product_stock)
            return res.status(401).send({
                status: false,
                message: "มีสินค้าในคลังแล้ว",
            });
        const new_product_stock = await new ProductStock({
            ...req.body,
            product_name: product.product_name,
        });
        new_product_stock.save();
        return res.status(200).send({ status: true, message: "เพิ่มสินค้าเข้าสต๊อกสำเร็จ", data: product_stock });
    } catch (err) {
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
}

exports.getProductStockAll = async (req, res) => {
    try {
        const product_stock = await ProductStock.find();
        if (!product_stock)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" })
        return res.status(200).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product_stock });
    } catch (err) {
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
}

exports.getProductStockById = async (req, res) => {
    try {
        const id = req.params.id;
        const product_stock = await ProductStock.findOne({ _id: id });
        if (!product_stock)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" })
        return res.status(201).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product_stock });
    } catch (err) {
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
}

exports.getProductStockByStockId = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await ProductStock.find();
        const product_stock = product.filter(
            (el) => el.stock_id === id,
        );
        if (!product_stock)
            return res.status(403).send({ status: false, message: "ดึงข้อมูลไม่สำเร็จ" })
        return res.status(201).send({ status: true, message: "ดึงข้อมูลสำเร็จ", data: product_stock });
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
        ProductStock.findByIdAndUpdate(id, { ...req.body }, { useFindAndModify: false })
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
                return res.status(500).send({
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
        ProductStock.findByIdAndDelete(id, { useFindAndModify: false })
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