// 监听点击机场图标 添加起飞点和线以及高度label
import {useEffect, useState} from "react";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import takeOffPng from "@/assets/images/drone/wayline/takeoff.svg";
import dronePng from "@/assets/images/drone/wayline/drone.png";
import {pickPosition} from "@/components/toolbar/tools";
import {clearPickPosition} from "@/components/toolbar/tools/pickPosition.ts";

export const useAddEventListener =
  (func?: (longitude: number, latitude: number, pickedObject?: any) => void,
   type = Cesium.ScreenSpaceEventType.LEFT_CLICK) => {
    useEffect(() => {
      if (!viewer) return;
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      handler.setInputAction((movement: any) => {
        viewer.scene.pickPositionAsync(movement.position).then((position: any) => {
          //将笛卡尔坐标转化为经纬度坐标
          const cartographic = Cesium.Cartographic.fromCartesian(position);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);
          // 点击的实体，没有则为undefined
          const pickedObject = viewer.scene.pick(movement.position);
          func?.(longitude, latitude, pickedObject);
        });
      }, type);

      return () => {
        if (handler) {
          handler.removeInputAction(type);//移除事件
          handler.destroy();
        }
      };
    }, []);
  };

const addTakeOffPoint = ({longitude, latitude, height, endHeight}: {
  longitude: number,
  latitude: number,
  height: number,
  endHeight: number
}) => {
  // 计算中间点高度
  const middleHeight = (height + endHeight) / 2;

  /*// 创建一个带凹尖的箭头形状
  const scale = 0.00005; // 缩小整体大小
  const planeHeight = take_off_security_height;

  // 定义箭头形状的顶点（带凹尖的五边形）
  const positions = [
    // 从左后角开始，顺时针定义顶点
    longitude - scale * 1.5, latitude - scale, planeHeight,           // 左后角
    longitude - scale * 0.5, latitude - scale * 0.8, planeHeight,     // 左边中点
    longitude + scale * 2, latitude, planeHeight + scale * 3,         // 前端（稍微抬高）
    longitude - scale * 0.5, latitude + scale * 0.8, planeHeight,     // 右边中点
    longitude - scale * 1.5, latitude + scale, planeHeight,           // 右后角
    longitude - scale, latitude, planeHeight - scale * 2,             // 后部凹尖（朝内且降低）
  ];

  // 创建几何实例
  const geometry = new Cesium.GeometryInstance({
    geometry: new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(
        Cesium.Cartesian3.fromDegreesArrayHeights(positions)
      ),
      perPositionHeight: true,
      extrudedHeight: planeHeight - scale * 8, // 增加厚度
      vertexFormat: Cesium.VertexFormat.ALL,
      arcType: Cesium.ArcType.GEODESIC // 使用大地线连接顶点
    }),
    id: 'arrow'
  });

  // 创建primitive
  const primitive = new Cesium.Primitive({
    geometryInstances: geometry,
    appearance: new Cesium.MaterialAppearance({
      material: new Cesium.Material({
        fabric: {
          type: 'Color',
          uniforms: {
            color: Cesium.Color.fromCssColorString("#43ABFF").withAlpha(0.9)
          }
        }
      }),
      flat: false,
      faceForward: true,
      translucent: true
    }),
    // 确保箭头始终显示在最上层
    depthTest: true,
    depthWrite: false,
    renderState: {
      cull: {
        enabled: true,
        face: Cesium.CullFace.BACK
      }
    }
  });

  viewer.scene.primitives.add(primitive);
  (getCustomSource("waylines-create") as any).arrowPrimitive = primitive;*/

  // 添加起飞点和虚线
  getCustomSource("waylines-create")?.entities.add({
    id: "takeoff",
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    billboard: {
      image: takeOffPng,
      width: 48,
      height: 48,
    },
    polyline: {
      positions: [
        Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
        Cesium.Cartesian3.fromDegrees(longitude, latitude, endHeight)
      ],
      width: 2,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8),
        dashLength: 8.0
      })
    }
  });

  // 添加高度标签
  getCustomSource("waylines-create")?.entities.add({
    id: "takeoff-label",
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, middleHeight),
    label: {
      text: `${endHeight}m`,
      font: "14px sans-serif",
      fillColor: Cesium.Color.BLACK,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      pixelOffset: new Cesium.Cartesian2(10, 0),
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    }
  });

  // 添加无人机图标
  getCustomSource("waylines-create")?.entities.add({
    id: "takeoff-drone",
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, endHeight),
    model: {
      uri: 'data:application/gltf+json,' + JSON.stringify({
        "asset": {
          "version": "2.0",
          "generator": "Created using the official Cinema 4D glTF Exporter 1.000x290161"
        },
        "scenes": [{
          "nodes": [0]
        }],
        "nodes": [{
          "name": "角锥",
          "translation": [0, 0, 0],
          "rotation": [0.0, 0.0, 0.0, -1.0],
          "scale": [0.1, 0.1, 0.1],
          "mesh": 0
        }],
        "meshes": [{
          "primitives": [{
            "attributes": {
              "POSITION": 1,
              "NORMAL": 2,
              "TEXCOORD_0": 3
            },
            "indices": 0,
            "material": 0
          }]
        }],
        "accessors": [{
          "bufferView": 0,
          "type": "SCALAR",
          "componentType": 5123,
          "count": 18,
          "byteOffset": 0,
          "min": [0],
          "max": [14]
        },
        {
          "bufferView": 1,
          "type": "VEC3",
          "componentType": 5126,
          "count": 15,
          "byteOffset": 0,
          "min": [-81.83937072753906, -24.118911743164064, -122.53469848632813],
          "max": [81.83937072753906, 24.118911743164064, 122.53469848632813]
        },
        {
          "bufferView": 1,
          "type": "VEC3",
          "componentType": 5126,
          "count": 15,
          "byteOffset": 12,
          "min": [-0.5999375581741333, -1.0, -0.20496876537799836],
          "max": [0.6073125004768372, 0.7750312685966492, 0.8280937671661377]
        },
        {
          "bufferView": 1,
          "type": "VEC2",
          "componentType": 5126,
          "count": 15,
          "byteOffset": 24,
          "min": [0.0, 0.0],
          "max": [1.0, 1.0]
        }],
        "bufferViews": [{
          "buffer": 0,
          "byteOffset": 0,
          "byteLength": 36,
          "target": 34963
        },
        {
          "buffer": 0,
          "byteOffset": 36,
          "byteLength": 480,
          "target": 34962,
          "byteStride": 32
        }],
        "buffers": [{
          "uri": "data:application/octet-stream;base64,DAAOAAsADQAMAAsACgAJAAgABwADAAYAAQACAAUAAAABAAQAwq2jwojzwMHEEfVCx0uLPvp+CT9OYkw/zMxMPwAAAD+M9gS+iPPAwaJevUJCYGU6+n4PP/T9Uz8AAAA/zMxMPsKto0KI88DBxBH1Qn9qir53vgo/LrJLP8zMTD4AAAA/Gmdhv4jzwMHEEfXC1XgbP9Z4RD9V41G+AAAAP8zMTD8A6+s+iPPAQQIfeEJCYGU6+n4PP/T9Uz8AAIA/AAAAAADr6z6I88BBAh94QkJgZTr6fg8/9P1TPwAAAAAAAAAAAOvrPojzwEECH3hC1XgbP9Z4RD9V41G+AAAAAAAAgD/CraNCiPPAwcQR9ULVeBs/1nhEP1XjUb7MzEw+AAAAPwDr6z6I88BBAh94QoKVGb9zaEY/q/FKvgAAgD8AAIA/wq2jwojzwMHEEfVCgpUZv3NoRj+r8Uq+zMxMPwAAAD8aZ2G/iPPAwcQR9cKClRm/c2hGP6vxSr4AAAA/zMxMPxpnYb+I88DBxBH1wgAAAAAAAIC/AAAAAAAAAAAAAAAAjPYEvojzwMGiXr1CAAAAAAAAgL8AAAAAAACAPwAAgD/CraNCiPPAwcQR9UIAAAAAAACAvwAAAAAAAAAAAACAP8Kto8KI88DBxBH1QgAAAAAAAIC/AAAAAAAAgD8AAAAA",
          "byteLength": 516
        }],
        "materials": [{
          "pbrMetallicRoughness": {
            "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
            "metallicFactor": 1.0,
            "roughnessFactor": 1.0
          },
          "emissiveFactor": [0.0, 0.0, 0.0],
          "alphaMode": "OPAQUE",
          "doubleSided": false,
          "name": "default"
        }]
      }),
      scale: 1,
      minimumPixelSize: 48,
      maximumScale: 32,
      color: Cesium.Color.fromCssColorString("#43ABFF").withAlpha(0.9),
      colorBlendMode: Cesium.ColorBlendMode.REPLACE,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
        Cesium.Cartesian3.fromDegrees(longitude, latitude, endHeight),
        new Cesium.HeadingPitchRoll(-Math.PI/2, Math.PI/2, 0)
      )
    }
  });
};

