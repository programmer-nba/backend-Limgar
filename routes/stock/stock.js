const router = require("express").Router();
const stock = require("../../controllers/stock/stock.controller");
const authAdmin = require('../../lib/auth.admin')

router.post('/', authAdmin, stock.create);

router.get('/all', stock.getStockAll);
router.get('/:id', authAdmin, stock.getById);

router.put('/:id', authAdmin, stock.update);
router.delete('/:id', authAdmin, stock.delete);

module.exports = router;
