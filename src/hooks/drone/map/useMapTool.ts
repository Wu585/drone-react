import {useSceneStore} from "@/store/useSceneStore.ts";
import {GeojsonCoordinate} from "@/types/map.ts";

export const useMapTool = () => {
  const mapState = useSceneStore(state => state.mapState);
  const panTo = (coordinate: GeojsonCoordinate) => {
    mapState.map.panTo(coordinate, 100);
    mapState.map.setZoom(18, false, 100);
  };

  return {panTo};
};
