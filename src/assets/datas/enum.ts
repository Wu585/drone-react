export enum BicycleRideStateEnum {
  InUse = 0,
  InStop = 1
}

export const BicycleRideStateMap = {
  [BicycleRideStateEnum.InUse]: "骑行中",
  [BicycleRideStateEnum.InStop]: "停放中"
};

export enum BicycleTypeEnum {
  ElectricCar,
  Bike,
}

export const BicycleTypeMap = {
  [BicycleTypeEnum.ElectricCar]: "电动车",
  [BicycleTypeEnum.Bike]: "单车"
};

export enum BikeStatusEnum {
  Open = 1,
  Close,
  Damage
}

export const BikeStatusMap = {
  [BikeStatusEnum.Open]: "开锁",
  [BikeStatusEnum.Close]: "关锁",
  [BikeStatusEnum.Damage]: "损坏"
};

export enum ReturnNormalEnum {
  UnNormal,
  Normal
}

export const ReturnNormalMap = {
  [ReturnNormalEnum.UnNormal]: "否",
  [ReturnNormalEnum.Normal]: "是"
};

export enum EntitySize {
  Width = 48,
  Height = 48
}
