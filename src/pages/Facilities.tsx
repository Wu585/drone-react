import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import {useFacilitiesEntities} from "@/hooks/facilities/entities.ts";
import {useRef, useState} from "react";
import {useVisible} from "@/hooks/public/utils.ts";
import {useAddLeftClickListener, useChangeSelectedEntityImage} from "@/hooks/public/event-listen.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import FacilitiesPanel from "@/components/facilities/FacilitiesPanel.tsx";
import {deleteFacility, FacilityInfo, useAllFacilities} from "@/hooks/facilities/api.ts";
import {cn} from "@/lib/utils.ts";
import ToolBarWithPosition from "@/components/public/ToolBarWithPosition.tsx";
import {pickPosition} from "@/components/toolbar/tools";
import FacilityProperty from "@/components/facilities/FacilityProperty.tsx";
import {clearPickPosition} from "@/components/toolbar/tools/pickPosition.ts";
import {CircleDot, PlusIcon} from "lucide-react";
import {drawCircle} from "@/components/toolbar/tools/drawCircle.ts";
import {useToast} from "@/components/ui/use-toast.ts";

const Facilities = () => {
  const {isFullScreen} = useSceneStore();
  const [content, setContent] = useState<Partial<FacilityInfo>>({});
  const [location, setLocation] = useState({
    longitude: "",
    latitude: ""
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const {visible, show, hide} = useVisible();
  const {mutate} = useAllFacilities();
  const {toast} = useToast();

  const {
    visible: facilityPropertyPanelVisible,
    show: showFacilityPropertyPanel,
    hide: hideFacilityPropertyPanel
  } = useVisible();

  const [facilityParams, setFacilityParams] = useState<Partial<FacilityInfo>>({
    facilitiesType: "",
    name: "",
    address: "",
    reservationNums: "",
    status: "add",
    enable: ""
  });

  useFacilitiesEntities();
  const {changeSelectedEntityImage, recoverSelectedEntityImage} = useChangeSelectedEntityImage("facilitiesSource",
    "bmss-point", "zdy-dqzd", "zdy-wsfw", "zdy-jly", "zdy-gy", "zdy-whhdzx", "zdy-lnhds",
    "zdy-hys", "zdy-tsg", "zdy-shyz", "zdy-sqst", "zdy-rjzlzx", "zdy-zzydzj");

  const handleClickEntity = (description: FacilityInfo) => {
    console.log(description);
    if (description.facilitiesType) {
      showFacilityPropertyPanel();
      setFacilityParams({
        ...description,
        enable: description.enable !== "false",
        name: description[description.facilitiesType as keyof FacilityInfo] as string,
        status: "edit"
      });
    } else {
      show();
    }
    setContent(description);
    changeSelectedEntityImage(description.id.toString());
  };

  const {addListener, removeListener} = useAddLeftClickListener(panelRef, handleClickEntity, false);

  const onClose = () => {
    hide();
    recoverSelectedEntityImage();
  };

  const onAddFacility = () => {
    setFacilityParams({
      facilitiesType: "",
      name: "",
      address: "",
      reservationNums: "",
      status: "add"
    });
    pickPosition(({longitude, latitude}) => {
      setLocation({
        longitude: longitude.toString(),
        latitude: latitude.toString()
      });
      showFacilityPropertyPanel();
    }, false);
  };

  const onChangeLocation = () => {
    hideFacilityPropertyPanel();
    pickPosition(({longitude, latitude}) => {
      showFacilityPropertyPanel();
      setLocation({
        longitude: longitude.toString(),
        latitude: latitude.toString()
      });
    }, false);
    setFacilityParams({
      ...facilityParams,
      status: "change"
    });
  };

  const onEdit = ({content}: any) => {
    showFacilityPropertyPanel();
    setFacilityParams({
      ...content,
      name: content[content.facilitiesType],
      status: "edit"
    });
  };

  const onCloseFacilityPropertyPanel = () => {
    hideFacilityPropertyPanel();
    clearPickPosition();
    recoverSelectedEntityImage();
  };

  const onDrawCircle = () => {
    removeListener();
    drawCircle(undefined, () => {
      addListener();
    });
  };

  const onDeletePoint = async () => {
    content.id && await deleteFacility(content.id.toString());
    await mutate();
    toast({description: "删除设施成功"});
    onClose?.();
  };

  return (
    <>
      {isFullScreen && <>
        <div onClick={onAddFacility} className={"z-10 absolute top-[150px] right-[600px] cursor-pointer" +
          " w-[152px] h-[42px] border rounded-full bg-[#3DCAFF] flex items-center justify-center space-x-2"}>
          <PlusIcon/>
          <span className={"text-[18px]"}>添加设施</span>
        </div>
        <div onClick={onDrawCircle} className={"z-10 absolute top-[200px] right-[600px] cursor-pointer" +
          " w-[152px] h-[42px] border rounded-full bg-[#3DCAFF] flex items-center justify-center space-x-2"}>
          <CircleDot/>
          <span className={"text-[18px]"}>设施分析</span>
        </div>
        <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
          <DisPlayItemLayout title={"文化活动中心"}>
            <div className={"space-y-2"}>
              <NewCommonTable
                data={[
                  {
                    id: "WHHDZX-001",
                    type: "A类",
                    address: "奉浦大道",
                  },
                  {
                    id: "WHHDZX-002",
                    type: "A类",
                    address: "美谷大道",
                  },
                ]}
                columns={[
                  {
                    key: "文化活动中心编号",
                    render: (item) => <>{item.id}</>
                  },
                  {
                    key: "类型",
                    render: (item) => <>{item.type}</>
                  },
                  {
                    key: "所属位置",
                    render: (item) => <>{item.address}</>
                  }
                ]}
              />
            </div>
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"生活驿站"}>
            <div className={"space-y-2"}>
              <NewCommonTable
                data={[
                  {
                    id: "SXYZ-001",
                    type: "秦塘生活驿站",
                    address: "吴塘路899弄12幢10号",
                    personCounts: 10
                  },
                  {
                    id: "SXYZ-002",
                    type: "国顺路生活驿站",
                    address: "国顺路555号",
                    personCounts: 10
                  },
                  {
                    id: "SXYZ-003",
                    type: "天鹅湾生活驿站",
                    address: "高州路6号",
                    personCounts: 10
                  },
                ]}
                columns={[
                  {
                    key: "生活驿站编号",
                    render: (item) => <>{item.id}</>
                  },
                  {
                    key: "生活驿站名称",
                    render: (item) => <>{item.type}</>
                  },
                  {
                    key: "生活驿站位置",
                    render: (item) => <>{item.address}</>
                  }
                ]}
              />
            </div>
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"党建服务点"}>
            <div className={"space-y-2"}>
              <NewCommonTable
                height={350}
                data={[
                  {
                    id: "1",
                    name: "上院佳庭北党群徽家",
                    address: "韩村路780弄",
                  },
                  {
                    id: "2",
                    name: "肖塘居民区党群服务站",
                    address: "北虹路肖塘雅苑",
                  },
                  {
                    id: "3",
                    name: "锦梓家园党群徽家",
                    address: "航南公路5188号",
                  },
                  {
                    id: "4",
                    name: "九华新园党群徽家",
                    address: "国顺路396弄",
                  },
                  {
                    id: "5",
                    name: "秦塘社区党群服务中心",
                    address: "吴塘路899弄10号",
                  },
                  {
                    id: "6",
                    name: "汇贤社区党群服务中心",
                    address: "富竹路铭邦华府",
                  },
                  {
                    id: "7",
                    name: "弯弯居委党群服务点",
                    address: "陈桥路陈湾小区",
                  },
                  {
                    id: "8",
                    name: "秋月社区党群服务中心",
                    address: "富竹路39弄14号",
                  },
                  {
                    id: "9",
                    name: "君望社区党群服务中心",
                    address: "梧桐西路半岛君望西南门东侧约60米",
                  },
                  {
                    id: "10",
                    name: "奉浦街道社区党群服务中心",
                    address: "高州路6号",
                  },
                ]}
                columns={[
                  {
                    key: "编号",
                    render: (item) => <>{item.id}</>
                  },
                  {
                    key: "党群服务中心名称",
                    render: (item) => <>{item.name}</>
                  },
                  {
                    key: "所属位置",
                    render: (item) => <>{item.address}</>
                  }
                ]}
              />
            </div>
          </DisPlayItemLayout>
        </div>

        <div className={"z-10 absolute top-[100px] right-[30px] mt-[24px]"}>
          <DisPlayItemLayout title={"全部公园信息"}>
            <div className={"space-y-2"}>
              <NewCommonTable
                height={200}
                data={[
                  {
                    name: "贤园/奉浦四季生态园",
                    address: "韩谊路515号",
                    area: "300000",
                    type: "免费"
                  },
                  {
                    name: "南上海运河公园",
                    address: "运河路沿线",
                    area: "10000",
                    type: "免费"
                  },
                ]}
                columns={[
                  {
                    key: "公园名称",
                    render: (item) => <>{item.name}</>
                  },
                  {
                    key: "公园地点",
                    render: (item) => <>{item.address}</>
                  },
                  {
                    key: "占地面积",
                    render: (item) => <>{item.area}</>
                  },
                  {
                    key: "类型",
                    render: (item) => <>{item.type}</>
                  }
                ]}
              />
            </div>
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"养老服务站"}>
            <div className={"space-y-2 mb-[32px]"}>
              <NewCommonTable
                data={[
                  {
                    name: "九华卫生站",
                    type: "为老服务中心",
                    address: "奉浦街道",
                  },
                  {
                    name: "天鹅湾生活驿站",
                    type: "为老服务中心",
                    address: "奉浦街道",
                  },
                  {
                    name: "秦塘生活驿站",
                    type: "为老服务中心",
                    address: "奉浦街道",
                  },
                ]}
                columns={[
                  {
                    key: "服务站名称",
                    render: (item) => <>{item.name}</>
                  },
                  {
                    key: "类型",
                    render: (item) => <>{item.type}</>
                  },
                  {
                    key: "地址",
                    render: (item) => <>{item.address}</>
                  }
                ]}
              />
            </div>
          </DisPlayItemLayout>

          <DisPlayItemLayout title={"卫生室"}>
            <div className={"space-y-2"}>
              <NewCommonTable
                data={[
                  {
                    id: "WSZX-001",
                    name: "高州路卫生中心",
                    address: "运河北路135号",
                  },
                  {
                    id: "WSZX-002",
                    name: "肖塘卫生中心",
                    address: "吴塘路480号",
                  },
                ]}
                columns={[
                  {
                    key: "编号",
                    render: (item) => <>{item.id}</>
                  },
                  {
                    key: "卫生中心名称",
                    render: (item) => <>{item.name}</>
                  },
                  {
                    key: "所属位置",
                    render: (item) => <>{item.address}</>
                  }
                ]}
              />
            </div>
          </DisPlayItemLayout>
        </div>
      </>}
      {/*<div className={'z-10 absolute bottom-[112px] right-[37px] cur bg-add-facility cursor-pointer ' +
        'bg-no-repeat bg-cover w-[220px] h-[88px]'}>
        <div className={'h-full flex items-center justify-center pl-8'}>
          添加便民设施
        </div>
      </div>*/}
      <ToolBarWithPosition/>
      {visible && <div ref={panelRef} className={"absolute w-[1180px] h-[730px] z-50 left-1/2 top-1/2"} style={{
        transform: "translate(-50%,-50%)"
      }}>
        {/*<DetailPanelLayout onClose={onClose} title={"设施详情"} content={{...content}}/>*/}
        <FacilitiesPanel onEdit={onEdit} content={content} onClose={onClose}/>
      </div>
      }

      {facilityPropertyPanelVisible &&
        <div ref={panelRef} className={"absolute w-[662px] h-[730px] z-50 left-1/2 top-1/2"} style={{
          transform: "translate(-50%,-50%)"
        }}>
          <FacilityProperty
            onDelete={onDeletePoint}
            facilityParams={facilityParams}
            location={location}
            onClose={onCloseFacilityPropertyPanel}
            onChangeLocation={onChangeLocation}
          />
        </div>
      }

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

export default Facilities;

