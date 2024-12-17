import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import {BiyCleTable} from "@/components/bicycles/BiycleTable.tsx";
import inStop from "@/assets/images/in-stop.png";
import inUse from "@/assets/images/in-use.png";
import BicycleOrdersTable from "@/components/bicycles/BicycleOrdersTable.tsx";
import {
  BicyclesInfo,
  useOrderInfoByBicycleId
} from "@/hooks/bicycles/api.ts";
import amountsPng from "@/assets/images/bicycle-amounts.png";
import {useEffect, useRef, useState} from "react";
import {addEntity, removeEntity} from "@/lib/entity.ts";
import startPng from "@/assets/images/start.png";
import endPng from "@/assets/images/end.png";
import BicycleDetailPanel from "@/components/bicycles/BicycleDetailPanel.tsx";
import BicycleOrderPanel from "@/components/bicycles/BicycleOrderPanel.tsx";
import {BicycleMap, useBicycleStore} from "@/store/useBicycleStore.ts";
import {flyToView} from "@/lib/view.ts";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import {useBicycleAmount} from "@/hooks/bicycles/bicycle-info.ts";
import {useAddLeftClickListener, useChangeSelectedEntityImage} from "@/hooks/public/event-listen.ts";
import {useSceneStore} from "@/store/useSceneStore.ts";
import BicycleMountProgressChart from "@/components/bicycles/BicycleMountProgressChart.tsx";
import AreaSelect from "@/components/bicycles/AreaSelect.tsx";
import SearchInput from "@/components/bicycles/SearchInput.tsx";
import MapChange from "@/components/bicycles/MapChange.tsx";
import {cn} from "@/lib/utils.ts";
import ToolBarWithPosition from "@/components/public/ToolBarWithPosition.tsx";
import {queryRegion, useQueryChildrenDatasets} from "@/hooks/public/layers.ts";

let startEntity: any;
let endEntity: any;
let trackLine: any;

const clear = () => {
  removeEntity(startEntity);
  removeEntity(endEntity);
  removeEntity(trackLine);
};

