
require("dotenv").config();
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on('connected',function(){
     console.log("connection is going on");
});
mongoose.connection.on('error',function(){
     console.log("connection is going off");
})
