const APP_ID = "62c1bcd773ea4592bb4f0f5ff8ad6b2e";
const CHANNEL = "main";

var client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {
  client.on("user-published", handleUserJoined);
  client.on("user-left", handleUserLeft);

  let UID = await client.join(APP_ID, CHANNEL, null, null);

  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `
  <div class="video-container" id="user-container-${UID}">
    <div class="video-player" id="user-${UID}"></div>
  </div>`;

  videoStreams.insertAdjacentHTML("beforeend", player);

  localTracks[1].play(`user-${UID}`);

  await client.publish([localTracks[0], localTracks[1]]);
};

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.leave();

  joinBtn.style.display = "block";
  controllers.style.display = "none";
  videoStreams.innerHTML = "";
};

let joinStream = async () => {
  await joinAndDisplayLocalStream();
  joinBtn.style.display = "none";
  controllers.style.display = "flex";
};

let handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.id] = user;
  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }
    player = `
    <div class="video-container" id="user-container-${user.uid}">
      <div class="video-player" id="user-${user.uid}"></div>
    </div>`;

    videoStreams.insertAdjacentHTML("beforeend", player);

    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
};

let toggleMic = async (e) => {
  console.log("working");
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    e.target.innerText = "Mic on";
    e.target.style = "background-color: catedblue";
  } else {
    await localTracks[0].setMuted(true);
    e.target.innerText = "Mic off";
    e.target.style = "background-color: #ee4b2b";
  }
};

let toggleCam = async (e) => {
  console.log("working");
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    e.target.innerText = "Cam on";
    e.target.style = "background-color: catedblue";
  } else {
    await localTracks[1].setMuted(true);
    e.target.innerText = "Cam off";
    e.target.style = "background-color: #ee4b2b";
  }
};

joinBtn.addEventListener("click", joinStream);
leave.addEventListener("click", leaveAndRemoveLocalStream);
muteMic.addEventListener("click", toggleMic);
muteCam.addEventListener("click", toggleCam);
