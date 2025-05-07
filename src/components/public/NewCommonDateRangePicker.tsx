import {FC, useEffect, useState} from "react";
import {DateRange} from "react-day-picker";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {zhCN} from "date-fns/locale";
import {Calendar} from "@/components/ui/calendar.tsx";

interface Props {
  date?: Date[] | undefined;
  setDate: (date: Date[] | undefined) => void;
  className?: string;
}

const NewCommonDateRangePicker: FC<Props> = ({date, setDate, className}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (!date || date.length !== 2) return undefined;
    return {
      from: date[0],
      to: date[1]
    };
  });

  useEffect(() => {
    if (!date || date.length !== 2) {
      if (dateRange !== undefined) {
        setDateRange(undefined);
      }
    } else if (date.length === 2) {
      const newFrom = date[0]?.getTime();
      const newTo = date[1]?.getTime();
      const currentFrom = dateRange?.from?.getTime();
      const currentTo = dateRange?.to?.getTime();

      if (newFrom !== currentFrom || newTo !== currentTo) {
        setDateRange({
          from: date[0],
          to: date[1]
        });
      }
    }
  }, [date?.map(d => d?.getTime()).join(',')]);

  const handleSelect = (range: DateRange | undefined) => {
    console.log("range");
    console.log(range);
    setDateRange(range);
    if (range?.from && range?.to) {
      setDate([range.from, range.to]);
    } else if (!range) {
      setDate(undefined);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild className={className}>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal bg-transparent hover:text-white hover:bg-transparent border-[#43ABFF] border-[1px]",
            !dateRange && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className={cn("mr-2 h-4 w-4 text-white", className)}/>
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
            <span className={"text-white"}>请选择日期范围</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleSelect}
          locale={zhCN}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NewCommonDateRangePicker;

