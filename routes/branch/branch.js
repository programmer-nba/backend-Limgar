const router = require("express").Router();
const branch = require("../../controllers/branch/branch.controller");

router.post("/register", branch.create);
router.get("/", branch.getAgentAll);
router.get("/:id", branch.getAgentById);
router.put("/:id", branch.update);
router.delete("/:id", branch.delete);

module.exports = router;
