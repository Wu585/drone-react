import {BicycleOrder} from "@/hooks/bicycles/api.ts";
import {FC} from "react";
import {areaIdNameMap} from "@/assets/datas/range.ts";

interface BicycleOrderPanelProps extends Partial<BicycleOrder> {
  onClose?: () => void;
  onCheckTrajectory?:
    (borrowAddressLon: number, borrowAddressLat: number, returnAddressLon: number, returnAddressLat: number, tracks?: string) => void;
}

const getSpeed = (distance: number, time: number) => {
  return ((distance / 1000) / (time / 60)).toFixed(2);
};

const BicycleOrderPanel: FC<BicycleOrderPanelProps> = (
  {
    onClose,
// @ts-ignore
    orderId, bikeId, startTime, borrowAreaId,
    endTime, returnAreaId, rideTime, rideDistance, returnNormal,
    borrowAddressLon, borrowAddressLat, returnAddressLon, returnAddressLat, tracks,
    onCheckTrajectory
  }) => {
  return (
    <div style={{
      backgroundSize: "100% 100%"
    }} className={"w-[500px] h-[524px] bg-bicycle-detail-bg pl-[22px] relative bg-no-repeat whitespace-nowrap"}>
      <div className={"py-[28px] text-[#f3f3f3] text-[20px] font-[600]"}>订单详情</div>
      <div className={"absolute right-[8px] top-[8px] text-[36px] cursor-pointer"} onClick={onClose}>×</div>
      <div className={"flex flex-col"}>
        <div className={"py-[6px] flex space-x-[64px]"}>
          <span className={"w-[100px]"}>订单编号: </span>
          <span className={"text-[16px] text-[#57b2ff] font-[500]"}>{orderId}</span>
        </div>
        <div className={"py-[6px] flex space-x-[64px]"}>
          <span className={"w-[100px]"}>自行车编号: </span>
          <span className={"text-[16px] text-[#57b2ff] font-[500]"}>{bikeId}</span>
        </div>
        <div className={"py-[6px] flex space-x-[64px]"}>
          <span className={"w-[100px]"}>借车时间: </span>
          <span className={"text-[16px] text-[#57b2ff] font-[500]"}>{startTime}</span>
        </div>
        <div className={"py-[6px] flex space-x-[64px]"}>
          <span className={"w-[100px]"}>借车区域: </span>
          <span className={"text-[16px] text-[#57b2ff] font-[500]"}>{borrowAreaId && areaIdNameMap[borrowAreaId]}</span>
        </div>
        <div className={"py-[6px] flex space-x-[64px]"}>
          <span className={"w-[100px]"}>还车时间: </span>
          <span className={"text-[16px] text-[#57b2ff] font-[500]"}>{endTime}</span>
        </div>
        <div className={"py-[6px] flex space-x-[64px]"}>
          <span className={"w-[100px]"}>还车区域: </span>
          <span className={"text-[16px] text-[#57b2ff] font-[500]"}>{returnAreaId && areaIdNameMap[returnAreaId]}</span>
        </div>
        <div className={"py-[6px] flex space-x-[64px]"}>
          <span className={"w-[100px]"}>骑行时长: </span>
          <span className={"text-[16px] text-[#57b2ff] font-[500]"}>{rideTime}分钟</span>
        </div>
        <div className={"py-[6px] flex space-x-[64px]"}>
          <span className={"w-[100px]"}>骑行里程: </span>
          <span className={"text-[16px] text-[#57b2ff] font-[500]"}>{rideDistance}米</span>
        </div>
        <div className={"py-[6px] flex space-x-[64px]"}>
          <span className={"w-[100px]"}>骑行速率: </span>
          <span
            className={"text-[16px] text-[#57b2ff] font-[500]"}>
            {getSpeed(rideDistance || 0, +rideTime! || 0)}公里/小时
            ；
            {((rideDistance || 0) / ((+rideTime! || 0) * 60)).toFixed(2)} 米/秒
          </span>
        </div>
        <div className={"py-[6px] flex space-x-[64px]"}>
          <span className={"w-[100px]"}>是否正常还车: </span>
          <span
            className={"text-[16px] text-[#57b2ff] font-[500]"}>{returnNormal === 0 ? "否" : returnNormal === 1 ? "是" : ""}</span>
        </div>
      </div>

      <div
        onClick={() =>
          onCheckTrajectory?.(parseFloat(borrowAddressLon || "0"), parseFloat(borrowAddressLat || "0")
            , parseFloat(returnAddressLon || "0"), parseFloat(returnAddressLat || "0"), tracks)}
        className={"w-[140px] h-[40px] bg-[#166ff2] rounded-full flex items-center justify-center cursor-pointer mt-[16px]"}>
        查看骑行轨迹
      </div>
    </div>
  );
};

export default BicycleOrderPanel;

