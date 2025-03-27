// 查询分组
import {useAjax} from "@/lib/http.ts";
import useSWR from "swr";
import {ELocalStorageKey} from "@/types/enum.ts";
import {MapElementEnum} from "@/types/map.ts";
import {useEffect} from "react";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import * as turf from "@turf/turf";

const PREFIX = "/map/api/v1";
const workspace_id = localStorage.getItem(ELocalStorageKey.WorkspaceId);

export interface Element {
  id: string;
  name: string;
  visual: boolean;
  resource: {
    type: number;
    content: {
      type: string;
      properties: {
        color: string;
        clampToGround: boolean;
      };
      geometry: {
        type: string;
        coordinates: number[];
        radius?: number
      };
    };
    user_name: string;
  };
  create_time: number;
  update_time: number;
}

export interface Layer {
  id: string;
  name: string;
  type: number;
  elements: Element[];
  parent_id: string;
  is_lock: boolean;
}

export const useElementsGroup = () => {
  const {get} = useAjax();
  const url = `${PREFIX}/workspaces/` + workspace_id + "/element-groups";
  return useSWR(url, async (path) => (await get<Resource<Layer[]>>(path)).data.data);
};

export const useElementsGroupActions = () => {
  const {post, delete: deleteClient} = useAjax();
  const addGroup = (body: { name: string, parent_id: string }) =>
    post(`${PREFIX}/workspaces/${workspace_id}/element-groups/add`, body);

  const updateGroup = (body: { group_id: string, name: string }) =>
    post(`${PREFIX}/workspaces/${workspace_id}/element-groups/update`, body);

  const deleteGroup = (group_id: string) =>
    deleteClient(`${PREFIX}/workspaces/${workspace_id}/element-groups/${group_id}/elements`);

  return {
    addGroup,
    updateGroup,
    deleteGroup
  };
};

export interface Coordinates {
  type: "Point" | "LineString" | "Polygon" | "MultiPoint" | "MultiLineString" | "MultiPolygon" | "GeometryCollection" | "Circle";
  coordinates: number[] | number[][] | number[][][] | number[][][][];
  radius?: number;
}

export interface GeoJsonFeature {
  type: "Feature";
  properties: Record<string, any>;
  geometry: Coordinates;
}

export interface ElementParam {
  id: string;
  name: string;
  resource: {
    content: {
      type: "Feature"
      geometry: Coordinates
      properties: {
        clampToGround: boolean
        color: string
      }
    }
    type: MapElementEnum
  };
}

export const useElementActions = () => {
  const {post, put, delete: deleteClient} = useAjax();

  const addElement = (groupId: string, geometry: ElementParam) =>
    post(`${PREFIX}/workspaces/${workspace_id}/element-groups/${groupId}/elements`, geometry as any);

  const deleteElement = (elementId: string) =>
    deleteClient(`${PREFIX}/workspaces/${workspace_id}/elements/${elementId}`);

  const updateElement = (elementId: string, geometry: {
    name: string
    content: {
      type: "Feature"
      geometry: Coordinates
      properties: {
        clampToGround: boolean
        color: string
      }
    }
  }) =>
    put(`${PREFIX}/workspaces/${workspace_id}/elements/${elementId}`, geometry as any);

  const updateElementVisible = (groupId: string, elementId: string, visible: boolean) =>
    post(`${PREFIX}/workspaces/${workspace_id}/element-groups/${groupId}/setVisual`, {
      element_id: elementId,
      visual: visible
    });

  return {
    addElement,
    deleteElement,
    updateElement,
    updateElementVisible
  };
};

export const generateLabelConfig = (text: string) => ({
  text,
  font: "14px sans-serif",
  fillColor: Cesium.Color.BLACK,
  outlineColor: Cesium.Color.WHITE,
  outlineWidth: 3,
  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
  verticalOrigin: Cesium.VerticalOrigin.CENTER,
  horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
  pixelOffset: new Cesium.Cartesian2(10, 0),
});

