const router = require("express").Router()
const invoiceShopShort = require("../../../controllers/pos/invoice.tax.shop.short")

router.post("/shop/short", invoiceShopShort.create);

module.exports = router;