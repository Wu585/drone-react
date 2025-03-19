import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {TimePickerDemo} from "./time-picker";

interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  disabled?: boolean;
}

export function DateTimePicker({date, setDate, disabled = false}: DateTimePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "rounded-none w-full justify-start text-left font-normal border-[#43ABFF]",
            disabled 
              ? "opacity-50 bg-[#072E62]/[.7] cursor-not-allowed pointer-events-none" 
              : "bg-[#072E62]/[.7] hover:bg-[#072E62] text-white hover:text-white",
            !date && "text-muted-foreground hover:text-muted-foreground"
          )}
        >
          <CalendarIcon className={cn(
            "mr-2 h-4 w-4",
            disabled ? "text-[#43ABFF]/50" : "text-[#43ABFF]"
          )}/>
          {date ? format(date, "yyyy-MM-dd HH:mm:ss") : <span>选择时间</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          disabled={disabled}
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            if (selectedDate && !disabled) {
              const newDate = new Date(selectedDate);
              newDate.setHours(date.getHours());
              newDate.setMinutes(date.getMinutes());
              newDate.setSeconds(date.getSeconds());
              setDate(newDate);
            }
          }}
          initialFocus
        />
        <div className="p-3 border-t border-border">
          <TimePickerDemo
            disabled={disabled}
            setDate={setDate}
            date={date}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
