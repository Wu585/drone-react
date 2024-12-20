// 控制权
export enum ControlSource {
  A = 'A',
  B = 'B'
}

export interface PayloadInfo {
  index: number,
  model: string,
  control_source?: ControlSource,
  payload_sn?: string,
  payload_index?: string,
  payload_name?: string,
}

// 设备信息
export interface OnlineDevice {
  model: string,
  callsign: string,
  sn: string,
  mode: number,
  gateway: {
    model: string,
    callsign: string,
    sn: string,
    domain: string,
  },
  payload: PayloadInfo[]
}

export enum EModeCode {
  Standby,
  Preparing,
  Ready,
  Manual,
  Automatic,
  Waypoint,
  Panoramic,
  Active_Track,
  ADS_B,
  Return_To_Home,
  Landing,
  Forced_Landing,
  Three_Blades_Landing,
  Upgrading,
  Disconnected,
}

export enum EDeviceTypeName {
  Aircraft = 0,
  Gateway = 2,
  Dock = 3,
}
