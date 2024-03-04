const router = require("express").Router()
const order_stock = require("../../controllers/order/order.stock.controller")
const auth_admin = require("../../lib/auth.admin")
const auth_employee = require("../../lib/auth.employee")

router.get("/all", auth_admin, order_stock.getOrderStockAll)
router.get("/:id", auth_employee, order_stock.getOrderStockById)
router.get("/stock/:id", auth_employee, order_stock.getOrderStockId)

module.exports = router;