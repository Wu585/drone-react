import {useBicyclesStatus} from "@/hooks/bicycles/api.ts";
import {BicycleRideStateEnum} from "@/assets/datas/enum.ts";

export const useBicycleAmount = () => {
  const {data: numberInUse} = useBicyclesStatus(BicycleRideStateEnum.InUse)
  const {data: numberInStop} = useBicyclesStatus(BicycleRideStateEnum.InStop)

  return {
    numberInStop,
    numberInUse,
    amount: (numberInUse || 0) + (numberInStop || 0)
  }
}