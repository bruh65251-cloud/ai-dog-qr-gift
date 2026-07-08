# AI Dog QR Tracking Gift

This is the version where the printed QR code is also used as the visual target.

Flow:

1. Print `print-card.html` or use `assets/qr.png` on a card.
2. Scan the QR using the phone camera.
3. The website opens.
4. Tap **Start camera** and allow camera access.
5. Point the rear camera at the same QR code.
6. The dog appears on top of the QR in the live camera view.

Important limitation:

A QR code cannot directly create a 3D object inside the default phone camera app. The QR opens the web page. The web page then uses the camera and QR tracking to show the dog on the real-world QR.

Replace `assets/dog.glb` with a realistic animated dog GLB file. Keep the filename exactly:

```text
assets/dog.glb
```

If the dog model has animation, the page will autoplay it. If not, the page still makes it move gently with a small attentive motion.
