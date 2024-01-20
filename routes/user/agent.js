const router = require("express").Router();
const agent = require("../../controllers/user/agent.controller");
const row = require("../../controllers/user/row.controller")
// const authAdmin = require("../../lib/authAdmin");

router.post("/register", agent.create);
router.get("/", agent.getAgentAll);
router.get("/:id", agent.getAgentById);
router.put("/:id", agent.update);
router.delete("/:id", agent.delete);

router.post("/row", row.create);
router.get("/row/all", row.getRowAll);
router.get("/row/:id", row.getRowById);
router.put("/row/:id", row.update);
router.delete("/row/:id", row.delete);

router.put("/confirm/:id", agent.comfirm);
router.put("/cancel/:id", agent.cancel);

module.exports = router;