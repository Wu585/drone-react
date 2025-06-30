import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePickerDemo } from "./time-picker";

interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date) => void;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  calendarClassName?: string;
  timePickerClassName?: string;
  placeholder?: string;
  dateFormat?: string;
  showSeconds?: boolean;
  align?: "start" | "center" | "end";
}

export function DateTimePicker({
                                 date,
                                 setDate,
                                 disabled = false,
                                 className,
                                 buttonClassName,
                                 calendarClassName,
                                 timePickerClassName,
                                 placeholder = "选择时间",
                                 dateFormat = "yyyy-MM-dd HH:mm:ss",
                                 showSeconds = true,
                                 align = "start",
                               }: DateTimePickerProps) {
  const formatTime = () => {
    if (!date) return "";
    return showSeconds
      ? format(date, dateFormat)
      : format(date, dateFormat.replace(/:ss$/, ""));
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              "bg-[#1E3762]/[.7] border-[1px] border-[#2D5FAC]/[.85] rounded-[2px] h-8 text-xs",
              "hover:bg-[#1E3762]/[.7] hover:text-white",
              "text-white",
              !date && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              buttonClassName
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70 text-[#d0d0d0]" />
            {date ? (
              <span>{formatTime()}</span>
            ) : (
              <span className="text-[#d0d0d0]">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-auto p-0", calendarClassName)}
          align={align}
        >
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
            className="border-0"
          />
          <div className={cn("p-3 border-t border-border", timePickerClassName)}>
            <TimePickerDemo
              disabled={disabled}
              setDate={setDate}
              date={date}
              showSeconds={showSeconds}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
