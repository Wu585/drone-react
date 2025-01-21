import {GeojsonCoordinate, GeojsonPolygon} from "@/lib/utils.ts";

export enum EFlightAreaType {
  NFZ = 'nfz',
  DFENCE = 'dfence',
}

export enum EGeometryType {
  CIRCLE = 'Circle',
  POLYGON = 'Polygon',
}

export enum EFlightAreaUpdate {
  ADD = 'add',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum ESyncStatus {
  WAIT_SYNC = 'wait_sync',
  SWITCH_FAIL = 'switch_fail',
  SYNCHRONIZING = 'synchronizing',
  SYNCHRONIZED = 'synchronized',
  FAIL = 'fail',
}

export interface GeojsonCircle {
  type: 'Feature'
  properties: {
    color: string
    clampToGround?: boolean
  }
  geometry: {
    type: EGeometryType.CIRCLE
    coordinates: GeojsonCoordinate
    radius: number
  }
}

export interface DroneLocation {
  area_distance: number,
  area_id: string,
  is_in_area: boolean,
}

export interface FlightAreasDroneLocation {
  drone_locations: DroneLocation[]
}

export type FlightAreaContent = GeojsonCircle | GeojsonPolygon

export interface FlightAreaUpdate {
  operation: EFlightAreaUpdate,
  area_id: string,
  name: string,
  type: EFlightAreaType,
  content: FlightAreaContent,
  status: boolean,
  username: string,
  create_time: number,
  update_time: number,
}

export interface FlightAreaSyncProgress {
  sn: string,
  result: number,
  status: ESyncStatus,
  message: string,
}

export const FlightAreaTypeTitleMap = {
  [EFlightAreaType.NFZ]: {
    [EGeometryType.CIRCLE]: '圆形限飞区',
    [EGeometryType.POLYGON]: '多边形限飞区',
  },
  [EFlightAreaType.DFENCE]: {
    [EGeometryType.CIRCLE]: '圆形作业区',
    [EGeometryType.POLYGON]: '多边形作业区',
  },
}

export interface GetFlightArea {
  area_id: string,
  name: string,
  type: EFlightAreaType,
  content: FlightAreaContent,
  status: boolean,
  username: string,
  create_time: number,
  update_time: number,
}

export interface PostFlightAreaBody {
  id: string,
  name: string,
  type: EFlightAreaType,
  content: {
    properties: {
      color: string,
      clampToGround: boolean,
    },
    geometry: {
      type: string,
      coordinates: GeojsonCoordinate | GeojsonCoordinate[][],
      radius?: number,
    }
  }
}

export interface FlightAreaStatus {
  sync_code: number,
  sync_status: ESyncStatus,
  sync_msg: string,

}
export interface GetDeviceStatus {
  device_sn: string,
  nickname?: string,
  device_name?: string,
  online?: boolean,
  flight_area_status: FlightAreaStatus,
}
