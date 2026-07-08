// QR-tracking WebAR-style gift.
// How it works:
// 1) The printed QR opens this page.
// 2) This page uses the rear camera.
// 3) jsQR detects the same QR code in the camera image.
// 4) The 3D dog is placed visually on top of that QR code.

const PROJECT_URL = "https://bruh65251-cloud.github.io/ai-dog-qr-gift/";
const ACCEPT_ONLY_PROJECT_QR = true;

const video = document.getElementById("camera");
const canvas = document.getElementById("scanCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const startPanel = document.getElementById("startPanel");
const startBtn = document.getElementById("startBtn");
const hint = document.getElementById("hint");
const dogAnchor = document.getElementById("dogAnchor");
const message = document.getElementById("message");

let scanning = false;
let lastSeenAt = 0;
let usingRearCamera = true;

function normalizeUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function qrIsAccepted(data) {
  if (!ACCEPT_ONLY_PROJECT_QR) return true;
  return normalizeUrl(data) === normalizeUrl(PROJECT_URL);
}

async function startCamera() {
  startBtn.disabled = true;
  startBtn.textContent = "Opening camera...";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });

    video.srcObject = stream;
    await video.play();

    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings ? track.getSettings() : {};
    usingRearCamera = settings.facingMode !== "user";
    video.style.transform = usingRearCamera ? "none" : "scaleX(-1)";

    startPanel.classList.add("hidden");
    hint.classList.remove("hidden");
    scanning = true;
    requestAnimationFrame(scanFrame);
  } catch (err) {
    startBtn.disabled = false;
    startBtn.textContent = "Try again";
    startPanel.querySelector("p").textContent =
      "Camera permission was blocked. Please allow camera access and open again.";
    console.error(err);
  }
}

function mapVideoPointToScreen(point) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const rect = video.getBoundingClientRect();

  const scale = Math.max(rect.width / vw, rect.height / vh);
  const shownWidth = vw * scale;
  const shownHeight = vh * scale;
  const offsetX = rect.left + (rect.width - shownWidth) / 2;
  const offsetY = rect.top + (rect.height - shownHeight) / 2;

  return {
    x: offsetX + point.x * scale,
    y: offsetY + point.y * scale
  };
}

function placeDogOnQr(location) {
  const points = [
    location.topLeftCorner,
    location.topRightCorner,
    location.bottomRightCorner,
    location.bottomLeftCorner
  ].map(mapVideoPointToScreen);

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const centerX = (minX + maxX) / 2;
  const bottomY = maxY;
  const qrSize = Math.max(maxX - minX, maxY - minY);
  const dogSize = Math.max(170, Math.min(window.innerWidth * 0.72, qrSize * 2.05));

  dogAnchor.style.left = `${centerX}px`;
  dogAnchor.style.top = `${bottomY}px`;
  dogAnchor.style.width = `${dogSize}px`;
  dogAnchor.style.height = `${dogSize}px`;

  dogAnchor.classList.remove("hidden");
  message.classList.remove("hidden");
  lastSeenAt = performance.now();
}

function hideDogIfLost() {
  const lostFor = performance.now() - lastSeenAt;
  if (lostFor > 600) {
    dogAnchor.classList.add("hidden");
    message.classList.add("hidden");
  }
}

function scanFrame() {
  if (!scanning || video.readyState !== video.HAVE_ENOUGH_DATA) {
    requestAnimationFrame(scanFrame);
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert"
  });

  if (code && qrIsAccepted(code.data)) {
    placeDogOnQr(code.location);
    hint.textContent = "Dog memory found";
  } else {
    hideDogIfLost();
    hint.textContent = "Point camera at the same QR code";
  }

  requestAnimationFrame(scanFrame);
}

startBtn.addEventListener("click", startCamera);

// Some mobile browsers allow camera only after user gesture, so the button is kept.
