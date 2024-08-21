const { Schema, model } = require("mongoose");

const studentSchema = new Schema({
  name: String,
  age: Number,
});

const studentModel = model("Student", studentSchema);

module.exports = studentModel;
