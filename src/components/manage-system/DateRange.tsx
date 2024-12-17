import {format} from "date-fns";
import {Calendar as CalendarIcon} from "lucide-react";
import {DateRange, SelectRangeEventHandler} from "react-day-picker";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {FC} from "react";
import {zhCN} from "date-fns/locale";

interface Props {
  className?: string;
  onSelect?: SelectRangeEventHandler;
  date?: DateRange;
  setDate?: (date: Props["date"]) => void;
}

const DateRangePicker: FC<Props> = ({
                                      className,
                                      onSelect,
                                      date,
                                      setDate
                                    }) => {

  const _onSelect: SelectRangeEventHandler = (...res) => {
    setDate?.(res[0]);
    onSelect?.(...res);
  };

  return (
    <Popover>
      <PopoverTrigger asChild className={className}>
        <Button
          id="date"
          variant={"outline"}
          className={cn(
            "w-[300px] justify-start text-left font-normal bg-transparent hover:text-white hover:bg-transparent",
            !date && "text-muted-foreground", className
          )}
        >
          <CalendarIcon className={cn("mr-2 h-4 w-4 text-white", className)}/>
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "yyyy-MM-dd", {locale: zhCN})} -{" "}
                {format(date.to, "yyyy-MM-dd", {locale: zhCN})}
              </>
            ) : (
              format(date.from, "yyyy-MM-dd", {locale: zhCN})
            )
          ) : (
            <span className={cn("text-white", className)}>请选择日期范围</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={_onSelect}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
