import {useRef, useState} from "react";
import {useAddLeftClickListener, useChangeSelectedEntityImage} from "@/hooks/public/event-listen.ts";
import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import {useParkingEntities} from "@/hooks/parking/entities.ts";
import CommonPieChart from "@/components/public/CommonPieChart.tsx";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
// import BicycleLineChart from "@/components/bicycles/BicycleLineChart.tsx";
import {cn} from "@/lib/utils.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {useAllElectricityMeterInfo, useQueryAllParkingSpace} from "@/hooks/business/api.ts";
import {useVisible} from "@/hooks/public/utils.ts";
import Panel from "@/components/parking/Panel.tsx";
import ToolBarWithPosition from "@/components/public/ToolBarWithPosition.tsx";

const Parking = () => {
  const {isFullScreen} = useSceneStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const {visible, show, hide} = useVisible();

  const [current, setCurrent] = useState({
    name: "",
    url: ""
  });

  const {changeSelectedEntityImage, recoverSelectedEntityImage} = useChangeSelectedEntityImage("parkingSource",
    "parking-point");

  const handleClickEntity = (description: Record<string, any>) => {
    console.log(description);
    changeSelectedEntityImage(description.id.toString());
    show();
    setCurrent({
      name: description.name,
      url: description.url
    });
  };

  const {data: electricityMeterInfo} = useAllElectricityMeterInfo();

  const {data: parkingDeviceData} = useQueryAllParkingSpace();
  useParkingEntities();

  useAddLeftClickListener(panelRef, handleClickEntity, false);
  const onClose = () => {
    hide();
    recoverSelectedEntityImage();
  };

  return (
    <>
      {
        isFullScreen &&
        <>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"车位统计"}>
              <div className={"w-full h-[200px]"}>
                <CommonPieChart
                  labelLine={true}
                  labelPosition={"outside"}
                  color={
                    ["#2AB3B8", "#FFA551", "#FFD956"]
                  } data={[
                  {name: "总车位", value: 30},
                  {name: "已用车位", value: 200},
                  {name: "未用车位", value: 80},
                ]}/>
              </div>
            </DisPlayItemLayout>

            <DisPlayItemLayout title={"车辆信息统计"}>
              <NewCommonTable
                data={[
                  {
                    carNo: "沪AEM6717",
                    inTime: "2024.03.02 12:00:01",
                    outTime: "2024.03.02 18:32:01",
                    stayTime: "6h"
                  },
                  {
                    carNo: "沪A1W177",
                    inTime: "2024.05.02 12:00:01",
                    outTime: "2024.05.03 12:12:01",
                    stayTime: "24h"
                  },
                  {
                    carNo: "沪C30GGX",
                    inTime: "2024.05.05 12:00:01",
                    outTime: "2024.05.06 12:25:01",
                    stayTime: "24h"
                  },
                  {
                    carNo: "沪DTY182",
                    inTime: "2024.06.12 08:00:01",
                    outTime: "2024.06.15 12:00:01",
                    stayTime: "76h"
                  },
                ]}
                columns={[
                  {
                    key: "车牌号",
                    render: (item) => <>{item.carNo}</>
                  },
                  {
                    key: "进入时间",
                    render: (item) => <>{item.inTime}</>
                  },
                  {
                    key: "离开时间",
                    render: (item) => <>{item.outTime}</>
                  },
                  {
                    key: "停留时间",
                    render: (item) => <>{item.stayTime}</>
                  }
                ]}
              />
            </DisPlayItemLayout>

            <DisPlayItemLayout title={"地磁设备信息"}>
              <NewCommonTable
                height={250}
                data={parkingDeviceData?.records || []}
                columns={[
                  {
                    key: "设备名称",
                    render: (item) => <>{item.deviceName}</>
                  },
                  {
                    key: "环境温度",
                    render: (item) => <>{item.temperature}</>
                  },
                  {
                    key: "信号量",
                    render: (item) => <>{item.csq}</>
                  },
                  {
                    key: "停车状态",
                    render: (item) => <>{item.parkingspotState ?
                      <span className={"text-red-500"}>占用</span> :
                      <span className={"text-green-500"}>空闲</span>}</>
                  },
                ]}
              />
            </DisPlayItemLayout>
            {/*<DisPlayItemLayout title={"车辆进出比统计"}>
            <div className={"w-full h-[250px]"}>
              <BicycleLineChart comeInData={[20, 10, 30, 50, 10, 30, 20, 10, 20, 10, 30]}
                                comeOutData={[10, 20, 10, 20, 10, 20, 10, 20, 30, 10]}/>
            </div>
          </DisPlayItemLayout>*/}
          </div>

          <div className={"z-10 absolute top-[100px] right-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"用电量监测"}>
              <NewCommonTable
                height={600}
                data={electricityMeterInfo || []}
                columns={[
                  {
                    key: "表号",
                    render: (item) => <>{item.deviceNo}</>
                  },
                  {
                    key: "电表名称",
                    render: (item) => <>{item.deviceName}</>
                  },
                  {
                    key: "断合闸状态",
                    render: (item) => <>{item.valve === 1 ? "合闸" : "拉闸"}</>
                  },
                  {
                    key: "设备状态",
                    render: (item) => <>{item.status === 1 ?
                      <span className={"text-green-500"}>在线</span> :
                      <span className={"text-red-500"}>离线</span>}</>
                  },
                ]}
              />
            </DisPlayItemLayout>
          </div>
        </>
      }
      {visible && <div ref={panelRef} className={"absolute w-[1840px] h-[980px] z-50 left-1/2 top-1/2"} style={{
        transform: "translate(-50%,-50%)"
      }}>
        <Panel title={current.name} iframeUrl={current.url} onClose={onClose}/>
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

export default Parking;

