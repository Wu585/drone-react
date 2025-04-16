export const resetView1 = () => {
  viewer.camera.setView({
    destination: new Cesium.Cartesian3(-2859160.2297640075, 4675301.603267225, 3277265.951102894),
    orientation: {
      heading: 6.220618987234879,
      pitch: -0.7865000312284445,
      roll: 6.283185307179586,
    },
  });
};

export const resetView = () => {
  viewer.camera.setView({
    destination: new Cesium.Cartesian3(-2863651.896728118, 4682796.768364262, 3260045.78877575),
    orientation: {
      heading: 6.196232171985616,
      pitch: -0.9694451594162494,
      roll: 0.000001031438563003917,
    },
  });
};

export const flyToView = (x: number, y: number, z: number, heading: number, pitch: number, roll: number, duration = 1) => {
  viewer.camera.flyTo({
    destination: new Cesium.Cartesian3(x, y, z),
    orientation: {
      heading,
      pitch,
      roll
    },
    duration
  });
};

export function transformGeometricPosition(x: number, y: number) {
  const point = new Cesium.Cartesian3(x, y, 0.5); //平面坐标
  const positionTr = viewer.scene.camera._projection.unproject(point); //平面坐标值转弧度
  const longitude = Cesium.Math.toDegrees(positionTr.longitude); //弧度转经纬度
  const latitude = Cesium.Math.toDegrees(positionTr.latitude);
  return {longitude, latitude};
}

export const flyToDegree = (lon: number, lat: number, height = 500) => {
  viewer.camera.flyTo({
    destination: new Cesium.Cartesian3.fromDegrees(lon, lat, height),
    orientation: {heading: 6.283185307179586, pitch: -1.5700810794210387, roll: 0},
    duration: 1
  });
};

export const flyToCartesian3 = (
  {
    locationX, locationY, locationZ,
    rotaionPitch, rotaionHeading, rotationRoll
  }: {
    locationX: number, locationY: number, locationZ: number,
    rotaionPitch: number, rotaionHeading: number, rotationRoll: number
  }) => {
  viewer.camera.flyTo({
    destination: new Cesium.Cartesian3(locationX, locationY, locationZ),
    orientation: {
      heading: rotaionHeading,
      pitch: rotaionPitch,
      roll: rotationRoll
    },
    duration: 1
  });
};

//笛卡尔转换为经纬度
export function Cartesian2toDegrees(position: any): number[] {
  const cartographic = Cesium.Cartographic.fromCartesian(position);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  const height = cartographic.height;

  return [longitude, latitude, height];
}

export const getCameraParam = () => {
  const locationX = viewer.camera.position.x;
  const locationY = viewer.camera.position.y;
  const locationZ = viewer.camera.position.z;
  const rotaionPitch = viewer.camera.pitch;
  const rotaionHeading = viewer.camera.heading;
  const rotationRoll = viewer.camera.roll;
  return {
    locationX,
    locationY,
    locationZ,
    rotaionPitch,
    rotaionHeading,
    rotationRoll,
  };
};

export const findS3mLayer = (name: string) => {
  return viewer.scene.layers.find(name);
};

export const findMapLayer = (name: string, viewer = window.viewer) => {
  return viewer.imageryLayers._layers.find((layer: any) => {
    return layer._imageryProvider.name === name;
  });
};
