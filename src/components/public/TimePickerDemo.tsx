// import {Clock} from "lucide-react";
import {TimePickerInput} from "@/components/ui/time-picker-input.tsx";

interface TimePickerDemoProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function TimePickerDemo({date, setDate}: TimePickerDemoProps) {

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="hours"
          date={date}
          setDate={setDate}
        />
      </div>
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="minutes"
          date={date}
          setDate={setDate}
        />
      </div>
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="seconds"
          date={date}
          setDate={setDate}
        />
      </div>
      {/*<div className="flex h-10 items-center">*/}
      {/*  <Clock className="ml-2 h-4 w-4"/>*/}
      {/*</div>*/}
    </div>
  );
}
