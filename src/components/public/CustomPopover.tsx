import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { FC, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PopoverProps } from "@radix-ui/react-popover";

interface CustomPopoverProps extends PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  className?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  portal?: boolean;
}

const CustomPopover: FC<CustomPopoverProps> = ({
                                                 trigger,
                                                 content,
                                                 className = "",
                                                 contentClassName = "",
                                                 align = "center",
                                                 sideOffset = 4,
                                                 portal = true,
                                                 ...props
                                               }) => {
  const contentElement = (
    <PopoverContent
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "bg-[#122B4D] bg-opacity-90 shadow-md shadow-[#031529]/72 rounded-[6px] border-none text-white",
        contentClassName
      )}
    >
      {content}
    </PopoverContent>
  );

  return (
    <Popover {...props}>
      <PopoverTrigger asChild className={cn("cursor-pointer", className)}>
        {trigger}
      </PopoverTrigger>
      {portal ? (
        <>{contentElement}</> // Will be portaled automatically by shadcn's PopoverContent
      ) : (
        contentElement
      )}
    </Popover>
  );
};

export default CustomPopover;
