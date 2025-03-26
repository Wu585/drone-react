import {X} from "lucide-react";
import {PreviewItem, PreviewMethods, UploadPreview} from "@rpldy/upload-preview";
import {useCallback, useEffect, useRef, useState} from "react";
import {getMediaType} from "@/hooks/drone/order";

interface Props {
  mediaList?: string[];  // 已有的媒体文件列表
  isPreview?: boolean;   // 是否是预览模式
  onPreviewChange?: (previews: PreviewItem[]) => void;
  onMediaRemove?: (url: string) => void;  // 删除已有媒体的回调
}

const WorkOrderUploadPreview = ({mediaList = [], isPreview = false, onPreviewChange, onMediaRemove}: Props) => {
  const previewMethodsRef = useRef<PreviewMethods>(null);
  const [existingMedia, setExistingMedia] = useState<string[]>(mediaList);

  useEffect(() => {
    setExistingMedia(mediaList);
  }, [mediaList]);

  const onClear = useCallback((id: string) => {
    if (previewMethodsRef.current?.removePreview) {
      previewMethodsRef.current.removePreview(id);
    }
  }, [previewMethodsRef]);

  const renderMedia = (url: string) => {
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
            onClick={() => onMediaRemove?.(url)}
            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full
                     text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4"/>
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* 显示已有的媒体文件 */}
      {existingMedia.map(renderMedia)}

      {/* 上传预览组件 */}
      {!isPreview && (
        <UploadPreview
          previewMethodsRef={previewMethodsRef}
          rememberPreviousBatches
          PreviewComponent={({url, type: fileType, name, id}) => {
            return (
              <div key={name} className="relative group aspect-video">
                {fileType === "video" ? (
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
                    alt={name}
                    className="w-full h-full object-cover rounded-sm"
                  />
                )}

                <button
                  type="button"
                  onClick={() => onClear(id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full
                         text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4"/>
                </button>
              </div>
            );
          }}
          onPreviewsChanged={onPreviewChange}
        />
      )}
    </>
  );
};

export default WorkOrderUploadPreview;

