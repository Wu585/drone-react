/**
 * 国测局坐标（火星坐标，GCJ02）与百度坐标（BD09）的转换
 * 以及与WGS84坐标的转换
 */
const x_PI: number = 3.14159265358979324 * 3000.0 / 180.0;
const PI: number = 3.1415926535897932384626;
const a: number = 6378245.0;
const ee: number = 0.00669342162296594323;

/**
 * WGS84转GCj02
 * @param lng - 经度
 * @param lat - 纬度
 * @returns [转换后的经度, 转换后的纬度]
 */
export function wgs84togcj02(lng: number, lat: number): [number, number] {
  if (outOfChina(lng, lat)) {
    return [lng, lat];
  }

  const dlat = transformlat(lng - 105.0, lat - 35.0);
  const dlng = transformlng(lng - 105.0, lat - 35.0);
  const radlat = lat / 180.0 * PI;
  const magic = Math.sin(radlat);
  const sqrtmagic = Math.sqrt(1 - ee * magic * magic);
  const dLat = (dlat * 180.0) / ((a * (1 - ee)) / (sqrtmagic * sqrtmagic * sqrtmagic) * PI);
  const dLng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);

  return [lng + dLng, lat + dLat];
}

function out_of_china(lng, lat) {
  return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
}

/**
 * GCJ02转WGS84
 * @param lng - 经度
 * @param lat - 纬度
 * @returns [转换后的经度, 转换后的纬度]
 */
export function gcj02towgs84(lng: number, lat: number): [number, number] {
  var lat = +lat;
  var lng = +lng;
  if (out_of_china(lng, lat)) {
    return [lng, lat]
  } else {
    var dlat = transformlat(lng - 105.0, lat - 35.0);
    var dlng = transformlng(lng - 105.0, lat - 35.0);
    var radlat = lat / 180.0 * PI;
    var magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
    var mglat = lat + dlat;
    var mglng = lng + dlng;
    return [lng * 2 - mglng, lat * 2 - mglat]
  }
}

/**
 * 转换纬度
 * @param lng - 经度
 * @param lat - 纬度
 */
function transformlat(lng: number, lat: number): number {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

/**
 * 转换经度
 * @param lng - 经度
 * @param lat - 纬度
 */
export function transformlng(lng: number, lat: number): number {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}

/**
 * 判断是否在中国境内
 * @param lng - 经度
 * @param lat - 纬度
 * @returns 是否在中国境内
 */
function outOfChina(lng: number, lat: number): boolean {
  return (lng < 72.004 || lng > 137.8347) || (lat < 0.8293 || lat > 55.8271);
}
