import {cn} from "@/lib/utils";
import {Plus} from "lucide-react";
import {PreviewItem, UploadPreview} from "@rpldy/upload-preview";
import UploadButton from "@rpldy/upload-button";
import {useItemFinishListener, useItemProgressListener, useItemStartListener} from "@rpldy/uploady";
import {useCallback, useState, memo} from "react";
import {Progress} from "@/components/ui/progress.tsx";

interface Props {
  onSuccess?: (key: string) => void;
  picOrigin?: string;
}

// Memoized PreviewComponent to prevent unnecessary re-renders
const MemoizedPreview = memo(({url, type, isUploading}: {url: string, type: string, isUploading: boolean}) => {
  return type === "image" ? (
    <img
      src={url}
      className={cn(
        "w-full h-full object-fill",
        isUploading && "opacity-50"
      )}
      alt="Upload preview"
    />
  ) : null;
});

const UploadSingle = ({onSuccess, picOrigin}: Props) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Throttle progress updates to prevent too many re-renders
  const throttledSetProgress = useCallback((value: number) => {
    setProgress(prev => {
      // Only update if the difference is significant enough
      return Math.abs(prev - value) > 1 ? value : prev;
    });
  }, []);

  useItemStartListener(() => {
    setIsUploading(true);
    setProgress(0);
  });

  useItemProgressListener((item) => {
    if (item) {
      throttledSetProgress(item.completed);
    }
  });

  useItemFinishListener(
    useCallback(({uploadResponse}) => {
      setIsUploading(false);
      setProgress(0);
      if (uploadResponse?.data?.data) {
        const newImageUrl = uploadResponse.data.data;
        onSuccess?.(newImageUrl);
      }
    }, [onSuccess])
  );

  const onPreviewChanged = useCallback((previewItems: PreviewItem[]) => {
    setPreviewUrl(previewItems[0]?.url);
  }, []);

  const PreviewComponent = useCallback(({url, type}: {url: string, type: string}) => {
    return url ? (
      <MemoizedPreview url={url} type={type} isUploading={isUploading} />
    ) : null;
  }, [isUploading]);

  return (
    <UploadButton
      className="block"
      onClick={(e) => {
        e.preventDefault();
      }}
    >
      <div className={cn(
        "w-[80px] h-[80px] rounded-sm overflow-hidden border-[1px] border-[#2D5FAC]/[.85]",
        "flex items-center justify-center relative",
        "cursor-pointer hover:opacity-90 transition-opacity",
        isUploading ? "bg-[#1E3762]/[.7]" : "bg-[#1E3762]/[.7]",
        isUploading && previewUrl && "opacity-70"
      )}>
        {!previewUrl && !isUploading && !picOrigin && (
          <div className="text-gray-400">
            <Plus className="w-6 h-6"/>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Progress value={progress} className="w-[60%] h-2"/>
          </div>
        )}

        {picOrigin && !previewUrl && <img
          src={picOrigin}
          className={cn(
            "w-full h-full object-fill",
            isUploading && "opacity-50"
          )}
          alt="Upload preview"
        />}

        <UploadPreview
          onPreviewsChanged={onPreviewChanged}
          PreviewComponent={PreviewComponent}
        />
      </div>
    </UploadButton>
  );
};

export default UploadSingle;
