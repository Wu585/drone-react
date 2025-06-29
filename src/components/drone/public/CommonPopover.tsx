import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import {PopoverProps} from "@radix-ui/react-popover";
import {ReactNode, forwardRef} from "react";

interface CommonPopoverProps extends PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

const CommonPopover = forwardRef<HTMLButtonElement, CommonPopoverProps>(
  ({trigger, children, className, contentClassName, ...props}, ref) => {
    return (
      <Popover {...props}>
        <PopoverTrigger
          asChild
          ref={ref}
          className={cn(
            "bg-[#1E3762]/[.7] border-[1px] border-[#2D5FAC]/[.85] h-8 text-xs data-[placeholder]:text-[#d0d0d0] rounded-[2px] px-3",
            className
          )}
        >
          {trigger}
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "bg-[#1E3762] border-[1px] border-[#2D5FAC]/[.85] text-xs text-white rounded-[2px]",
            contentClassName
          )}
        >
          {children}
        </PopoverContent>
      </Popover>
    );
  }
);

CommonPopover.displayName = "CommonPopover";

export {CommonPopover};
