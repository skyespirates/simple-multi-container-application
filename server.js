const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 8080;
const Student = require("./models/student.model");

const app = express();

const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});
mongoose
  .connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/test`)
  .then((conn1) => {
    client
      .on("error", (err) => {
        console.log("redis client error", err);
      })
      .on("connect", () => {
        console.log(
          `connected to mongodb at ${conn1.connections[0].host}:${conn1.connections[0].port}`
        );
        console.log(
          `connected to redis at ${client.options.socket.host}:${client.options.socket.port}`
        );
        app.listen(PORT, () => {
          console.log(`server running on port ${PORT}`);
        });
      })
      .connect();
  })
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  const response = "Hello World!!!";
  console.log(response);
  res.send(response);
});

app.get("/health/check", async (req, res) => {
  const studentCache = await client.get("student");
  let student = null,
    mongo = 0,
    redis = 0;
  if (!studentCache) {
    const std = await Student.find({});
    student = std[0];
    mongo = 1;
    client.setEx("student", 300, JSON.stringify(student));
  } else {
    student = JSON.parse(studentCache);
    redis = 1;
  }
  console.log(student);
  res.json({
    status: {
      mongo,
      redis,
    },
    student,
  });
});
