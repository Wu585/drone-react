import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Textarea, TextareaProps } from "@/components/ui/textarea"

export interface CommonTextareaProps extends TextareaProps {
  // You can add custom props here if needed
}

const CommonTextarea = forwardRef<HTMLTextAreaElement, CommonTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        className={cn(
          "bg-[#1E3762]/[.7] border-[1px] border-[#2D5FAC]/[.85]",
          "placeholder:text-[#d0d0d0] text-xs rounded-[2px]",
          "min-h-[80px] focus-visible:ring-[#2D5FAC] focus-visible:ring-offset-0 resize-none",
          className
        )}
        {...props}
      />
    )
  }
)

CommonTextarea.displayName = "CommonTextarea"

export { CommonTextarea }
