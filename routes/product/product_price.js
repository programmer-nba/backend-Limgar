const router = require("express").Router();
const productPrice = require("../../controllers/product/product_price.controller");

router.post("/", productPrice.create);
router.get("/", productPrice.getProductPriceAll);
router.get("/byproduct/:id", productPrice.getProductPriceByProduct_oid);
router.put("/:id", productPrice.update);
router.put("/byproduct/:id", productPrice.updateByProduct_oid);
router.delete("/:id", productPrice.delete);
router.delete("/byproduct/:id", productPrice.deleteByProduct_oid);

module.exports = router;