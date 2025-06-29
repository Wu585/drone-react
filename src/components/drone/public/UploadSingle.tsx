import {cn} from "@/lib/utils";
import {Plus} from "lucide-react";
import {PreviewItem, UploadPreview} from "@rpldy/upload-preview";
import UploadButton from "@rpldy/upload-button";
import {useItemFinishListener, useItemProgressListener, useItemStartListener} from "@rpldy/uploady";
import {useCallback, useState} from "react";
import {Progress} from "@/components/ui/progress.tsx";

interface Props {
  onSuccess?: (key: string) => void;
  picOrigin?: string;
}

const UploadSingle = ({onSuccess, picOrigin}: Props) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useItemStartListener(() => {
    setIsUploading(true);
    setProgress(0);
  });

  useItemProgressListener((item) => {
    if (item) {
      setProgress(item.completed);
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

  const onPreviewChanged = (previewItems: PreviewItem[]) => {
    setPreviewUrl(previewItems[0]?.url);
  };

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
          PreviewComponent={({url, type}) => url ? (
            type === "image" && <img
              src={url}
              className={cn(
                "w-full h-full object-fill",
                isUploading && "opacity-50"
              )}
              alt="Upload preview"
            />
          ) : null
          }
        />
      </div>
    </UploadButton>
  );
};

export default UploadSingle;
