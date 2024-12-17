import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import {cn} from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({className, value, ...props}, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    style={{
      background: "rgba(15, 32, 70, 0.3)"
    }}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-amber-200 transition-all"
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`,
        background: 'linear-gradient(270deg, #59A5FD 0%, #1A4FB3 100%)'
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export {Progress}
