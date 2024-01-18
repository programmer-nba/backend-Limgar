const router = require("express").Router();
const productPrice = require("../../controllers/product/product_price.controller");

router.post("/", productPrice.create);
router.get("/", productPrice.getProductPriceAll);
router.get("/:id", productPrice.getProductPriceById);
router.put("/:id", productPrice.update);
router.delete("/:id", productPrice.delete);

module.exports = router;