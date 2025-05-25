import {cloneElement, ReactElement, useState} from "react";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {AspectRatio} from "@/components/ui/aspect-ratio";

interface MediaPreviewProps {
  src: string;
  alt?: string;
  type: "image" | "video";
  triggerElement?: React.ReactNode;
  triggerClassName?: string;
  modalWidth?: number | string;
  modalHeight?: number | string;
  aspectRatio?: number;
}

export function MediaPreview({
                               src,
                               alt = "Preview",
                               type,
                               triggerElement,
                               triggerClassName,
                               modalWidth = "80%",
                               modalHeight = "80%",
                               aspectRatio = 16 / 9,
                             }: MediaPreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerElement ? (
          cloneElement(triggerElement as ReactElement, {
            className: triggerClassName,
          })
        ) : (
          <Button variant="outline" className={triggerClassName}>
            Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-w-none p-0 bg-transparent border-none"
        style={{
          width: typeof modalWidth === "number" ? `${modalWidth}px` : modalWidth,
          height: typeof modalHeight === "number" ? `${modalHeight}px` : modalHeight,
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          {type === "image" ? (
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <AspectRatio ratio={aspectRatio} className="w-full h-full">
              <video
                src={src}
                controls
                autoPlay
                className="w-full h-full object-fill"
              />
            </AspectRatio>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
