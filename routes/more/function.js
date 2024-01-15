const router = require("express").Router();
const FunctionMore = require("../../controllers/more/function.controller");

router.get("/", FunctionMore.getAll);
router.get("/:id", FunctionMore.getById);
router.get("/:func_name", FunctionMore.getByFunctionName);
router.post("/", FunctionMore.create);
router.put("/:id", FunctionMore.update);
router.delete("/:id", FunctionMore.delete);

module.exports = router;
