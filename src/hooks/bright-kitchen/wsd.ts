import {useEffect, useState} from "react";
import {useWSZPageInfo} from "@/hooks/bright-kitchen/api.ts";
import {DateRange} from "react-day-picker";
import {format} from "date-fns";

export const useWsd = () => {
  const [params, setParams] = useState<{
    imei: string,
    type: "t" | "rh" | "uv"
    beginTime: string
    endTime: string
  }>({
    imei: "865447061143845",
    type: "t", // t - 温度 / rh - 湿度 / uv - 紫外线
    beginTime: "",
    endTime: ""
  });

  const [date, setDate] = useState<DateRange | undefined>();

  const {data} = useWSZPageInfo(1, 1000, params);

  useEffect(() => {
    if (!date?.from || !date?.to) return;
    setParams({
      ...params,
      beginTime: format(date?.from, "yyyy-MM-dd HH:mm:ss"),
      endTime: format(date?.to, "yyyy-MM-dd HH:mm:ss")
    });
  }, [date]);

  return {
    data: {
      ...data,
      records: data?.records.sort((a, b) => a.timestamp - b.timestamp) || []
    },
    params,
    setParams,
    date,
    setDate
  };
};
