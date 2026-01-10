// src/components/BackgroundVideo.jsx

import video from "../assets/induction-video.mp4"
export const BackgroundVideo = () => {
  return (
    <video
      className="fixed top-0 left-0 w-full h-full object-cover -z-10"
      src={video}
      autoPlay
      loop
      muted
      playsInline
    /> 
  );
};
