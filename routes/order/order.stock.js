const router = require("express").Router()
const order_stock = require("../../controllers/order/order.stock.controller")
const auth_admin = require("../../lib/auth.admin")
const auth_employee = require("../../lib/auth.employee")

router.get("/all", order_stock.getOrderStockAll)
router.get("/:id", order_stock.getOrderStockById)
router.get("/stock/:id", order_stock.getOrderStockId)

module.exports = router;