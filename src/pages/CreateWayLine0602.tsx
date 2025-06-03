import {AlignJustify, ChevronLeft, Copy, Save, Trash2, XIcon} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {useState, useEffect, useMemo, useRef, useCallback} from "react";
import {pickPosition} from "@/components/toolbar/tools";
import {clearPickPosition} from "@/components/toolbar/tools/pickPosition.ts";
import {useRightClickPanel} from "@/components/drone/public/useRightClickPanel.tsx";
import {z} from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import {cn, uuidv4} from "@/lib/utils";
import {toast} from "@/components/ui/use-toast";
import pashengImage from "@/assets/images/drone/wayline/pasheng.svg";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useAjax} from "@/lib/http.ts";
import {Cascader, CascaderOption} from "@/components/ui/cascader.tsx";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Separator} from "@/components/ui/separator.tsx";
import {Slider} from "@/components/ui/slider.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {
  Dialog, DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {useWaylineById} from "@/hooks/drone";
import {
  addConnectLines,
  dynamicAddDroneModel,
  addLabelWithin, addPyramid, addTakeOffPoint,
  addWayPointWithIndex,
  removeDroneModel, removePyramid,
  removeTakeoffPoint, getHeading, calculateHeading, calculateDirection
} from "@/hooks/drone/wayline";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import MapChange from "@/components/drone/public/MapChange.tsx";
import Compass from "@/components/drone/public/Compass.tsx";
import {ImageFormat} from "@/hooks/drone";
import SceneMini from "@/components/drone/public/SceneMini.tsx";
import * as egm96 from "egm96-universal";
import {useSetViewByWaylineData} from "@/hooks/drone/wayline/useSetViewByWaylineData.ts";
import CreateWaylineScene from "@/components/drone/wayline/CreateWaylineScene.tsx";
import SearchPositionInput from "@/components/drone/SearchPositionInput.tsx";

interface WayPoint {
  id: string;
  longitude: number;
  latitude: number;
  height?: number;
  ellipsoid_height?: number;
  entity?: any;
  speed?: number;
  copyToAll?: boolean;
  copyToPoints?: boolean;
  useGlobalHeight?: boolean;
  useGlobalSpeed?: boolean;
  actions: Record<string, any>[];
}

interface DeviceOption extends CascaderOption {
  payloadEnumValue?: number;
  payloadPositionIndex?: number;
  children?: DeviceOption[];
}

const deviceData: DeviceOption[] = [
  {
    label: "经纬M30系列",
    value: 67,
    children: [
      {
        label: "Matrice 30",
        value: 0,
        payloadEnumValue: 52,
        payloadPositionIndex: 0
      },
      {
        label: "Matrice 30T",
        value: 1,
        payloadEnumValue: 53,
        payloadPositionIndex: 0
      },
    ]
  },
  {
    label: "经纬M4系列",
    value: 100,
    children: [
      {
        label: "Matrice 4D",
        value: 0,
        payloadEnumValue: 98,
        payloadPositionIndex: 0
      },
      {
        label: "Matrice 4TD",
        value: 1,
        payloadEnumValue: 99,
        payloadPositionIndex: 0
      },
    ]
  }
];

const actionList = [
  {
    name: "开始录像",
    func: "startRecord",
    isGlobal: true,
    param: ["zoom", "wide", "ir", "visable"]
  },
  {
    name: "停止录像",
    func: "stopRecord",
  },
  {
    name: "悬停",
    func: "hover",
    param: 5
  },
  {
    name: "飞行器偏航角",
    func: "rotateYaw",
    param: 0
  },
  {
    name: "云台偏航角",
    func: "gimbalRotate",
    type: "gimbal_yaw_rotate_angle",
    param: 0
  },
  {
    name: "云台俯仰角",
    func: "gimbalRotate",
    type: "gimbal_pitch_rotate_angle",
    param: 0
  },
  {
    name: "拍照",
    func: "takePhoto",
    isGlobal: true,
    param: ["zoom", "wide", "ir", "visable"]
  },
  {
    name: "变焦",
    func: "zoom",
    param: 5
  },
  {
    name: "全景拍照",
    func: "panoShot",
    isGlobal: true,
    param: ["zoom", "wide", "ir", "visable"]
  },
];

const formSchema = z.object({
  name: z.string().min(1, {
    message: "请输入航线名称"
  }),
  device: z.object({
    drone_type: z.coerce.number(),
    sub_drone_type: z.coerce.number(),
    payload_type: z.coerce.number(),
    payload_position: z.coerce.number()
  }),
  take_off_ref_point: z.string(),
  image_format: z.array(z.enum(["wide", "zoom", "ir", "visable"])).min(1, {
    message: "请至少选择一种拍照模式"
  }),
  fly_to_wayline_mode: z.enum(["safely", "pointToPoint"], {
    required_error: "请选择飞行模式",
    invalid_type_error: "请选择有效的飞行模式"
  }),
  global_height: z.coerce.number()
    .min(20, {message: "航线高度不能低于20米"})
    .max(1500, {message: "航线高度不能超过1500米"}),
  take_off_security_height: z.coerce.number()
    .min(2, {message: "安全起飞高度不能低于2米"})
    .max(1500, {message: "安全起飞高度不能超过1500米"}),
  // globalHeight: z.coerce.number(),
  auto_flight_speed: z.coerce.number()
    .min(1, {message: "全局航线速度不能小于1米/s"})
    .max(15, {message: "全局航线速度不能大于15米/s"}),
  global_transitional_speed: z.coerce.number()
    .min(1, {message: "起飞速度不能小于1米/s"})
    .max(15, {message: "起飞速度不能大于15米/s"}),
  global_waypoint_turn_mode: z.enum(["coordinateTurn", "toPointAndStopWithDiscontinuityCurvature",
    "toPointAndStopWithContinuityCurvature", "toPointAndPassWithContinuityCurvature"], {
    required_error: "请选择航点类型",
    invalid_type_error: "请选择有效的航点类型"
  }),
  gimbal_pitch_mode: z.enum(["manual", "usePointSetting"], {
    required_error: "请选择云台俯仰角控制模式",
    invalid_type_error: "请选择有效的云台俯仰角控制模式"
  }),
  finish_action: z.enum(["goHome", "noAction", "autoLand", "gotoFirstWaypoint"], {
    required_error: "请选择完成动作",
    invalid_type_error: "请选择有效的完成动作"
  }),
  waypoint_heading_mode: z.enum(["followWayline", "manually", "fixed"], {
    required_error: "请选择飞行器偏航角模式",
    invalid_type_error: "请选择有效的飞行器偏航角模式"
  }),
});

function isNumericString(str) {
  return !isNaN(str) && !isNaN(parseFloat(str));
}

