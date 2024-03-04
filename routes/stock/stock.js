const router = require("express").Router();
const stock = require("../../controllers/stock/stock.controller");
const authAdmin = require('../../lib/auth.admin');
const auth = require("../../lib/auth.me")

router.post('/', authAdmin, stock.create);

router.get('/all', authAdmin, stock.getStockAll);
router.get('/:id', auth, stock.getById);

router.put('/:id', authAdmin, stock.update);
router.delete('/:id', authAdmin, stock.delete);

module.exports = router;
