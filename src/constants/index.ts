import {CURRENT_CONFIG} from "@/lib/config.ts";

export const AMapConfig = {
  key: CURRENT_CONFIG.amapKey,
  version: "2.0",
  plugins: [
    "AMap.Scale",
    "AMap.ToolBar",
    "AMap.ControlBar",
    "AMap.ElasticMarker",
    "AMap.MapType",
    "AMap.Geocoder",
    "AMap.CircleEditor",
    "AMap.PolygonEditor",
    "AMap.PolylineEditor",
    "AMap.PolyEditor",
    "AMap.RangingTool",
    "AMap.Weather",
    "AMap.MouseTool",
    "AMap.MoveAnimation"
  ]
};


export const DEFAULT_PLACEHOLDER = "--"; // 默认占位符

// 全局日期格式
export const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";
export const DATE_FORMAT_MINUTE = "YYYY-MM-DD HH:mm";
export const DATE_FORMAT_DAY = "YYYY-MM-DD";
export const TIME_FORMAT = "HH:mm:ss";
export const TIME_FORMAT_MINUTE = "HH:mm";
export const DATE_FORMAT_MM = "MM-DD HH:mm";

export const SIZES = ["B", "K", "M", "G", "T", "P", "E", "Z", "Y"];
export const BYTE_SIZES = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
export const PAGE_SIZE_OPTIONS = ["20", "50", "100"];
export const PAGE_SIZE = 50;
