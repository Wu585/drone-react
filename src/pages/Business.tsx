import {useBusinessEntities} from "@/hooks/business/entities.ts";
import {useAddLeftClickListener, useChangeSelectedEntityImage} from "@/hooks/public/event-listen.ts";
import {useEffect, useRef} from "react";
import DetailPanelLayout from "@/components/public/DetailPanelLayout.tsx";
import {useVisible} from "@/hooks/public/utils.ts";
import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import ParkingCounts from "@/components/business/ParkingCounts.tsx";
import CommonPieChart from "@/components/public/CommonPieChart.tsx";
import BusinessInfoLineChart from "@/components/business/BusinessInfoLineChart.tsx";
import TopBusiness from "@/components/business/TopBusiness.tsx";
import {useSceneStore} from "@/store/useSceneStore.ts";
// import {useQueryAllParkingSpace} from "@/hooks/business/api.ts";
import {cn} from "@/lib/utils.ts";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import TopBusinessPanel from "@/components/business/TopBusinessPanel.tsx";
import ToolBarWithPosition from "@/components/public/ToolBarWithPosition.tsx";
import {useQueryAllParkingSpace} from "@/hooks/business/api.ts";
import {Button} from "@/components/ui/button.tsx";

const Business = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const {visible, show, hide} = useVisible();
  const {visible: topBusinessVisible, show: showTopBusiness, hide: hideTopBusiness} = useVisible();
  const {isFullScreen} = useSceneStore();

  const {data: parkingDeviceData} = useQueryAllParkingSpace();

  useBusinessEntities();
  const {
    changeSelectedEntityImage,
    recoverSelectedEntityImage
  } = useChangeSelectedEntityImage("businessSource", "sygl");

  const handleClickEntity = (description: Record<string, any>) => {
    console.log(description);
    show();
    changeSelectedEntityImage(description.id);
  };
  useAddLeftClickListener(panelRef, handleClickEntity);

  useEffect(() => {
    if (!parkingDeviceData) return;
    console.log("parkingDeviceData");
    console.log(parkingDeviceData);
  }, [parkingDeviceData]);

  /*  const {data} = useQueryAllParkingSpace();
    useEffect(() => {
      if (data) {
        console.log("data");
        console.log(data);
      }
    }, [data]);*/

  const onClose = () => {
    hide();
    recoverSelectedEntityImage();
  };

  return (
    <>
      {isFullScreen && <>
        <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
          <DisPlayItemLayout title={"当前区域车位信息"}>
            <ParkingCounts/>
            <NewCommonTable
              data={[
                {
                  name: "奉浦停车场1",
                  counts: "100",
                  inUse: "85",
                  unUse: "15"
                },
                {
                  name: "奉浦停车场2",
                  counts: "130",
                  inUse: "41",
                  unUse: "89"
                },
              ]}
              columns={[
                {
                  key: "停车场名称",
                  render: (item) => <>{item.name}</>
                },
                {
                  key: "总车位",
                  render: (item) => <>{item.counts}</>
                },
                {
                  key: "已使用车位",
                  render: (item) => <>
                <span className={"text-[#FFA82F]"}>
                  {item.inUse}
                </span>
                  </>
                },
                {
                  key: "未使用车位",
                  render: (item) => <>
                    <span className={"text-[#55FFDD]"}>{item.unUse}</span>
                  </>
                },
              ]}/>
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"地磁设备信息"}>
            <NewCommonTable
              height={200}
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

          <DisPlayItemLayout title={"销售量占比"}>
            <div className={"h-[200px] w-full"}>
              <CommonPieChart
                labelLine={true}
                labelPosition={"outside"}
                color={
                  ["#CCAFDA", "#FFF187", "#3C8BDB", "#67CFC2", "#9B5BBC"]
                } data={[
                {name: "饮食", value: 30},
                {name: "休闲", value: 200},
                {name: "百货", value: 80},
                {name: "装饰", value: 50},
                {name: "娱乐", value: 28},
              ]}/>
            </div>
          </DisPlayItemLayout>
        </div>

        <div className={"z-10 absolute top-[100px] right-[30px] mt-[24px]"}>
          <DisPlayItemLayout
            title={"全部商铺信息"}
            action={<Button
              variant={"link"}
              onClick={() => window.open("http://m.fengpushanghu.danlu.net/p/1135641/#/default-home")}
              className={"text-[16px] text-white"}>更多</Button>}>
            <div className={"h-[290px]"}>
              <NewCommonTable
                data={[
                  {
                    no: "1",
                    busNo: "M1-L1-009/010/063",
                    floorNo: "1F",
                    brand: "华为",
                    busFormat: "数码电子-数码集合"
                  },
                  {
                    no: "2",
                    busNo: "M2-F1-051",
                    floorNo: "1F",
                    brand: "老庙黄金",
                    busFormat: "零件配套-珠宝钟表-黄金"
                  },
                  {
                    no: "3",
                    busNo: "M1-L1-020/059",
                    floorNo: "1F",
                    brand: "荣威",
                    busFormat: "生活配套-生活服务-汽车服务"
                  },
                  {
                    no: "4",
                    busNo: "M2-B1-030/031-1",
                    floorNo: "B1",
                    brand: "HОTMAXX",
                    busFormat: "生活配套/服务-便利店"
                  },
                  {
                    no: "5",
                    busNo: "M1-L4-",
                    floorNo: "4F",
                    brand: "西塔老太太泥炉烤肉",
                    busFormat: "餐饮-异国餐-韩餐"
                  },
                ]}
                columns={[
                  {
                    key: "序号",
                    render: (item) => <>{item.no}</>
                  },
                  {
                    key: "商铺号",
                    render: (item) => <>{item.busNo}</>
                  },
                  {
                    key: "楼层",
                    render: (item) => <>{item.floorNo}</>
                  },
                  {
                    key: "品牌",
                    render: (item) => <>{item.brand}</>
                  },
                  // {
                  //   key: "业态",
                  //   render: (item) => <>{item.busFormat}</>
                  // }
                ]}/>
            </div>
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"奉贤宝龙城市广场销售月报表"}>
            <div className={"h-[200px]"}>
              <BusinessInfoLineChart/>
            </div>
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"奉贤宝龙城市广场24年度TOP5商铺"}>
            <div onClick={showTopBusiness}>
              <TopBusiness/>
            </div>
          </DisPlayItemLayout>
        </div>
      </>}

      {visible && <div ref={panelRef} className={"absolute w-[500px] h-[504px] z-50"} style={{
        transform: "translate(-50%,-110%)"
      }}>
        <DetailPanelLayout onClose={onClose} title={"商铺详情"} size={"large"} content={{
          "企业名称：": "上海美妆有限公司",
          "注册资金：": "500万",
          "法人名称：": "张三",
          "行业：": "批发和零售业",
          "注册地址：": "上海市奉贤区望园路99号",
          "企业邮箱：": "zhangsan@zs.com",
          "登记机关：": "奉贤区市场监督管理局",
          "统一信用编码：": "91310230AAAABBBB",
          "企业注册日期：": "2011-12-30",
        }}/>
      </div>
      }
      {
        topBusinessVisible && <div className={"absolute w-[1400px] h-[730px] z-50 left-1/2 top-1/2"} style={{
          transform: "translate(-50%,-50%)"
        }}>
          <TopBusinessPanel onClose={hideTopBusiness}/>
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

export default Business;

