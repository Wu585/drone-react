// VideoPlayer.tsx
import React, {useEffect, useRef} from "react";
// @ts-ignore
import videojs, {VideoJsPlayer} from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({src}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      playerRef.current = videojs(videoRef.current, {
        restoreEl: true,
        controls: true,
        autoplay: true,
        preload: "auto",
        fluid: true,
        sources: [
          {
            src,
          },
        ],
      });

      return () => {
        playerRef.current?.dispose();
        playerRef.current = null; // Clear the reference
      };
    }
  }, [src]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-default-skin"/>
    </div>
  );
};

export default VideoPlayer;
