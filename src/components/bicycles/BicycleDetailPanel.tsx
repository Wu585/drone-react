import {BicyclesInfo} from "@/hooks/bicycles/api.ts";
import {FC} from "react";
import {BicycleRideStateMap, BicycleTypeMap, BikeStatusMap} from "@/assets/datas/enum.ts";

interface BicycleDetailPanelProps extends Partial<BicyclesInfo> {
  onClickQuery?: () => void
  onClose?: () => void
}

const BicycleDetailPanel: FC<BicycleDetailPanelProps> = (
  {
    bikeId, bikeType, rideState,
    bikeStatus, onClose,
  }) => {
  return (
    <div className={'w-[310px] h-[310px] bg-bicycle-detail-bg pl-[22px] bg-cover relative'}>
      <div className={'py-[10px] text-[#f3f3f3] text-[20px] font-[600]'}>单车详情</div>
      <div className={"absolute right-[8px] top-0 text-[32px] cursor-pointer"} onClick={onClose}>×</div>
      <div className={"flex flex-col"}>
        <div className={"py-[10px]"}>
          <span>车辆编号: </span>
          <span className={'text-[16px] text-[#57b2ff] font-[500]'}>{bikeId}</span>
        </div>
        <div className={"py-[10px]"}>
          <span>车辆类型: </span>
          <span
            className={'text-[16px] text-[#57b2ff] font-[500]'}>{bikeType?.toString() && BicycleTypeMap[bikeType]}</span>
        </div>
        <div className={"py-[10px]"}>
          <span>骑行状态: </span>
          <span
            className={'text-[16px] text-[#57b2ff] font-[500]'}>{rideState?.toString()  && BicycleRideStateMap[rideState]}</span>
        </div>
        <div className={"py-[10px]"}>
          <span>车辆状态: </span>
          <span
            className={'text-[16px] text-[#57b2ff] font-[500]'}>{bikeStatus?.toString() && BikeStatusMap[bikeStatus]}</span>
        </div>
      </div>
      {/*<div
        className={'w-[140px] h-[40px] bg-[#166ff2] rounded-full flex items-center justify-center cursor-pointer mt-[16px]'}
        onClick={onClickQuery}>
        订单查询
      </div>*/}
    </div>
  );
}

export default BicycleDetailPanel

