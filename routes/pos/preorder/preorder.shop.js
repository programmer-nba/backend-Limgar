const router = require("express").Router()
const pos = require("../../../controllers/pos/preorder.shop.controller")
const authEmp = require("../../../lib/auth.employee")
const authAdmin = require("../../../lib/auth.admin")

router.get('/product/stock/:id', pos.getProductStock)
router.get('/product/price/:id', pos.getProductStockPrice)

router.post('/create', authEmp, pos.create)

router.get('/all', authAdmin, pos.getAll)
router.get('/:id', authEmp, pos.getById)
router.get('/stock/:id', authEmp, pos.getByStockId)

// router.put('/:id', authEmp, pos.update)
// router.delete('/:id', authAdmin, pos.delete)

module.exports = router;