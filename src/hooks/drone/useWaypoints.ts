import {useState, useCallback, useEffect} from 'react';
import {WayPoint} from '@/types/waypoint';

interface WaylineData {
  route_point_list: Array<{
    route_point_index: number;
    longitude: number;
    latitude: number;
    actions: Array<{
      action_index: number;
      action_actuator_func: string;
      gimbal_pitch_rotate_angle?: number;
      zoom?: number;
      use_global_image_format?: number;
      hover_time?: number;
    }>;
  }>;
  global_height: number;
  auto_flight_speed: number;
}

export const useWaypoints = (viewer: any, waylineData?: WaylineData) => {
  const [waypoints, setWaypoints] = useState<WayPoint[]>([]);
  const [selectedWaypointId, setSelectedWaypointId] = useState<number | null>(null);

  // 初始化航点数据
  useEffect(() => {
    if (!waylineData || !viewer) return;

    const initialWaypoints = waylineData.route_point_list.map((point, index) => {
      // 创建航点图标
      const waypointEntity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          point.longitude, 
          point.latitude, 
          waylineData.global_height
        ),
        billboard: {
          image: (() => {
            const canvas = document.createElement("canvas");
            canvas.width = 32;
            canvas.height = 32;
            const context = canvas.getContext("2d");
            if (context) {
              context.beginPath();
              context.moveTo(16, 28);
              context.lineTo(4, 4);
              context.lineTo(28, 4);
              context.closePath();
              context.fillStyle = "#4CAF50";
              context.fill();

              context.font = "bold 16px Arial";
              context.fillStyle = "white";
              context.textAlign = "center";
              context.textBaseline = "middle";
              context.fillText((index + 1).toString(), 16, 14);
            }
            return canvas;
          })(),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          width: 32,
          height: 32,
          color: Cesium.Color.WHITE
        }
      });

      // 创建垂直虚线
      const verticalLineEntity = viewer.entities.add({
        polyline: {
          positions: [
            Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, 0),
            Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, waylineData.global_height)
          ],
          width: 2,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8),
            dashLength: 8.0
          })
        }
      });

      // 转换动作数据
      const actions = point.actions.map(action => {
        switch (action.action_actuator_func) {
          case 'gimbalRotate':
            return {
              type: '云台俯仰',
              param: action.gimbal_pitch_rotate_angle
            };
          case 'zoom':
            return {
              type: '变焦',
              param: action.zoom
            };
          case 'hover':
            return {
              type: '悬停',
              param: action.hover_time
            };
          case 'takePhoto':
            return {
              type: '拍照'
            };
          case 'startRecord':
            return {
              type: '开始录像'
            };
          case 'stopRecord':
            return {
              type: '停止录像'
            };
          default:
            return null;
        }
      }).filter(Boolean);

      return {
        id: index + 1,
        longitude: point.longitude,
        latitude: point.latitude,
        height: waylineData.global_height,
        speed: waylineData.auto_flight_speed,
        useGlobalHeight: true,
        useGlobalSpeed: true,
        actions,
        entity: {
          point: waypointEntity,
          verticalLine: verticalLineEntity,
          connectLine: null
        }
      };
    });

    setWaypoints(initialWaypoints);
    
    // 初始化完成后更新航线路径
    updateWaylinePath(initialWaypoints);
  }, [waylineData, viewer]);

  // 处理航点高亮
  const handleWaypointHighlight = useCallback((waypoint: WayPoint, isHighlight: boolean) => {
    if (waypoint.entity?.point) {
      waypoint.entity.point.billboard.color = isHighlight ? 
        Cesium.Color.YELLOW : 
        Cesium.Color.WHITE;
      
      waypoint.entity.verticalLine.material = new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.fromCssColorString(isHighlight ? "#FFFF00" : "#4CAF50").withAlpha(0.8),
        dashLength: 8.0
      });
    }
  }, []);

  // 选中航点
  const selectWaypoint = useCallback((waypoint: WayPoint | null) => {
    // 取消之前选中的航点高亮
    if (selectedWaypointId) {
      const prevWaypoint = waypoints.find(wp => wp.id === selectedWaypointId);
      if (prevWaypoint) {
        handleWaypointHighlight(prevWaypoint, false);
      }
    }

    // 设置新选中的航点
    if (waypoint) {
      setSelectedWaypointId(waypoint.id);
      handleWaypointHighlight(waypoint, true);
    } else {
      setSelectedWaypointId(null);
    }
  }, [selectedWaypointId, waypoints, handleWaypointHighlight]);

  // 添加航点
  const addWaypoint = useCallback((position: Position, afterId: number) => {
    // ... 添加航点的逻辑
  }, [waypoints, selectWaypoint]);

  // 删除航点
  const deleteWaypoint = useCallback((waypoint: WayPoint) => {
    // ... 删除航点的逻辑
  }, [waypoints, selectedWaypointId]);

  // 更新航线路径
  const updateWaylinePath = useCallback((waypoints: WayPoint[]) => {
    // ... 更新航线路径的逻辑
  }, []);

  return {
    waypoints,
    selectedWaypointId,
    selectWaypoint,
    addWaypoint,
    deleteWaypoint,
    updateWaylinePath
  };
}; 