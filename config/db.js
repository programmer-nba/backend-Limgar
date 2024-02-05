const mongoose = require("mongoose");
module.exports = () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.DB, connectionParams);
    //mongoose.connect(process.env.DB_testter, connectionParams);
    console.log("Connected to database successfully");
  } catch (error) {
    console.log(error);
    console.log("Could not connect database!");
  }
};
