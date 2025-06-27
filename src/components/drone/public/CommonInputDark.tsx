import {CommonInputProps} from "@/components/drone/public/CommonInput.tsx";
import {forwardRef} from "react";
import {Input} from "@/components/ui/input.tsx";
import {cn} from "@/lib/utils.ts";

interface CommonInputDarkProps extends CommonInputProps {
  // 可以添加自定义props
}

const CommonInputDark = forwardRef<HTMLInputElement, CommonInputDarkProps>(
  ({className, ...props}, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          "bg-[#1E3762]/[.7] border-[1px] border-[#2D5FAC]/[.85] h-8 placeholder:text-[#d0d0d0] text-xs rounded-[2px]",
          className
        )}
        {...props}
      />
    );
  }
);

CommonInputDark.displayName = "CommonInputDark";

export {CommonInputDark};

