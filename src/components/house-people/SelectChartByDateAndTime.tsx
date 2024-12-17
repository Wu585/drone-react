import {useEffect, useState} from "react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {cn} from "@/lib/utils.ts";
import {CalendarIcon} from "lucide-react";
import dayjs from "dayjs";
import {Calendar} from "@/components/ui/calendar.tsx";
import {humanMigrations} from "@/assets/datas/human-migration.ts";
import {SeriesOption} from "echarts";
import CommonMultiBarChart from "@/components/public/CommonMultiBarChart.tsx";

const SelectChartByDateAndTime = () => {
  const [params, setParams] = useState<{
    date: Date[] | undefined;
    region: string,
    timeFrom: string
    timeTo: string,
  }>({
    date: [],
    timeFrom: "",
    timeTo: "",
    region: ""
  });

  const [chartData, setChartData] = useState<{
    xAxisData: string[]
    seriesData: SeriesOption[]
  }>({
    xAxisData: [],
    seriesData: []
  });

  useEffect(() => {
    if (!params.timeFrom || !params.timeTo) {
      return;
    }
    const sortDateData = params.date?.sort((a: any, b: any) => a - b).map(date => dayjs(date).format("YYYYMMDD"));
    const data = humanMigrations.filter(item => item.name === params.region);
    const groupData = data.reduce((group: any, item) => {
      const {date, time} = item;
      group[date] = group[date] ?? [];
      if (+params.timeFrom <= time && time <= +params.timeTo) {
        group[date].push(item);
      }
      return group;
    }, {});

    for (let key in groupData) {
      if (!sortDateData?.includes(key.toString())) {
        delete groupData[key];
      }
    }
    if (Object.keys(groupData).length === 0) return;
    setChartData({
      xAxisData: Object.keys(groupData),
      seriesData: [
        {
          name: "有效人流数",
          type: "bar",
          barWidth: 24,
          data: Object.keys(groupData).map(date => groupData[date].reduce((count: number, item: any) => {
            count += item["effective-counts"];
            return count;
          },0))
        },
        {
          name: "无限制人流数",
          type: "bar",
          barWidth: 24,
          data: Object.keys(groupData).map(date => groupData[date].reduce((count: number, item: any) => {
            count += item["uneffective-counts"];
            return count;
          },0))
        }
      ]
    });
  }, [params]);

  return (
    <div className={"space-y-4"}>
      <div className={"flex space-x-4"}>
        <div className={"flex items-center whitespace-nowrap"}>
          <span>区域：</span>
          <Select value={params.region} onValueChange={(value) => setParams({
            ...params,
            region: value
          })}>
            <SelectTrigger className="w-[180px] h-full bg-transparent">
              <SelectValue placeholder={"请选择区域"}/>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"绿地智尊"}>绿地智尊</SelectItem>
                <SelectItem value={"宝龙商圈"}>宝龙商圈</SelectItem>
                <SelectItem value={"悦澜天地商办楼"}>悦澜天地商办楼</SelectItem>
                <SelectItem value={"韩村路"}>韩村路</SelectItem>
                <SelectItem value={"亿阳菜场"}>亿阳菜场</SelectItem>
                <SelectItem value={"锦梓家园"}>锦梓家园</SelectItem>
                <SelectItem value={"航星二村"}>航星二村</SelectItem>
                <SelectItem value={"华龙别墅"}>华龙别墅</SelectItem>
                <SelectItem value={"半岛君望"}>半岛君望</SelectItem>
                <SelectItem value={"百合苑"}>百合苑</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className={"flex items-center w-[200px] whitespace-nowrap"}>
          <span>日期：</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                style={{
                  background: "transparent",
                }}
                variant={"outline"}
                className={cn(
                  "w-[200px] justify-start text-left font-normal text-white hover:text-white",
                  !params.date && "text-white"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4"/>
                {/*{params.date ? dayjs(params.date).format("YYYY-MM-DD") : <span>请选择日期</span>}*/}
                <div
                  className={"overflow-hidden text-ellipsis whitespace-nowrap"}>{params.date && params.date?.length > 0 ?
                  params.date?.map((item) => dayjs(item).format("MM-DD")).join(",") : "请选择日期"}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="multiple"
                selected={params.date}
                onSelect={(date) => setParams({
                  ...params,
                  date
                })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className={"flex items-center whitespace-nowrap"}>
        <span>时间：</span>
        <Select value={params.timeFrom} onValueChange={(value) => setParams({
          ...params,
          timeFrom: value
        })}>
          <SelectTrigger className="w-[180px] h-full bg-transparent">
            <SelectValue placeholder={"请选择开始时间"}/>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(item =>
                <SelectItem value={item.toString()}>{item.toString()}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
        <span className={"mx-[8px]"}>至</span>
        <Select value={params.timeTo} onValueChange={(value) => setParams({
          ...params,
          timeTo: value
        })}>
          <SelectTrigger className="w-[180px] h-full bg-transparent">
            <SelectValue placeholder={"请选择结束时间"}/>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(item =>
                <SelectItem value={item.toString()}>{item.toString()}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className={"h-[300px]"}>
        <CommonMultiBarChart {...chartData}/>
      </div>
    </div>
  );
};

export default SelectChartByDateAndTime;

