import {useAddLeftClickListener, useChangeSelectedEntityImage} from "@/hooks/public/event-listen.ts";
import {useEffect, useRef, useState} from "react";
import DetailPanelLayout from "@/components/public/DetailPanelLayout.tsx";
import {useVisible} from "@/hooks/public/utils.ts";
import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import {useSceneStore} from "@/store/useSceneStore.ts";
// import {useQueryAllParkingSpace} from "@/hooks/business/api.ts";
import FoodSupervision from "@/components/bright-kitchen/FoodSupervision.tsx";
import Monitor from "@/components/bright-kitchen/Monitor.tsx";
// import BlackList from "@/components/bright-kitchen/BlackList.tsx";
import {cn} from "@/lib/utils.ts";
import ToolBarWithPosition from "@/components/public/ToolBarWithPosition.tsx";
import {usePageOffLine, useWSZPageInfo} from "@/hooks/bright-kitchen/api.ts";
import dayjs from "dayjs";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useWsd} from "@/hooks/bright-kitchen/wsd.ts";
import BugInfo from "@/components/bright-kitchen/BugInfo.tsx";
import NewCommonDateRangePicker from "@/components/public/NewCommonDateRangePicker.tsx";
import CommonMultiLineChart from "@/components/public/CommonMultiLineChart.tsx";
import {useVideoJS} from "react-hook-videojs";
import {useBKEntities} from "@/hooks/bright-kitchen/entities.ts";
import HealthTable from "@/components/bright-kitchen/HealthTable.tsx";
// import HealthTable from "@/components/bright-kitchen/HealthTable.tsx";

