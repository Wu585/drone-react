import {FC, useEffect, useState} from "react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useBugsInfo, useMouseInfo} from "@/hooks/bright-kitchen/api.ts";
import CommonMultiLineChart from "@/components/public/CommonMultiLineChart.tsx";
import dayjs from "dayjs";
import {DateRange} from "react-day-picker";
import {format, subDays} from "date-fns";
import NewCommonDateRangePicker from "@/components/public/NewCommonDateRangePicker.tsx";
import CommonBarChart from "@/components/public/CommonBarChart.tsx";

const useDeviceParams = () => {
  const [type, setType] = useState<"0" | "1">("0");
  const [date, setDate] = useState<DateRange | undefined>();
  const [params, setParams] = useState({
    imei: "865447061143845",
    beginTime: "",
    endTime: ""
  });

  useEffect(() => {
    const imei = type === "0" ? "865447061143845" : "868366073634574";
    setParams({...params, imei});
  }, [type]);

  return {type, setType, params, setParams, date, setDate};
};

interface Props {
  type: "0" | "1";
  setType: (type: Props["type"]) => void;
  params: {
    imei: string;
    beginTime: string
    endTime: string
  };
  setParams: (params: Props["params"]) => void;
}

const DeviceSelect: FC<Props> = ({type, setType, params, setParams}) => (
  <div className="flex space-x-4">
    <div className="flex items-center whitespace-nowrap">
      <span>设备类型：</span>
      <Select value={type} onValueChange={(value: "0" | "1") => setType(value)}>
        <SelectTrigger className="w-[140px] h-full bg-transparent">
          <SelectValue/>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={"0"}>灭蝇灯</SelectItem>
            <SelectItem value={"1"}>捕鼠盒</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
    <div className="flex items-center whitespace-nowrap">
      <span>设备名称：</span>
      <Select value={params.imei} onValueChange={(value: string) => setParams({...params, imei: value})}>
        <SelectTrigger className="w-[180px] h-full bg-transparent">
          <SelectValue/>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {type === "0" ? (
              <>
                <SelectItem value={"865447061143845"}>灭蝇灯F01_烤鸭店区</SelectItem>
                <SelectItem value={"865447061188253"}>灭蝇灯F02_猪肉区</SelectItem>
                <SelectItem value={"865447061082944"}>灭蝇灯F03_牛羊肉区</SelectItem>
                <SelectItem value={"865447061369655"}>灭蝇灯F04_水产区</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value={"868366073634574"}>毒鼠盒M01_入口右侧空调外机</SelectItem>
                <SelectItem value={"868366073635381"}>毒鼠盒M02_菜场侧边</SelectItem>
                <SelectItem value={"868366073634525"}>毒鼠盒M03_菜场门口</SelectItem>
                <SelectItem value={"868366073634467"}>毒鼠盒M04_后门空调外机下方</SelectItem>
              </>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </div>
);

const BugInfo = () => {
  const {type, setType, params, setParams, date, setDate} = useDeviceParams();
  const {data} = useBugsInfo(1, 1000, {
    ...params,
    type
  });

  const {data: yesterdayData} = useBugsInfo(1, 10, {
    type,
    imei: params.imei,
    beginTime: format(subDays(new Date(), 1), "yyyy-MM-dd 00:00:00"),
    endTime: format(subDays(new Date(), 1), "yyyy-MM-dd 23:59:59")
  });

  const {data: todayData} = useBugsInfo(1, 10, {
    type,
    imei: params.imei,
    beginTime: format(new Date, "yyyy-MM-dd 00:00:00"),
    endTime: format(new Date, "yyyy-MM-dd 23:59:59")
  });

  const {data: mouseData} = useMouseInfo(1, 100, {
    type,
    ...params,
  });

  /*let sortedResult: Record<string, number> = {};

  useEffect(() => {
    console.log("mouseData");
    console.log(mouseData);
    if (!mouseData) return;
    // 使用 reduce 方法进行日期统计
    const result = mouseData.records.reduce((acc: any, record) => {
      // 提取日期（精确到日）
      const date = record.createTime.split(" ")[0]; // 获取日期部分

      // 如果该日期在结果对象中不存在，则初始化为0
      if (!acc[date]) {
        acc[date] = 0;
      }

      // 增加该日期的计数
      acc[date]++;

      return acc; // 返回累加器
    }, {});

    // 将结果对象转换为数组并按日期排序
    sortedResult = Object.entries(result)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .reduce((acc, [date, count]) => {
        acc[date] = count;
        return acc;
      }, {});

    console.log("sortedResult");
    console.log(sortedResult);

    console.log('Object.keys(sortedResult)');
    console.log(Object.keys(sortedResult));

    console.log('Object.keys(sortedResult).map((key: string) => sortedResult[key])');
    console.log(Object.keys(sortedResult).map((key: string) => sortedResult[key]));
  }, [mouseData]);*/

  useEffect(() => {
    if (!date?.from || !date?.to) return;
    setParams({
      ...params,
      beginTime: format(date?.from, "yyyy-MM-dd HH:mm:ss"),
      endTime: format(date?.to, "yyyy-MM-dd HH:mm:ss")
    });
  }, [date]);

  const sortedData = data?.records.sort((a, b) => a.timestamp - b.timestamp) || [];

  return (
    <>
      <DeviceSelect type={type} setType={setType} params={params} setParams={setParams}/>
      <div className="mt-2">
        <span>日期范围：</span>
        <NewCommonDateRangePicker date={date} setDate={setDate}/>
      </div>
      {type === "0" && <div className={"space-x-4 mt-2"}>
        <span>今日增长值：{
          todayData?.records[0] && yesterdayData?.records[0] ?
            ((todayData?.records[0].bigInsect || 0) + (todayData?.records[0].smallInsect || 0)) -
            ((yesterdayData?.records[0].bigInsect || 0) + (yesterdayData?.records[0].smallInsect || 0)) : "暂无数据"
        }</span>
        <span>今日增长率：{
          todayData?.records[0] && yesterdayData?.records[0] ?
            (((((todayData?.records[0].bigInsect || 0) + (todayData?.records[0].smallInsect || 0)) -
                ((yesterdayData?.records[0].bigInsect || 0) + (yesterdayData?.records[0].smallInsect || 0))) /
              ((todayData?.records[0].bigInsect || 0) + (todayData?.records[0].smallInsect || 0))) * 100).toFixed(2) + "%" : "暂无数据"
        }</span>
      </div>}
      <div className="h-[260px] mt-[16px]">
        {type === "0" ? <CommonMultiLineChart
            tooltip={{trigger: "axis"}}
            rotate={290}
            xAxisData={sortedData.map(item => dayjs.unix(item.timestamp).format("YYYY-MM-DD HH:mm")) || []}
            seriesData={[
              {
                name: "大飞虫",
                type: "line",
                data: sortedData.map(item => item.bigInsect)
              },
              {
                name: "小飞虫",
                type: "line",
                data: sortedData.map(item => item.smallInsect)
              }
            ]}
          /> :
          <CommonBarChart
            xAxisData={mouseData?.records.map(item => item.createTime).reverse() || []}
            seriesData={mouseData?.records.map(() => 1) || []}
          />
        }
      </div>
    </>
  );
};

export default BugInfo;
