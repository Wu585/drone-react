import {X} from "lucide-react";
import {getMediaType} from "@/hooks/drone/order";

const MediaPreview = (url: string, isPreview: boolean = false, onRemove?: (url: string) => void) => {
  const mediaType = getMediaType(url);
  return (
    <div key={url} className="relative group aspect-video">
      {mediaType === "video" ? (
        <video
          muted
          loop
          controls
          className="w-full h-full object-cover rounded-sm"
          src={url}
        />
      ) : (
        <img
          src={url}
          alt="预览图片"
          className="w-full h-full object-cover rounded-sm"
        />
      )}

      {!isPreview && (
        <button
          type="button"
          onClick={() => onRemove?.(url)}
          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full
    text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4"/>
        </button>
      )}
    </div>
  );
};

export default MediaPreview;