const BrightKitchen = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const healthPanelRef = useRef<HTMLDivElement>(null);
  const {visible, show, hide} = useVisible();
  const {visible: healthInfoVisible, show: showHealthInfoVisible, hide: hideHealthInfoVisible} = useVisible();
  const [videoSrc, setVideoSrc] = useState("");
  const {params: wsdParams, setParams: setWsdParams, data: wsdData, date, setDate} = useWsd();

  const {isFullScreen} = useSceneStore();
  useBKEntities();

  const {
    changeSelectedEntityImage,
    recoverSelectedEntityImage
  } = useChangeSelectedEntityImage("businessSource", "sygl");

  const {data: pageOffLineData} = usePageOffLine(1, 4);
  const {data: wszData} = useWSZPageInfo(1, 4);

  const [offLineTableData, setOffLineTableData] = useState<{
    id: string,
    state: boolean,
    type: string,
    name: string
  }[]>(
    [
      {
        id: "865447061143845",
        state: true,
        type: "智能灭蝇灯",
        name: "灭蝇灯F01_烤鸭店区"
      },
      {
        id: "865447061188253",
        state: true,
        type: "智能灭蝇灯",
        name: "灭蝇灯F02_猪肉区"
      },
      {
        id: "865447061082944",
        state: true,
        type: "智能灭蝇灯",
        name: "灭蝇灯F03_牛羊肉区"
      },
      {
        id: "865447061369655",
        state: true,
        type: "智能灭蝇灯",
        name: "灭蝇灯F04_水产区"
      },
      {
        id: "868366073634574",
        state: true,
        type: "毒鼠盒",
        name: "毒鼠盒M01_入口右侧空调外机"
      },
      {
        id: "868366073635381",
        state: true,
        type: "毒鼠盒",
        name: "毒鼠盒M02_菜场侧边"
      },
      {
        id: "868366073634525",
        state: true,
        type: "毒鼠盒",
        name: "毒鼠盒M03_菜场门口"
      },
      {
        id: "868366073634467",
        state: true,
        type: "毒鼠盒",
        name: "毒鼠盒M04_后门空调外机下方"
      }
    ]);

  useEffect(() => {
    if (!pageOffLineData || pageOffLineData.records.length === 0) return;
    if (!wszData || wszData.records.length === 0) return;
    const newOffLineTableData = JSON.parse(JSON.stringify(offLineTableData));
    pageOffLineData.records.forEach(record => {
      const current = wszData.records.find(item => item.id === record.id);
      if (!current) return;
      newOffLineTableData.find((item: any) => item.id === current.imei).state = dayjs.unix(record.timestamp).isBefore(current.timestamp);
    });
    setOffLineTableData(newOffLineTableData);
  }, [pageOffLineData, wszData]);

  const {Video} = useVideoJS({
    controls: true,
    autoplay: true,
    preload: "auto",
    fluid: true,
    sources: [{src: videoSrc}],
  });

  const handleClickEntity = (description: Record<string, any>) => {
    console.log(description);
    changeSelectedEntityImage(description.id);
    if (description.id === "health") {
      hide();
      showHealthInfoVisible();
      return;
    }
    show();
    setVideoSrc(description.src);
  };
  useAddLeftClickListener(panelRef, handleClickEntity);
  useAddLeftClickListener(healthPanelRef, handleClickEntity, false);

  const onClose = () => {
    hide();
    recoverSelectedEntityImage();
  };

  /*useEffect(() => {
    flyToView(-2857800.500386217, 4670971.063061702, 3259613.688213728,
      3.6966562017560847, -0.23731012326766177, 0.0000013286370093013034);
  }, []);*/

  return (
    <>
      {isFullScreen && <>
        <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
          <DisPlayItemLayout title={"食安监管信息"}>
            <FoodSupervision/>
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"监控设备管控"}>
            <Monitor/>
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"设备在线状态"}>
            <div className={"w-full h-[200px]"}>
              <NewCommonTable
                height={300}
                data={offLineTableData}
                columns={[
                  {
                    key: "设备名称",
                    render: (item) => <>{item.name}</>
                  },
                  {
                    key: "设备编号",
                    render: (item) => <>{item.id}</>
                  },
                  {
                    key: "设备状态",
                    render: (item) => <>{item.state ?
                      <span className={"text-green-500"}>在线</span> :
                      <span className={"text-red-500"}>离线</span>}</>
                  }
                ]}/>
            </div>
          </DisPlayItemLayout>
        </div>

        <div className={"z-10 absolute top-[100px] right-[30px] mt-[24px]"}>
          <DisPlayItemLayout title={"设备运行环境状态"}>
            <div className={"flex space-x-4"}>
              <div className={"flex items-center whitespace-nowrap"}>
                <span>设备名称：</span>
                <Select value={wsdParams.imei} onValueChange={(value) => setWsdParams({
                  ...wsdParams,
                  imei: value
                })}>
                  <SelectTrigger className="w-[180px] h-full bg-transparent">
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {offLineTableData.filter(item => item.name.includes("灭蝇灯")).map(item => <SelectItem
                        key={item.id} value={item.id}>{item.name}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className={"flex items-center whitespace-nowrap"}>
                <span>紫外灯：</span>
                <span>开</span>
              </div>
            </div>
            <div className="mt-4">
              <span>日期范围：</span>
              <NewCommonDateRangePicker date={date} setDate={setDate}/>
            </div>
            <div className={"h-[300px] w-full mt-[32px]"}>
              <CommonMultiLineChart
                rotate={290}
                interval={30}
                tooltip={{trigger: "axis"}}
                xAxisData={wsdData?.records.map(item => dayjs.unix(item.timestamp).format("YYYY-MM-DD HH:mm")) || []}
                seriesData={[
                  {
                    name: "温度",
                    type: "line",
                    data: wsdData?.records.map(item => item.t)
                  },
                  {
                    name: "湿度",
                    type: "line",
                    data: wsdData?.records.map(item => item.rh)
                  }
                ]}/>
            </div>
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"防治密度分析"}>
            <BugInfo/>
          </DisPlayItemLayout>

          {/*<DisPlayItemLayout title={"本月监管黑榜top5"}>
            <BlackList/>
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"违规类型AI智能分析"}>

          </DisPlayItemLayout>*/}
        </div>
      </>}

      {healthInfoVisible &&
        <div ref={healthPanelRef} className={"absolute w-[750px] h-[550px] z-50 left-1/2 top-1/2"} style={{
          transform: "translate(-50%,-50%)"
        }}>
          <DetailPanelLayout title={"商铺人员健康信息"} onClose={() => {
            hideHealthInfoVisible();
            recoverSelectedEntityImage();
          }} contentType={"component"}>
            <div className={"mt-12"}>
              <HealthTable/>
            </div>
          </DetailPanelLayout>
        </div>}

      {visible && <div ref={panelRef} className={"absolute w-[500px] h-[504px] z-50"} style={{
        transform: "translate(-50%,-110%)"
      }}>
        {/*<DetailPanelLayout onClose={onClose} title={"商铺详情"} size={"large"} content={{
          "企业名称：": "上海美妆有限公司",
          "注册资金：": "500万",
          "法人名称：": "张三",
          "行业：": "批发和零售业",
          "注册地址：": "上海市奉贤区望园路99号",
          "企业邮箱：": "zhangsan@zs.com",
          "登记机关：": "奉贤区市场监督管理局",
          "统一信用编码：": "91310230AAAABBBB",
          "企业注册日期：": "2011-12-30",
        }}/>*/}
        <DetailPanelLayout onClose={onClose} title={"视频监控"} size={"large"} contentType={"component"}>
          {/*<RealtimeMonitor videoSrc={videoSrc}/>*/}
          <Video className={"video-js vjs-default-skin mt-[40px]"}/>
        </DetailPanelLayout>
        {/*<RealtimeMonitor/>*/}
      </div>
      }
      <ToolBarWithPosition/>
      <div style={{
        backgroundSize: "100% 100%"
      }} className={cn("bg-side-container bg-no-repeat w-[560px] h-full absolute top-0 left-0 z-5 my-[80px]",
        isFullScreen ? "w-[560px]" : "w-0")}/>
      <div style={{
        backgroundSize: "100% 100%"
      }} className={cn("bg-side-container bg-no-repeat w-[560px] h-full absolute top-0 right-0 z-5 my-[80px]",
        isFullScreen ? "w-[560px]" : "w-0")}/>
    </>
  );
};

export default BrightKitchen;

