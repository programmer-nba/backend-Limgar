const router = require("express").Router();
const productPrice = require("../../controllers/product/product_price.controller");
const authAdmin = require("../../lib/auth.admin");
const authAgent = require("../../lib/auth.agent")

router.post("/", authAdmin, productPrice.create);
router.get("/", authAgent, productPrice.getProductPriceAll);
router.get("/:id", authAgent, productPrice.getProductPriceByProduct_oid);
router.put("/:id", authAdmin, productPrice.update);
router.put("/byproduct/:id", authAdmin, productPrice.updateByProduct_oid);
router.delete("/:id", authAdmin, productPrice.delete);
router.delete("/byproduct/:id", authAdmin, productPrice.deleteByProduct_oid);

module.exports = router;