import {FC} from "react";
import {DateRange} from "react-day-picker";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {CalendarIcon} from "lucide-react";
import {format} from "date-fns";
import {zhCN} from "date-fns/locale";
import {Calendar} from "@/components/ui/calendar.tsx";

interface Props {
  date: DateRange | undefined;
  setDate: (date: Props["date"]) => void;
  className?: string;
}

const NewCommonDateRangePicker: FC<Props> = ({date, setDate, className}) => {
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
            <span className={"text-white"}>请选择日期范围</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
        />
      </PopoverContent>
    </Popover>
  );
};

export default NewCommonDateRangePicker;

