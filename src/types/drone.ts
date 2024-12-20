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
  {label: "Continue", value: WaylineLostControlActionInCommandFlight.CONTINUE},
  {label: "Execute Lost Action", value: WaylineLostControlActionInCommandFlight.EXEC_LOST_ACTION}
];

export enum ERthMode {
  SMART = 0,
  SETTING = 1
}

export const RthModeInCommandFlightOptions = [
  {label: "Smart Height", value: ERthMode.SMART},
  {label: "Setting Height", value: ERthMode.SETTING}
];

export enum ECommanderModeLostAction {
  CONTINUE = 0,
  EXEC_LOST_ACTION = 1
}

export const CommanderModeLostActionInCommandFlightOptions = [
  {label: "Continue", value: ECommanderModeLostAction.CONTINUE},
  {label: "Execute Lost Action", value: ECommanderModeLostAction.EXEC_LOST_ACTION}
];

export enum ECommanderFlightMode {
  SMART = 0,
  SETTING = 1
}

export const CommanderFlightModeInCommandFlightOptions = [
  {label: "Smart Height", value: ERthMode.SMART},
  {label: "Setting Height", value: ERthMode.SETTING}
];
