import {DateRangeAmount, useBicycleDistributedInfo, useQueryByDateRange} from "@/hooks/bicycles/api.ts";
import {ComponentProps, useEffect, useMemo, useState} from "react";
import {Progress} from "@/components/ui/progress.tsx";
import bicycleMountBackPng from "@/assets/images/bicycle-mount-back.png";
import DateRangePicker from "@/components/public/DateRangePicker.tsx";
import dayjs from "dayjs";
import {DateRange, SelectRangeEventHandler} from "react-day-picker";
import {areaIdNameMap} from "@/assets/datas/range.ts";
import BicycleBarChart from "@/components/bicycles/BicycleBarChart.tsx";

const groupByDate = (dateRangeAmount: DateRangeAmount[], condition: "day" | "time") => {
  const res = dateRangeAmount.map(item =>
    ({...item, date: condition === "day" ? item.time_interval.split(" ")[0] : item.time_interval.split(" ")[1]}));

  return res.reduce((acc: {
    [k: string]: {
      active_bikes: number
      inactive_bikes: number
    }
  }, cur: DateRangeAmount & {
    date: string
  }) => {
    if (!acc[cur.date]) {
      acc[cur.date] = {
        active_bikes: 0,
        inactive_bikes: 0
      };
    }
    acc[cur.date].active_bikes += cur.active_bikes;
    acc[cur.date].inactive_bikes += cur.inactive_bikes;
    return acc;
  }, {});
};

const BicycleMountProgressChart = () => {
  const {data} = useBicycleDistributedInfo();
  const [flag, setFlag] = useState(true);
  const [areaId, setAreaId] = useState<string>("");
  const [distributedInfo, setDistributedInfo] = useState<Record<string, number>>({});

  const [dateRange, setDateRange] = useState<DateRange>({
    from: dayjs().toDate(),
    to: dayjs().toDate(),
  });

  const queryDateRangeData = useMemo(() => {
    if (areaId) {
      return {
        startTime: dayjs(dateRange.from).format("YYYY-MM-DD 00:00:00"),
        endTime: dayjs(dateRange.to).add(1, "day").format("YYYY-MM-DD 00:00:00"),
        interval: 3,
        areaId: +areaId
      };
    }

  }, [dateRange, areaId]);

  const {data: dateRangeAmount} = useQueryByDateRange(queryDateRangeData);

  const [barChartData, setBarChartData] = useState<ComponentProps<typeof BicycleBarChart>>({
    xAxisData: [],
    activeData: [],
    inActiveData: []
  });

  useEffect(() => {
    if (dateRangeAmount) {
      if (dateRange.from?.toISOString() === dateRange.to?.toISOString()) {
        const result = groupByDate(dateRangeAmount, "time");
        const sortKeys = Object.keys(result).sort((a, b) => {
          if (a === "0:00:00") return -1;
          if (b === "0:00:00") return 1;
          if (a === "3:00:00" || a === "6:00:00" || a === "9:00:00") return -1;
          if (b === "3:00:00" || b === "6:00:00" || b === "9:00:00") return 1;
          return a.localeCompare(b);
        });
        setBarChartData({
          xAxisData: sortKeys,
          activeData: sortKeys.map(key => result[key].active_bikes),
          inActiveData: sortKeys.map(key => result[key].inactive_bikes)
        });
      } else {
        const result = groupByDate(dateRangeAmount, "day");
        const sortKeys = Object.keys(result).sort((a, b) => a.localeCompare(b));
        setBarChartData({
          xAxisData: sortKeys,
          activeData: sortKeys.map(key => result[key].active_bikes),
          inActiveData: sortKeys.map(key => result[key].inactive_bikes)
        });
      }
    }
  }, [dateRangeAmount]);

  useEffect(() => {
    if (data) {
      delete data["奉浦街道其他区域"];
      setDistributedInfo(data);
    }
  }, [data]);

  const onClickProgressItem = (name: string) => {
    const areaId = Object.keys(areaIdNameMap).find(item => areaIdNameMap[item] === name);
    areaId ? setAreaId(areaId) : setAreaId("");
    setFlag(false);
  };

  const onDateSelect: SelectRangeEventHandler = (dataRange) => {
    if (dataRange?.from && dataRange.to) {
      console.log("dataRange");
      console.log(dataRange);
      setDateRange(dataRange);
    }
  };

  return (
    <div className={"h-full w-full"}>
      {flag ? Object.keys(distributedInfo).filter(item =>
        Object.keys(areaIdNameMap).map(key => areaIdNameMap[key]).includes(item) && item !== "奉浦区其他区域").sort(
        (a, b) => distributedInfo[b] - distributedInfo[a])
        .map(item => <div key={item} className={"mb-[8px] cursor-pointer"} onClick={() => onClickProgressItem(item)}>
          <span>{item}： {distributedInfo[item]}辆</span>
          <Progress value={
            (distributedInfo[item] / (distributedInfo[Object.keys(distributedInfo).filter(item => item !== "奉浦区其他区域").sort(
              (a, b) => distributedInfo[b] - distributedInfo[a])[0]])) * 100
          } className=""/>
        </div>) : <>
        <div className={"flex justify-between items-center"}>
          <div className={"w-[84px] h-[32px] cursor-pointer"} onClick={() => setFlag(true)}>
            <img src={bicycleMountBackPng} alt=""/>
          </div>
          <div>
            <DateRangePicker onDateSelect={onDateSelect} from={dateRange.from} to={dateRange.to}/>
          </div>
        </div>
        <div className={"h-[350px]"}>
          {/*<BicycleLineChart/>*/}
          <BicycleBarChart {...barChartData}/>
        </div>
      </>}
    </div>
  );
};

export default BicycleMountProgressChart;

