import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import {Input, InputProps} from "@/components/ui/input.tsx";

export interface CommonInputProps extends InputProps {
  // 可以添加自定义props
}

const CommonInput = forwardRef<HTMLInputElement, CommonInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          "bg-[#1E3762]/[.7] border-[1px] border-[#2D5FAC]/[.85] h-8 placeholder:text-[#d0d0d0] text-xs rounded-[2px]",
          className
        )}
        {...props}
      />
    )
  }
)

CommonInput.displayName = "CommonInput"

export { CommonInput }