// 初始化所有显示的标签
export const useAddAllElements = () => {
  const {data: groups} = useElementsGroup();

  useEffect(() => {
    const elementsSource = getCustomSource("elements");
    if (!groups || !elementsSource) return;

    console.log("elementsSource");
    console.log(elementsSource);
    groups.forEach(group => {
      group.elements.forEach(element => {
        const entity = elementsSource.entities.getById(element.id);
        if (!entity) {
          switch (element.resource.type) {
            case MapElementEnum.LINE: {
              const coordinates = element.resource.content.geometry.coordinates;

              // 创建线段实体
              elementsSource.entities.add({
                id: element.id,
                polyline: {
                  positions: Cesium.Cartesian3.fromDegreesArray(coordinates.flat()),
                  width: 2,
                  material: Cesium.Color.fromCssColorString(element.resource.content.properties.color),
                }
              });

              // 为每段线段添加标签
              for (let i = 0; i < coordinates.length - 1; i++) {
                const point1 = turf.point(coordinates[i]);
                const point2 = turf.point(coordinates[i + 1]);

                // 计算中点
                const midpoint = turf.midpoint(point1, point2);

                // 计算这段线段的距离
                const distance = turf.distance(point1, point2, {units: "meters"});

                // 在中点添加标签
                elementsSource.entities.add({
                  id: `${element.id}_label_${i}`,
                  position: Cesium.Cartesian3.fromDegrees(
                    midpoint.geometry.coordinates[0],
                    midpoint.geometry.coordinates[1],
                    coordinates[i][2]  // 使用第一个点的高度
                  ),
                  label: generateLabelConfig(
                    i === 0
                      ? `${element.name}\n${distance.toFixed(2)}m`
                      : `${distance.toFixed(2)}m`
                  )
                });
              }
              break;
            }
            case MapElementEnum.POLY: {
              const coordinates = element.resource.content.geometry.coordinates;
              const feature = turf.points(coordinates[0]);
              const center = turf.center(feature);
              const polygon = turf.polygon([[...coordinates.flat(), coordinates.flat()[0]]]);
              const area = turf.area(polygon);
              elementsSource.entities.add({
                id: element.id,
                position: Cesium.Cartesian3.fromDegrees(...center.geometry.coordinates),
                polygon: {
                  hierarchy: Cesium.Cartesian3.fromDegreesArray(
                    element.resource.content.geometry.coordinates.flat(2)
                  ),
                  material: Cesium.Color.fromCssColorString(element.resource.content.properties.color).withAlpha(0.5),
                  outline: true,
                  outlineColor: Cesium.Color.fromCssColorString(element.resource.content.properties.color),
                },
                label: generateLabelConfig(`${element.name}\n面积：${area.toFixed(2)} ㎡`)
              });
              break;
            }
            case MapElementEnum.CIRCLE:
              elementsSource.entities.add({
                id: element.id,
                position: Cesium.Cartesian3.fromDegrees(...element.resource.content.geometry.coordinates),
                ellipse: {
                  semiMinorAxis: element.resource.content.geometry.radius,
                  semiMajorAxis: element.resource.content.geometry.radius,
                  material: Cesium.Color.fromCssColorString("#2D8CF0").withAlpha(0.5),
                  outline: true,
                  outlineColor: Cesium.Color.fromCssColorString("#2D8CF0"),
                },
                label: generateLabelConfig(`${element.name}\n半径：${element.resource.content.geometry.radius}m`)
              });
              break;
            case MapElementEnum.PIN: {
              const coordinates = element.resource.content.geometry.coordinates;
              elementsSource.entities.add({
                id: element.id,
                position: Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2] + 5),
                label: generateLabelConfig(element.name),
                polyline: {
                  positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                    coordinates[0], coordinates[1], 0,  // 地面点
                    coordinates[0], coordinates[1], coordinates[2] + 5  // 标记点
                  ]),
                  width: 1,
                  material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.fromCssColorString("#2D8CF0").withAlpha(0.6),
                    dashLength: 8
                  })
                },
                billboard: {
                  image: (() => {
                    // 创建一个 canvas 来绘制菱形
                    const canvas = document.createElement("canvas");
                    canvas.width = 16;
                    canvas.height = 16;
                    const context = canvas.getContext("2d");
                    if (context) {
                      // 开始绘制菱形
                      context.beginPath();
                      // 移动到顶点
                      context.moveTo(8, 0);
                      // 绘制右边
                      context.lineTo(16, 8);
                      // 绘制底边
                      context.lineTo(8, 16);
                      // 绘制左边
                      context.lineTo(0, 8);
                      // 闭合路径
                      context.closePath();

                      // 填充颜色
                      context.fillStyle = "#2D8CF0";
                      context.fill();
                    }
                    return canvas;
                  })(),
                  verticalOrigin: Cesium.VerticalOrigin.CENTER,
                  horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                  width: 16,
                  height: 32
                }
              });
              break;
            }
          }
        }
      });
    });
  }, [groups]);
};

// 根据经纬度计算两点之间的直线距离
export function two_points_distance(start_point: [number, number], end_point: [number, number]): number {
  // 经纬度转换为世界坐标，高度默认为0
  const start_position = Cesium.Cartesian3.fromDegrees(start_point[0], start_point[1], 0);
  const end_position = Cesium.Cartesian3.fromDegrees(end_point[0], end_point[1], 0);
  // 返回两个坐标的距离（单位：米）
  return Cesium.Cartesian3.distance(start_position, end_position);
}

