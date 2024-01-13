const router = require("express").Router();
const channels = require("../../controllers/more/channels.controller");

router.post("/", channels.create);
router.get("/", channels.getChannelAll);
router.get("/:id", channels.getChannelById);
router.put("/:id", channels.update);
router.delete("/:id", channels.delete);

module.exports = router;
