const express = require("express");
const mongoose = require("mongoose");
const redis = require("redis");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 8080;
const Student = require("./models/student.model");

const app = express();

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// connect to mongodb
mongoose
  .connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/test`)
  .then((conn1) => {
    console.log(
      `connected to mongodb at ${conn1.connections[0].host}:${conn1.connections[0].port}`
    );
  })
  .catch((err) => {
    throw err;
  })
  .catch((err) => console.log(err));

// connect to redis
client
  .on("error", (err) => {
    throw err;
  })
  .on("connect", () => {
    console.log(
      `connected to redis at ${client.options.socket.host}:${client.options.socket.port}`
    );
  })
  .connect();

app.use(express.json());

app.get("/", (req, res) => {
  const data = {
    message: "success",
  };
  res.send(data);
});

app.post("/health/check", async (req, res) => {
  const { name, age } = req.body;
  console.log(req.body);
  try {
    await Student.create({ name, age });
    res.status(201).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/health/check", async (req, res) => {
  try {
    const studentCache = await client.get("student");
    let students = [],
      mongo = 0,
      redis = 0;
    if (!studentCache) {
      const students = await Student.find({});
      if (students.length === 0) {
        res.json({ message: "Data is empty" });
        return;
      }
      mongo = 1;
      client.setEx("student", 300, JSON.stringify(students));
    } else {
      students = JSON.parse(studentCache);
      redis = 1;
    }
    console.log(students);
    res.json({
      status: {
        mongo,
        redis,
      },
      students,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/health/check", async (req, res) => {
  try {
    await Student.deleteMany({});
    res.status(201).json({ message: "Data removed successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/flushall", async (req, res) => {
  try {
    await client.flushAll();
    res.json({ message: "cache is removed" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
