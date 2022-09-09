console.log("MainJS loaded");

// const socket = io.connect("http://localhost:7331");
const socket = io.connect(`https://livehub-io.herokuapp.com/`);

let herokuPort;

socket.on("connection", () => {
  console.log("Connected to server");
});

socket.on("port_transfer", (port) => (herokuPort = port));

const peer = new Peer(undefined, {
  host: "https://livehub-io.herokuapp.com/",
  port: herokuPort,
  path: "/peerjs",
});

peer.on("open", (id) => {
  socket.emit("new-connection", id);
  console.log("Peer ID:", id);
});

// HTML Elements
const myStream = document.querySelector("#user");
const othersStream = document.querySelector("#others");
const videoEl = document.querySelector(".stream");

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    // HTML to show own webcam stream

    (myStream.srcObject = stream),
      myStream.addEventListener("loadedmetadata", () => {
        myStream.play();
      });

    // on receiving peer.call:line 42
    peer.on("call", (call) => {
      console.log("received call");
      call.answer(stream);
    });

    // on new user entering domain
    socket.on("user-add", (usersObj) => {
      othersStream.innerHTML = "";
      Object.keys(usersObj).forEach((newPeerId) => {
        console.log("PEERCHECK:", newPeerId, peer.id);
        console.log("PEERCHECKBOOL:", newPeerId === peer.id);
        if (newPeerId !== peer.id) {
          console.log("user added");
          setTimeout(() => {
            let call = peer.call(newPeerId, stream);
            console.log("calling...");

            call.on("stream", (remoteStream) => {
              // Received stream

              console.log("received stream");
              let newVideo = document.createElement("video");
              newVideo.style.width = "640px";
              newVideo.srcObject = remoteStream;
              newVideo.addEventListener("loadedmetadata", () => {
                newVideo.play();
              });
              othersStream.appendChild(newVideo);
            });
          }, 1000);
        }
      });
    });
  })
  .catch((err) => console.log("Webcam connection error"));
