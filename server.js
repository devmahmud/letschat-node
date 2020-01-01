const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");

app.use(express.static("static"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri =
  "mongodb+srv://<username>:<password>@cluster0-8i2yl.mongodb.net/chatdb?retryWrites=true&w=majority";

var Message = mongoose.model("Message", {
  name: String,
  message: String
});

app.get("/messages", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const messages = Message.find({}, (err, messages) => {
    if (err) res.sendStatus(500);
    res.send(messages);
  }).sort({ _id: -1 });
});

app.post("/messages", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const message = new Message(req.body);
  message.save(err => {
    if (err) res.sendStatus(500);
    io.emit("message", req.body);
    res.sendStatus(200);
  });
});

io.on("connection", socket => {
  console.log("User connected");
});

mongoose.connect(uri, { useNewUrlParser: true }, err => {
  console.log("Mongodb connected");
});

const PORT = process.env.PORT || 5000;

http.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
