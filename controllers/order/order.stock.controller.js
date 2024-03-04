const { OrderStocks } = require("../../model/order/order.stock.model")

exports.getOrderStockAll = async (req, res) => {
    try {
        const order = await OrderStocks.find();
        if (!order)
            return res.status(404)
                .send({ status: false, message: "ดึงข้อมูลออเดอร์ไม่สำเร็จ" });
        return res.status(200)
            .send({ status: true, message: "ดึงข้อมูลออเดอร์สำเร็จ", data: order });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
}

exports.getOrderStockById = async (req, res) => {
    try {
        const id = req.params.id;
        const order = await OrderStocks.findById(id);
        if (!order)
            return res
                .status(404)
                .send({ status: false, message: "ดึงข้อมูลออเดอร์ไม่สำเร็จ" });
        return res
            .status(200)
            .send({ status: true, message: "ดึงข้อมูลออเดอร์สำเร็จ", data: order });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
};

exports.getOrderStockId = async (req, res) => {
    try {
        const id = req.params.id;
        const order = await OrderStocks.find();
        const stock_order = order.filter(
            (el) => el.stock_id === id,
        );
        // const order = await Orders.findOne({
        //   agent_oid: id,
        // });
        // console.log(order);
        if (!stock_order)
            return res
                .status(404)
                .send({ status: false, message: "ดึงข้อมูลออเดอร์ไม่สำเร็จ" });
        return res
            .status(200)
            .send({ status: true, message: "ดึงข้อมูลออเดอร์สำเร็จ", data: stock_order });
    } catch (err) {
        return res.status(500).send({ message: "Internal Server Error" });
    }
}