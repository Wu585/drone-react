import {memo} from "react";
import MediaItem from "@/components/drone/work-order/MediaItem.tsx";
import {X} from "lucide-react";

const UploadPreviewItem = memo(({
                                  url,
                                  type,
                                  id,
                                  onClear
                                }: {
  url: string;
  type: string;
  id?: string;
  onClear: (id?: string) => void
}) => {
  return (
    <div className="relative group shrink-0 w-28 h-28">
      <div className="w-28 h-28 border-[#2D5FAC]/[.85] border-[1px] rounded-[2px] content-center">
        <MediaItem url={url} type={type}/>
      </div>
      <button
        type="button"
        onClick={() => onClear(id)}
        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-50"
      >
        <X className="w-4 h-4"/>
      </button>
    </div>
  );
});

export default UploadPreviewItem;
