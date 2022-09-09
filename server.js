const express = require("express");
const { Server } = require("socket.io");
const morgan = require("morgan");
const cors = require("cors");
const { ExpressPeerServer } = require("peer");

const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.static("public"));
app.use("/favicon.ico", express.static("public/assets/favicon.ico"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index.ejs");
});

const httpServer = app.listen(process.env.PORT || 7331);

const peerServer = ExpressPeerServer(httpServer, {
  debug: true,
});

app.use("/peerjs", peerServer);

peerServer.on("connection", (client) => {
  console.log("Peer client connected");
});
peerServer.on("disconnect", (client) => {
  console.log("Peer client disconnected");
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const idStore = {};

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.on("new-connection", (peerId) => {
    console.log("New connection request");
    idStore[peerId] = true;

    // idStore.forEach((ele) => {
    io.emit("user-add", idStore);
    // });
  });

  socket.on("disconnect", () => console.log("Client disconnected"));
});
