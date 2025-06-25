import {format} from "date-fns";
import {zhCN} from "date-fns/locale";
import {Calendar as CalendarIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import dayjs from "dayjs";
import {DateRange} from "react-day-picker";
import {useEffect, useState} from "react";

interface CommonDateRangeProps {
  value?: { start?: string; end?: string };
  onChange?: (value: { start?: string; end?: string }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CommonDateRange({
                                  value,
                                  onChange,
                                  placeholder = "选择日期范围",
                                  className,
                                  disabled = false,
                                }: CommonDateRangeProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    // Ensure we only create new Date objects if the strings are valid
    const from = value?.start ? new Date(value.start) : undefined;
    const to = value?.end ? new Date(value.end) : undefined;
    return from || to ? { from, to } : undefined;
  });

  // Sync with external value changes
  useEffect(() => {
    const from = value?.start ? new Date(value.start) : undefined;
    const to = value?.end ? new Date(value.end) : undefined;
    setDateRange(prev => {
      // Only update if the dates are actually different
      const prevFrom = prev?.from?.toISOString();
      const prevTo = prev?.to?.toISOString();
      const newFrom = from?.toISOString();
      const newTo = to?.toISOString();

      return prevFrom !== newFrom || prevTo !== newTo
        ? { from, to }
        : prev;
    });
  }, [value?.start, value?.end]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!range) {
      setDateRange(undefined);
      onChange?.({start: undefined, end: undefined});
      return;
    }

    setDateRange(range);

    if (range.from && range.to) {
      onChange?.({
        start: dayjs(range.from).format("YYYY-MM-DD 00:00:00"),
        end: dayjs(range.to).format("YYYY-MM-DD 23:59:59"),
      });
    } else if (range.from) {
      // Handle case where only start date is selected
      setDateRange({ from: range.from, to: undefined });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            "bg-[#1E3762]/[.7] border-[1px] border-[#2D5FAC]/[.85] rounded h-8 text-xs",
            "hover:bg-[#2D5FAC]/[.3] hover:text-white",
            "text-white",
            !dateRange?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70 text-[#d0d0d0]"/>
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "yyyy-MM-dd", {locale: zhCN})} -{" "}
                {format(dateRange.to, "yyyy-MM-dd", {locale: zhCN})}
              </>
            ) : (
              format(dateRange.from, "yyyy-MM-dd", {locale: zhCN})
            )
          ) : (
            <span className="text-[#d0d0d0]">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from || new Date()}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={zhCN}
        />
      </PopoverContent>
    </Popover>
  );
}
