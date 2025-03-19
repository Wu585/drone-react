import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";
import {MapDoodleColor, MapElementEnum, MapGeographicPosition, pinAMapPosition} from "@/types/map.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseUrl = (url: string) => {
  return url.split("/").filter((part) => {
    return part !== "";
  });
};

export const getImageUrl = (name: string) => {
  return new URL(`/src/assets/images/${name}.png`, import.meta.url).href;
};

export const getScreenImageUrl = (name: string) => {
  return new URL(`/src/assets/images/drone/screen/${name}.png`, import.meta.url).href;
};

/**
 * regular expression to check for valid hour format (01-23)
 */
export function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value);
}

/**
 * regular expression to check for valid 12 hour format (01-12)
 */
export function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value);
}

/**
 * regular expression to check for valid minute format (00-59)
 */
export function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value);
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean };

export function getValidNumber(
  value: string,
  {max, min = 0, loop = false}: GetValidNumberConfig
) {
  let numericValue = parseInt(value, 10);

  if (!isNaN(numericValue)) {
    if (!loop) {
      if (numericValue > max) numericValue = max;
      if (numericValue < min) numericValue = min;
    } else {
      if (numericValue > max) numericValue = min;
      if (numericValue < min) numericValue = max;
    }
    return numericValue.toString().padStart(2, "0");
  }

  return "00";
}

export function getValidHour(value: string) {
  if (isValidHour(value)) return value;
  return getValidNumber(value, {max: 23});
}

export function getValid12Hour(value: string) {
  if (isValid12Hour(value)) return value;
  return getValidNumber(value, {min: 1, max: 12});
}

export function getValidMinuteOrSecond(value: string) {
  if (isValidMinuteOrSecond(value)) return value;
  return getValidNumber(value, {max: 59});
}

type GetValidArrowNumberConfig = {
  min: number;
  max: number;
  step: number;
};

export function getValidArrowNumber(
  value: string,
  {min, max, step}: GetValidArrowNumberConfig
) {
  let numericValue = parseInt(value, 10);
  if (!isNaN(numericValue)) {
    numericValue += step;
    return getValidNumber(String(numericValue), {min, max, loop: true});
  }
  return "00";
}

export function getValidArrowHour(value: string, step: number) {
  return getValidArrowNumber(value, {min: 0, max: 23, step});
}

export function getValidArrow12Hour(value: string, step: number) {
  return getValidArrowNumber(value, {min: 1, max: 12, step});
}

export function getValidArrowMinuteOrSecond(value: string, step: number) {
  return getValidArrowNumber(value, {min: 0, max: 59, step});
}

export function setMinutes(date: Date, value: string) {
  const minutes = getValidMinuteOrSecond(value);
  date.setMinutes(parseInt(minutes, 10));
  return date;
}

export function setSeconds(date: Date, value: string) {
  const seconds = getValidMinuteOrSecond(value);
  date.setSeconds(parseInt(seconds, 10));
  return date;
}

export function setHours(date: Date, value: string) {
  const hours = getValidHour(value);
  date.setHours(parseInt(hours, 10));
  return date;
}

export function set12Hours(date: Date, value: string, period: Period) {
  const hours = parseInt(getValid12Hour(value), 10);
  const convertedHours = convert12HourTo24Hour(hours, period);
  date.setHours(convertedHours);
  return date;
}

export type TimePickerType = "minutes" | "seconds" | "hours" | "12hours";
export type Period = "AM" | "PM";

export function setDateByType(
  date: Date,
  value: string,
  type: TimePickerType,
  period?: Period
) {
  switch (type) {
    case "minutes":
      return setMinutes(date, value);
    case "seconds":
      return setSeconds(date, value);
    case "hours":
      return setHours(date, value);
    case "12hours": {
      if (!period) return date;
      return set12Hours(date, value, period);
    }
    default:
      return date;
  }
}

