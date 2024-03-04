const router = require("express").Router()
const invoiceShopShort = require("../../../controllers/pos/invoice.tax.shop.short")
const auth_employee = require("../../../lib/auth.employee")

router.post("/shop/short", auth_employee, invoiceShopShort.create);

module.exports = router;