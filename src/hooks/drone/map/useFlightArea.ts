import {useSceneStore} from "@/store/useSceneStore.ts";
import {useGMapCover} from "@/hooks/drone/map/useGMapCover.ts";
import {useToast} from "@/components/ui/use-toast.ts";
import {generateCircleContent, generatePolyContent, uuidv4} from "@/lib/utils.ts";
import dayjs from "dayjs";
import {DATE_FORMAT} from "@/constants";
import {GeojsonCoordinate, MapDoodleEnum} from "@/types/map.ts";
import {gcj02towgs84, wgs84togcj02} from "@/vendor/coordtransform.ts";
import {useAjax} from "@/lib/http.ts";
import {MAP_API_PREFIX, useFlightAreas} from "@/hooks/drone";
import {PostFlightAreaBody} from "@/types/flight-area.ts";
import {ELocalStorageKey} from "@/types/enum.ts";

const workspaceId: string = localStorage.getItem(ELocalStorageKey.WorkspaceId) || "";

export const useFlightArea = () => {
  const mapState = useSceneStore(state => state.mapState);
  // const coverMap = useSceneStore(state => state.coverMap);
  const useGMapCoverHook = useGMapCover();
  const {post} = useAjax();
  const {toast} = useToast();
  const {mutate} = useFlightAreas(workspaceId);

  const MIN_RADIUS = 10;

  const checkCircle = (obj: any) => {
    if (obj.getRadius() < MIN_RADIUS) {
      toast({
        description: `半径必须大于 ${MIN_RADIUS}m.`,
        variant: "destructive"
      });
      mapState.map.remove(obj);
      return false;
    }
    return true;
  };

  const checkPolygon = (obj: any) => {
    const path: any[][] = obj.getPath();
    if (path.length < 3) {
      toast({
        description: "The path of the polygon cannot be crossed.",
        variant: "destructive"
      });
      mapState.map.remove(obj);
      return false;
    }
    return true;
  };

  function setExtData(obj: any) {
    let ext = obj.getExtData();
    const id = uuidv4();
    const name = `${ext.type}-${dayjs().format(DATE_FORMAT)}`;
    ext = Object.assign({}, ext, {id, name});
    obj.setExtData(ext);
    return ext;
  }

  const getWgs84 = <T extends GeojsonCoordinate | GeojsonCoordinate[]>(coordinate: T): T => {
    if (coordinate[0] instanceof Array) {
      return (coordinate as GeojsonCoordinate[]).map(c => gcj02towgs84(c[0], c[1])) as T;
    }
    return gcj02towgs84(coordinate[0], coordinate[1]);
  };

  const getGcj02 = <T extends GeojsonCoordinate | GeojsonCoordinate[]>(coordinate: T): T => {
    if (coordinate[0] instanceof Array) {
      return (coordinate as GeojsonCoordinate[]).map(c => wgs84togcj02(c[0], c[1])) as T;
    }
    return wgs84togcj02(coordinate[0], coordinate[1]);
  };

  function createFlightArea(obj: any) {
    const ext = obj.getExtData();
    const data = {
      id: ext.id,
      type: ext.type,
      name: ext.name,
    };
    let coordinates: GeojsonCoordinate | GeojsonCoordinate[][];
    let content;
    console.log('ext.mapType');
    console.log(ext.mapType);
    switch (ext.mapType) {
      case "circle":
        content = generateCircleContent(obj.getCenter(), obj.getRadius());
        coordinates = getWgs84(content.geometry.coordinates as GeojsonCoordinate);
        break;
      case "polygon":
        content = generatePolyContent(obj.getPath()).content;
        coordinates = [getWgs84(content.geometry.coordinates[0] as GeojsonCoordinate[])];
        break;
      default:
        toast({
          description: `Invalid type: ${obj.mapType}`,
          variant: "destructive"
        });
        mapState.map.remove(obj);
        return;
    }
    content.geometry.coordinates = coordinates;
    console.log('content');
    console.log(content);
    post(`${MAP_API_PREFIX}/workspaces/${workspaceId}/flight-area`, Object.assign({}, data, {content}) as PostFlightAreaBody)
      .then(async (res: any) => {
        if (res.data.code !== 0) {
          useGMapCoverHook.removeCoverFromMap(ext.id);
        }
        await mutate();
      }).finally(() => mapState.map.remove(obj));
  }

  function getDrawFlightAreaCallback(obj: any) {
    const ext = setExtData(obj);
    console.log('ext===');
    console.log(ext);
    switch (ext.mapType) {
      case MapDoodleEnum.CIRCLE:
        if (!checkCircle(obj)) {
          return;
        }
        break;
      case MapDoodleEnum.POLYGON:
        if (!checkPolygon(obj)) {
          return;
        }
        break;
      default:
        break;
    }
    createFlightArea(obj);
  }


  return {
    getDrawFlightAreaCallback,
    getGcj02,
    getWgs84,
  };
};
