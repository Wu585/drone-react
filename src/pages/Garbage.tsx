import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import cyljUrl from "@/assets/images/cylj.png";
import khslj from "@/assets/images/khslj.png";
import yhlj from "@/assets/images/yhlj.png";
import qtlj from "@/assets/images/qtlj.png";
import {useGarbageEntities} from "@/hooks/garbage/entities.ts";
import {useRef} from "react";
import {useVisible} from "@/hooks/public/utils.ts";
import DetailPanelLayout from "@/components/public/DetailPanelLayout.tsx";
import {useAddLeftClickListener} from "@/hooks/public/event-listen.ts";
import BusinessInfoLineChart from "@/components/business/BusinessInfoLineChart.tsx";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {cn} from "@/lib/utils.ts";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import ToolBarWithPosition from "@/components/public/ToolBarWithPosition.tsx";
import CommonFullPie from "@/components/public/CommonFullPie.tsx";

const Garbage = () => {
  const {isFullScreen} = useSceneStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const {visible, show, hide} = useVisible();

  const handleClickEntity = (description: Record<string, any>) => {
    console.log(description);
    show();
  };

  useGarbageEntities();

  useAddLeftClickListener(panelRef, handleClickEntity);

  return (
    <>
      {
        isFullScreen && <>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"垃圾总量详情"}>
              <div className={"flex"}>
                <div className={"flex items-end py-2"}>垃圾总量:</div>
                <div style={{
                  fontFamily: "DINAlternate",
                  textShadow: "0px 2px 6px #80F0F7"
                }} className={"font-bold text-[#80F0F7] text-[34px] flex items-end px-2"}>4221.120吨
                </div>
              </div>
              <div className={"flex justify-center py-[22px]"}>
                <div className={"flex items-center"}>
                  <div className={"w-[12px] h-[12px] bg-[#338CF7]"}></div>
                  <div className={"px-2"}>干垃圾</div>
                </div>
                <div className={"flex items-center"}>
                  <div className={"w-[12px] h-[12px] bg-[#46FFEE]"}></div>
                  <div className={"px-2"}>湿垃圾</div>
                </div>
                <div className={"flex items-center"}>
                  <div className={"w-[12px] h-[12px] bg-[#F19CFF]"}></div>
                  <div className={"px-2"}>有害垃圾</div>
                </div>
                <div className={"flex items-center"}>
                  <div className={"w-[12px] h-[12px] bg-[#FFC646]"}></div>
                  <div className={"px-2"}>其他垃圾</div>
                </div>
              </div>
              <div className={"flex space-x-[18px] items-center justify-center"}>
                <div className={"flex flex-col items-center justify-center"}>
                  <img src={cyljUrl} alt=""/>
                  <div className={"py-2"}>753.580</div>
                </div>
                <div className={"flex flex-col items-center justify-center"}>
                  <img src={khslj} alt=""/>
                  <div className={"py-2"}>362.500</div>
                </div>
                <div className={"flex flex-col items-center justify-center"}>
                  <img src={yhlj} alt=""/>
                  <div className={"py-2"}>853.680</div>
                </div>
                <div className={"flex flex-col items-center justify-center"}>
                  <img src={qtlj} alt=""/>
                  <div className={"py-2"}>843.360</div>
                </div>
              </div>
            </DisPlayItemLayout>

            <DisPlayItemLayout title={"月均垃圾量趋势图"}>
              <div className={"flex items-center justify-center h-[240px] w-full"}>
                <BusinessInfoLineChart/>
              </div>
            </DisPlayItemLayout>

            <DisPlayItemLayout title={"垃圾分类占比"}>
              <div className={"h-[250px]"}>
                <CommonFullPie
                  color={["#0CFFC4", "#4082E4","#F19CFF","#FFC646"]}
                  data={[
                    {name: "干垃圾", value: 753.580},
                    {name: "湿垃圾", value: 362.500},
                    {name: "有害垃圾", value: 853.680},
                    {name: "其他垃圾", value: 843.360},
                  ]}
                />
              </div>
            </DisPlayItemLayout>
          </div>

          <div className={"z-10 absolute top-[100px] right-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"异常事件列表"}>
              <NewCommonTable
                data={[
                  {
                    event: "1",
                    date: "2024-02-13",
                    address: "垃圾站",
                    status: "完成",
                  },
                  {
                    event: "2",
                    date: "2024-02-18",
                    address: "垃圾站",
                    status: "完成",
                  },
                  {
                    event: "3",
                    date: "2024-02-13",
                    address: "垃圾站",
                    status: "完成",
                  },
                  {
                    event: "4",
                    date: "2024-03-12",
                    address: "垃圾站",
                    status: "完成",
                  },
                  {
                    event: "5",
                    date: "2024-03-20",
                    address: "垃圾站",
                    status: "完成",
                  },
                  {
                    event: "6",
                    date: "2024-04-13",
                    address: "垃圾站",
                    status: "完成",
                  },
                  {
                    event: "7",
                    date: "2024-05-18",
                    address: "垃圾站",
                    status: "完成",
                  },
                ]}
                columns={[
                  {
                    key: "序号",
                    render: (item) => <>{item.event}</>
                  },
                  {
                    key: "日期",
                    render: (item) => <>{item.date}</>
                  },
                  {
                    key: "处理厂",
                    render: (item) => <>{item.address}</>
                  },
                  {
                    key: "处理状态",
                    render: (item) => <>{item.status}</>
                  }
                ]}
              />
            </DisPlayItemLayout>
            <DisPlayItemLayout title={"视频监控"}>
              <div className={"grid grid-cols-2 gap-[12px]"}>
                <div className={"h-[170px] flex flex-col"}>
                  <div className={"bg-[#225EB8] text-center py-[4px] px-[84px]"}>垃圾站</div>
                  <div className={"flex-1 bg-black"}></div>
                </div>
                <div className={"h-[170px] flex flex-col"}>
                  <div className={"bg-[#225EB8] text-center py-[4px] px-[84px]"}>垃圾站</div>
                  <div className={"flex-1 bg-black"}></div>
                </div>
                <div className={"h-[170px] flex flex-col"}>
                  <div className={"bg-[#225EB8] text-center py-[4px] px-[84px]"}>垃圾站</div>
                  <div className={"flex-1 bg-black"}></div>
                </div>
                <div className={"h-[170px] flex flex-col"}>
                  <div className={"bg-[#225EB8] text-center py-[4px] px-[84px]"}>垃圾站</div>
                  <div className={"flex-1 bg-black"}></div>
                </div>
              </div>
            </DisPlayItemLayout>
          </div>
        </>
      }

      {visible && <div ref={panelRef} className={"absolute w-[500px] h-[360px]"} style={{
        transform: "translate(-50%,-110%)"
      }}>
        <DetailPanelLayout onClose={hide} title={"垃圾桶详情"} content={{
          "安装点位：": "百合苑小区门口--上海市奉贤区八字桥路158弄",
          "设备信息：": "重量 1.5（kg）",
          "垃圾类型：": "可回收垃圾  /厨余垃圾",
          "垃圾桶容量：": "20L",
          "安装时间：": "2023-12-30",
        }}/>
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

export default Garbage;