// 计算多个点之间的总距离
export const calcManyPointsDistance = (coordinates: [number, number][]): number => {
  if (coordinates.length < 2) return 0;

  let totalDistance = 0;

  // 遍历相邻的点对，计算它们之间的距离并累加
  for (let i = 0; i < coordinates.length - 1; i++) {
    const startPoint = coordinates[i];
    const endPoint = coordinates[i + 1];
    console.log("startPoint endpoint");
    console.log(startPoint, endPoint);
    // 使用之前定义的两点距离计算函数
    const distance = two_points_distance(startPoint, endPoint);
    totalDistance += distance;
  }

  // 返回总距离，保留两位小数
  return Number(totalDistance.toFixed(2));
};

// 计算多边形面积
export const calcPolygonArea = (coordinates: [number, number][]): number => {
  if (coordinates.length < 3) return 0;

  // 创建一个闭合的多边形（确保首尾相连）
  const closedCoords = [...coordinates, coordinates[0]];

  // 将经纬度坐标转换为笛卡尔坐标
  const positions = closedCoords.map(coord =>
    Cesium.Cartesian3.fromDegrees(coord[0], coord[1], 0)
  );

  // 计算面积
  let area = 0;
  const center = Cesium.Cartesian3.fromDegrees(
    coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length,
    coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length,
    0
  );

  // 使用三角剖分计算面积
  for (let i = 0; i < positions.length - 1; i++) {
    const p1 = positions[i];
    const p2 = positions[i + 1];

    // 计算三角形面积
    const triangleArea = Cesium.Cartesian3.magnitude(
      Cesium.Cartesian3.cross(
        Cesium.Cartesian3.subtract(p1, center, new Cesium.Cartesian3()),
        Cesium.Cartesian3.subtract(p2, center, new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      )
    ) / 2;

    area += triangleArea;
  }

  // 返回面积（平方米），保留两位小数
  return Number(area.toFixed(2));
};

export const deleteElementById = (id: string) => {
  const elementsSource = getCustomSource("elements");
  if (!elementsSource) return;

  // 删除主实体
  const entity = elementsSource.entities.getById(id);
  if (entity) {
    elementsSource.entities.remove(entity);

    // 如果是线实体，需要删除所有相关的标签实体
    if (entity.polyline) {
      let index = 0;

      let labelEntity;
      // 循环删除所有相关的标签实体
      while ((labelEntity = elementsSource.entities.getById(`${id}_label_${index}`))) {
        elementsSource.entities.remove(labelEntity);
        index++;
      }
    }
  }
};

export const toggleVisibleElementById = (id: string, visible: boolean) => {
  const elementsSource = getCustomSource("elements");
  if (!elementsSource) return;

  const entity = elementsSource.entities.getById(id);
  if (entity) {
    entity.show = visible;

    if (entity.polyline) {
      let index = 0;

      let labelEntity;
      while ((labelEntity = elementsSource.entities.getById(`${id}_label_${index}`))) {
        labelEntity.show = visible;
        index++;
      }
    }
  }
};

export const changeColor = (id: string, color: string) => {
  const elementsSource = getCustomSource("elements");
  if (!elementsSource) return;

  const entity = elementsSource.entities.getById(id);
  if (entity) {
    // 根据实体类型更新颜色
    if (entity.billboard) {
      // 更新点标记颜色
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const context = canvas.getContext("2d");
      if (context) {
        context.beginPath();
        context.moveTo(8, 0);
        context.lineTo(16, 8);
        context.lineTo(8, 16);
        context.lineTo(0, 8);
        context.closePath();
        context.fillStyle = color;
        context.fill();
      }

      // 需要先移除旧的 billboard 再添加新的
      const oldBillboard = entity.billboard;
      entity.billboard = undefined;
      entity.billboard = {
        image: canvas,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        width: oldBillboard.width,
        height: oldBillboard.height
      };

      // 更新牵引线颜色
      if (entity.polyline) {
        entity.polyline.material = new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString(color).withAlpha(0.6),
          dashLength: 8
        });
      }
    } else if (entity.polyline) {
      // 更新线段颜色
      entity.polyline.material = Cesium.Color.fromCssColorString(color);

      // 更新所有相关标签的连接线颜色
      let index = 0;
      let labelEntity;
      while ((labelEntity = elementsSource.entities.getById(`${id}_label_${index}`))) {
        if (labelEntity.polyline) {
          labelEntity.polyline.material = new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString(color).withAlpha(0.6),
            dashLength: 8
          });
        }
        index++;
      }
    } else if (entity.polygon) {
      // 更新多边形颜色
      entity.polygon.material = Cesium.Color.fromCssColorString(color).withAlpha(0.5);
      entity.polygon.outlineColor = Cesium.Color.fromCssColorString(color);
    } else if (entity.ellipse) {
      // 更新圆形颜色
      entity.ellipse.material = Cesium.Color.fromCssColorString(color).withAlpha(0.5);
      entity.ellipse.outlineColor = Cesium.Color.fromCssColorString(color);
    }
  }
};
