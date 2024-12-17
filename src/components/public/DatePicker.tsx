import {Calendar as CalendarIcon} from "lucide-react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {FC} from "react";
import dayjs from "dayjs";

interface Props {
  date: Date | undefined;
  setDate: (date: Props["date"]) => void;
}

const DatePicker: FC<Props> = ({date, setDate}) => {

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          style={{
            background: "transparent",
          }}
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal text-white hover:text-white",
            !date && "text-white"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4"/>
          {date ? dayjs(date).format("YYYY-MM-DD") : <span>请选择日期</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
