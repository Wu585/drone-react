import {getCustomSource} from "@/hooks/public/custom-source.ts";
import quyuBg from "@/assets/images/quyu-entity-bg.png";
import {allRange} from "@/assets/datas/range.ts";

export const addPolygon = (pointArray: {
  x: number,
  y: number
}[]) => {
  return viewer.entities.add({
    outlineColor: Cesium.Color.RED,
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(pointArray),
      // material: Cesium.Color.fromCssColorString(`rgba(0, 0, 0, 1)`),
      material: new Cesium.Color.fromCssColorString("rgba(255, 167, 62, 0.3)"),
      // classificationType: Cesium.ClassificationType.S3M_TILE
    }
  });
};

export const addEntity = (lon: number, lat: number, hei: number, imageUrl: string,
                          description = {}, width: number = 40, height: number = 64): any => {
  return viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat, hei),
    billboard: {
      image: imageUrl,
      width,
      height,
      // distanceDisplayCondition: isShow && new Cesium.DistanceDisplayCondition(0, 2000)
    },
    description: JSON.stringify(description),
  });
};

export const addRegionMountsEntity = (lon: number, lat: number, text: string, offset: [number, number] = [140, -70]) => {
  getCustomSource("regionSource")?.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat, 300), // 设置广告牌的位置
    billboard: {
      // 设置广告牌显示的图片，这里使用Cesium内置的图标作为示例
      image: Cesium.buildModuleUrl(quyuBg),
      scale: 1.0, // 设置广告牌的缩放比例
      pixelOffset: new Cesium.Cartesian2(120, -80), // 设置文字相对于广告牌图片的偏移量
    },
    label: {
      text, // 设置显示的文字
      font: "48px serif", // 设置字体样式
      scale: 0.5,
      fillColor: Cesium.Color.fromCssColorString("#fff"), // 设置文字颜色
      outlineColor: Cesium.Color.fromCssColorString("#fff"), // 设置文字轮廓颜色
      outlineWidth: 3, // 设置文字轮廓的宽度
      style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 设置文字的样式
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 设置垂直对齐方式
      pixelOffset: new Cesium.Cartesian2(...offset), // 设置文字的偏移量，以确保文字不会直接覆盖在图片上
    },
  });
};

export const removeEntity = (entity: any) => {
  viewer.entities.remove(entity);
};

// 计算两点之间的距离（单位：公里）
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // 地球半径，公里
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 计算每个点位的密度
export function calculateDensity(points: {
  longitude: number,
  latitude: number
}[], radius: number) {
  return points.map((point, _, arr) => {
    const density = arr.reduce((acc, cur) => {
      if (haversineDistance(point.latitude, point.longitude, cur.latitude, cur.longitude) <= radius) {
        return acc + 1;
      }
      return acc;
    }, 0);
    return {...point, density};
  });
}

export const generateHeatMap = (data: {
  x: number,
  y: number,
  value: number
}[], valueMin: number, valueMax: number) => {
  const polygonCoordinates = allRange.map((poi: [number, number]) => new Cesium.Cartesian3.fromDegrees(poi[0], poi[1]));

  // 获取多边形的包围盒
  const boundingRectangle = Cesium.Rectangle.fromCartesianArray(polygonCoordinates);

  const heatMap = SuperMap3DHeatmap.create(
    viewer,
    {
      west: Cesium.Math.toDegrees(boundingRectangle.west),
      east: Cesium.Math.toDegrees(boundingRectangle.east),
      south: Cesium.Math.toDegrees(boundingRectangle.south),
      north: Cesium.Math.toDegrees(boundingRectangle.north)
    }
  );

  heatMap.setWGS84Data(valueMin, valueMax, data);

  return heatMap;
};

export const getSelectedEntity = (sourceName: string, id: string) => {
  return getCustomSource(sourceName)?.entities.getById(id);
};