// src/components/BackgroundVideo.jsx
const videoUrl = `${import.meta.env.VITE_IMAGEKIT_URL}/induction-video.mp4`;

export const BackgroundVideo = ({
  className = "absolute inset-0 w-full h-full object-cover",
}) => {
  return (
    <video
      className={`${className} 
        brightness-75 contrast-90
        dark:brightness-50 dark:contrast-90
      `}
      src={videoUrl}
      autoPlay
      loop
      muted
      playsInline
    />
  );
};