// 修改删除逻辑
const removeTakeoffPoint = () => {
  const takeoffEntity = getCustomSource("waylines-create")?.entities.getById("takeoff");
  const takeoffLabelEntity = getCustomSource("waylines-create")?.entities.getById("takeoff-label");
  const arrowPrimitive = (getCustomSource("waylines-create") as any).arrowPrimitive;

  if (takeoffEntity) {
    getCustomSource("waylines-create")?.entities.remove(takeoffEntity);
  }
  if (takeoffLabelEntity) {
    getCustomSource("waylines-create")?.entities.remove(takeoffLabelEntity);
  }
  if (arrowPrimitive) {
    viewer.scene.primitives.remove(arrowPrimitive);
    (getCustomSource("waylines-create") as any).arrowPrimitive = undefined;
  }
};

// 点击机场设置起飞点
export const useSetTakeOffPoint = (height?: number) => {
  useAddEventListener((longitude, latitude, pickedObject) => {
    if (pickedObject && pickedObject.id._id.includes("dock")) {
      removeTakeoffPoint();
      addTakeOffPoint({
        longitude,
        latitude,
        height: 0,
        endHeight: 120
      });
    }
  });
};

// 主动设置起飞点，参数为垂直线的高度，建议用全局高度
export const useManuallySetTakeOffPoint = (endHeight: number) => {
  const [takeoffPoint, setTakeOffPoint] = useState<{
    longitude: number,
    latitude: number,
    height: number
  } | null>(null);
  const onSetTakeoffPoint = () => pickPosition(({longitude, latitude, height}) => {
    removeTakeoffPoint();
    addTakeOffPoint({
      longitude,
      latitude,
      height,
      endHeight
    });
    setTakeOffPoint({longitude, latitude, height});
    clearPickPosition();
  });

  return {takeoffPoint, onSetTakeoffPoint};
};
