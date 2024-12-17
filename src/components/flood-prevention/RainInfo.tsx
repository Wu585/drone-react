// import waterLevel from "@/assets/images/water-level.png";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import {
  FlowmetreData,
  useFlowmetreData,
  useFlowmetreDataByInterval,
  useLaLiLeData
} from "@/hooks/flood-prevention/api.ts";
import NewCommonDateRangePicker from "@/components/public/NewCommonDateRangePicker.tsx";
import {useEffect, useState} from "react";
import {DateRange} from "react-day-picker";
import {format} from "date-fns";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import CommonLineChart from "@/components/public/CommonLineChart.tsx";
import {useWorkOrderList} from "@/hooks/manage-system/api.ts";
import AreaLineChart from "@/components/public/AreaLineChart.tsx";
import DatePicker from "@/components/public/DatePicker.tsx";
import dayjs from "dayjs";

/*const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const Content = () => {
  return (
    <div>
      <div className={"bg-rain-time flex justify-center items-center space-x-16 py-4"}>
        <img src={waterLevel} alt=""/>
        <div className={"flex flex-col space-y-2"}>
          <span className={"text-[30px] font-bold text-[#FFB24D]"}>25.2M</span>
          <span>预估水位</span>
        </div>
        <div className={"flex flex-col space-y-2"}>
          <span className={"text-[30px] font-bold text-[#4DFFF9]"}>25.2M</span>
          <span>安全水位</span>
        </div>
      </div>
      <NewCommonTable
        data={[
          {
            time: "09:00",
            value: "25.2M"
          },
        ]}
        columns={[
          {
            key: "09:00",
            render: (item) => <>{item.value}</>
          },
          {
            key: "10:00",
            render: (item) => <>{item.value}</>
          },
          {
            key: "11:00",
            render: (item) => <>{item.value}</>
          },
          {
            key: "12:00",
            render: (item) => <>{item.value}</>
          },
          {
            key: "13:00",
            render: (item) => <>{item.value}</>
          },
          {
            key: "14:00",
            render: (item) => <>{item.value}</>
          },
        ]}/>
    </div>
  );
};*/

const Content2 = ({deviceId}: { deviceId: string }) => {
  const {data} = useFlowmetreData(1, 1, {deviceId});

  useEffect(() => {
    if (!data) return;
    console.log("data");
    console.log(data);
  }, [data]);

  return (
    <div className={"bg-rain-time flex justify-center items-center space-x-16 py-4 whitespace-nowrap"}>
      {/*<div className={"flex flex-col"}>
        <span className={"font-bold text-[26px]"}>{data?.records[0].deviceId}</span>
        <span>设备编号</span>
      </div>*/}
      <div className={"flex flex-col"}>
        <span className={"font-bold text-[20px] whitespace-nowrap"}>{data?.records[0].accumulatedWaterVolume}</span>
        <span>累计过水量</span>
      </div>
      <div className={"flex flex-col"}>
        <span className={"font-bold text-[20px]"}>{data?.records[0].equipmentInWater ? "入水" : "未入水"}</span>
        <span>状态</span>
      </div>
      <div className={"flex flex-col"}>
        <span className={"font-bold text-[20px]"}>{data?.records[0].batteryLevel}</span>
        <span>电池电量</span>
      </div>
      <div className={"flex flex-col"}>
        <span className={"font-bold text-[20px]"}>{data?.records[0].instantaneousVelocity}</span>
        <span>当前流速</span>
      </div>
    </div>
  );
};

const yeweiIds = ["1609852306AD", "124A7DE85B61"];

