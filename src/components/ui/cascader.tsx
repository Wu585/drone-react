import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface CascaderOption {
  label: string
  value: string | number
  children?: CascaderOption[]
  disabled?: boolean
}

interface CascaderProps {
  options: CascaderOption[]
  value?: (string | number)[]
  onChange?: (value: (string | number)[]) => void
  placeholder?: string
  className?: string
}

export function Cascader({
  options,
  value = [],
  onChange,
  placeholder = "请选择",
  className,
}: CascaderProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedOptions, setSelectedOptions] = React.useState<CascaderOption[]>([])
  const [activeOptions, setActiveOptions] = React.useState<CascaderOption[][]>([options])

  React.useEffect(() => {
    if (value.length > 0) {
      const selected: CascaderOption[] = []
      let currentOptions = options

      value.forEach((v) => {
        const option = currentOptions.find((opt) => opt.value === v)
        if (option) {
          selected.push(option)
          currentOptions = option.children || []
        }
      })

      setSelectedOptions(selected)
      updateActiveOptions(selected)
    }
  }, [value, options])

  const updateActiveOptions = (selected: CascaderOption[]) => {
    const newActiveOptions = [options]
    selected.forEach((option) => {
      if (option.children) {
        newActiveOptions.push(option.children)
      }
    })
    setActiveOptions(newActiveOptions)
  }

  const handleOptionClick = (option: CascaderOption, depth: number) => {
    const newSelected = [...selectedOptions.slice(0, depth), option]
    setSelectedOptions(newSelected)
    
    if (option.children) {
      updateActiveOptions(newSelected)
    } else {
      onChange?.(newSelected.map((opt) => opt.value))
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          {selectedOptions.length > 0
            ? selectedOptions.map((opt) => opt.label).join(" / ")
            : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <div className="flex">
          {activeOptions.map((options, depth) => (
            <div
              key={depth}
              className="w-[160px] border-r last:border-r-0"
            >
              {options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    selectedOptions[depth]?.value === option.value &&
                      "bg-accent text-accent-foreground",
                    option.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (!option.disabled) {
                      handleOptionClick(option, depth)
                    }
                  }}
                >
                  {option.label}
                  {option.children && <ChevronRight className="h-4 w-4" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
} 