const CreateWayLine0517 = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "";
  const {data: currentWaylineData} = useWaylineById(id || "");
  const [copyCheckedIds, setCopyCheckedIds] = useState<string[]>([]);
  // 航线距离和执行时间
  const [waylineInfo, setWaylineInfo] = useState({
    distance: 0,
    time: 0
  });

  // 初始化视角定位
  useSetViewByWaylineData(id);

  // 表单默认值
  const defaultValues: z.infer<typeof formSchema> = {
    device: {
      drone_type: 67,
      sub_drone_type: 1,
      payload_type: 53,
      payload_position: 0
    },
    take_off_ref_point: "",
    image_format: ["zoom", "wide", "ir"] as ImageFormat[],
    fly_to_wayline_mode: "safely",
    global_height: 120,
    take_off_security_height: 100,
    auto_flight_speed: 10,
    global_transitional_speed: 15,
    global_waypoint_turn_mode: "toPointAndStopWithDiscontinuityCurvature",
    gimbal_pitch_mode: "manual",
    finish_action: "goHome",
    waypoint_heading_mode: "followWayline",
    name: "新建航点航线"
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues, // 只在初始化时设置一次默认值
    values: currentWaylineData && {
      device: {
        drone_type: currentWaylineData.drone_type,
        sub_drone_type: currentWaylineData.sub_drone_type,
        payload_type: currentWaylineData.payload_type,
        payload_position: currentWaylineData.payload_position,
      },
      take_off_ref_point: currentWaylineData.take_off_ref_point,
      image_format: currentWaylineData.image_format?.split(",") as ImageFormat[],
      fly_to_wayline_mode: currentWaylineData.fly_to_wayline_mode,
      global_height: currentWaylineData.global_height,
      take_off_security_height: currentWaylineData.take_off_security_height,
      auto_flight_speed: currentWaylineData.auto_flight_speed,
      global_transitional_speed: currentWaylineData.global_transitional_speed,
      global_waypoint_turn_mode: currentWaylineData.waypoint_turn_req.waypoint_turn_mode,
      gimbal_pitch_mode: currentWaylineData.gimbal_pitch_mode,
      finish_action: currentWaylineData.finish_action,
      waypoint_heading_mode: currentWaylineData.waypoint_heading_req.waypoint_heading_mode,
      name: currentWaylineData.name,
    }
  });

  const {post} = useAjax();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [wayPointOpen, setWayPointOpen] = useState(false);
  const [takeoffPoint, setTakeoffPoint] = useState<{
    longitude: number;
    latitude: number;
    height: number;
  } | null>(null);
  const [waypoints, setWaypoints] = useState<WayPoint[]>([]);
  // 当前编辑的航点
  const [currentWayPoint, setCurrentWayPoint] = useState<WayPoint | null>(null);
  const currentWayPointIndex = waypoints.findIndex(point => point.id === currentWayPoint?.id);

  const [rightClickPosition, setRightClickPosition] = useState<{
    longitude: number;
    latitude: number;
    height: number;
  } | null>(null);
  const [selectedWaypointId, setSelectedWaypointId] = useState<number | null>(null);

  const globalHeight = +form.watch("global_height"); // 提供默认值
  const takeOffSecurityHeight = +form.watch("take_off_security_height");
  const fly_to_wayline_mode = form.watch("fly_to_wayline_mode");
  const waypoint_heading_mode = form.watch("waypoint_heading_mode");

  // 起飞点线段终点高度
  const takeoffPointEndHeight = useMemo(() => {
    if (fly_to_wayline_mode === "pointToPoint") {
      return takeOffSecurityHeight;
    } else {
      if ((waypoints.length > 0 && waypoints[0].useGlobalHeight) || waypoints.length === 0) {
        return takeOffSecurityHeight > globalHeight ? takeOffSecurityHeight : globalHeight;
      } else {
        return takeOffSecurityHeight > waypoints[0].height! ? takeOffSecurityHeight : waypoints[0].height!;
      }
    }
  }, [takeOffSecurityHeight, globalHeight, fly_to_wayline_mode, waypoints]);

  const onSetTakeoffPoint = () => {
    pickPosition(({longitude, latitude, height}) => {
      setTakeoffPoint({longitude, latitude, height});
      clearPickPosition();
    });
  };

  if (takeoffPoint) {
    form.setValue("take_off_ref_point", `${takeoffPoint.latitude},${takeoffPoint.longitude},${takeoffPoint.height}`);
  }

  // 点击选中某个航点图标
  useEffect(() => {
    const handler: any = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(() => {
      const selectedEntity: any = viewer.selectedEntity;
      if (!selectedEntity) return;
      const id = +selectedEntity.id + 1;
      setSelectedWaypointId(id);
      /*getCustomSource("waylines-create")?.entities.values.forEach(item => {
        if (item.billboard) {
          item.billboard.color = Cesium.Color.WHITE;
        }
      });
      const entity = getCustomSource("waylines-create")?.entities.getById(selectedEntity.id);
      if (entity && entity.billboard) {
        entity.billboard.color = Cesium.Color.YELLOW;
      }*/
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
    };
  }, [waypoints]);

  /* useEffect(() => {
     if (!selectedWaypointId) return;
     const waypoint = waypoints[selectedWaypointId - 1];
     if (waypoint) {
       const action1 = waypoint.actions?.find((action: any) => action.type === "gimbal_yaw_rotate_angle");
       const action2 = waypoint.actions?.find((action: any) => action.type === "gimbal_pitch_rotate_angle");
       setMiniSceneCameraHp({
         heading: action1 ? action1.param * (Math.PI / 180) : 0,
         pitch: action2 ? action2.param * (Math.PI / 180) : 0
       });
     }
   }, [selectedWaypointId, waypoints]);*/

  // 选中拖拽
  useEffect(() => {
    const modelDragHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    let canMove = false;
    modelDragHandler.setInputAction(({position}: { position: any }) => {
      const pick = viewer.scene.pick(position);
      canMove = pick && pick.id.id && isNumericString(pick.id.id);
      let endPosition: { longitude: number, latitude: number } | null = null;
      viewer.scene.screenSpaceCameraController.enableRotate = !canMove;
      const selectedEntity: any = viewer.selectedEntity;
      if (!selectedEntity) {
        return;
      } // 如果点击空白区域，则不往下执行
      modelDragHandler.setInputAction((arg: any) => {
        const position = arg.endPosition; // arg有startPosition与endPosition两个属性，即移动前后的位置信息：Cartesian2对象
        const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(position), viewer.scene); //将Cartesian2转为Cartesian3
        if (!selectedEntity) {
          return false;
        }
        if (cartesian && canMove) {
          const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);
          endPosition = {
            longitude,
            latitude
          };
          const height = waypoints[waypoints.length - 1].useGlobalHeight ? globalHeight : waypoints[waypoints.length - 1].height!;
          // 创建固定的位置引用
          const positions = [
            Cesium.Cartesian3.fromDegrees(longitude, latitude, 0),
            Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
          ];
          selectedEntity.position = new Cesium.CallbackProperty(() => positions[1], false);
          selectedEntity.polyline.positions = new Cesium.CallbackProperty(() => positions, false);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      modelDragHandler.setInputAction(() => { //为viewer绑定LEFT_UP事件监听器（执行函数，监听的事件）
        modelDragHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE); // 解除viewer的MOUSE_MOVE事件监听器
        modelDragHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP); // 解除viewer的LEFT_UP事件监听器
        viewer.scene.screenSpaceCameraController.enableRotate = true; // 取消相机锁定

        if (selectedEntity && endPosition) {
          const newWaypoints = [...waypoints];
          newWaypoints[selectedEntity.id].longitude = endPosition.longitude;
          newWaypoints[selectedEntity.id].latitude = endPosition.latitude;
          setWaypoints(newWaypoints);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_UP);

    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    return () => {
      modelDragHandler.destroy();
    };
  }, [globalHeight, waypoints]);

  const onDeleteWaypoint = (index: number) => {
    const newWaypoints = waypoints.filter((_, current_index) => index !== current_index);
    setWaypoints(newWaypoints);
    setSelectedWaypointId(newWaypoints.length);
  };

  // 棱锥顶点坐标以及指向
  const pyramidPositionRef = useRef<{
    position: {
      longitude: number
      latitude: number
      height: number
    }

    direction: {
      x: number
      y: number
      z: number
    }

    sideAndDistance: {
      side: number
      distance: number
    }
  } | null>(null);

  const onCameraChange = useCallback((direction: any) => {
    if (pyramidPositionRef.current) {
      pyramidPositionRef.current.direction.x = direction.x;
      pyramidPositionRef.current.direction.y = direction.y;
      pyramidPositionRef.current.direction.z = direction.z;
    }
  }, []);

  // 小窗口视角
  const [miniSceneCameraPosition, setMiniSceneCameraPosition] = useState<{
    longitude: number
    latitude: number
    height: number
  } | null>(null);

  const [miniSceneCameraHp, setMiniSceneCameraHp] = useState<{
    heading: number
    pitch: number
  } | undefined>(undefined);

  useEffect(() => {
    if (selectedWaypointId) {
      const currentWayPoint = waypoints[selectedWaypointId - 1];
      const height = currentWayPoint.useGlobalHeight ? globalHeight : currentWayPoint.height!;
      const {longitude, latitude} = currentWayPoint;
      setMiniSceneCameraPosition({longitude, latitude, height});
      // setMiniSceneCameraHp({
      //   heading: Cesium.Math.toRadians(30),
      //   pitch: 0
      // });
    } else if (takeoffPoint) {
      setMiniSceneCameraPosition({
        ...takeoffPoint,
        height: takeoffPointEndHeight
      });
    }
  }, [takeoffPoint, waypoints, globalHeight, takeoffPointEndHeight, selectedWaypointId]);

  // 无人机模型的坐标及偏航角参数
  const dronePositionRef = useRef<{
    longitude: number
    latitude: number
    height: number
    heading: number
  } | null>(null);

  useEffect(() => {
    const speed = 3; // 移动速度
    const rotateSpeed = 1.5; // 移动速度

    const handleKeyDown = (evt: KeyboardEvent) => {
      if (!dronePositionRef.current || !pyramidPositionRef.current) return;
      const topPosition = Cesium.Cartesian3.fromDegrees(
        pyramidPositionRef.current.position.longitude,
        pyramidPositionRef.current.position.latitude,
        pyramidPositionRef.current.position.height
      );
      switch (evt.code) {
        case "Space": {
          if (!takeoffPoint) return toast({
            description: "请先设置起飞点",
            variant: "destructive"
          });
          const globalSpeed = +form.getValues("auto_flight_speed");
          const currentPoint: WayPoint = {
            id: uuidv4(),
            longitude: dronePositionRef.current.longitude,
            latitude: dronePositionRef.current.latitude,
            height: globalHeight,
            speed: globalSpeed,
            actions: [],
            useGlobalHeight: true,
            useGlobalSpeed: true
          };
          const newWaypoints = [
            ...waypoints.slice(0, selectedWaypointId!),
            currentPoint,
            ...waypoints.slice(selectedWaypointId!)
          ];
          setWaypoints(newWaypoints);
          setSelectedWaypointId(selectedWaypointId! + 1);
          break;
        }
        case "KeyA": { // 左移
          const leftPosition = Cesium.Cartesian3.fromDegrees(
            pyramidPositionRef.current.position.longitude - 0.1,
            pyramidPositionRef.current.position.latitude,
            pyramidPositionRef.current.position.height
          );
          const direction = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(leftPosition, topPosition, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
          );
          const offset = Cesium.Cartesian3.multiplyByScalar(direction, speed, new Cesium.Cartesian3());
          const newPosition = Cesium.Cartesian3.add(topPosition, offset, new Cesium.Cartesian3());
          const cartographic = Cesium.Cartographic.fromCartesian(newPosition);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);
          const height = cartographic.height;
          pyramidPositionRef.current.position.longitude = dronePositionRef.current.longitude = longitude;
          pyramidPositionRef.current.position.latitude = dronePositionRef.current.latitude = latitude;
          pyramidPositionRef.current.position.height = dronePositionRef.current.height = height;
          setMiniSceneCameraPosition({
            longitude, latitude, height
          });
          break;
        }
        case "KeyD": { // 右移
          const rightPosition = Cesium.Cartesian3.fromDegrees(
            pyramidPositionRef.current.position.longitude + 0.1,
            pyramidPositionRef.current.position.latitude,
            pyramidPositionRef.current.position.height
          );
          const direction = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(rightPosition, topPosition, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
          );
          const offset = Cesium.Cartesian3.multiplyByScalar(direction, speed, new Cesium.Cartesian3());
          const newPosition = Cesium.Cartesian3.add(topPosition, offset, new Cesium.Cartesian3());
          const cartographic = Cesium.Cartographic.fromCartesian(newPosition);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);
          const height = cartographic.height;
          pyramidPositionRef.current.position.longitude = dronePositionRef.current.longitude = longitude;
          pyramidPositionRef.current.position.latitude = dronePositionRef.current.latitude = latitude;
          pyramidPositionRef.current.position.height = dronePositionRef.current.height = height;
          setMiniSceneCameraPosition({
            longitude, latitude, height
          });
          break;
        }
        case "KeyW": { // 前进
          const forwardPosition = Cesium.Cartesian3.fromDegrees(
            pyramidPositionRef.current.position.longitude,
            pyramidPositionRef.current.position.latitude + 0.1,
            pyramidPositionRef.current.position.height
          );
          const direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(forwardPosition, topPosition,
            new Cesium.Cartesian3()), new Cesium.Cartesian3()); // 直接使用朝向作为前进方向
          const offset = Cesium.Cartesian3.multiplyByScalar(direction, speed, new Cesium.Cartesian3());
          const newPosition = Cesium.Cartesian3.add(topPosition, offset, new Cesium.Cartesian3());
          const cartographic = Cesium.Cartographic.fromCartesian(newPosition);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);
          const height = cartographic.height;
          pyramidPositionRef.current.position.longitude = dronePositionRef.current.longitude = longitude;
          pyramidPositionRef.current.position.latitude = dronePositionRef.current.latitude = latitude;
          pyramidPositionRef.current.position.height = dronePositionRef.current.height = height;
          setMiniSceneCameraPosition({
            longitude, latitude, height
          });
          break;
        }
        case "KeyS": { // 后退
          const forwardPosition = Cesium.Cartesian3.fromDegrees(
            pyramidPositionRef.current.position.longitude,
            pyramidPositionRef.current.position.latitude + 0.1,
            pyramidPositionRef.current.position.height
          );
          const direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(forwardPosition, topPosition,
            new Cesium.Cartesian3()), new Cesium.Cartesian3());
          const backward = Cesium.Cartesian3.negate(direction, new Cesium.Cartesian3()); // 反向
          const offset = Cesium.Cartesian3.multiplyByScalar(backward, speed, new Cesium.Cartesian3());
          const newPosition = Cesium.Cartesian3.add(topPosition, offset, new Cesium.Cartesian3());
          const cartographic = Cesium.Cartographic.fromCartesian(newPosition);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);
          const height = cartographic.height;
          pyramidPositionRef.current.position.longitude = dronePositionRef.current.longitude = longitude;
          pyramidPositionRef.current.position.latitude = dronePositionRef.current.latitude = latitude;
          pyramidPositionRef.current.position.height = dronePositionRef.current.height = height;
          setMiniSceneCameraPosition({
            longitude, latitude, height
          });
          break;
        }
        case "KeyC": { // 升高
          // pyramidPositionRef.current.position.longitude = dronePositionRef.current.longitude = longitude;
          // pyramidPositionRef.current.position.latitude = dronePositionRef.current.latitude = latitude;
          pyramidPositionRef.current.position.height = dronePositionRef.current.height += 0.5;
          setMiniSceneCameraPosition({
            ...miniSceneCameraPosition, height: pyramidPositionRef.current.position.height
          });
          break;
        }
        case "KeyZ": { // 升高
          // pyramidPositionRef.current.position.longitude = dronePositionRef.current.longitude = longitude;
          // pyramidPositionRef.current.position.latitude = dronePositionRef.current.latitude = latitude;
          pyramidPositionRef.current.position.height = dronePositionRef.current.height -= 0.5;
          setMiniSceneCameraPosition({
            ...miniSceneCameraPosition, height: pyramidPositionRef.current.position.height
          });
          break;
        }
        case "KeyQ": { // 左旋转
          const oldHeading = dronePositionRef.current.heading || 0;
          dronePositionRef.current.heading = oldHeading - rotateSpeed;
          if (miniSceneCameraHp) {
            setMiniSceneCameraHp({
              ...miniSceneCameraHp,
              heading: miniSceneCameraHp.heading - Cesium.Math.toRadians(rotateSpeed)
            });
          }
          break;
        }
        case "KeyE": { // 右旋转
          const oldHeading = dronePositionRef.current.heading || 0;
          dronePositionRef.current.heading = oldHeading + rotateSpeed;
          if (miniSceneCameraHp) {
            setMiniSceneCameraHp({
              ...miniSceneCameraHp,
              heading: miniSceneCameraHp.heading + Cesium.Math.toRadians(rotateSpeed)
            });
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedWaypointId, takeoffPoint, globalHeight, form, waypoints, miniSceneCameraHp]);

  useEffect(() => {
    getCustomSource("waylines-update")?.entities.removeAll();
    getCustomSource("waylines-create")?.entities.removeAll();
    // 删除带数字polyline entity用的，不能放在额外的update source里面，会crash
    // https://github.com/CesiumGS/cesium/issues/7758
    // waypoints.forEach((_, index) => getCustomSource("waylines-create")?.entities.removeById(index.toString()));
    let distance = 0;
    if (!takeoffPoint) return;
    removeTakeoffPoint();
    addTakeOffPoint({
      ...takeoffPoint,
      endHeight: takeoffPointEndHeight
    });
    if (waypoints.length > 0) {
      const firstPointHeight = waypoints[0].useGlobalHeight ? globalHeight : waypoints[0].height;
      if (takeoffPointEndHeight > firstPointHeight!) {
        addConnectLines([takeoffPoint.longitude, takeoffPoint.latitude, takeoffPointEndHeight],
          [waypoints[0].longitude, waypoints[0].latitude, takeoffPointEndHeight]);
        distance += addLabelWithin([takeoffPoint.longitude, takeoffPoint.latitude, takeoffPointEndHeight],
          [waypoints[0].longitude, waypoints[0].latitude, takeoffPointEndHeight]);
        addConnectLines([waypoints[0].longitude, waypoints[0].latitude, takeoffPointEndHeight],
          [waypoints[0].longitude, waypoints[0].latitude, firstPointHeight!]);
        distance += addLabelWithin([waypoints[0].longitude, waypoints[0].latitude, takeoffPointEndHeight],
          [waypoints[0].longitude, waypoints[0].latitude, firstPointHeight!]);
      } else {
        if (fly_to_wayline_mode === "pointToPoint") {
          addConnectLines([takeoffPoint.longitude, takeoffPoint.latitude, takeoffPointEndHeight],
            [waypoints[0].longitude, waypoints[0].latitude, firstPointHeight!]);
          distance += addLabelWithin([takeoffPoint.longitude, takeoffPoint.latitude, takeoffPointEndHeight],
            [waypoints[0].longitude, waypoints[0].latitude, firstPointHeight!]);
        } else {
          addConnectLines([takeoffPoint.longitude, takeoffPoint.latitude, takeoffPointEndHeight],
            [waypoints[0].longitude, waypoints[0].latitude, takeoffPointEndHeight]);
          distance += addLabelWithin([takeoffPoint.longitude, takeoffPoint.latitude, takeoffPointEndHeight],
            [waypoints[0].longitude, waypoints[0].latitude, takeoffPointEndHeight]);
        }
      }
    }
    // 添加航点图标
    waypoints.forEach((item, index) => {
      addWayPointWithIndex({
        longitude: item.longitude,
        latitude: item.latitude,
        height: item.useGlobalHeight ? globalHeight : item.height!,
        text: index + 1,
        id: `${index}`
      });
      addLabelWithin([item.longitude, item.latitude, 0],
        [item.longitude, item.latitude, item.useGlobalHeight ? globalHeight : item.height!]);
    });
    // 添加连接线
    for (let i = 0; i < waypoints.length - 1; i++) {
      addConnectLines([waypoints[i].longitude, waypoints[i].latitude, waypoints[i].useGlobalHeight ? globalHeight : waypoints[i].height!],
        [waypoints[i + 1].longitude, waypoints[i + 1].latitude, waypoints[i + 1].useGlobalHeight ? globalHeight : waypoints[i + 1].height!]);
      distance += addLabelWithin([waypoints[i].longitude, waypoints[i].latitude, waypoints[i].useGlobalHeight ? globalHeight : waypoints[i].height!],
        [waypoints[i + 1].longitude, waypoints[i + 1].latitude, waypoints[i + 1].useGlobalHeight ? globalHeight : waypoints[i + 1].height!]);
    }
    setWaylineInfo(prevState => ({
      ...prevState,
      distance: +distance.toFixed(2)
    }));
  }, [waypoints, form, takeoffPoint, takeoffPointEndHeight, globalHeight, takeOffSecurityHeight, fly_to_wayline_mode]);

  const onZoomChange = (zoom: number) => {
    if (!pyramidPositionRef.current) return;
    // 线性映射公式: y = mx + b
    // zoom: 5 -> 20 映射到 side: 50 -> 20
    // m = (y2-y1)/(x2-x1) = (20-50)/(20-5) = -2
    // b = y1 - mx1 = 50 - (-2 * 5) = 60
    const side = -2 * zoom + 60;
    pyramidPositionRef.current.sideAndDistance.side = side;
    removePyramid();
    addPyramid(pyramidPositionRef.current);
  };

  const onChangeMode = (mode: string) => {
    if (mode === "zoom" && pyramidPositionRef.current && miniSceneCameraPosition) {
      const {position, direction, sideAndDistance} = pyramidPositionRef.current;
      const {longitude, latitude, height} = position;

      // 计算相机位置 - 降低高度到30米
      setMiniSceneCameraPosition({
        longitude,
        latitude,
        height: 30
      });

      // 计算相机朝向
      // 使用中心线的方向来计算heading
      const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
      const centerPosition = Cesium.Cartesian3.add(
        topPosition,
        Cesium.Cartesian3.multiplyByScalar(direction, sideAndDistance.distance, new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      );

      // 计算heading角度
      const cartographic = Cesium.Cartographic.fromCartesian(centerPosition);
      const centerLongitude = Cesium.Math.toDegrees(cartographic.longitude);
      const centerLatitude = Cesium.Math.toDegrees(cartographic.latitude);

      // 计算方位角
      const heading = Math.atan2(
        centerLongitude - longitude,
        centerLatitude - latitude
      );

      // 设置相机角度 - 添加一定的俯仰角以获得更好的视角
      setMiniSceneCameraHp({
        heading: heading,
        pitch: -0.3 // 约-17度的俯仰角
      });
    }
  };

  useEffect(() => {
    if (!takeoffPoint) return;
    // 只有起飞点 无航点
    if (waypoints.length === 0) {
      removePyramid();
      const {longitude, latitude} = takeoffPoint;
      const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, takeoffPointEndHeight);
      const forwardPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude + 0.1, takeoffPointEndHeight);  // 正北方向
      pyramidPositionRef.current = {
        position: {
          longitude: takeoffPoint.longitude,
          latitude: takeoffPoint.latitude,
          height: takeoffPointEndHeight,
        },
        direction: Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(forwardPosition, topPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3()),
        sideAndDistance: {
          side: 50,
          distance: 200
        }
      };
      addPyramid(pyramidPositionRef.current);
      removeDroneModel();
      dronePositionRef.current = {
        longitude, latitude, height: takeoffPointEndHeight, heading: 0
      };
      dynamicAddDroneModel(dronePositionRef.current);
    } else {
      if (!selectedWaypointId) return;
      const index = selectedWaypointId - 1;
      console.log('index');
      console.log(index);
      removePyramid();
      const longitude = waypoints[index].longitude;
      const latitude = waypoints[index].latitude;
      const height = waypoints[index].useGlobalHeight ? globalHeight : waypoints[index].height!;
      const heading = waypoints[index].actions?.find(action => action.func === "rotateYaw")?.param || 0;
      const gimbal_yaw_rotate_angle = waypoints[index].actions?.find(action => action.type === "gimbal_yaw_rotate_angle")?.param || 0;
      const gimbal_pitch_rotate_angle = waypoints[index].actions?.find(action => action.type === "gimbal_pitch_rotate_angle")?.param || 0;
      dronePositionRef.current = {
        longitude,
        latitude,
        height,
        heading
      };
      if (selectedWaypointId === 1) {
        const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        const forwardPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude + 0.1, height);  // 正北方向
        const direction = calculateDirection(gimbal_yaw_rotate_angle || 0, gimbal_pitch_rotate_angle || 0);
        console.log("direction");
        console.log(direction);
        pyramidPositionRef.current = {
          position: {
            longitude,
            latitude,
            height,
          },
          // direction: pyramidPositionRef.current?.direction || Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(forwardPosition, topPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3()),
          direction: Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(forwardPosition, topPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3()),
          sideAndDistance: {
            side: 50,
            distance: 200
          }
        };
        console.log(11111);
        setMiniSceneCameraHp({
          heading: Cesium.Math.toRadians(gimbal_yaw_rotate_angle || 0),
          pitch: Cesium.Math.toRadians(gimbal_pitch_rotate_angle || 0)
        });
      } else {
        // const pitch_rotate_angle =
        if (waypoint_heading_mode !== "followWayline") {
          // 视棱锥朝向朝北
          const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
          const forwardPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude + 0.1, height);  // 正北方向
          pyramidPositionRef.current = {
            position: {
              longitude,
              latitude,
              height,
            },
            // direction: pyramidPositionRef.current?.direction || Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(forwardPosition, topPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3()),
            direction: Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(forwardPosition, topPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3()),
            sideAndDistance: {
              side: 50,
              distance: 200
            }
          };
        } else {
          // 视棱锥朝向跟随航线
          const topPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
          const lastLongitude = waypoints[selectedWaypointId - 2].longitude;
          const lastLatitude = waypoints[selectedWaypointId - 2].latitude;
          // const lastPoiHeight = waypoints[selectedWaypointId - 2].height;
          const forwardPosition = Cesium.Cartesian3.fromDegrees(lastLongitude, lastLatitude, 0);
          // 计算方向向量（从forwardPosition指向topPosition）
          const directionVector = Cesium.Cartesian3.subtract(topPosition, forwardPosition, new Cesium.Cartesian3());
          // 归一化
          const direction = Cesium.Cartesian3.normalize(directionVector, new Cesium.Cartesian3());
          pyramidPositionRef.current = {
            position: {
              longitude,
              latitude,
              height,
            },
            // direction: pyramidPositionRef.current?.direction || Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(topPosition, forwardPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3()),
            direction,
            sideAndDistance: {
              side: 50,
              distance: 200
            }
          };
          dronePositionRef.current.heading = heading || calculateHeading({
            longitude: lastLongitude,
            latitude: lastLatitude
          }, {longitude, latitude});
          setMiniSceneCameraHp({
            heading: Cesium.Math.toRadians(gimbal_yaw_rotate_angle || dronePositionRef.current.heading),
            pitch: Cesium.Math.toRadians(gimbal_pitch_rotate_angle || 0)
          });
        }
      }
      addPyramid(pyramidPositionRef.current);
      removeDroneModel();
      dynamicAddDroneModel(dronePositionRef.current);
    }
  }, [takeoffPointEndHeight, takeoffPoint, globalHeight, waypoints, selectedWaypointId, waypoint_heading_mode]);

  const addWaypointAfter = (currentIndex: number) => {
    if (!takeoffPoint) return toast({
      description: "请先设置起飞点",
      variant: "destructive"
    });

    if (!rightClickPosition) return;
    const globalSpeed = form.getValues("auto_flight_speed");
    const currentPoint: WayPoint = {
      id: uuidv4(),
      longitude: rightClickPosition.longitude,
      latitude: rightClickPosition.latitude,
      height: globalHeight,
      speed: globalSpeed,
      actions: [],
      useGlobalHeight: true,
      useGlobalSpeed: true
    };
    const newWaypoints = [
      ...waypoints.slice(0, currentIndex),
      currentPoint,
      ...waypoints.slice(currentIndex)
    ];
    setWaypoints(newWaypoints);
    setSelectedWaypointId(currentIndex + 1);
  };

  const {RightClickPanel, MenuItem} = useRightClickPanel({
    containerId: "cesiumContainer",
    onRightClick: (movement) => {
      // 获取点击位置的坐标
      const cartesian = viewer.scene.pickPosition(movement.position);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;
        setRightClickPosition({longitude, latitude, height});
      }
    }
  });

  const onError = (errors: any) => {
    console.log(errors);
    if (errors.device) {
      toast({
        variant: "destructive",
        description: errors.device.drone_type?.message || "请选择飞行器"
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("提交的表单数据:", values);
    const route_point_list = waypoints.map((waypoint, index) => {
      return {
        route_point_index: index,
        longitude: waypoint.longitude,
        latitude: waypoint.latitude,
        height: !waypoint.useGlobalHeight && waypoint.height,
        ellipsoid_height: !waypoint.useGlobalHeight && egm96.egm96ToEllipsoid(waypoint.latitude, waypoint.longitude, waypoint.height!),
        speed: !waypoint.useGlobalSpeed && waypoint.speed,
        action_trigger_req: {
          action_trigger_type: "reach_point",
          // action_trigger_param: 5
        },
        actions: waypoint.actions?.map((action, index) => {
          const base = {
            action_index: index,
            action_actuator_func: action.func
          };
          if (action.func === "hover") {
            return {
              ...base,
              hover_time: action.param
            };
          }
          if (action.func === "rotateYaw") {
            return {
              ...base,
              aircraft_heading: action.param
            };
          }
          if (action.func === "gimbalRotate" && action.type && action.type === "gimbal_yaw_rotate_angle") {
            return {
              ...base,
              gimbal_yaw_rotate_angle: action.param
            };
          }
          if (action.func === "gimbalRotate" && action.type && action.type === "gimbal_pitch_rotate_angle") {
            return {
              ...base,
              gimbal_pitch_rotate_angle: action.param
            };
          }
          if (action.func === "takePhoto" || action.func === "startRecord" || action.func === "panoShot") {
            return action.isGlobal ? {
              ...base,
              use_global_image_format: 1,
              image_format: form.getValues("image_format").join(",")
            } : {
              ...base,
              use_global_image_format: 0,
              image_format: action.param.join(",")
            };
          }
          if (action.func === "zoom") {
            return {
              ...base,
              zoom: action.param * 24
            };
          }
          if (action.func === "stopRecord") {
            return {
              ...base,
            };
          }
        })
      };
    });
    const formValue = {
      ...values,
      template_type: "waypoint",
      image_format: values.image_format.join(","),
      ...values.device,
      exit_on_rc_lost_action: "goBack",
      waypoint_heading_req: {
        waypoint_heading_mode: values.waypoint_heading_mode
      },
      waypoint_turn_req: {
        waypoint_turn_mode: values.global_waypoint_turn_mode
      },
      route_point_list: route_point_list.map(point => {
        if (!point.speed) {
          delete point.speed;
        }
        if (!point.height) {
          delete point.height;
        }
        if (!point.ellipsoid_height) {
          delete point.ellipsoid_height;
        }
        return {
          ...point
        };
      })
    };
    console.log("formValue");
    console.log(formValue);
    if (currentWaylineData) {
      try {
        const res: any = await post(`wayline/api/v1/common/updateKmzFile`, {
          ...formValue,
          id
        });
        if (res.data.code === 0) {
          toast({
            description: "更新航线成功！"
          });
          navigate("/wayline");
        }
      } catch (error: any) {
        toast({
          description: error.data.message,
          variant: "destructive"
        });
      }
    } else {
      try {
        const res: any = await post(`wayline/api/v1/common/buildKmzFile`, formValue);
        if (res.data.code === 0) {
          toast({
            description: "创建航线成功！"
          });
          navigate("/wayline");
        }
      } catch (error: any) {
        toast({
          description: error.data.message,
          variant: "destructive"
        });
      }
    }
  };

  const onSaveWayPointSetting = () => {
    if (!currentWayPoint) return;
    const newWaypoints = waypoints.map(point => point.id === currentWayPoint.id ? currentWayPoint : point);
    setWaypoints(newWaypoints);
    // 提示保存成功
    toast({
      description: "航点设置已保存"
    });
  };

  // 在 useEffect 中添加初始化逻辑
  useEffect(() => {
    if (!currentWaylineData || !viewer) return;

    // 如果有起飞点数据，初始化起飞点
    if (currentWaylineData.take_off_ref_point) {
      const [latitude, longitude, height] = currentWaylineData.take_off_ref_point.split(",").map(Number);
      setTakeoffPoint({longitude, latitude, height});
    }

    // 编辑状态设置最后一个航点为选中航点
    if (currentWaylineData.route_point_list.length > 0) {
      setSelectedWaypointId(currentWaylineData.route_point_list.length);
    }

    // 初始化航点
    const initialWaypoints = currentWaylineData.route_point_list.map((point: WayPoint) => {
      // 转换动作数据
      const actions = point.actions?.map(action => {
        switch (action.action_actuator_func) {
          case "rotateYaw":
            return {
              name: "飞行器偏航角",
              func: "rotateYaw",
              param: action.aircraft_heading
            };
          case "gimbalRotate":
            return action.gimbal_pitch_rotate_angle ? {
              name: "云台俯仰角",
              func: "gimbalRotate",
              type: "gimbal_pitch_rotate_angle",
              param: action.gimbal_pitch_rotate_angle
            } : {
              name: "云台偏航角",
              func: "gimbalRotate",
              type: "gimbal_yaw_rotate_angle",
              param: action.gimbal_yaw_rotate_angle
            };
          case "zoom":
            return {
              name: "变焦",
              func: "zoom",
              param: action.zoom / 24
            };
          case "hover":
            return {
              name: "悬停",
              func: "hover",
              param: action.hover_time
            };
          case "takePhoto":
            return {
              name: "拍照",
              func: "takePhoto",
              isGlobal: action.use_global_image_format === 1,
              param: action.use_global_image_format === 1 ? currentWaylineData.image_format?.split(",") : action.image_format?.split(",")
            };
          case "panoShot":
            return {
              name: "全景拍照",
              func: "panoShot",
              isGlobal: action.use_global_image_format === 1,
              param: action.use_global_image_format === 1 ? currentWaylineData.image_format?.split(",") : action.image_format?.split(",")
            };
          case "startRecord":
            return {
              name: "开始录像",
              func: "startRecord",
              isGlobal: action.use_global_image_format === 1,
              param: action.use_global_image_format === 1 ? currentWaylineData.image_format.split(",") : action.image_format.split(",")
            };
          case "stopRecord":
            return {
              name: "停止录像",
              func: "stopRecord",
            };
          default:
            return null;
        }
      }).filter(Boolean);

      return {
        id: uuidv4(),
        longitude: point.longitude,
        latitude: point.latitude,
        height: point.height || globalHeight,
        speed: point.speed || currentWaylineData.auto_flight_speed,
        useGlobalHeight: !point.height,
        useGlobalSpeed: !point.speed,
        actions,
      };
    });

    setWaypoints(initialWaypoints);
  }, [currentWaylineData, form, globalHeight]);

  // 添加对 auto_flight_speed 的监听
  useEffect(() => {
    const speed = form.watch("auto_flight_speed");
    if (speed && waylineInfo.distance > 0) {
      // 计算预计飞行时间（秒）
      const timeInSeconds = waylineInfo.distance / speed;
      // 四舍五入到2位小数
      setWaylineInfo(prev => ({
        ...prev,
        time: Number(timeInSeconds.toFixed(2))
      }));
    }
  }, [form.watch("auto_flight_speed"), waylineInfo.distance]);

  return (
    <Form {...form}>
      <form className={"w-full h-full flex flex-col"} onSubmit={form.handleSubmit(onSubmit, onError)}>
        <header className={"grid grid-cols-3 py-[6px] bg-[#232323] whitespace-nowrap"}>
          <div className={"col-span-1 flex space-x-2 items-center"}>
            <ChevronLeft className={"cursor-pointer"} onClick={() => navigate("/wayline")}/>
            {/*<ChevronLeft className={"cursor-pointer"} onClick={() => {
              updateDroneDirection(heading.current)
              heading.current+=30
            }}/>*/}
            <span>|</span>
            <Button type={"submit"} className={"bg-transparent"}>
              <Save/>
            </Button>
            <Popover open={true}>
              <PopoverTrigger asChild>
                <span className={"bg-[#3c3c3c] px-4 py-2 rounded-md cursor-pointer"}>航点设置</span>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 bg-[#232323] text-white text-[14px] space-y-2 h-[calc(100vh-60px)] overflow-y-auto">
                <h3 className={"rounded-md flex justify-between  px-2 py-2"}>航点列表</h3>
                <Separator className={"bg-gray-500"}/>
                <div className={"flex space-x-4 h-12"}>
                  <div className={"flex flex-col justify-center items-center"}>
                    <span>航线长度</span>
                    <span>{waylineInfo.distance}m</span>
                  </div>
                  <Separator className={"bg-gray-500"} orientation={"vertical"}/>
                  <div className={"flex flex-col justify-center items-center"}>
                    <span>预计执行时间</span>
                    <span>{waylineInfo.time}s</span>
                  </div>
                  <Separator className={"bg-gray-500"} orientation={"vertical"}/>
                  <div className={"flex flex-col justify-center items-center"}>
                    <span>航点数量</span>
                    <span>{waypoints.length}</span>
                  </div>
                </div>
                <Separator className={"bg-gray-500"}/>
                {/*航点列表*/}
                <div className="space-y-2">
                  {waypoints.map((waypoint, index) => (
                    <div key={waypoint.id}
                         className="flex items-center justify-between bg-[#3c3c3c] p-2 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-[#4CAF50] rounded-full flex items-center justify-center text-white">
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm">高度: {waypoint.height}m</span>
                          <span className="text-xs text-gray-400">
                            {waypoint.longitude.toFixed(6)}, {waypoint.latitude.toFixed(6)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className="p-1 hover:bg-[#4c4c4c] rounded"
                          onClick={() => {
                            // 编辑航点
                            setWayPointOpen(true);
                            setCurrentWayPoint(waypoint);
                            setSelectedWaypointId(index + 1);
                          }}>
                          编辑
                        </button>
                        <button
                          className="p-1 hover:bg-[#4c4c4c] rounded text-red-400"
                          onClick={() => onDeleteWaypoint(index)}>
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Popover open={open}>
              <PopoverTrigger asChild>
                <span className={"bg-[#3c3c3c] px-4 py-2 rounded-md cursor-pointer"}
                      onClick={() => setOpen(!open)}>航线设置</span>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 bg-[#232323] text-white text-[14px] space-y-2 h-[calc(100vh-60px)] overflow-y-auto">
                <FormField
                  control={form.control}
                  name="name"
                  render={({field}) => (
                    <FormItem className={"rounded-md grid grid-cols-3 items-center bg-[#3c3c3c] px-2 py-2 space-y-2 "}>
                      <FormLabel>航线名称</FormLabel>
                      <FormControl>
                        <Input className={"bg-transparent col-span-2"} {...field}/>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="device"
                  render={({field}) => (
                    <FormItem className={"rounded-md flex bg-[#3c3c3c] px-2 py-2 flex-col space-y-2"}>
                      <FormLabel>飞行器选择</FormLabel>
                      <FormControl>
                        <Cascader
                          className={"bg-transparent text-white border-white"}
                          options={deviceData}
                          value={[field.value.drone_type, field.value.sub_drone_type]}
                          onChange={(values) => {
                            if (values.length === 2) {
                              const [droneType, subType] = values;
                              const selectedSeries = deviceData.find(series => series.value === droneType);
                              const selectedModel = selectedSeries?.children?.find(model => model.value === subType);

                              if (selectedModel) {
                                field.onChange({
                                  drone_type: droneType,
                                  sub_drone_type: selectedModel.value,
                                  payload_type: selectedModel.payloadEnumValue || 53,
                                  payload_position: selectedModel.payloadPositionIndex || 0
                                });
                              }
                            }
                          }}
                          placeholder="请选择飞行器型号"
                        />
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image_format"
                  render={({field}) => (
                    <FormItem className={"rounded-md flex bg-[#3c3c3c] px-2 py-2 flex-col space-y-2"}>
                      <FormLabel>拍照设置</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="multiple"
                          value={field.value}
                          onValueChange={field.onChange}
                          className={"space-x-2"}
                        >
                          <ToggleGroupItem value="wide">广角</ToggleGroupItem>
                          <ToggleGroupItem value="zoom">变焦</ToggleGroupItem>
                          <ToggleGroupItem value="ir">红外</ToggleGroupItem>
                          <ToggleGroupItem value="visable">可见光</ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fly_to_wayline_mode"
                  render={({field}) => (
                    <FormItem className={"rounded-md flex bg-[#3c3c3c] px-2 py-2 flex-col space-y-2"}>
                      <FormControl>
                        <div>
                          <ToggleGroup type="single" value={field.value} onValueChange={field.onChange}
                                       className={"grid grid-cols-2"}>
                            <ToggleGroupItem value="safely">
                              垂直爬升
                            </ToggleGroupItem>
                            <ToggleGroupItem value="pointToPoint">
                              倾斜爬升
                            </ToggleGroupItem>
                          </ToggleGroup>
                          <FormField
                            name={"take_off_security_height"}
                            control={form.control}
                            render={({field}) => (
                              <FormItem className={"rounded-md flex bg-[#3c3c3c] px-2 py-2 flex-col space-y-2"}>
                                <FormControl>
                                  <div className={"grid grid-cols-3"}>
                                    <img className={"col-span-2"} src={pashengImage} alt=""/>
                                    <div className={"flex content-center space-x-2"}>
                                      <Input {...field} className={"bg-transparent h-6"}/>
                                      <span>米</span>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage/>
                              </FormItem>
                            )}
                          />
                        </div>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <div className={"rounded-md flex justify-between bg-[#3c3c3c] px-2 py-2"}>
                  <span>参考起飞点</span>
                  <span className={"cursor-pointer"} onClick={onSetTakeoffPoint}>设置起飞点</span>
                </div>
                <FormField
                  control={form.control}
                  name="global_height"
                  render={({field}) => (
                    <FormItem className={"rounded-md flex bg-[#3c3c3c] px-2 py-2 flex-col space-y-2"}>
                      <FormLabel>航线高度(海拔高度)</FormLabel>
                      <FormControl>
                        <div className={"flex space-x-2 items-center"}>
                          <Input className={"bg-transparent"} {...field} onChange={(e) => {
                            console.log(111);
                            field.onChange(e);
                            setWaypoints(waypoints.map(point => point.useGlobalHeight ? ({
                              ...point,
                              height: +form.getValues("global_height")!
                            }) : point));
                          }}/>
                          <span>米</span>
                        </div>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="auto_flight_speed"
                  render={({field}) => (
                    <FormItem className={"rounded-md flex bg-[#3c3c3c] px-2 py-2 flex-col space-y-2"}>
                      <FormLabel>全局航线速度</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2 justify-between">
                          <Button
                            type="button"
                            onClick={() => {
                              const newValue = Math.max(1, Number(field.value) - 1);
                              field.onChange(newValue);
                            }}
                            disabled={field.value <= 1}
                            className={cn(
                              "w-8 h-8 flex items-center justify-center bg-[#232323] text-white",
                              field.value <= 1 && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            -
                          </Button>
                          <div className="text-[24px] text-[#43ABFF] min-w-[40px] text-center">
                            {field.value}<span className="text-white ml-2 text-[12px]">m/s</span>
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              const newValue = Math.min(15, Number(field.value) + 1);
                              field.onChange(newValue);
                            }}
                            disabled={field.value >= 15}
                            className={cn(
                              "w-8 h-8 flex items-center justify-center bg-[#232323] text-white",
                              field.value >= 15 && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            +
                          </Button>

                        </div>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="global_transitional_speed"
                  render={({field}) => (
                    <FormItem className={"rounded-md flex bg-[#3c3c3c] px-2 py-2 flex-col space-y-2"}>
                      <FormLabel>起飞速度</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2 justify-between">
                          <Button
                            type="button"
                            onClick={() => {
                              const newValue = Math.max(1, Number(field.value) - 1);
                              field.onChange(newValue);
                            }}
                            disabled={field.value <= 1}
                            className={cn(
                              "w-8 h-8 flex items-center justify-center bg-[#232323] text-white",
                              field.value <= 1 && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            -
                          </Button>
                          <div className="text-[24px] text-[#43ABFF] min-w-[40px] text-center">
                            {field.value}<span className="text-white ml-2 text-[12px]">m/s</span>
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              const newValue = Math.min(15, Number(field.value) + 1);
                              field.onChange(newValue);
                            }}
                            disabled={field.value >= 15}
                            className={cn(
                              "w-8 h-8 flex items-center justify-center bg-[#232323] text-white",
                              field.value >= 15 && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            +
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="global_waypoint_turn_mode"
                  render={({field}) => (
                    <FormItem className={"rounded-md flex bg-[#3c3c3c] px-2 py-2 flex-col space-y-2"}>
                      <FormLabel>航点类型</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={"bg-transparent"}>
                            <SelectValue/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="coordinateTurn">协调转弯，不过点，提前转弯</SelectItem>
                          <SelectItem
                            value="toPointAndStopWithDiscontinuityCurvature">直线飞行，飞行器到点停</SelectItem>
                          <SelectItem value="toPointAndStopWithContinuityCurvature">曲线飞行，飞行器到点停</SelectItem>
                          <SelectItem value="toPointAndPassWithContinuityCurvature">曲线飞行，飞行器过点不停</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waypoint_heading_mode"
                  render={({field}) => (
                    <FormItem className={"rounded-md flex bg-[#3c3c3c] px-2 py-2 flex-col space-y-2"}>
                      <FormLabel>飞行器偏航角模式</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={"bg-transparent"}>
                            <SelectValue/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="followWayline">沿航线方向</SelectItem>
                          <SelectItem value="manually">手动控制</SelectItem>
                          <SelectItem value="fixed">锁定当前偏航角</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gimbal_pitch_mode"
                  render={({field}) => (
                    <FormItem className={"rounded-md flex bg-[#3c3c3c] px-2 py-2 flex-col space-y-2"}>
                      <FormLabel>航点间云台俯仰角控制模式</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={"bg-transparent"}>
                            <SelectValue/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manual">手动控制</SelectItem>
                          <SelectItem value="usePointSetting">依照每个航点设置</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="finish_action"
                  render={({field}) => (
                    <FormItem className={"rounded-md flex bg-[#3c3c3c] px-2 py-2 flex-col space-y-2"}>
                      <FormLabel>完成动作</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={"bg-transparent"}>
                            <SelectValue/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="goHome">自动返航</SelectItem>
                          <SelectItem value="noAction">退出航线模式</SelectItem>
                          <SelectItem value="autoLand">原地降落</SelectItem>
                          <SelectItem value="gotoFirstWaypoint">返回航线起始点悬停</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage/>
                    </FormItem>
                  )}
                />
              </PopoverContent>
            </Popover>
          </div>
          {/*<div className={"col-span-1 grid content-center"}>
              <div className={"space-x-4 bg-[#3c3c3c] rounded-md px-4 py-2 cursor-pointer"}>
                <span>新建航点航线</span>
                <span>经纬M30T</span>
              </div>
          </div>*/}
          <div className={"col-span-1"}></div>
          <div className={"text-right"}>
            <Popover open={wayPointOpen}>
              <PopoverTrigger asChild>
                <span className={" px-4 py-2 rounded-md cursor-pointer h-full"}></span>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 bg-[#232323] text-white text-[14px] space-y-4 h-[calc(100vh-60px)]">
                <div className="p-4 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3>航点{currentWayPointIndex + 1}</h3>
                    <button
                      className="hover:bg-[#4c4c4c] p-1 rounded"
                      onClick={() => setWayPointOpen(false)}
                    >
                      <XIcon/>
                    </button>
                  </div>
                  <Separator className="bg-gray-500"/>
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 items-center">
                      <span className={"whitespace-nowrap"}>飞行高度</span>
                      <div className={"content-center space-x-2 col-span-3"}>
                        <Checkbox id={"fly_height"}
                                  checked={currentWayPoint?.useGlobalHeight}
                                  onCheckedChange={(checked) => {
                                    setCurrentWayPoint({
                                      ...currentWayPoint!,
                                      useGlobalHeight: checked as boolean,
                                      height: checked ? globalHeight : currentWayPoint!.height
                                    });
                                  }}/>
                        <label
                          htmlFor="fly_height"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          是否跟随航线
                        </label>
                      </div>
                      <span className="text-gray-400">{currentWayPoint?.height}m</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="w-6 h-6 bg-[#3c3c3c] rounded-full flex items-center justify-center hover:bg-[#4c4c4c]">-
                      </button>
                      <Slider disabled={currentWayPoint?.useGlobalHeight}
                              onValueChange={(value) => {
                                setCurrentWayPoint({
                                  ...currentWayPoint!,
                                  height: value[0]
                                });
                              }} max={200} min={20} step={1} value={[currentWayPoint?.height || 0]}/>
                      <button
                        className="w-6 h-6 bg-[#3c3c3c] rounded-full flex items-center justify-center hover:bg-[#4c4c4c]">+
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-5 items-center">
                      <span className={"whitespace-nowrap"}>飞行速度</span>
                      <div className={"content-center space-x-2 col-span-3"}>
                        <Checkbox id={"fly_height"}
                                  checked={currentWayPoint?.useGlobalSpeed}
                                  onCheckedChange={(checked) => {
                                    setCurrentWayPoint({
                                      ...currentWayPoint!,
                                      useGlobalSpeed: checked as boolean,
                                      speed: checked ? form.getValues("auto_flight_speed") : currentWayPoint!.speed
                                    });
                                  }}
                        />
                        <label
                          htmlFor="fly_height"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          是否跟随航线
                        </label>
                      </div>
                      <span className="text-gray-400">{currentWayPoint?.speed || 0}m/s</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="w-6 h-6 bg-[#3c3c3c] rounded-full flex items-center justify-center hover:bg-[#4c4c4c]">-
                      </button>
                      <Slider onValueChange={(value) => setCurrentWayPoint({
                        ...currentWayPoint!,
                        speed: value[0]
                      })} min={1} max={15} value={[currentWayPoint?.speed || 0]}
                              disabled={currentWayPoint?.useGlobalSpeed}/>
                      <button
                        className="w-6 h-6 bg-[#3c3c3c] rounded-full flex items-center justify-center hover:bg-[#4c4c4c]">+
                      </button>
                    </div>
                  </div>
                  <Separator className="bg-gray-500"/>
                  <div>
                    <h3 className={"flex justify-between items-center"}>
                      <div className={"flex space-x-2 items-center"}>
                        <span>航点动作</span>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Copy size={16} className={"cursor-pointer"}/>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>动作组复制</DialogTitle>
                            </DialogHeader>
                            <div className={"space-y-4"}>
                              <div className={"flex items-center space-x-2"}>
                                <Checkbox
                                  id={"copy-all"}
                                  checked={copyCheckedIds.length === waypoints.length}
                                  onCheckedChange={(checked) => {
                                    // 更新当前航点的 copyToAll 状态
                                    checked ? setCopyCheckedIds(waypoints.map(p => p.id)) : setCopyCheckedIds([]);
                                  }}
                                />
                                <label
                                  htmlFor="copy-all"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  应用于全部航点
                                </label>
                              </div>
                              <div className={"grid grid-cols-4 gap-2"}>
                                {waypoints.map((point, index) => (
                                  <div key={point.id} className={"flex items-center space-x-2"}>
                                    <Checkbox
                                      id={`copy-${point.id}`}
                                      checked={copyCheckedIds.includes(point.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setCopyCheckedIds(prev => [...prev, point.id]);
                                        } else {
                                          setCopyCheckedIds(prev => prev.filter(id => id !== point.id));
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`copy-${point.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      航点{index + 1}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose>
                                <Button type="button" onClick={() => {
                                  const newWaypoints = waypoints.map(point => {
                                    if (copyCheckedIds.includes(point.id)) {
                                      return {
                                        ...point,
                                        actions: currentWayPoint?.actions || []
                                      };
                                    } else {
                                      return point;
                                    }
                                  });
                                  setWaypoints(newWaypoints);
                                  // 提示成功
                                  toast({
                                    description: "动作组复制成功"
                                  });
                                }}>
                                  保存
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className={"bg-[#3c3c3c]"} type={"button"}>添加动作</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {actionList.map(action =>
                            <DropdownMenuItem key={action.name} onClick={() => setCurrentWayPoint({
                              ...currentWayPoint!,
                              actions: [...(currentWayPoint?.actions || []), action]
                            })}>{action.name}</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </h3>
                  </div>
                  <div className={"space-y-2 h-[calc(100vh-500px)] overflow-y-auto"}>
                    {currentWayPoint?.actions?.map((action, index) => {
                      switch (action.name) {
                        case "飞行器偏航角":
                          return <div key={index} className={"space-y-4"}>
                            <div className={"grid grid-cols-6 items-center"}>
                              <div className={"flex items-center space-x-2 col-span-3"}>
                                <AlignJustify size={16}/>
                                <span>飞行器偏航角</span>
                              </div>
                              <div className={"col-span-2 flex items-center space-x-2"}>
                                <Input
                                  className={"bg-[#3c3c3c] rounded-sm col-span-2 h-8 content-center"}
                                  value={action.param?.toString() || ""}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;

                                    // 允许空值（用于删除）
                                    if (inputValue === "") {
                                      setCurrentWayPoint({
                                        ...currentWayPoint!,
                                        actions: currentWayPoint!.actions.map((item, idx) => {
                                          if (idx === index) {
                                            return {
                                              ...item,
                                              param: 0
                                            };
                                          }
                                          return item;
                                        })
                                      });
                                      return;
                                    }

                                    // 转换为数字并验证
                                    const value = Number(inputValue);
                                    if (!isNaN(value) && value >= -180 && value <= 180) {
                                      setCurrentWayPoint({
                                        ...currentWayPoint!,
                                        actions: currentWayPoint!.actions.map((item, idx) => {
                                          if (idx === index) {
                                            return {
                                              ...item,
                                              param: value
                                            };
                                          }
                                          return item;
                                        })
                                      });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    // 阻止 e.key === 'e' 或 'E'，因为这在number类型输入框中会触发科学计数法
                                    if (e.key === "e" || e.key === "E") {
                                      e.preventDefault();
                                    }
                                  }}
                                  type="number"
                                  min={-180}
                                  max={180}
                                />
                                <span>°</span>
                              </div>
                              <Trash2
                                className={"cursor-pointer text-right ml-2"}
                                size={16}
                                onClick={() => {
                                  // 删除当前航点的指定动作
                                  setCurrentWayPoint({
                                    ...currentWayPoint!,
                                    actions: currentWayPoint!.actions.filter((_, idx) => idx !== index)
                                  });
                                }}
                              />
                            </div>
                            <Slider
                              value={[action.param as number]}
                              onValueChange={(value) => {
                                // 更新当前航点的 actions 中对应 index 的 param 值
                                setCurrentWayPoint({
                                  ...currentWayPoint!,
                                  actions: currentWayPoint!.actions.map((item, idx) => {
                                    if (idx === index) {
                                      return {
                                        ...item,
                                        param: value[0]  // 更新 param 值
                                      };
                                    }
                                    return item;
                                  })
                                });
                              }}
                              min={-180}
                              max={180}
                            />
                          </div>;
                        case "云台偏航角":
                          return <div key={index} className={"space-y-4"}>
                            <div className={"grid grid-cols-6 items-center"}>
                              <div className={"flex items-center space-x-2 col-span-3"}>
                                <AlignJustify size={16}/>
                                <span>云台偏航角</span>
                              </div>
                              <div className={"col-span-2 flex items-center space-x-2"}>
                                <Input
                                  className={"bg-[#3c3c3c] rounded-sm pr-2 h-8 content-center"}
                                  value={action.param?.toString() || ""}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;

                                    if (inputValue === "") {
                                      setCurrentWayPoint({
                                        ...currentWayPoint!,
                                        actions: currentWayPoint!.actions.map((item, idx) => {
                                          if (idx === index) {
                                            return {
                                              ...item,
                                              param: 0
                                            };
                                          }
                                          return item;
                                        })
                                      });
                                      return;
                                    }

                                    const value = Number(inputValue);
                                    if (!isNaN(value) && value >= -180 && value <= 180) {
                                      setCurrentWayPoint({
                                        ...currentWayPoint!,
                                        actions: currentWayPoint!.actions.map((item, idx) => {
                                          if (idx === index) {
                                            return {
                                              ...item,
                                              param: value
                                            };
                                          }
                                          return item;
                                        })
                                      });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "e" || e.key === "E") {
                                      e.preventDefault();
                                    }
                                  }}
                                  type="number"
                                  min={-180}
                                  max={180}
                                />
                                <span>°</span>
                              </div>
                              <Trash2
                                className={"cursor-pointer text-right ml-2"}
                                size={16}
                                onClick={() => {
                                  // 删除当前航点的指定动作
                                  setCurrentWayPoint({
                                    ...currentWayPoint!,
                                    actions: currentWayPoint!.actions.filter((_, idx) => idx !== index)
                                  });
                                }}
                              />
                            </div>
                            <Slider
                              value={[action.param as number]}
                              onValueChange={(value) => {
                                // 更新当前航点的 actions 中对应 index 的 param 值
                                setCurrentWayPoint({
                                  ...currentWayPoint!,
                                  actions: currentWayPoint!.actions.map((item, idx) => {
                                    if (idx === index) {
                                      return {
                                        ...item,
                                        param: value[0]  // 更新 param 值
                                      };
                                    }
                                    return item;
                                  })
                                });
                              }}
                              min={-180}
                              max={180}
                            />
                          </div>;
                        case "云台俯仰角":
                          return <div key={index} className={"space-y-4"}>
                            <div className={"grid grid-cols-6 items-center"}>
                              <div className={"flex items-center space-x-2 col-span-3"}>
                                <AlignJustify size={16}/>
                                <span>云台俯仰角</span>
                              </div>
                              <div className={"col-span-2 flex items-center space-x-2"}>
                                <Input
                                  className={"bg-[#3c3c3c] rounded-sm pr-2 h-8 content-center"}
                                  value={action.param?.toString() || ""}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;

                                    if (inputValue === "") {
                                      setCurrentWayPoint({
                                        ...currentWayPoint!,
                                        actions: currentWayPoint!.actions.map((item, idx) => {
                                          if (idx === index) {
                                            return {
                                              ...item,
                                              param: 0
                                            };
                                          }
                                          return item;
                                        })
                                      });
                                      return;
                                    }

                                    const value = Number(inputValue);
                                    if (!isNaN(value) && value >= -120 && value <= 45) {
                                      setCurrentWayPoint({
                                        ...currentWayPoint!,
                                        actions: currentWayPoint!.actions.map((item, idx) => {
                                          if (idx === index) {
                                            return {
                                              ...item,
                                              param: value
                                            };
                                          }
                                          return item;
                                        })
                                      });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "e" || e.key === "E") {
                                      e.preventDefault();
                                    }
                                  }}
                                  type="number"
                                  min={-120}
                                  max={45}
                                />
                                <span>°</span>
                              </div>
                              <Trash2
                                className={"cursor-pointer text-right ml-2"}
                                size={16}
                                onClick={() => {
                                  // 删除当前航点的指定动作
                                  setCurrentWayPoint({
                                    ...currentWayPoint!,
                                    actions: currentWayPoint!.actions.filter((_, idx) => idx !== index)
                                  });
                                }}
                              />
                            </div>
                            <Slider
                              value={[action.param as number]}
                              onValueChange={(value) => {
                                // 更新当前航点的 actions 中对应 index 的 param 值
                                setCurrentWayPoint({
                                  ...currentWayPoint!,
                                  actions: currentWayPoint!.actions.map((item, idx) => {
                                    if (idx === index) {
                                      return {
                                        ...item,
                                        param: value[0]  // 更新 param 值
                                      };
                                    }
                                    return item;
                                  })
                                });
                              }}
                              min={-120}
                              max={45}
                            />
                          </div>;
                        case "悬停":
                          return <div key={index} className={"space-y-4"}>
                            <div className={"grid grid-cols-6 items-center"}>
                              <div className={"flex items-center space-x-2 col-span-3"}>
                                <AlignJustify size={16}/>
                                <span>悬停</span>
                              </div>
                              <div className={"col-span-2 flex items-center space-x-2"}>
                                <Input
                                  className={"bg-[#3c3c3c] rounded-sm pr-2 h-8 content-center"}
                                  value={action.param?.toString() || ""}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;

                                    if (inputValue === "") {
                                      setCurrentWayPoint({
                                        ...currentWayPoint!,
                                        actions: currentWayPoint!.actions.map((item, idx) => {
                                          if (idx === index) {
                                            return {
                                              ...item,
                                              param: 0
                                            };
                                          }
                                          return item;
                                        })
                                      });
                                      return;
                                    }

                                    const value = Number(inputValue);
                                    if (!isNaN(value) && value >= 1 && value <= 900) {
                                      setCurrentWayPoint({
                                        ...currentWayPoint!,
                                        actions: currentWayPoint!.actions.map((item, idx) => {
                                          if (idx === index) {
                                            return {
                                              ...item,
                                              param: value
                                            };
                                          }
                                          return item;
                                        })
                                      });
                                    }
                                  }}
                                  type="number"
                                  min={1}
                                  max={900}
                                />
                                <span>秒</span>
                              </div>
                              <Trash2
                                className={"cursor-pointer text-right ml-2"}
                                size={16}
                                onClick={() => {
                                  // 删除当前航点的指定动作
                                  setCurrentWayPoint({
                                    ...currentWayPoint!,
                                    actions: currentWayPoint!.actions.filter((_, idx) => idx !== index)
                                  });
                                }}
                              />
                            </div>
                            <Slider
                              value={[action.param as number]}
                              onValueChange={(value) => {
                                // 更新当前航点的 actions 中对应 index 的 param 值
                                setCurrentWayPoint({
                                  ...currentWayPoint!,
                                  actions: currentWayPoint!.actions.map((item, idx) => {
                                    if (idx === index) {
                                      return {
                                        ...item,
                                        param: value[0]  // 更新 param 值
                                      };
                                    }
                                    return item;
                                  })
                                });
                              }}
                              min={1}
                              max={900}
                            />
                          </div>;
                        case "开始录像":
                          return <div key={index} className={"space-y-4"}>
                            <div className={"grid grid-cols-6 items-center"}>
                              <div className={"flex items-center space-x-2 col-span-3"}>
                                <AlignJustify size={16}/>
                                <span>开始录像</span>
                              </div>
                              <div className={"content-center space-x-2 col-span-2"}>
                                <Checkbox id={"record"}
                                          checked={action.isGlobal as boolean}
                                          onCheckedChange={(checked) => {
                                            setCurrentWayPoint({
                                              ...currentWayPoint!,
                                              actions: currentWayPoint!.actions.map((item, idx) => {
                                                if (idx === index) {
                                                  return {
                                                    ...item,
                                                    isGlobal: checked  // 更新 param 值
                                                  };
                                                }
                                                return item;
                                              })
                                            });
                                          }}
                                />
                                <label
                                  htmlFor="record"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  跟随航线
                                </label>
                              </div>
                              <Trash2
                                className={"cursor-pointer text-right ml-2"}
                                size={16}
                                onClick={() => {
                                  // 删除当前航点的指定动作
                                  setCurrentWayPoint({
                                    ...currentWayPoint!,
                                    actions: currentWayPoint!.actions.filter((_, idx) => idx !== index)
                                  });
                                }}
                              />
                            </div>
                            <ToggleGroup
                              disabled={action.isGlobal}
                              type="multiple"
                              className={"space-x-2 whitespace-nowrap"}
                              value={action.param}
                              onValueChange={(value) => {
                                // 如果新的选择为空且当前只有一个选项，则保持不变
                                if (value.length === 0 && action.param.length === 1) {
                                  return;
                                }
                                setCurrentWayPoint({
                                  ...currentWayPoint,
                                  actions: currentWayPoint!.actions.map((item, idx) => {
                                    if (idx === index) {
                                      return {
                                        ...item,
                                        param: value  // 更新 param 值
                                      };
                                    }
                                    return item;
                                  })
                                });
                              }}
                            >
                              <ToggleGroupItem value="wide">广角</ToggleGroupItem>
                              <ToggleGroupItem value="zoom">变焦</ToggleGroupItem>
                              <ToggleGroupItem value="ir">红外</ToggleGroupItem>
                              <ToggleGroupItem value="visable">可见光</ToggleGroupItem>
                            </ToggleGroup>
                          </div>;
                        case "拍照":
                          return <div key={index} className={"space-y-4"}>
                            <div className={"grid grid-cols-6 items-center"}>
                              <div className={"flex items-center space-x-2 col-span-3"}>
                                <AlignJustify size={16}/>
                                <span>拍照</span>
                              </div>
                              <div className={"content-center space-x-2 col-span-2"}>
                                <Checkbox id={"photo"}
                                          checked={action.isGlobal as boolean}
                                          onCheckedChange={(checked) => {
                                            setCurrentWayPoint({
                                              ...currentWayPoint!,
                                              actions: currentWayPoint!.actions.map((item, idx) => {
                                                if (idx === index) {
                                                  return {
                                                    ...item,
                                                    isGlobal: checked  // 更新 param 值
                                                  };
                                                }
                                                return item;
                                              })
                                            });
                                          }}
                                />
                                <label
                                  htmlFor="photo"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  跟随航线
                                </label>
                              </div>
                              <Trash2
                                className={"cursor-pointer text-right ml-2"}
                                size={16}
                                onClick={() => {
                                  // 删除当前航点的指定动作
                                  setCurrentWayPoint({
                                    ...currentWayPoint!,
                                    actions: currentWayPoint!.actions.filter((_, idx) => idx !== index)
                                  });
                                }}
                              />
                            </div>
                            <ToggleGroup
                              disabled={action.isGlobal}
                              type="multiple"
                              className={"space-x-2 whitespace-nowrap"}
                              value={action.param}
                              onValueChange={(value) => {
                                // 如果新的选择为空且当前只有一个选项，则保持不变
                                if (value.length === 0 && action.param.length === 1) {
                                  return;
                                }
                                setCurrentWayPoint({
                                  ...currentWayPoint,
                                  actions: currentWayPoint!.actions.map((item, idx) => {
                                    if (idx === index) {
                                      return {
                                        ...item,
                                        param: value  // 更新 param 值
                                      };
                                    }
                                    return item;
                                  })
                                });
                              }}
                            >
                              <ToggleGroupItem value="wide">广角</ToggleGroupItem>
                              <ToggleGroupItem value="zoom">变焦</ToggleGroupItem>
                              <ToggleGroupItem value="ir">红外</ToggleGroupItem>
                              <ToggleGroupItem value="visable">可见光</ToggleGroupItem>
                            </ToggleGroup>
                          </div>;
                        case "全景拍照":
                          return <div key={index} className={"space-y-4"}>
                            <div className={"grid grid-cols-6 items-center"}>
                              <div className={"flex items-center space-x-2 col-span-3"}>
                                <AlignJustify size={16}/>
                                <span>全景拍照</span>
                              </div>
                              <div className={"content-center space-x-2 col-span-2"}>
                                <Checkbox id={"photo"}
                                          checked={action.isGlobal as boolean}
                                          onCheckedChange={(checked) => {
                                            setCurrentWayPoint({
                                              ...currentWayPoint!,
                                              actions: currentWayPoint!.actions.map((item, idx) => {
                                                if (idx === index) {
                                                  return {
                                                    ...item,
                                                    isGlobal: checked  // 更新 param 值
                                                  };
                                                }
                                                return item;
                                              })
                                            });
                                          }}
                                />
                                <label
                                  htmlFor="photo"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  跟随航线
                                </label>
                              </div>
                              <Trash2
                                className={"cursor-pointer text-right ml-2"}
                                size={16}
                                onClick={() => {
                                  // 删除当前航点的指定动作
                                  setCurrentWayPoint({
                                    ...currentWayPoint!,
                                    actions: currentWayPoint!.actions.filter((_, idx) => idx !== index)
                                  });
                                }}
                              />
                            </div>
                            <ToggleGroup
                              disabled={action.isGlobal}
                              type="multiple"
                              className={"space-x-2 whitespace-nowrap"}
                              value={action.param}
                              onValueChange={(value) => {
                                // 如果新的选择为空且当前只有一个选项，则保持不变
                                if (value.length === 0 && action.param.length === 1) {
                                  return;
                                }
                                setCurrentWayPoint({
                                  ...currentWayPoint,
                                  actions: currentWayPoint!.actions.map((item, idx) => {
                                    if (idx === index) {
                                      return {
                                        ...item,
                                        param: value  // 更新 param 值
                                      };
                                    }
                                    return item;
                                  })
                                });
                              }}
                            >
                              <ToggleGroupItem value="wide">广角</ToggleGroupItem>
                              <ToggleGroupItem value="zoom">变焦</ToggleGroupItem>
                              <ToggleGroupItem value="ir">红外</ToggleGroupItem>
                              <ToggleGroupItem value="visable">可见光</ToggleGroupItem>
                            </ToggleGroup>
                          </div>;
                        case "停止录像":
                          return <div key={index} className={"space-y-4"}>
                            <div className={"grid grid-cols-6 items-center"}>
                              <div className={"flex items-center space-x-2 col-span-3"}>
                                <AlignJustify size={16}/>
                                <span>停止录像</span>
                              </div>
                              <div className={"content-center space-x-2 col-span-2"}>
                              </div>
                              <Trash2
                                className={"cursor-pointer text-right ml-2"}
                                size={16}
                                onClick={() => {
                                  // 删除当前航点的指定动作
                                  setCurrentWayPoint({
                                    ...currentWayPoint!,
                                    actions: currentWayPoint!.actions.filter((_, idx) => idx !== index)
                                  });
                                }}
                              />
                            </div>
                          </div>;
                        case "变焦":
                          return <div key={index} className={"space-y-4"}>
                            <div className={"grid grid-cols-6 items-center"}>
                              <div className={"flex items-center space-x-2 col-span-3"}>
                                <AlignJustify size={16}/>
                                <span>变焦</span>
                              </div>
                              <div className={"col-span-2 flex items-center space-x-2"}>
                                <Input
                                  className={"bg-[#3c3c3c] rounded-sm pr-2 h-8 content-center"}
                                  value={action.param?.toString() || ""}
                                  onChange={(e) => {
                                    const inputValue = e.target.value;

                                    if (inputValue === "") {
                                      setCurrentWayPoint({
                                        ...currentWayPoint!,
                                        actions: currentWayPoint!.actions.map((item, idx) => {
                                          if (idx === index) {
                                            return {
                                              ...item,
                                              param: 2
                                            };
                                          }
                                          return item;
                                        })
                                      });
                                      return;
                                    }

                                    const value = Number(inputValue);
                                    if (!isNaN(value) && value >= 2 && value <= 200) {
                                      setCurrentWayPoint({
                                        ...currentWayPoint!,
                                        actions: currentWayPoint!.actions.map((item, idx) => {
                                          if (idx === index) {
                                            return {
                                              ...item,
                                              param: value
                                            };
                                          }
                                          return item;
                                        })
                                      });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "e" || e.key === "E") {
                                      e.preventDefault();
                                    }
                                  }}
                                  type="number"
                                  min={2}
                                  max={200}
                                />
                                <span>X</span>
                              </div>
                              <Trash2
                                className={"cursor-pointer text-right ml-2"}
                                size={16}
                                onClick={() => {
                                  // 删除当前航点的指定动作
                                  setCurrentWayPoint({
                                    ...currentWayPoint!,
                                    actions: currentWayPoint!.actions.filter((_, idx) => idx !== index)
                                  });
                                }}
                              />
                            </div>
                            <Slider
                              value={[action.param as number]}
                              onValueChange={(value) => {
                                // 更新当前航点的 actions 中对应 index 的 param 值
                                setCurrentWayPoint({
                                  ...currentWayPoint!,
                                  actions: currentWayPoint!.actions.map((item, idx) => {
                                    if (idx === index) {
                                      return {
                                        ...item,
                                        param: value[0] // 更新 param 值
                                      };
                                    }
                                    return item;
                                  })
                                });
                              }}
                              min={2}
                              max={200}
                            />
                          </div>;
                      }
                    })}
                  </div>
                  <Button className={"bg-[#3c3c3c]"} type={"button"} onClick={onSaveWayPointSetting}>保存设置</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>
        <div className={"flex-1 relative overflow-hidden"}>
          <CreateWaylineScene/>
          <div className={"absolute right-36 top-12"}>
            <SearchPositionInput/>
          </div>
          <div className={"absolute bottom-0 right-[180px] w-[360px] h-[280px]"}>
            {miniSceneCameraPosition &&
              <SceneMini
                onCameraChange={onCameraChange}
                hp={miniSceneCameraHp}
                onChangeHp={setMiniSceneCameraHp}
                initialPosition={miniSceneCameraPosition}
                onZoomChange={onZoomChange}
                onChangeMode={onChangeMode}
              />}

            {/*<SceneMini onCameraChange={onCameraChange}
                       hp={miniSceneCameraHp}
                       onChangeHp={setMiniSceneCameraHp}
                       initialPosition={miniSceneCameraPosition}
                       onZoomChange={onZoomChange}
                       onChangeMode={onChangeMode}
            />*/}
          </div>
          <div className={"absolute bottom-12 left-1/2 -translate-x-1/2 overflow-hidden"}>
            {miniSceneCameraPosition && <Compass heading={miniSceneCameraHp?.heading || 0}/>}
          </div>
          <div className={"absolute right-0 bottom-0 z-100"}>
            <MapChange/>
          </div>
          <RightClickPanel>
            {waypoints.length === 0 ? (
              <MenuItem onClick={() => addWaypointAfter(0)}>
                新增航点
              </MenuItem>
            ) : selectedWaypointId ? (
              <>
                <MenuItem onClick={() => addWaypointAfter(0)}>
                  在最前添加航点
                </MenuItem>
                <MenuItem onClick={() => addWaypointAfter(selectedWaypointId - 1)}>
                  在 {selectedWaypointId} 号航点前添加航点
                </MenuItem>
                <MenuItem onClick={() => addWaypointAfter(selectedWaypointId)}>
                  在 {selectedWaypointId} 号航点后添加航点
                </MenuItem>
                <MenuItem onClick={() => addWaypointAfter(waypoints.length)}>
                  在最后添加航点
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem onClick={() => addWaypointAfter(0)}>
                  在最前添加航点
                </MenuItem>
                <MenuItem onClick={() => addWaypointAfter(waypoints.length)}>
                  在最后添加航点
                </MenuItem>
              </>
            )}
          </RightClickPanel>
        </div>
      </form>
    </Form>
  );
};

export default CreateWayLine0517;

