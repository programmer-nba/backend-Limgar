const router = require("express").Router();
const products = require("../../controllers/product/product.controller");

router.post("/", products.create);
router.get("/", products.getProductAll);
router.get("/:id", products.getProductById);
router.put("/:id", products.update);
router.delete("/:id", products.delete);

module.exports = router;