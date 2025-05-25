export enum LostControlActionInCommandFLight {
  HOVER = 0, // 悬停
  Land = 1, // 着陆
  RETURN_HOME = 2, // 返航
}

export const LostControlActionInCommandFLightOptions = [
  {label: "返航", value: LostControlActionInCommandFLight.RETURN_HOME},
  {label: "悬停", value: LostControlActionInCommandFLight.HOVER},
  {label: "着陆", value: LostControlActionInCommandFLight.Land}
];

export enum WaylineLostControlActionInCommandFlight {
  CONTINUE = 0,
  EXEC_LOST_ACTION = 1
}

export const WaylineLostControlActionInCommandFlightOptions = [
  {label: "继续", value: WaylineLostControlActionInCommandFlight.CONTINUE},
  {label: "执行失控动作", value: WaylineLostControlActionInCommandFlight.EXEC_LOST_ACTION}
];

export enum ERthMode {
  SMART = 0,
  SETTING = 1
}

export const RthModeInCommandFlightOptions = [
  {label: "自动高度", value: ERthMode.SMART},
  {label: "指定高度", value: ERthMode.SETTING}
];

export enum ECommanderModeLostAction {
  CONTINUE = 0,
  EXEC_LOST_ACTION = 1
}

export const CommanderModeLostActionInCommandFlightOptions = [
  {label: "继续", value: ECommanderModeLostAction.CONTINUE},
  {label: "执行失控动作", value: ECommanderModeLostAction.EXEC_LOST_ACTION}
];

export enum ECommanderFlightMode {
  SMART = 0,
  SETTING = 1
}

export const CommanderFlightModeInCommandFlightOptions = [
  {label: "自动高度", value: ERthMode.SMART},
  {label: "指定高度", value: ERthMode.SETTING}
];
