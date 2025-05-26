import {useWaylineById} from "@/hooks/drone";
import {useEffect} from "react";

export const useSetViewByWaylineData = (id?: string) => {
  const {data: currentWaylineData} = useWaylineById(id || "");

  useEffect(() => {
    if (!currentWaylineData) return;
    const takeoffPoint = currentWaylineData.take_off_ref_point?.split(",");
    if (takeoffPoint && takeoffPoint.length >= 2) {
      return viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(+takeoffPoint[1], +takeoffPoint[0], 500),
        orientation: {
          heading: 0,
          pitch: Cesium.Math.toRadians(-90),
          roll: 0.0
        }
      });
    } else if (currentWaylineData.route_point_list && currentWaylineData.route_point_list.length > 0) {
      const firstIndex = currentWaylineData.route_point_list[0];
      return viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(firstIndex.longitude, firstIndex.latitude, 500),
        orientation: {
          heading: 0,
          pitch: Cesium.Math.toRadians(-90),
          roll: 0.0
        }
      });
    }
  }, [currentWaylineData]);
};
