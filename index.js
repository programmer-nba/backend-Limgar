require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const concention = require("./config/db");
concention();

app.use(bodyParser.json({ limit: "50mb", type: "application/json" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(cors());

// login
app.use("/Limgar/login", require("./routes/login"));

// me
app.use("/Limgar/me", require("./routes/me"));

// user
app.use("/Limgar/admin", require("./routes/user/admin"));
app.use("/Limgar/agent", require("./routes/user/agent"));

app.use("/Limgar/channels", require("./routes/more/channels"));

// Porduct
app.use("/Limgar/product", require("./routes/product/product"));
app.use("/Limgar/product/image", require("./controllers/product/uploadfile"));

// Function
app.use("/Limgar/function", require("./routes/more/function"));

// Delete Image
app.use("/Limgar/delete/image", require("./routes/more/deleteImage"));
// UPLOAD FILE COLLECTION
app.use("/Limgar/image/collection", require("./routes/more/uploadfile"));

const port = process.env.PORT || 7474;
app.listen(port, console.log(`Listening on port ${port}`));
