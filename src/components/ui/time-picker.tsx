import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  date: Date
  setDate: (date: Date) => void
  disabled?: boolean
}

export function TimePickerDemo({ date, setDate, disabled = false }: TimePickerProps) {
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  const secondOptions = Array.from({ length: 60 }, (_, i) => i)

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Select
          disabled={disabled}
          defaultValue={date.getHours().toString()}
          onValueChange={(value) => {
            if (!disabled) {
              const newDate = new Date(date)
              newDate.setHours(parseInt(value))
              setDate(newDate)
            }
          }}
        >
          <SelectTrigger className={cn(
            "w-[80px]",
            disabled && "opacity-50"
          )}>
            <SelectValue placeholder="H" />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map((hour) => (
              <SelectItem key={hour} value={hour.toString()}>
                {hour.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className={cn(
          "text-xs text-muted-foreground",
          disabled && "opacity-50"
        )}>时</span>
      </div>
      <div className="grid gap-1 text-center">
        <Select
          disabled={disabled}
          defaultValue={date.getMinutes().toString()}
          onValueChange={(value) => {
            if (!disabled) {
              const newDate = new Date(date)
              newDate.setMinutes(parseInt(value))
              setDate(newDate)
            }
          }}
        >
          <SelectTrigger className={cn(
            "w-[80px]",
            disabled && "opacity-50"
          )}>
            <SelectValue placeholder="M" />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((minute) => (
              <SelectItem key={minute} value={minute.toString()}>
                {minute.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className={cn(
          "text-xs text-muted-foreground",
          disabled && "opacity-50"
        )}>分</span>
      </div>
      <div className="grid gap-1 text-center">
        <Select
          disabled={disabled}
          defaultValue={date.getSeconds().toString()}
          onValueChange={(value) => {
            if (!disabled) {
              const newDate = new Date(date)
              newDate.setSeconds(parseInt(value))
              setDate(newDate)
            }
          }}
        >
          <SelectTrigger className={cn(
            "w-[80px]",
            disabled && "opacity-50"
          )}>
            <SelectValue placeholder="S" />
          </SelectTrigger>
          <SelectContent>
            {secondOptions.map((second) => (
              <SelectItem key={second} value={second.toString()}>
                {second.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className={cn(
          "text-xs text-muted-foreground",
          disabled && "opacity-50"
        )}>秒</span>
      </div>
    </div>
  )
}
