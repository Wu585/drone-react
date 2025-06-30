import {memo} from "react";
import {MediaPreview} from "@/components/drone/MediaPreview.tsx";
import {X} from "lucide-react";

const MediaItem = memo(({url, type, onRemove}: {
  url: string;
  type: string;
  onRemove?: () => void
}) => {
  return (
    <div className="relative group aspect-video">
      {type === "video" ? (
        <MediaPreview
          src={url}
          type="video"
          alt="Video Preview"
          modalWidth="70vw"
          modalHeight="70vh"
          triggerElement={
            <video
              controls
              muted
              className="w-full h-full object-cover rounded-sm"
              src={url}
            />
          }
        />
      ) : (
        <MediaPreview
          src={url}
          type="image"
          alt="Image Preview"
          modalWidth="1000px"
          modalHeight="800px"
          triggerElement={
            <img
              src={url}
              className="w-full h-full object-cover rounded-sm border-2"
              alt="Preview"
            />
          }
        />
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          type="button"
          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full
                   text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4"/>
        </button>
      )}
    </div>
  );
});

export default MediaItem;
