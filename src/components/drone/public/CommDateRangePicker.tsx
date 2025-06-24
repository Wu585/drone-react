import {useState, useEffect} from "react";
import {DateRange} from "react-day-picker";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {zhCN} from "date-fns/locale";
import {Calendar} from "@/components/ui/calendar";

interface DateRangePickerProps {
  /** 当前选中的日期范围 */
  value?: Date[];
  /** 日期变化回调函数 */
  onChange?: (date: Date[] | undefined) => void;
  /** 自定义类名 */
  className?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 占位文本 */
  placeholder?: string;
}

export const CommonDateRangePicker = ({
                                        value,
                                        onChange,
                                        className,
                                        disabled = false,
                                        placeholder = "请选择日期范围"
                                      }: DateRangePickerProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (!value || value.length !== 2) return undefined;
    return {from: value[0], to: value[1]};
  });

  // 同步外部value变化
  useEffect(() => {
    if (!value || value.length !== 2) {
      setDateRange(undefined);
    } else {
      setDateRange({from: value[0], to: value[1]});
    }
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range);

    if (range?.from && range?.to) {
      onChange?.([range.from, range.to]);
    } else {
      onChange?.(undefined);
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
            "bg-[#182640]/[.7] border-[1px] border-[#2D5FAC]/[.85] rounded h-8 text-xs",
            "hover:bg-[#2D5FAC]/[.3] hover:text-white",
            "text-white focus:ring-1 focus:ring-[#2D5FAC]",
            !dateRange && "text-muted-foreground",
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
            <span className={"text-[#d0d0d0]"}>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        // bg-[#182640]
        className="w-auto p-0 border-[#2D5FAC]"
        align="start"
      >
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
          locale={zhCN}
          // classNames={{
          //   day: "hover:bg-[#2D5FAC] hover:text-white",
          //   day_selected: "bg-[#2D5FAC] text-white",
          //   day_range_start: "bg-[#2D5FAC] text-white",
          //   day_range_end: "bg-[#2D5FAC] text-white",
          //   day_range_middle: "bg-[#2D5FAC]/[.3] text-white",
          //   day_today: "text-[#2D5FAC] font-bold",
          //   head_cell: "text-white",
          //   nav_button: "text-white hover:bg-[#2D5FAC]",
          //   caption_label: "text-white",
          // }}
        />
      </PopoverContent>
    </Popover>
  );
};
