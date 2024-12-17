import aqiPng from "@/assets/images/air-quality.png";
import {useEffect, useRef, useState} from "react";
import {useDeviceAverageData, useDeviceRealData} from "@/hooks/flood-prevention/api.ts";
import {useFloodPreventionEntities} from "@/hooks/flood-prevention/entities.ts";
import {useVisible} from "@/hooks/public/utils.ts";
import {useAddLeftClickListener} from "@/hooks/public/event-listen.ts";
import DetailPanelLayout from "@/components/public/DetailPanelLayout.tsx";
import {createPortal} from "react-dom";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {DateRange} from "react-day-picker";
import NewCommonDateRangePicker from "@/components/public/NewCommonDateRangePicker.tsx";
import {format} from "date-fns";
import CommonMultiLineChart from "@/components/public/CommonMultiLineChart.tsx";

const Ecosystem = () => {
  const [content, setContent] = useState<Record<string, string | number>>({});
  const [title, setTitle] = useState("");
  const [airDeviceId, setAirDeviceId] = useState("");
  const {data: airDeviceRealData} = useDeviceRealData(airDeviceId);
  const [date, setDate] = useState<DateRange | undefined>();
  const [date1, setDate1] = useState<DateRange | undefined>();

  const [timeRange, setTimeRange] = useState<{
    start: string,
    end: string
  }>({
    start: "",
    end: ""
  });

  const [timeRange1, setTimeRange1] = useState<{
    start: string,
    end: string
  }>({
    start: "",
    end: ""
  });

  const [params, setParams] = useState<{
    deviceId?: string;
    variable?: string;
    benginTime?: string;
    endTime?: string
  }>({
    deviceId: "",
    variable: "day",
  });

  const [params1, setParams1] = useState<{
    deviceId?: string;
    variable?: string;
    benginTime?: string;
    endTime?: string
  }>({
    deviceId: "",
    variable: "day",
  });

  useEffect(() => {
    if (!date?.from || !date?.to) return;
    if (params.variable === "day") {
      setParams({
        ...params,
        benginTime: format(date?.from, "yyyy-MM-dd"),
        endTime: format(date?.to, "yyyy-MM-dd")
      });
    } else {
      setParams({
        ...params,
        benginTime: format(date?.from, "yyyy-MM-dd") + " " + timeRange.start,
        endTime: format(date?.to, "yyyy-MM-dd") + " " + timeRange.end,
      });
    }
  }, [date]);

  useEffect(() => {
    if (!date1?.from || !date1?.to) return;
    if (params1.variable === "day") {
      setParams1({
        ...params1,
        benginTime: format(date1?.from, "yyyy-MM-dd"),
        endTime: format(date1?.to, "yyyy-MM-dd")
      });
    } else {
      setParams1({
        ...params1,
        benginTime: format(date1?.from, "yyyy-MM-dd") + " " + timeRange1.start,
        endTime: format(date1?.to, "yyyy-MM-dd") + " " + timeRange1.end,
      });
    }
  }, [date1]);

  useEffect(() => {
    console.log("timeRange");
    console.log(timeRange);
    if (!date?.from || !date?.to) return;
    if (!timeRange.start || !timeRange.end) return;
    setParams({
      ...params,
      benginTime: format(date?.from, "yyyy-MM-dd") + " " + timeRange.start,
      endTime: format(date?.to, "yyyy-MM-dd") + " " + timeRange.end,
    });
  }, [timeRange]);

  useEffect(() => {
    if (!date1?.from || !date1?.to) return;
    if (!timeRange1.start || !timeRange1.end) return;
    setParams1({
      ...params1,
      benginTime: format(date1?.from, "yyyy-MM-dd") + " " + timeRange1.start,
      endTime: format(date1?.to, "yyyy-MM-dd") + " " + timeRange1.end,
    });
  }, [timeRange1]);

  const {data: averageData} = useDeviceAverageData(params);
  const {data: averageData1} = useDeviceAverageData(params1);

  useEffect(() => {
    console.log("averageData");
    console.log(averageData);
  }, [airDeviceRealData]);

  useFloodPreventionEntities();

  useEffect(() => {
    if (airDeviceRealData) {
      if (title === "空气监测详情") {
        setContent({
          "PM2.5：": airDeviceRealData[0].PM25 + "μg/m³",
          "PM10：": airDeviceRealData[0].PM10 + "μg/m³",
          "温度：": airDeviceRealData[0].TEMP + "℃",
          "湿度：": airDeviceRealData[0].HUMI + "%RH",
          "风速：": airDeviceRealData[0].WS + "m/s",
          "风向：": airDeviceRealData[0].WD,
          "噪声": airDeviceRealData[0].NOISE + "dB(A)",
          "气压：": airDeviceRealData[0].MPA + "hPa",
          "光照度：": airDeviceRealData[0].LUX + "LUX",
          // "TSP": airDeviceRealData[0].NOISE + "μg/m³",
          "总悬浮颗粒物：": airDeviceRealData[0].NOISE + "μg/m³",
        });
      } else if (title === "水质监测详情") {
        setContent({
          "氨氮：": airDeviceRealData[0].WTANDAN + "mg/L",
          "电导率：": airDeviceRealData[0].WTDDL + "μS/cm",
          "酸碱度：": airDeviceRealData[0].WTPH,
          "溶解氧：": airDeviceRealData[0].WTRDO + "mg/L",
          "水温：": airDeviceRealData[0].WTTEMP + "℃",
        });
      }
    }
  }, [airDeviceRealData]);

  const panelRef = useRef<HTMLDivElement>(null);

  const {visible, show, hide} = useVisible();

  const handleClickEntity = (description: Record<string, any>) => {
    console.log(description);
    const {type} = description;
    show();
    if (type === "gyp") {
      setTitle("广告牌详情");
      setContent({
        "倾斜角度：": "3°",
        "广告牌安装时间：": "500万",
        "广告牌安装点位：": "张三",
        "广告牌维护时间：": "批发和零售业",
        "广告牌长宽高：": "3000*1500*1200 cm",
      });
    } else if (type === "szjc") {
      setTitle("水质监测详情");
      setAirDeviceId(description.device_id);
    } else if (type === "kqjc") {
      setTitle("空气监测详情");
      setAirDeviceId(description.device_id);
    }
  };

  useAddLeftClickListener(panelRef, handleClickEntity);

  return (
    <>
      <div>
        <div className={"text-[20px] font-semibold px-4"}>环境空气质量</div>
        <div className={"flex space-x-4"}>
          <div className={"relative"}>
            <img src={aqiPng} alt=""/>
            <span className={"text-[#38FF59] text-[50px] absolute top-[32px] left-[42px]"}>26</span>
            <span className={"text-[#38FF59] absolute bottom-[20px] left-[64px]"}>优</span>
          </div>
          <div className={"text-[#92E1FF] text-[#20px] flex flex-col items-center justify-center"}>
            <span>AQI</span>
            <span>指数</span>
          </div>
          <div className={"space-y-2"}>
            <div className={"bg-aqi w-[234px] h-[55px] flex flex-col pl-4"}>
              <span className={"text-[#92E1FF]"}>对健康影响情况</span>
              <span>空气质量满意，基本无污染</span>
            </div>
            <div className={"bg-aqi w-[234px] h-[55px] flex flex-col pl-4"}>
              <span className={"text-[#92E1FF]"}>建议采取的措施</span>
              <span>各类人群可正常活动</span>
            </div>
          </div>
        </div>

        <div className={"text-[20px] font-semibold px-4"}>空气设备历史均值数据</div>
        <div className={"grid grid-cols-2 gap-2"}>
          <div className={"grid grid-cols-4 items-center gap-4"}>
            <span className={"whitespace-nowrap text-right"}>设备：</span>
            <Select value={params?.deviceId} onValueChange={(value) => setParams({
              ...params,
              deviceId: value
            })}>
              <SelectTrigger className="bg-transparent col-span-3">
                <SelectValue placeholder={"请选择空气设备"}/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={"61341001"}>61341001</SelectItem>
                  <SelectItem value={"61341002"}>61341002</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className={"grid grid-cols-4 items-center gap-4"}>
            <span className={"whitespace-nowrap text-right"}>数据：</span>
            <Select value={params?.variable} onValueChange={(value) => setParams({
              ...params,
              variable: value
            })}>
              <SelectTrigger className="bg-transparent col-span-3">
                <SelectValue placeholder={"请选择空气设备"}/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={"day"}>按天</SelectItem>
                  <SelectItem value={"hour"}>按小时</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className={"grid grid-cols-8 items-center mt-2"}>
          <span className={"whitespace-nowrap"}>日期：</span>
          <div className={"col-span-7"}>
            <NewCommonDateRangePicker className={"w-[280px]"} date={date} setDate={setDate}/>
          </div>
        </div>
        {
          params.variable === "hour" &&
          <div className={"flex items-center mt-2"}>
            <span className={"whitespace-nowrap text-right"}>时间段：</span>
            <Select value={timeRange.start} onValueChange={value => setTimeRange({
              ...timeRange,
              start: value
            })}>
              <SelectTrigger className="w-[180px] h-full bg-transparent">
                <SelectValue placeholder={"请选择开始时间"}/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(item =>
                    <SelectItem
                      value={item < 10 ? item.toString().padStart(2, "0") : item.toString()}>{item.toString()}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            <span className={"mx-[8px]"}>至</span>
            <Select value={timeRange.end} onValueChange={value => setTimeRange({
              ...timeRange,
              end: value
            })}>
              <SelectTrigger className="w-[180px] h-full bg-transparent">
                <SelectValue placeholder={"请选择结束时间"}/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(item =>
                    <SelectItem
                      value={item < 10 ? item.toString().padStart(2, "0") : item.toString()}>{item.toString()}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        }
        <div className={"h-[200px]"}>
          <CommonMultiLineChart
            tooltip={{trigger: "axis"}}
            xAxisData={averageData?.map(item => item.idx) || []}
            seriesData={[
              {
                name: "温度",
                type: "line",
                data: averageData?.map(item => item.TEMP)
              },
              {
                name: "湿度",
                type: "line",
                data: averageData?.map(item => item.HUMI)
              },
              {
                name: "PM2.5",
                type: "line",
                data: averageData?.map(item => item.PM25)
              },
              {
                name: "PM10",
                type: "line",
                data: averageData?.map(item => item.PM10)
              },
            ]}
          />
        </div>

        <div className={"text-[20px] font-semibold px-4"}>水质设备历史均值数据</div>
        <div className={"grid grid-cols-2 gap-2"}>
          <div className={"grid grid-cols-4 items-center gap-4"}>
            <span className={"whitespace-nowrap text-right"}>设备：</span>
            <Select value={params1?.deviceId} onValueChange={(value) => setParams1({
              ...params1,
              deviceId: value
            })}>
              <SelectTrigger className="bg-transparent col-span-3">
                <SelectValue placeholder={"请选择水质设备"}/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={"61343001"}>61343001</SelectItem>
                  <SelectItem value={"61343002"}>61343002</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className={"grid grid-cols-4 items-center gap-4"}>
            <span className={"whitespace-nowrap text-right"}>数据：</span>
            <Select value={params1?.variable} onValueChange={(value) => setParams1({
              ...params1,
              variable: value
            })}>
              <SelectTrigger className="bg-transparent col-span-3">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={"day"}>按天</SelectItem>
                  <SelectItem value={"hour"}>按小时</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className={"grid grid-cols-8 items-center mt-2"}>
          <span className={"whitespace-nowrap"}>日期：</span>
          <div className={"col-span-7"}>
            <NewCommonDateRangePicker className={"w-[280px]"} date={date1} setDate={setDate1}/>
          </div>
        </div>
        {
          params1.variable === "hour" &&
          <div className={"flex items-center mt-2"}>
            <span className={"whitespace-nowrap text-right"}>时间段：</span>
            <Select value={timeRange1.start} onValueChange={value => setTimeRange1({
              ...timeRange1,
              start: value
            })}>
              <SelectTrigger className="w-[180px] h-full bg-transparent">
                <SelectValue placeholder={"请选择开始时间"}/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(item =>
                    <SelectItem
                      value={item < 10 ? item.toString().padStart(2, "0") : item.toString()}>{item.toString()}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            <span className={"mx-[8px]"}>至</span>
            <Select value={timeRange1.end} onValueChange={value => setTimeRange1({
              ...timeRange1,
              end: value
            })}>
              <SelectTrigger className="w-[180px] h-full bg-transparent">
                <SelectValue placeholder={"请选择结束时间"}/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(item =>
                    <SelectItem
                      value={item < 10 ? item.toString().padStart(2, "0") : item.toString()}>{item.toString()}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        }
        <div className={"h-[200px]"}>
          <CommonMultiLineChart
            tooltip={{trigger: "axis"}}
            xAxisData={averageData1?.map(item => item.idx) || []}
            seriesData={[
              {
                name: "氨氮",
                type: "line",
                data: averageData1?.map(item => item.WTANDAN)
              },
              {
                name: "电导率",
                type: "line",
                data: averageData1?.map(item => item.WTDDL)
              },
              {
                name: "酸碱度",
                type: "line",
                data: averageData1?.map(item => item.WTPH)
              },
              {
                name: "溶解氧",
                type: "line",
                data: averageData1?.map(item => item.WTRDO)
              },
              {
                name: "水温",
                type: "line",
                data: averageData1?.map(item => item.WTTEMP)
              },
            ]}
          />
        </div>
      </div>

      {visible && createPortal(<div
        ref={panelRef}
        className={"absolute w-[500px] h-[450px] z-50 left-1/2 top-1/2 text-white"}
        style={{
          transform: "translate(-50%,-130%)"
        }}>
        <DetailPanelLayout onClose={hide} title={title} content={content}/>
      </div>, document.body)}
    </>
  );
};

export default Ecosystem;

