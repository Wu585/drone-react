import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { UploadPreview } from "@rpldy/upload-preview";
import UploadButton from "@rpldy/upload-button";
import { useItemFinishListener } from "@rpldy/uploady";
import { useCallback, useState } from "react";

interface Props {
  onSuccess?: (key: string) => void;
  picOrigin?: string;
}

const UploadAvatar = ({ onSuccess, picOrigin }: Props) => {
  const [currentImage, setCurrentImage] = useState<string | null>(picOrigin || null);

  useItemFinishListener(
    useCallback(({ uploadResponse }) => {
      if (uploadResponse?.data?.data) {
        const newImageUrl = uploadResponse.data.data;
        setCurrentImage(newImageUrl);
        onSuccess?.(newImageUrl);
      }
    }, [onSuccess])
  );

  return (
    <UploadButton className="block" onClick={(e) => e.preventDefault()}>
      <div className={cn(
        "w-[80px] h-[80px] border rounded-sm overflow-hidden",
        "flex items-center justify-center bg-gray-50 relative"
      )}>
        {/* Show either the preview or the existing image */}
        {currentImage ? (
          <img
            src={currentImage}
            className="w-full h-full object-cover"
            alt="Avatar preview"
          />
        ) : (
          <div className="text-gray-400">
            <Plus className="w-6 h-6" />
          </div>
        )}

        {/* Upload preview overlay - only active during uploads */}
        <div className="absolute inset-0 pointer-events-none">
          <UploadPreview
            PreviewComponent={({ url }) => url ? (
              <img
                src={url}
                className="w-full h-full object-cover"
                alt="Upload preview"
              />
            ) : null
            }
          />
        </div>
      </div>
    </UploadButton>
  );
};

export default UploadAvatar;
