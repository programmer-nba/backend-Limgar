const router = require("express").Router();
const stock_product = require("../../controllers/stock/stock.product.controller")
const authAdmin = require("../../lib/auth.admin")

router.post("/", authAdmin, stock_product.create);

router.get("/all", authAdmin, stock_product.getProductStockAll);
router.get("/:id", authAdmin, stock_product.getProductStockById);
router.get("/stock/:id", authAdmin, stock_product.getProductStockByStockId);

router.put("/:id", authAdmin, stock_product.update);
router.delete("/:id", authAdmin, stock_product.delete);

// History
router.post("/history", stock_product.createHistory);
router.get("/history/stock/:id", stock_product.getHistory);

module.exports = router;