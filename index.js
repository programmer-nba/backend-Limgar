require("dotenv").config();

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const concention = require("./config/db");
concention();

app.use(bodyParser.json({limit: "50mb", type: "application/json"}));
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.json());
app.use(cors());

// login
app.use("/Limgar/login", require("./routes/login"));

// me
app.use("/Limgar/me", require("./routes/me"));

// user
app.use("/Limgar/admin", require("./routes/user/admin"));

const port = process.env.PORT || 7474;
app.listen(port, console.log(`Listening on port ${port}`));