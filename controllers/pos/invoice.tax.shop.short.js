const dayjs = require("dayjs")
const { PreOrderShops } = require("../../model/pos/preorder.shop")

exports.create = async (req, res) => {
    try {
        PreOrderShops.find({
            poshop_stock_id: req.body.stock_id
        }).then((value) => {
            if (!value) {
                return res.status(404);
            } else {
                console.log("ค่าที่รีเทอนกลับมา =>>>>>>> ", value);
                const findDate = value.filter(
                    (item) =>
                        dayjs(item.poshop_timestamp).format("MM/YYYY") ===
                        dayjs(req.body.date).format("MM/YYYY")
                );
                if (findDate.length < 9) {
                    return res.send({
                        status: true,
                        invoice_short: `LIMGAR${dayjs(req.body.date).format("YYYYMM")}000${findDate.length + 1}`,
                    });
                } else if (findDate.length < 99) {
                    return res.send({
                        status: true,
                        invoice_short: `LIMGAR${dayjs(req.body.date).format("YYYYMM")}00${findDate.length + 1}`,
                    });
                } else if (findDate.length < 999) {
                    return res.send({
                        status: true,
                        invoice_short: `LIMGAR${dayjs(req.body.date).format("YYYYMM")}0${findDate.length + 1}`,
                    });
                }
            }
        })
    } catch (err) {
        return res.status(500).send({ message: "มีบางอย่างผิดพลาด", status: false });
    }
}