const Bicycle = () => {
  const {numberInStop, numberInUse, amount} = useBicycleAmount();
  // 单车信息面板数据
  const [bicycleDetail, setBicycleDetail] = useState<BicyclesInfo | null>(null);
  const [bicycleDetailPanelVisible, setBicycleDetailPanelVisible] = useState(false);
  const [bicycleOrderPanelVisible, setBicycleOrderPanelVisible] = useState(false);
  const bicycleDetailPanelRef = useRef<HTMLDivElement>(null);
  const {selectedOrder} = useBicycleStore();
  const {isFullScreen, setKeyAreas} = useSceneStore();
  const {data: orderInfoList} = useOrderInfoByBicycleId(bicycleDetail?.bikeId);
  // 轨迹状态
  const [trackStatus, setTrackStatus] = useState(false);

  // 添加重点区域面
  const {data: regionDataList} = useQueryChildrenDatasets("WorkSpace", "DataSource");

  useEffect(() => {
    if (regionDataList && regionDataList.datasetNames && regionDataList.datasetNames instanceof Array) {
      const promiseArray = regionDataList.datasetNames.map((name) =>
        queryRegion("WorkSpace", "DataSource", name));

      getCustomSource("polygonSource")?.entities.removeAll();

      Promise.all(promiseArray).then(res => {
        setKeyAreas(res.map((item: any) => item.data));

        res.map((item: any) => {
          const poiArray = [];
          const geometryPoints = item.data.features[0].geometry.points;
          geometryPoints.forEach((poi: any) => poiArray.push(poi.x, poi.y));
          poiArray.push(geometryPoints[0].x, geometryPoints[0].y);
          getCustomSource("polygonSource")?.entities.add({
            polygon: {
              hierarchy: Cesium.Cartesian3.fromDegreesArray(poiArray),
              material: new Cesium.Color.fromCssColorString("rgba(255, 167, 62, 0.5)")
            }
          });
        });
      });
    }
  }, [regionDataList]);

  const {
    changeSelectedEntityImage,
    recoverSelectedEntityImage
  } = useChangeSelectedEntityImage("bicyclesSource", "bike");

  const onCheckOrder = () => {
    setBicycleOrderPanelVisible(true);
  };

  const handleClickBicycleEntity = (description: any) => {
    console.log("description");
    console.log(description);
    if (JSON.stringify(description) === "{}") return;
    if (description.status === "track") {
      clear();
      getCustomSource("regionSource")!.show = true;
      setTrackStatus(false);
      return;
    }
    setBicycleDetail(description);
    setBicycleDetailPanelVisible(true);
    changeSelectedEntityImage(description.bikeId);
  };

  useAddLeftClickListener(bicycleDetailPanelRef, handleClickBicycleEntity);

  const onCheckTrajectory = (x1: number, y1: number, x2: number, y2: number, tracks?: string) => {
    setTrackStatus(true);

    clear();

    getCustomSource("bicyclesSource")!.show = false;
    getCustomSource("regionSource")!.show = false;

    setBicycleOrderPanelVisible(false);
    setBicycleDetailPanelVisible(false);

    if (x1 && y1) {
      startEntity = addEntity(x1, y1, 64, startPng, {
        status: "track"
      }, 64, 64);
    }
    if (x2 && y2) {
      endEntity = addEntity(x2, y2, 64, endPng, {
        status: "track"
      }, 64, 64);
    }

    if (tracks) {
      const tracksArray = JSON.parse(tracks);
      trackLine = viewer.entities.add({
        name: "track-line",
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(tracksArray),
          width: 5,  // 设置折线的宽度
          material: Cesium.Color.RED,  // 折线的颜色
          clampToGround: true  // 如果需要折线贴地渲染，设置为true
        }
      });
    }

    flyToView(-2863651.896728118, 4682796.768364262, 3260045.78877575,
      6.196232171985616, -0.9694451594162494, 0.000001031438563003917);
  };

  useEffect(() => {
    return () => {
      getCustomSource("polygonSource")?.entities.removeAll();
      clear();
    };
  }, []);

  useEffect(() => {
    if (!trackStatus) {
      getCustomSource("bicyclesSource")!.show = true;
    }
  }, [trackStatus]);

  const onMapChange = (map: BicycleMap) => {
    if (map.name === "热力图") {
      clear();
    }
  };

  const onClickRow = (bicycle: BicyclesInfo) => {
    changeSelectedEntityImage(bicycle.bikeId);
  };

  const onClose = () => {
    setBicycleDetailPanelVisible(false);
    recoverSelectedEntityImage();
  };

  return (
    <>
      {
        isFullScreen && <>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"奉浦街道单车总数"}>
              <div className={"w-[467px] h-[120px] relative flex items-center justify-center"}>
                <div>
                  <img src={amountsPng} alt=""/>
                </div>
                <div style={{
                  transform: "translate(-50%,-50%)"
                }} className={"absolute top-1/2 left-1/2 flex items-center justify-center pl-[32px] whitespace-nowrap"}>
                  <span>单车总量：</span>
                  <span style={{
                    textShadow: "0px 2px 6px #147CFF"
                  }} className={"text-[38px]"}>
                {amount}
              </span>
                  <span>辆</span>
                </div>
              </div>
            </DisPlayItemLayout>

            <DisPlayItemLayout title={"骑行中与停放中单车数对比"}>
              <div className={"flex items-center justify-center space-x-[98px]"}>
                <div className={"flex flex-col justify-center items-center relative w-[120px]"}>
                  <div>
                    <img src={inUse} alt=""/>
                  </div>
                  <div className={"text-[28px] absolute top-[44px] flex flex-col items-center"}>
                    <div className={"flex justify-center items-center"}>
                      <span>{numberInUse || 0}</span>
                      <span className={"text-[16px]"}>辆</span>
                    </div>
                    <span className={"text-[14px]"}>骑行中</span>
                  </div>
                </div>
                <div className={"flex flex-col justify-center items-center relative w-[120px]"}>
                  <div>
                    <img src={inStop} alt=""/>
                  </div>
                  <div className={"text-[28px] absolute top-[44px] flex flex-col items-center"}>
                    <div className={"flex justify-center items-center"}>
                      <span>{numberInStop || 0}</span>
                      <span className={"text-[16px]"}>辆</span>
                    </div>
                    <span className={"text-[14px]"}>停放中</span>
                  </div>
                </div>
              </div>
            </DisPlayItemLayout>

            <DisPlayItemLayout title={"重点区域单车数量统计"}>
              <div className={"flex items-center justify-center h-[400px] w-full"}>
                <BicycleMountProgressChart/>
              </div>
            </DisPlayItemLayout>
          </div>

          <div className={"z-10 absolute top-[100px] right-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"全部单车信息"} action={<div className={"flex items-center pl-6"}>
              <SearchInput/>
              <AreaSelect/>
            </div>}>
              <BiyCleTable onClickRow={onClickRow}/>
            </DisPlayItemLayout>

            <DisPlayItemLayout title={"当前单车订单列表"}>
              <BicycleOrdersTable orderList={orderInfoList} onCheckOrderInfo={onCheckOrder}
                                  amount={(numberInUse || 0) + (numberInStop || 0)}/>
            </DisPlayItemLayout>
          </div>
        </>
      }

      <div className={"absolute top-[160px] right-1/3 z-10"}>
        <MapChange onMapChange={onMapChange}/>
      </div>

      <div ref={bicycleDetailPanelRef} className={"absolute z-50"} style={{
        transform: "translate(-50%,-110%)"
      }}>
        {bicycleDetailPanelVisible && <BicycleDetailPanel
          {...bicycleDetail}
          onClose={onClose}
          onClickQuery={() => setBicycleOrderPanelVisible(true)}/>}
      </div>

      <div className={"absolute left-1/2 top-1/2 z-50"} style={{
        transform: "translate(-50%,-50%)"
      }}>
        {bicycleOrderPanelVisible &&
          <BicycleOrderPanel {...selectedOrder} onCheckTrajectory={onCheckTrajectory}
                             onClose={() => setBicycleOrderPanelVisible(false)}/>}
      </div>
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

export default Bicycle;

