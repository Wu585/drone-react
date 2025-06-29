import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

export interface CommonSwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  /**
   * 开关大小
   * @default "md"
   */
  size?: "sm" | "md" | "lg"
  /**
   * 是否显示加载状态
   * @default false
   */
  loading?: boolean
}

const CommonSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  CommonSwitchProps
>(({
     className,
     size = "sm",
     loading = false,
     ...props
   }, ref) => {
  // 尺寸配置 - 与Input的h-8高度协调
  const sizeConfig = {
    sm: {
      root: "h-5 w-10",  // 24px × 40px
      thumb: "h-4 w-4 data-[state=checked]:translate-x-6" // 16px
    },
    md: {
      root: "h-7 w-12",  // 28px × 48px (接近Input的h-8)
      thumb: "h-5 w-5 data-[state=checked]:translate-x-7" // 20px
    },
    lg: {
      root: "h-7 w-14",  // 32px × 56px
      thumb: "h-6 w-6 data-[state=checked]:translate-x-8" // 24px
    }
  }

  return (
    <SwitchPrimitives.Root
      ref={ref}
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-[1px] transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2D5FAC]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // 未选中状态 - 与Input背景一致
        "bg-[#1E3762]/[.7] border-[#2D5FAC]/[.85]",
        // 选中状态 - 使用Input的边框色作为主色
        "data-[state=checked]:bg-[#2D5FAC] data-[state=checked]:border-[#2D5FAC]",
        sizeConfig[size].root,
        loading && "opacity-70 cursor-not-allowed",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-[#d0d0d0] shadow-lg ring-0 transition-transform",
          "data-[state=unchecked]:translate-x-0",
          sizeConfig[size].thumb,
          loading && "animate-pulse"
        )}
      />
    </SwitchPrimitives.Root>
  )
})

CommonSwitch.displayName = "CommonSwitch"

export { CommonSwitch }
