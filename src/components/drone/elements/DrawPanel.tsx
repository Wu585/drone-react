import {pickPosition} from "@/components/toolbar/tools";
import {ElementParam, generateLabelConfig, useElementActions, useElementsGroup} from "@/hooks/drone/elements";
import {uuidv4} from "@/lib/utils.ts";
import {MapElementEnum} from "@/types/map.ts";
import {toast} from "@/components/ui/use-toast.ts";
import {useCallback, useEffect, useRef} from "react";
import {clearPickPosition} from "@/components/toolbar/tools/pickPosition.ts";
import {useDrawLine} from "@/components/toolbar/tools/drawLine.ts";
import {useDrawPolygon} from "@/components/toolbar/tools/drawPolygon.ts";
import {CircleResult, useDrawCircle} from "@/components/toolbar/tools/drawCircleEle.ts";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import dayjs from "dayjs";
import * as turf from "@turf/turf";
import {Circle, DiamondIcon, Spline, Square} from "lucide-react";

interface Props {
  groupId: string;
  onSuccess?: () => void;
}

const DrawPanel = ({groupId, onSuccess}: Props) => {
  const departId = localStorage.getItem("departId");
  const {addElement} = useElementActions();
  const {data: groups} = useElementsGroup(departId ? +departId : undefined);
  // 使用 ref 来保存最新的 groupId
  const groupIdRef = useRef(groupId);
  // 更新 ref
  useEffect(() => {
    groupIdRef.current = groupId;
  }, [groupId]);

  // 清理上一次的事件监听
  useEffect(() => {
    return () => {
      clearPickPosition();
    };
  }, []);

  useEffect(() => {
    const elementsSource = getCustomSource("elements");
    console.log("elementsSource==");
    console.log(elementsSource);
    if (!groups || !elementsSource) return;
    console.log("remove all===");
    // 清理现有实体
    elementsSource.entities.removeAll();

    groups.forEach(group => {
      group.elements.forEach(element => {
        if (!element.visual) return;
        const entity = elementsSource.entities.getById(element.id);
        if (!entity) {
          switch (element.resource.type) {
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
                    color: Cesium.Color.fromCssColorString(element.resource.content.properties.color).withAlpha(0.6),
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
                      context.fillStyle = element.resource.content.properties.color;
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
                  hierarchy: Cesium.Cartesian3.fromDegreesArray(element.resource.content.geometry.coordinates.flat(2)),
                  material: Cesium.Color.fromCssColorString(element.resource.content.properties.color).withAlpha(0.5),
                  outline: true,
                  outlineColor: Cesium.Color.fromCssColorString(element.resource.content.properties.color),
                },
                label: generateLabelConfig(`${element.name}\n面积：${area.toFixed(2)} ㎡`)
              });
              break;
            }
            case MapElementEnum.CIRCLE: {
              elementsSource.entities.add({
                id: element.id,
                position: Cesium.Cartesian3.fromDegrees(...element.resource.content.geometry.coordinates),
                ellipse: {
                  semiMinorAxis: element.resource.content.geometry.radius,
                  semiMajorAxis: element.resource.content.geometry.radius,
                  material: Cesium.Color.fromCssColorString(element.resource.content.properties.color).withAlpha(0.5),
                  outline: true,
                  outlineColor: Cesium.Color.fromCssColorString(element.resource.content.properties.color),
                },
                label: generateLabelConfig(`${element.name}\n半径：${element.resource.content.geometry.radius}m\n面积：${(3.14 * element.resource.content.geometry.radius! * element.resource.content.geometry.radius!).toFixed(2)}㎡`)
              });
              break;
            }
          }
        }
      });
    });

    // 组件卸载时清理所有实体
    return () => {
      const source = getCustomSource("elements");
      source?.entities.removeAll();
    };
  }, [groups]);

  const handlePickPosition = useCallback(async ({longitude, latitude, height}: {
    longitude: number,
    latitude: number,
    height: number
  }) => {
    const id = uuidv4();
    const geojsonParam: ElementParam = {
      id,
      name: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      resource: {
        content: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude, height]
          },
          properties: {
            clampToGround: false,
            color: "#2D8CF0"
          }
        },
        type: MapElementEnum.PIN
      }
    };

    try {
      // 使用 ref 中的值而不是闭包中的 groupId
      await addElement(groupIdRef.current, geojsonParam);
      clearPickPosition();
      onSuccess?.();
    } catch (err: any) {
      toast({
        description: err.data.message || "添加失败",
        variant: "destructive"
      });
    }
  }, [addElement, onSuccess]); // 移除 groupId 依赖，因为我们使用 ref

  const onDrawPoint = useCallback(() => {
    if (!groupIdRef.current) {
      return toast({
        description: "请选择层级",
        variant: "destructive"
      });
    }
    pickPosition(handlePickPosition);
  }, [handlePickPosition]);

  const {startDraw} = useDrawLine(useCallback(async (positions) => {
    const id = uuidv4();
    const geojsonParam: ElementParam = {
      id,
      name: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      resource: {
        content: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: positions.map(pos => [pos.longitude, pos.latitude, pos.height])
          },
          properties: {
            clampToGround: false,
            color: "#2D8CF0"
          }
        },
        type: MapElementEnum.LINE
      }
    };

    try {
      await addElement(groupIdRef.current, geojsonParam);
      onSuccess?.();
    } catch (err: any) {
      toast({
        description: err.data.message || "添加失败",
        variant: "destructive"
      });
    }
  }, [addElement, onSuccess]));

  const onDrawLine = useCallback(() => {
    if (!groupIdRef.current) {
      return toast({
        description: "请选择层级",
        variant: "destructive"
      });
    }
    startDraw();
  }, [startDraw]);

  const {startDraw: startDrawPolygon} = useDrawPolygon(useCallback(async (positions) => {
    const id = uuidv4();
    const geojsonParam: ElementParam = {
      id,
      name: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      resource: {
        content: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [positions.map(pos => [pos.longitude, pos.latitude, pos.height])]
          },
          properties: {
            clampToGround: false,
            color: "#2D8CF0"
          }
        },
        type: MapElementEnum.POLY
      }
    };

    try {
      await addElement(groupIdRef.current, geojsonParam);
      onSuccess?.();
    } catch (err: any) {
      toast({
        description: err.data.message || "添加失败",
        variant: "destructive"
      });
    }
  }, [addElement, onSuccess]));

  const onDrawPolygon = useCallback(() => {
    if (!groupIdRef.current) {
      return toast({
        description: "请选择层级",
        variant: "destructive"
      });
    }
    startDrawPolygon();
  }, [startDrawPolygon]);

  const {startDraw: startDrawCircle} = useDrawCircle(useCallback(async ({center, radius}: CircleResult) => {
    const id = uuidv4();
    const geojsonParam: ElementParam = {
      id,
      name: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      resource: {
        content: {
          type: "Feature",
          geometry: {
            type: "Circle",
            coordinates: [center.longitude, center.latitude, center.height],
            radius: +radius.toFixed(2)
          },
          properties: {
            clampToGround: false,
            color: "#2D8CF0"
          }
        },
        type: MapElementEnum.CIRCLE
      }
    };
    try {
      await addElement(groupIdRef.current, geojsonParam);
      onSuccess?.();
    } catch (err: any) {
      toast({
        description: err.data.message || "添加失败",
        variant: "destructive"
      });
    }
  }, [addElement, onSuccess]));

  const onDrawCircle = () => {
    if (!groupIdRef.current) {
      return toast({
        description: "请选择层级",
        variant: "destructive"
      });
    }
    startDrawCircle();
  };

  return (
    <div className="text-white bg-[#0A81E1]/80 rounded p-2 space-y-2">
      <DiamondIcon
        className="cursor-pointer hover:bg-white/50 p-2 rounded"
        onClick={onDrawPoint}
        size={30}
      />
      <Spline
        className="cursor-pointer hover:bg-white/50 p-2 rounded"
        onClick={onDrawLine}
        size={30}
      />
      <Square
        className="cursor-pointer hover:bg-white/50 p-2 rounded"
        onClick={onDrawPolygon}
        size={30}
      />
      <Circle
        className="cursor-pointer hover:bg-white/50 p-2 rounded"
        onClick={onDrawCircle}
        size={30}
      />
    </div>
  );
};

export default DrawPanel;

