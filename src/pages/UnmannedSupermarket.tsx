import {useRef} from "react";
import {useAddLeftClickListener, useChangeSelectedEntityImage} from "@/hooks/public/event-listen.ts";
import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import {cn} from "@/lib/utils.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {useWrcsEntities} from "@/hooks/unmanned-supermarket/entities.ts";
import Panel from "@/components/unmanned-supermarket/Panel.tsx";
import {useVisible} from "@/hooks/public/utils.ts";
import Monitor from "@/components/unmanned-supermarket/Monitor.tsx";
import ToolBarWithPosition from "@/components/public/ToolBarWithPosition.tsx";
import shucaiPng from "@/assets/images/shucai.png";
import yecaiPng from "@/assets/images/yecai.png";
import qieguaPng from "@/assets/images/qiegua.png";
import genjingPng from "@/assets/images/genjing.png";
import congjiangsuanPng from "@/assets/images/congjiangsuan.png";
import junPng from "@/assets/images/jun.png";
import douPng from "@/assets/images/dou.png";
import {Progress} from "@/components/ui/progress.tsx";

const UnmannedSupermarket = () => {
  const {isFullScreen} = useSceneStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const {visible, show, hide} = useVisible();
  const {changeSelectedEntityImage, recoverSelectedEntityImage} = useChangeSelectedEntityImage("wrcsSource",
    "wrcs-point");
  const handleClickEntity = (description: Record<string, any>) => {
    console.log(description);
    changeSelectedEntityImage(description.id.toString());
    show();
  };

  useWrcsEntities();

  useAddLeftClickListener(panelRef, handleClickEntity, false);

  const onClose = () => {
    hide();
    recoverSelectedEntityImage();
  };
  return (
    <>
      {
        isFullScreen && <>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"监控实时画面"}>
              <div className={"pl-8"}>
                <Monitor/>
              </div>
            </DisPlayItemLayout>

            <DisPlayItemLayout title={"超市设备信息列表"}>
              <NewCommonTable
                data={[
                  {
                    deviceName: "收银台监控摄像头1",
                    type: "摄像头",
                    status: "正常",
                  },
                  {
                    deviceName: "收银台监控摄像头2",
                    type: "摄像头",
                    status: "正常",
                  },
                  {
                    deviceName: "收银台监控摄像头3",
                    type: "摄像头",
                    status: "正常",
                  },
                ]
                }
                columns={[
                  {
                    key: "设备名称",
                    render: (item) => <>{item.deviceName}</>
                  },
                  {
                    key: "类型",
                    render: (item) => <>{item.type}</>
                  },
                  {
                    key: "状态",
                    render: (item) => <>{item.status}</>
                  }
                ]}
              />
            </DisPlayItemLayout>

            <DisPlayItemLayout title={"积分兑换"}>
              <NewCommonTable
                data={[
                  {
                    type: "叶菜类",
                    value: "20",
                    name: "白菜",
                  },
                  {
                    type: "茄瓜类",
                    value: "30",
                    name: "黄瓜",
                  },
                  {
                    type: "根茎类",
                    value: "20",
                    name: "玉米",
                  },
                  {
                    type: "菌类",
                    value: "40",
                    name: "蘑菇",
                  },
                ]
                }
                columns={[
                  {
                    key: "类目",
                    render: (item) => <>{item.type}</>
                  },
                  {
                    key: "菜品",
                    render: (item) => <>{item.name}</>
                  },
                  {
                    key: "积分",
                    render: (item) => <>{item.value}</>
                  }
                ]}
              />
            </DisPlayItemLayout>
          </div>
          <div className={"z-10 absolute top-[100px] right-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"蔬菜销售额统计"}>
              <div className={"h-[100px] bg-rain-time flex justify-center items-center space-x-4"}>
                <img src={shucaiPng} alt=""/>
                <span >今日蔬菜销售额</span>
                <div>
                  <span className={"text-[30px] text-[#FFB24D] font-semibold"}>63210</span>
                  <span>元</span>
                </div>
              </div>
              <div className={"text-[20px] font-semibold my-[24px] pl-4"}>各类目今日销售额统计</div>
              <div className={"grid grid-cols-2 gap-4 pl-4 my-[24px]"}>
                <div className={"flex space-x-4"}>
                  <img src={yecaiPng} alt=""/>
                  <div className={"flex flex-col"}>
                    <div className={"flex justify-center items-center space-x-2"}>
                      <span className={"text-[26px] text-[#33DAFC]"}>20000</span>
                      <span className={"text-[#33DAFC]"}>元</span>
                    </div>
                    <span>叶菜类</span>
                  </div>
                </div>
                <div className={"flex space-x-4"}>
                  <img src={qieguaPng} alt=""/>
                  <div className={"flex flex-col"}>
                    <div className={"flex justify-center items-center space-x-2"}>
                      <span className={"text-[26px] text-[#33DAFC]"}>20000</span>
                      <span className={"text-[#33DAFC]"}>元</span>
                    </div>
                    <span>茄瓜类</span>
                  </div>
                </div>
                <div className={"flex space-x-4"}>
                  <img src={genjingPng} alt=""/>
                  <div className={"flex flex-col"}>
                    <div className={"flex justify-center items-center space-x-2"}>
                      <span className={"text-[26px] text-[#33DAFC]"}>20000</span>
                      <span className={"text-[#33DAFC]"}>元</span>
                    </div>
                    <span>根茎类</span>
                  </div>
                </div>
                <div className={"flex space-x-4"}>
                  <img src={congjiangsuanPng} alt=""/>
                  <div className={"flex flex-col"}>
                    <div className={"flex justify-center items-center space-x-2"}>
                      <span className={"text-[26px] text-[#33DAFC]"}>20000</span>
                      <span className={"text-[#33DAFC]"}>元</span>
                    </div>
                    <span>葱姜蒜类</span>
                  </div>
                </div>
                <div className={"flex space-x-4"}>
                  <img src={junPng} alt=""/>
                  <div className={"flex flex-col"}>
                    <div className={"flex justify-center items-center space-x-2"}>
                      <span className={"text-[26px] text-[#33DAFC]"}>20000</span>
                      <span className={"text-[#33DAFC]"}>元</span>
                    </div>
                    <span>菌类</span>
                  </div>
                </div>
                <div className={"flex space-x-4"}>
                  <img src={douPng} alt=""/>
                  <div className={"flex flex-col"}>
                    <div className={"flex justify-center items-center space-x-2"}>
                      <span className={"text-[26px] text-[#33DAFC]"}>20000</span>
                      <span className={"text-[#33DAFC]"}>元</span>
                    </div>
                    <span>豆类</span>
                  </div>
                </div>
              </div>
            </DisPlayItemLayout>

            <DisPlayItemLayout title={"今日蔬菜销售额排行"}>
              <div className={"space-y-6"}>
                <div className={"text-[18px]"}>
                  <div className={"flex justify-between"}>
                    <div className={"space-x-2"}>
                      <span className={"text-[#FFCE38] font-bold"}>Top1</span>
                      <span>白菜</span>
                    </div>
                    <span>92990元</span>
                  </div>
                  <Progress className={"h-[12px]"} value={100}/>
                </div>
                <div className={"text-[18px]"}>
                  <div className={"flex justify-between"}>
                    <div className={"space-x-2"}>
                      <span className={"text-[#FFCE38] font-bold"}>Top2</span>
                      <span>番茄</span>
                    </div>
                    <span>82990元</span>
                  </div>
                  <Progress className={"h-[12px]"} value={90}/>
                </div>
                <div className={"text-[18px]"}>
                  <div className={"flex justify-between"}>
                    <div className={"space-x-2"}>
                      <span className={"text-[#FFCE38] font-bold"}>Top3</span>
                      <span>黄瓜</span>
                    </div>
                    <span>72990元</span>
                  </div>
                  <Progress className={"h-[12px]"} value={80}/>
                </div>
                <div className={"text-[18px]"}>
                  <div className={"flex justify-between"}>
                    <div className={"space-x-2"}>
                      <span className={"text-[#FFCE38] font-bold"}>Top4</span>
                      <span>辣椒</span>
                    </div>
                    <span>62990元</span>
                  </div>
                  <Progress className={"h-[12px]"} value={70}/>
                </div>
                <div className={"text-[18px]"}>
                  <div className={"flex justify-between"}>
                    <div className={"space-x-2"}>
                      <span className={"text-[#FFCE38] font-bold"}>Top5</span>
                      <span>四季豆</span>
                    </div>
                    <span>52990元</span>
                  </div>
                  <Progress className={"h-[12px]"} value={60}/>
                </div>
                <div className={"text-[18px]"}>
                  <div className={"flex justify-between"}>
                    <div className={"space-x-2"}>
                      <span className={"text-[#FFCE38] font-bold"}>Top6</span>
                      <span>土豆</span>
                    </div>
                    <span>42990元</span>
                  </div>
                  <Progress className={"h-[12px]"} value={50}/>
                </div>
              </div>
            </DisPlayItemLayout>
          </div>
        </>
      }
      {visible && <div ref={panelRef} className={"absolute w-[940px] h-[580px] z-50 left-1/2 top-1/2"} style={{
        transform: "translate(-50%,-50%)"
      }}>
        <Panel onClose={onClose}/>
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

export default UnmannedSupermarket;

