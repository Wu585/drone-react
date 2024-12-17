import {useState} from "react";
import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import {useSceneStore} from "@/store/useSceneStore.ts";
import Weather from "@/components/flood-prevention/Weather.tsx";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import NewCommonTabs from "@/components/public/NewCommonTabs.tsx";
import Supplies from "@/components/facilities/Supplies.tsx";
import Ecosystem from "@/components/flood-prevention/Ecosystem.tsx";
import RainInfo from "@/components/flood-prevention/RainInfo.tsx";
import Billboard from "@/components/flood-prevention/Billboard.tsx";
import EmergencyPlan from "@/components/flood-prevention/EmergencyPlan.tsx";
import {cn} from "@/lib/utils.ts";
import ToolBarWithPosition from "@/components/public/ToolBarWithPosition.tsx";

const tabList = ["防汛物资", "生态环境", "流速/流量", "广告牌", "应急预案"];

const FloodPrevention = () => {
  const {isFullScreen} = useSceneStore();

  const [rightTab, setRightTab] = useState("0");

  const onChangeRightTab = (value: string) => {
    setRightTab(value);
  };
  return (
    <>
      {isFullScreen && <>
        <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
          <DisPlayItemLayout title={"街道天气数据"}>
            <Weather/>
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"汛期社情民意"}>
            {/*<SuppliesCounts/>*/}
            <NewCommonTable
              data={[
                {
                  eventName: "奉浦**街道积水",
                  region: "奉浦四街道",
                  status: "未处理"
                },
                {
                  eventName: "奉浦**街道积水",
                  region: "奉浦四街道",
                  status: "未处理"
                },
                {
                  eventName: "奉浦**街道积水",
                  region: "奉浦四街道",
                  status: "未处理"
                }
              ]}
              columns={[
                {
                  key: "事件名称",
                  render: (item) => <>{item.eventName}</>
                },
                {
                  key: "区域",
                  render: (item) => <>{item.region}</>
                },
                {
                  key: "处理情况",
                  render: (item) => <>{item.status}</>
                },
              ]}
            />
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"汛期值班信息"} action={<NewCommonTabs tabs={[
            {
              value: "1",
              label: "区级",
            },
            {
              value: "2",
              label: "街镇",
            }
          ]}/>}>
            <NewCommonTable
              data={[
                {
                  name: "季**",
                  position: "带班领导",
                  phone: "1388232****",
                  department: "奉浦街道"
                },
                {
                  name: "季**",
                  position: "带班领导",
                  phone: "1388232****",
                  department: "奉浦街道"
                },
                {
                  name: "季**",
                  position: "带班领导",
                  phone: "1388232****",
                  department: "奉浦街道"
                },
                {
                  name: "季**",
                  position: "带班领导",
                  phone: "1388232****",
                  department: "奉浦街道"
                },
              ]}
              columns={[
                {
                  key: "姓名",
                  render: (item) => <>{item.name}</>
                },
                {
                  key: "职务",
                  render: (item) => <>{item.position}</>
                },
                {
                  key: "值班电话",
                  render: (item) => <>{item.phone}</>
                },
                {
                  key: "所属部门",
                  render: (item) => <>{item.department}</>
                }
              ]}
            />
          </DisPlayItemLayout>
        </div>
        <div className={"z-10 absolute h-full top-[100px] right-[30px] mt-[24px]"}>
          <DisPlayItemLayout action={<NewCommonTabs
            tabs={tabList.map((tab, index) => ({
              value: index.toString(),
              label: tab
            }))}
            onChangeTab={onChangeRightTab}
          />}>
            {+rightTab === 0 && <Supplies/>}
            {+rightTab === 1 && <Ecosystem/>}
            {+rightTab === 2 && <RainInfo/>}
            {+rightTab === 3 && <Billboard/>}
            {+rightTab === 4 && <EmergencyPlan/>}
          </DisPlayItemLayout>
          {/*<FloodPreventionTabPage/>*/}
        </div>
      </>}
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

export default FloodPrevention;