export function getDateByType(date: Date, type: TimePickerType) {
  switch (type) {
    case "minutes":
      return getValidMinuteOrSecond(String(date.getMinutes()));
    case "seconds":
      return getValidMinuteOrSecond(String(date.getSeconds()));
    case "hours":
      return getValidHour(String(date.getHours()));
    case "12hours":
      const hours = display12HourValue(date.getHours());
      return getValid12Hour(String(hours));
    default:
      return "00";
  }
}

export function getArrowByType(
  value: string,
  step: number,
  type: TimePickerType
) {
  switch (type) {
    case "minutes":
      return getValidArrowMinuteOrSecond(value, step);
    case "seconds":
      return getValidArrowMinuteOrSecond(value, step);
    case "hours":
      return getValidArrowHour(value, step);
    case "12hours":
      return getValidArrow12Hour(value, step);
    default:
      return "00";
  }
}

/**
 * handles value change of 12-hour input
 * 12:00 PM is 12:00
 * 12:00 AM is 00:00
 */
export function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === "PM") {
    if (hour <= 11) {
      return hour + 12;
    } else {
      return hour;
    }
  } else if (period === "AM") {
    if (hour === 12) return 0;
    return hour;
  }
  return hour;
}

/**
 * time is stored in the 24-hour form,
 * but needs to be displayed to the user
 * in its 12-hour representation
 */
export function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) return "12";
  if (hours >= 22) return `${hours - 12}`;
  if (hours % 12 > 9) return `${hours}`;
  return `0${hours % 12}`;
}

export const extractIPFromRTMP = (rtmpUrl: string) => {
  // 正则表达式匹配IP地址
  const ipRegex = /rtmp:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
  const match = rtmpUrl.match(ipRegex);

  if (match) {
    return match[1]; // 返回提取的IP地址
  }

  return ""; // 如果没有找到IP地址，返回null
};

export const convertWebRTCtoHTTP = (webrtcUrl: string) => {
  // 使用正则表达式提取IP地址和路径
  const regex = /webrtc:\/\/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(\/.*)/;
  const match = webrtcUrl.match(regex);

  if (match) {
    const ipAddress = match[1]; // 提取IP地址
    const path = match[2]; // 提取路径
    // 构建新的HTTP URL
    return `http://${ipAddress}:8080${path}.m3u8`;
  }

  return ""; // 如果格式不正确，返回null
};

export type GeojsonCoordinate = [number, number, number?]

export interface GeojsonLine {
  type: "Feature";
  properties: {
    color: string
    directConnected?: boolean
  };
  geometry: {
    type: "LineString"
    coordinates: GeojsonCoordinate[]
  };
}

export interface GeojsonPolygon {
  type: "Feature";
  properties: {
    color: string
  };
  geometry: {
    type: "Polygon"
    coordinates: GeojsonCoordinate[][]
  };
}

export interface GeojsonPoint {
  type: "Feature";
  properties: {
    color: string
    clampToGround?: boolean
  };
  geometry: {
    type: "Point"
    coordinates: GeojsonCoordinate
  };
}

export interface GeojsonCircle {
  type: "Feature";
  properties: {
    color: string
    clampToGround?: boolean
  };
  geometry: {
    type: "Circle"
    coordinates: GeojsonCoordinate
    radius: number
  };
}

export type GeojsonFeature = GeojsonLine | GeojsonPolygon | GeojsonPoint | GeojsonCircle

export function geographic2Coordinate(position: MapGeographicPosition): GeojsonCoordinate {
  const coordinates: GeojsonCoordinate = [position.longitude, position.latitude];
  if (position.height !== undefined) coordinates.push(position.height);
  return coordinates;
}

export function generateLine(coordinates: MapGeographicPosition[], properties: GeojsonLine["properties"]): GeojsonFeature {
  return {
    type: "Feature",
    properties,
    geometry: {
      type: "LineString",
      coordinates: coordinates.map(geographic2Coordinate),
    },
  };
}

