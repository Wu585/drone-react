import {useWaylineById} from "@/hooks/drone/index.ts";
import {useEffect} from "react";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import takeOffPng from "@/assets/images/drone/wayline/takeoff.svg";
import {waylinePointConfig} from "@/lib/wayline.ts";
import * as egm96 from "egm96-universal";
import {useRealTimeDeviceInfo} from "@/hooks/drone/device.ts";

export const useAddWaylineEntityById = (waylineId?: string, viewerInitialized?: boolean, dockSn?: string, deviceSn?: string) => {
  // console.log("waylineId");
  // console.log(waylineId);
  const {data: currentWaylineData} = useWaylineById(waylineId);
  // const realTimeDeviceInfo = useRealTimeDeviceInfo(dockSn, deviceSn);

  // const dockHeight = +realTimeDeviceInfo?.dock?.basic_osd?.height || 0;

  useEffect(() => {
    if (!waylineId && viewerInitialized)
      getCustomSource("waylines-preview")?.entities.removeAll();
  }, [waylineId, viewerInitialized]);

  // 撒点撒线
  useEffect(() => {
    if (!currentWaylineData || !viewerInitialized) return;
    if (currentWaylineData.route_point_list && currentWaylineData.route_point_list.length > 0) {
      getCustomSource("waylines-preview")?.entities.removeAll();
      const takeoffPoint = currentWaylineData.take_off_ref_point?.split(",");
      if (takeoffPoint && takeoffPoint.length > 1) {
        const [takeoffLat, takeoffLon, takeoffHei] = takeoffPoint;
        getCustomSource("waylines-preview")?.entities.add({
          position: Cesium.Cartesian3.fromDegrees(+takeoffLon, +takeoffLat, +takeoffHei),
          billboard: {
            image: takeOffPng,
            width: 48,
            height: 48,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          polyline: {
            positions: [
              Cesium.Cartesian3.fromDegrees(+takeoffLon, +takeoffLat, +takeoffHei),
              Cesium.Cartesian3.fromDegrees(+takeoffLon, +takeoffLat, currentWaylineData.take_off_security_height)
            ],
            width: 2,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8),
              dashLength: 8.0
            })
          }
        });
        if (currentWaylineData.route_point_list.length > 0) {
          const ellipsoid_height = currentWaylineData.route_point_list[0].ellipsoid_height;
          const globalEllipsoidHeight = egm96.egm96ToEllipsoid(currentWaylineData.route_point_list[0].latitude, currentWaylineData.route_point_list[0].longitude, currentWaylineData.global_height);
          getCustomSource("waylines-preview")?.entities.add({
            polyline: {
              positions: [
                Cesium.Cartesian3.fromDegrees(+takeoffLon, +takeoffLat, currentWaylineData.take_off_security_height),
                Cesium.Cartesian3.fromDegrees(currentWaylineData.route_point_list[0].longitude, currentWaylineData.route_point_list[0].latitude, ellipsoid_height || globalEllipsoidHeight)
              ],
              width: 2,
              material: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8)
            }
          });
        }
      }
      currentWaylineData.route_point_list.forEach((point, index) => {
        const globalEllipsoidHeight = egm96.egm96ToEllipsoid(point.latitude, point.longitude, currentWaylineData.global_height);
        getCustomSource("waylines-preview")?.entities.add(waylinePointConfig({
          longitude: point.longitude,
          latitude: point.latitude,
          height: point.ellipsoid_height || globalEllipsoidHeight,
          text: (index + 1).toString()
        }));
        getCustomSource("waylines-preview")?.entities.add({
          polyline: currentWaylineData.route_point_list[index + 1] ? {
            positions: [
              Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, point.ellipsoid_height || globalEllipsoidHeight),
              Cesium.Cartesian3.fromDegrees(currentWaylineData.route_point_list[index + 1].longitude,
                currentWaylineData.route_point_list[index + 1].latitude,
                currentWaylineData.route_point_list[index + 1].ellipsoid_height || globalEllipsoidHeight)
            ],
            width: 2,
            material: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8)
          } : {}
        });
        getCustomSource("waylines-preview")?.entities.add({
          polyline: {
            positions: [
              Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, 0),
              Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, point.ellipsoid_height || globalEllipsoidHeight)
            ],
            width: 2,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString("#4CAF50").withAlpha(0.8),
              dashLength: 8.0
            })
          }
        });
      });
    }
  }, [currentWaylineData, viewerInitialized]);
};