const RainInfo = () => {
  const {data: workOrderData} = useWorkOrderList(1, 1000);
  const [date, setDate] = useState<DateRange | undefined>();
  const [params, setParams] = useState({
    type: "wellWaterLevel",
    beginTime: "",
    endTime: "",
    deviceId: "313401007"
  });

  const [dateYW, setDateYW] = useState<Date | undefined>();
  const [paramsYW, setParamsYW] = useState({
    "deviceCode": "",
    "startDate": "",
    "endDate": "",
    "current": "1",
    "size": "200"
  });

  useEffect(() => {
    if (!dateYW) return;
    setParamsYW({
      ...paramsYW,
      startDate: dayjs(dateYW).startOf("day").subtract(1, 'day').format("YYYY-MM-DD HH:mm:ss"),
      endDate: dayjs(dateYW).endOf("day").subtract(1, 'day').format("YYYY-MM-DD HH:mm:ss")
    });
  }, [dateYW]);

  useEffect(() => {
    if (yeweiIds.includes(params.deviceId)) {
      setParamsYW({
        ...paramsYW,
        deviceCode: params.deviceId,
      });
    }
  }, [params.deviceId]);

  const {data: yeweiData} = useLaLiLeData(paramsYW);

  const {data: flowmetreData} = useFlowmetreDataByInterval(1, 1000, params);

  useEffect(() => {
    if (!date?.from || !date?.to) return;
    setParams({
      ...params,
      beginTime: format(date?.from, "yyyy-MM-dd HH:mm:ss"),
      endTime: format(date?.to, "yyyy-MM-dd HH:mm:ss")
    });
  }, [date]);

  useEffect(() => {
    if (!flowmetreData) return;
    console.log("flowmetreData");
    console.log(flowmetreData);
  }, [flowmetreData]);

  return (
    <div>
      <div className={"text-[20px] font-semibold px-4 mb-2"}>工单列表</div>
      <NewCommonTable
        height={250}
        data={workOrderData?.records || []}
        columns={[
          {
            key: "联系人",
            render: (item) => <>{item.lxr}</>
          },
          {
            key: "联系电话",
            render: (item) => <>{item.lxrPhone}</>
          },
          {
            key: "故障地点",
            render: (item) => <>{item.problemDiscoveryPosition}</>
          },
          {
            key: "故障内容",
            render: (item) => <>{item.problemContent}</>
          },
        ]}
      />
      <div className={"text-[20px] font-semibold px-4 py-[12px]"}>水位/流速趋势图</div>
      <div className={"grid grid-cols-2 mb-2 gap-2 pr-2"}>
        <div className={"grid grid-cols-4 items-center"}>
          <span className={"text-right"}>设备：</span>
          <Select value={params.deviceId} onValueChange={(value) => setParams({
            ...params,
            deviceId: value
          })}>
            <SelectTrigger className="bg-transparent col-span-3">
              <SelectValue placeholder={"请选择设备"}/>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"313401007"}>陈桥路585号</SelectItem>
                <SelectItem value={"313401004"}>奉贤中专学校东50米汽车站</SelectItem>
                <SelectItem value={"313401002"}>上海奉贤区博华双语学校车站</SelectItem>
                <SelectItem value={"313401003"}>悠口产业园旁凯宝药业对面</SelectItem>
                <SelectItem value={"313401006"}>悠口产业园公交车站</SelectItem>
                <SelectItem value={"1609852306AD"}>航星二村内河</SelectItem>
                <SelectItem value={"124A7DE85B61"}>奉浦四季生态园</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className={"grid grid-cols-4 space-x-4 items-center"}>
          <span className={"whitespace-nowrap"}>统计类型：</span>
          <Select value={params.type} onValueChange={(value) => setParams({
            ...params,
            type: value
          })}>
            <SelectTrigger className="bg-transparent col-span-3">
              <SelectValue/>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"wellWaterLevel"}>水位</SelectItem>
                {
                  !yeweiIds.includes(params.deviceId) && <>
                    <SelectItem value={"instantaneousVelocity"}>瞬时流速</SelectItem>
                    <SelectItem value={"flowRate"}>瞬时流量</SelectItem>
                    <SelectItem value={"accumulatedWaterVolume"}>累积流量</SelectItem>
                  </>
                }
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className={"grid grid-cols-8 items-center space-x-4"}>
        {
          yeweiIds.includes(params.deviceId) ? <>
            <span className={"whitespace-nowrap"}>选择日期：</span>
            <DatePicker date={dateYW} setDate={setDateYW}/>
          </> : <>
            <span className={"whitespace-nowrap"}>日期范围：</span>
            <NewCommonDateRangePicker className={"col-span-7"} date={date} setDate={setDate}/>
          </>
        }
      </div>
      <div className={"w-full h-[250px]"}>
        {
          yeweiIds.includes(params.deviceId) &&
          <CommonLineChart
            rotate={280}
            interval={30}
            xAxisData={yeweiData?.resultLaLiLeList
              .sort((a, b) => {
                const dateA = typeof a.createTime === "string" ? new Date(a.createTime) : new Date(0);
                const dateB = typeof b.createTime === "string" ? new Date(b.createTime) : new Date(0);
                return dateA.getTime() - dateB.getTime();
              })
              .map(item => item.createTime) || []}
            seriesData={yeweiData?.resultLaLiLeList.map(item => item.liquidLevel) || []}
          />
        }
        {
          !yeweiIds.includes(params.deviceId) && params.type === "accumulatedWaterVolume" ?
            <AreaLineChart
              xAxisData={flowmetreData?.records
                .sort((a, b) => {
                  const dateA = typeof a.createTime === "string" ? new Date(a.createTime) : new Date(0);
                  const dateB = typeof b.createTime === "string" ? new Date(b.createTime) : new Date(0);
                  return dateA.getTime() - dateB.getTime();
                })
                .map(item => item.createTime) || []}
              seriesData={flowmetreData?.records
                .sort((a, b) => {
                  const dateA = typeof a.createTime === "string" ? new Date(a.createTime) : new Date(0);
                  const dateB = typeof b.createTime === "string" ? new Date(b.createTime) : new Date(0);
                  return dateA.getTime() - dateB.getTime();
                })
                .map(item => {
                  const value = item[params.type as keyof FlowmetreData] as string;
                  const numberValue = value?.split(" ")[0]; // 获取第一个部分
                  return numberValue ? Number(numberValue) : 0; // 转换为数字，若无效则返回 0
                }) || []}/> :
            <CommonLineChart
              rotate={280}
              interval={30}
              tooltip={{trigger: "axis"}}
              xAxisData={flowmetreData?.records
                .sort((a, b) => {
                  const dateA = typeof a.createTime === "string" ? new Date(a.createTime) : new Date(0);
                  const dateB = typeof b.createTime === "string" ? new Date(b.createTime) : new Date(0);
                  return dateA.getTime() - dateB.getTime();
                })
                .map(item => item.createTime) || []}
              seriesData={flowmetreData?.records
                .sort((a, b) => {
                  const dateA = typeof a.createTime === "string" ? new Date(a.createTime) : new Date(0);
                  const dateB = typeof b.createTime === "string" ? new Date(b.createTime) : new Date(0);
                  return dateA.getTime() - dateB.getTime();
                })
                .map(item => {
                  const value = item[params.type as keyof FlowmetreData] as string;
                  const numberValue = value?.split(" ")[0]; // 获取第一个部分
                  return numberValue ? Number(numberValue) : 0; // 转换为数字，若无效则返回 0
                }) || []}
            />
        }
      </div>
      <div className={"text-[20px] font-semibold px-4 py-[12px]"}>设备状态：</div>
      {yeweiIds.includes(params.deviceId) ? <div className={"bg-rain-time flex justify-center items-center space-x-16 py-4 whitespace-nowrap"}>
        <span>信号量：</span>
        <span className={"font-bold text-[20px] whitespace-nowrap"}>
          {yeweiData && yeweiData.resultLaLiLeList[0] && yeweiData.resultLaLiLeList[0].signalStrength}
        </span>
      </div> : <Content2 deviceId={params.deviceId}/>}
    </div>
  );
};

export default RainInfo;

