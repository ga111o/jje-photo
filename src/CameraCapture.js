import React, { useRef, useState, useEffect } from "react";
import "./CameraCapture.css";
import front_img from "./public/front_img.png";

const CameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [timer, setTimer] = useState(0);

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraStarted(true);
      })
      .catch((err) => console.error("Error accessing the camera: ", err));
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = 406;
    canvas.height = 552;

    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const video = videoRef.current;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    const cropWidth = 406;
    const cropHeight = 552;

    const cropX = (videoWidth - cropWidth) / 2;
    const cropY = (videoHeight - cropHeight) / 2;

    context.save();
    context.scale(-1, 1);
    context.drawImage(
      video,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      -cropWidth,
      0,
      cropWidth,
      cropHeight
    );
    context.restore();

    const photoData = canvas.toDataURL("image/png");
    setPhotos((prevPhotos) => [...prevPhotos, photoData]);
  };

  const startAutoCapture = () => {
    setIsCapturing(true);
    setTimer(4);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          takePhoto();
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      setIsCapturing(false);
    }, 17000);
  };

  const downloadPhotos = () => {
    const combinedCanvas = document.createElement("canvas");
    const combinedContext = combinedCanvas.getContext("2d");

    combinedCanvas.width = 1080;
    combinedCanvas.height = 1920;

    const positions = [
      { x: 110, y: 461 },
      { x: 110, y: 1000 },
      { x: 558, y: 530 },
      { x: 558, y: 1089 },
    ];

    const overlayImage = new Image();
    overlayImage.src = front_img;

    overlayImage.onload = () => {
      photos.forEach((photo, index) => {
        const img = new Image();
        img.src = photo;
        img.onload = () => {
          const { x, y } = positions[index];

          const cutWidth = 406;
          const cutHeight = 552;
          const cutX = (img.width - cutWidth) / 2;
          const cutY = (img.height - cutHeight) / 2;

          combinedContext.drawImage(
            img,
            cutX,
            cutY,
            cutWidth,
            cutHeight,
            x,
            y,
            cutWidth,
            cutHeight
          );

          combinedContext.drawImage(
            overlayImage,
            0,
            0,
            combinedCanvas.width,
            combinedCanvas.height
          );

          if (index === photos.length - 1) {
            const link = document.createElement("a");
            link.href = combinedCanvas.toDataURL("image/png");
            link.download = "combined_photos.png";
            link.click();
          }
        };
      });
    };
    setPhotos([]);
  };

  return (
    <div className="main">
      <video ref={videoRef} className="video" autoPlay></video>
      {!isCameraStarted && <button onClick={startCamera}>카메라 켜기📷</button>}

      {photos.length === 4 ? (
        <button onClick={downloadPhotos}>사진 다운로드</button>
      ) : (
        <>
          <div className="">
            <button
              className="capture-button"
              onClick={isCapturing ? null : startAutoCapture}
            >
              {isCapturing ? `${timer}` : "촬영 시작"}
            </button>
          </div>
          <div className="imgs">
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Captured ${index}`}
                width="100"
              />
            ))}
          </div>
        </>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      <div></div>
    </div>
  );
};

export default CameraCapture;
