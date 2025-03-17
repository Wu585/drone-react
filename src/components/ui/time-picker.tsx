import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimePickerProps {
  date: Date
  setDate: (date: Date) => void
}

export function TimePickerDemo({ date, setDate }: TimePickerProps) {
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  const secondOptions = Array.from({ length: 60 }, (_, i) => i)

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Select
          defaultValue={date.getHours().toString()}
          onValueChange={(value) => {
            const newDate = new Date(date)
            newDate.setHours(parseInt(value))
            setDate(newDate)
          }}
        >
          <SelectTrigger className="w-[80px]">
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
        <span className="text-xs text-muted-foreground">时</span>
      </div>
      <div className="grid gap-1 text-center">
        <Select
          defaultValue={date.getMinutes().toString()}
          onValueChange={(value) => {
            const newDate = new Date(date)
            newDate.setMinutes(parseInt(value))
            setDate(newDate)
          }}
        >
          <SelectTrigger className="w-[80px]">
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
        <span className="text-xs text-muted-foreground">分</span>
      </div>
      <div className="grid gap-1 text-center">
        <Select
          defaultValue={date.getSeconds().toString()}
          onValueChange={(value) => {
            const newDate = new Date(date)
            newDate.setSeconds(parseInt(value))
            setDate(newDate)
          }}
        >
          <SelectTrigger className="w-[80px]">
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
        <span className="text-xs text-muted-foreground">秒</span>
      </div>
    </div>
  )
}
