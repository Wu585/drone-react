import * as React from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {cn} from "@/lib/utils";
import {TooltipProps} from "@radix-ui/react-tooltip";
import {ReactNode, forwardRef} from "react";

interface CommonTooltipProps extends TooltipProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  contentProps?: React.ComponentPropsWithoutRef<typeof TooltipContent>;
}

const CommonTooltip = forwardRef<HTMLButtonElement, CommonTooltipProps>(
  (
    {
      trigger,
      children,
      className,
      contentClassName,
      contentProps = {},
      ...props
    },
    ref
  ) => {
    return (
      <TooltipProvider>
        <Tooltip {...props}>
          <TooltipTrigger
            asChild
            ref={ref}
            className={className}
          >
            {trigger}
          </TooltipTrigger>
          <TooltipContent
            {...contentProps}
            className={cn(
              "z-[100] overflow-hidden rounded-md border bg-[#1E3762] border-[#2D5FAC]/[.85] text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95",
              contentClassName
            )}
          >
            {children}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

CommonTooltip.displayName = "CommonTooltip";

export {CommonTooltip, TooltipProvider};
