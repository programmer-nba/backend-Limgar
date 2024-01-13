const router = require("express").Router();
const agent = require("../../controllers/user/agent.controller");
// const authAdmin = require("../../lib/authAdmin");

router.post("/register", agent.create);
router.get("/", agent.getAgentAll);
router.get("/:id", agent.getAgentById);
router.put("/:id", agent.update);
router.delete("/:id", agent.delete);

module.exports = router;
