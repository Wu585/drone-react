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
import {HTMLAttributes, useState} from "react";
import dayjs from "dayjs";

const DateRangePicker = (
  {className, from, to, onDateSelect}: HTMLAttributes<HTMLDivElement> & {
    from?: Date
    to?: Date,
    onDateSelect?: SelectRangeEventHandler
  }) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from,
    to,
  });

  const onSelect: SelectRangeEventHandler = (...res) => {
    setDate(res[0]);
    onDateSelect?.(...res);
  };

  const onOpenChange = (visible: boolean) => {
    console.log("visible");
    console.log(visible);
  };

  // const onConfirmDate = () => {
  //
  // };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger>
          <Button
            style={{
              background: "rgba(27, 55, 95, 0.8)",
              boxShadow: "inset -3px -3px 7px 0px #2268A5"
            }}
            id="date"
            className={cn(
              "w-[300px] justify-start text-left font-normal border-none text-white",
              !date && "text-white"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4"/>
            {date?.from ? (
              date.to ? (
                <>
                  {dayjs(date.from).format("YYYY-MM-DD")} -{" "}
                  {dayjs(date.to).format("YYYY-MM-DD")}
                </>
              ) : (
                dayjs(date.from).format("YYYY-MM-DD")
              )
            ) : (
              <span>请选择日期</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 " side="right" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onSelect}
            footer={
              <div className={"text-right"}>
                {/*<Button onClick={onConfirmDate}>*/}
                {/*  确认*/}
                {/*</Button>*/}
              </div>
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
