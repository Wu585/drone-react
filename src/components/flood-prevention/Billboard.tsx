import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import NewCommonDateRangePicker from "@/components/public/NewCommonDateRangePicker.tsx";
import {useRef, useState} from "react";
import {DateRange} from "react-day-picker";
import {useAngleData} from "@/hooks/flood-prevention/api.ts";
import {format} from "date-fns";
import CommonMultiLineChart from "@/components/public/CommonMultiLineChart.tsx";
import {useBillboardEntities} from "@/hooks/flood-prevention/entities.ts";
import {useVisible} from "@/hooks/public/utils.ts";
import {useAddLeftClickListener} from "@/hooks/public/event-listen.ts";
import {createPortal} from "react-dom";
import DetailPanelLayout from "@/components/public/DetailPanelLayout.tsx";
import ggp1Png from "@/assets/images/ggp-1.png";

const Billboard = () => {
  const [params, setParams] = useState<{
    deviceCode: string;
    date: DateRange | undefined;
  }>({
    deviceCode: "",
    date: undefined,
  });

  const {data: angleList} = useAngleData({
    deviceCode: params.deviceCode,
    startDate: params.date?.from ? format(params.date?.from, "yyyy-MM-dd HH:mm:ss") : undefined,
    endDate: params.date?.to ? format(params.date?.to, "yyyy-MM-dd HH:mm:ss") : undefined,
    size: "100"
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const {visible, show, hide} = useVisible();
  useBillboardEntities();
  const [content, setContent] = useState<Record<string, string | number>>({});

  const handleClickEntity = (description: Record<string, any>) => {
    console.log("description");
    console.log(description);
    setContent({
      "门店名称": description.name,
      "地址": description.address,
      "营业时间": description.businessTime,
      "道路": description.road,
      "责任人": description.person,
      "架设时间": description.time,
      "材质": description.metal,
      "备注": description.note,
      "图片": ggp1Png
    });
    show();
  };

  useAddLeftClickListener(panelRef, handleClickEntity);

  return (
    <>
      <div>
        <div className={"text-[20px] font-semibold px-4 py-[12px]"}>广告牌倾角</div>
        <div className={"w-full flex justify-center space-x-2"}>
          <div className={"flex items-center whitespace-nowrap"}>
            <span>设备编号：</span>
            <Select value={params.deviceCode} onValueChange={(value) => setParams({
              ...params,
              deviceCode: value
            })}>
              <SelectTrigger className="w-[120px] h-full bg-transparent">
                <SelectValue placeholder={"请选择设备"}/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={"2024073001"}>久二蛙酸汤牛蛙饭</SelectItem>
                  <SelectItem value={"2024073002"}>海头人本地海鲜</SelectItem>
                  <SelectItem value={"2024073003"}>江正地产(奉浦分行)</SelectItem>
                  <SelectItem value={"2024073004"}>JUNE COFFEE</SelectItem>
                  <SelectItem value={"2024073005"}>满汉全席·蒸羊羔(韩村路店)</SelectItem>
                  <SelectItem value={"2024092501"}>全家便利店(韩村路二店)</SelectItem>
                  <SelectItem value={"2024092502"}>鹿丽食品店</SelectItem>
                  <SelectItem value={"2024092503"}>雨虹到家服务</SelectItem>
                  <SelectItem value={"2024092504"}>粤广烧劲脆烧肉(奉贤店)</SelectItem>
                  <SelectItem value={"2024092505"}>川香阁(韩村路店)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className={"flex whitespace-nowrap items-center flex-1 w-[180px]"}>
            <span>日期范围：</span>
            <NewCommonDateRangePicker date={params.date} setDate={(date) => setParams({
              ...params,
              date: date
            })}/>
          </div>
        </div>
        <div className={"h-[400px] mt-[12px]"}>
          <CommonMultiLineChart
            yAxisUnit={"度"}
            tooltip={{trigger: "axis"}}
            rotate={290}
            xAxisData={angleList?.resultAngleList.reverse().map((item) => item.createTime) || []}
            seriesData={[
              {
                name: "倾角",
                type: "line",
                data: angleList?.resultAngleList.reverse().map(item => Math.abs(item.xangle).toFixed(1)) || []
              }
            ]}
          />
        </div>
        <div className={"text-[20px] font-semibold px-4 py-[12px]"}>广告牌事故预警</div>
        <NewCommonTable
          data={[
            {
              name: "广告牌倾斜",
              person: "莉丝",
              time: "2024-9-10"
            },
            {
              name: "广告牌倾斜",
              person: "莉丝",
              time: "2024-9-13"
            },
            {
              name: "广告牌倾斜",
              person: "莉丝",
              time: "2024-9-22"
            },
            {
              name: "广告牌倾斜",
              person: "莉丝",
              time: "2024-9-28"
            },
          ]}
          columns={[
            {
              key: "预警信息",
              render: (item) => <>{item.name}</>
            },
            {
              key: "预警时间",
              render: (item) => <>{item.time}</>
            },
            {
              key: "负责人",
              render: (item) => <>{item.person}</>
            },
          ]}
        />
      </div>
      {visible && createPortal(<div
        ref={panelRef}
        className={"absolute w-[520px] h-[480px] z-50 left-1/2 top-1/2 text-white"}
        style={{
          transform: "translate(-50%,-130%)"
        }}>
        <DetailPanelLayout onClose={hide} title={"广告牌详情"} content={content}/>
      </div>, document.body)}
    </>
  );
};

export default Billboard;