export function generatePolygon(coordinates: MapGeographicPosition[], properties: GeojsonPolygon["properties"]): GeojsonFeature {
  return {
    type: "Feature",
    properties,
    geometry: {
      type: "Polygon",
      coordinates: [coordinates.map(geographic2Coordinate)],
    },
  };
}

export function generatePoint(position: MapGeographicPosition, properties: GeojsonPoint["properties"]): GeojsonFeature {
  return {
    type: "Feature",
    properties,
    geometry: {
      type: "Point",
      coordinates: geographic2Coordinate(position),
    },
  };
}

export function generateCircle(position: MapGeographicPosition, properties: GeojsonCircle["properties"], radius: number): GeojsonFeature {
  return {
    type: "Feature",
    properties,
    geometry: {
      type: "Circle",
      coordinates: geographic2Coordinate(position),
      radius: radius,
    },
  };
}

export function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getPinPosition(pinAMapPosition: pinAMapPosition): MapGeographicPosition {
  return {height: 0, latitude: pinAMapPosition.lat, longitude: pinAMapPosition.lng};
}

export function generatePointContent(pinAMapPosition: pinAMapPosition) {
  const position = getPinPosition(pinAMapPosition);
  return {
    type: MapElementEnum.PIN,
    content: generatePoint(position, {
      color: MapDoodleColor.PinColor,
      clampToGround: true,
    })
  };
}

function getLieOrPolyPosition(mapPosition: pinAMapPosition[]): MapGeographicPosition[] {
  const position = [] as MapGeographicPosition[];
  mapPosition.forEach(item => {
    position.push({height: 0, latitude: item.lat, longitude: item.lng});
  });
  return position;
}

export function generateLineContent(mapPosition: pinAMapPosition[]) {
  const position = getLieOrPolyPosition(mapPosition);
  return {
    type: MapElementEnum.LINE,
    content: generateLine(position, {
      color: MapDoodleColor.PolylineColor,
      directConnected: false,
    })
  };
}

export function generatePolyContent(mapPosition: pinAMapPosition[]) {
  const position = getLieOrPolyPosition(mapPosition);
  return {
    type: MapElementEnum.POLY,
    content: generatePolygon(position, {
      color: MapDoodleColor.PolygonColor,
    })
  };
}

export function generateCircleContent(pinAMapPosition: pinAMapPosition, radius: number) {
  const position = getPinPosition(pinAMapPosition);
  return generateCircle(position, {color: MapDoodleColor.PolygonColor}, radius);
}

export function generateRandomString(length: number = 6): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 可用字符
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length); // 生成随机索引
    result += characters[randomIndex]; // 追加随机字符
  }

  return result;
}

/**
 * 使用 Haversine 公式计算两个经纬度点之间的距离（以千米为单位）
 * 输入起点和终点
 * @param {*} point1 经纬度数组 [纬度, 经度]
 * @param {*} point2 经纬度数组 [纬度, 经度]
 * @returns {number} 起点到终点的距离（以千米为单位）
 */
export function calculateHaversineDistance(point1: number[], point2: number[]) {
  // 提取起点和终点的纬度和经度
  const lat1 = point1[0];
  const lon1 = point1[1];
  const lat2 = point2[0];
  const lon2 = point2[1];

  // 地球半径（米）
  const earthRadius = 6371000;

  // 将角度转换为弧度
  const radLat1 = (Math.PI * lat1) / 180;
  const radLat2 = (Math.PI * lat2) / 180;
  const deltaLat = (Math.PI * (lat2 - lat1)) / 180;
  const deltaLon = (Math.PI * (lon2 - lon1)) / 180;

  // Haversine 公式计算
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) *
    Math.cos(radLat2) *
    Math.sin(deltaLon / 2) *
    Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // 返回距离（以千米为单位）
  return earthRadius * c;
}

