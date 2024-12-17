import {useEffect, useState} from "react";
import {BicycleMap, useBicycleStore} from "@/store/useBicycleStore.ts";
import {generateHeatMap, removeEntity} from "@/lib/entity.ts";
import {useBicycleAllInfo} from "@/hooks/bicycles/api.ts";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import {useBicycleEntities, useKeyAreaCounts} from "@/hooks/bicycles/entities.ts";

interface MapChangeProps {
  onMapChange?: (map: BicycleMap) => void;
}

const worker = new Worker("/heatmap.worker.js");

let heatmap: any;
worker.addEventListener("message", (e) => {
  if (heatmap) {
    removeEntity(heatmap._layer);
  }
  heatmap = generateHeatMap(e.data.map((item: any) => ({
    x: item.longitude,
    y: item.latitude,
    value: item.density
  })), 0, 300);
});

const MapChange = ({onMapChange}: MapChangeProps) => {
  const {data} = useBicycleAllInfo();

  useKeyAreaCounts();

  useBicycleEntities();

  const [mapList] = useState<BicycleMap[]>([
    {name: "分布图"},
    {name: "热力图"}
  ]);

  const {selectedMap, setSelectedMap} = useBicycleStore();

  useEffect(() => {
    if (!data) {
      return;
    }

    onMapChange?.(selectedMap);

    switch (selectedMap.name) {
      case "分布图":
        getCustomSource("regionSource")!.show = true;
        getCustomSource("bicyclesSource")!.show = true;
        removeEntity(heatmap?._layer);
        break;

      case "热力图":
        getCustomSource("regionSource")!.show = false;
        getCustomSource("bicyclesSource")!.show = false;

        worker.postMessage(data);
        break;
    }

    return () => {
      if (heatmap) {
        removeEntity(heatmap._layer);
      }
    };
  }, [selectedMap, data]);

  return (
    <div style={{
      border: "1px solid #64B8FF",
      background: "rgba(7,35,77,0.63)"
    }} className={"flex"}>
      {mapList.map(map =>
        <div
          key={map.name}
          style={{
            background: `${selectedMap.name === map.name ? "rgba(83, 176, 255, 0.8)" : ""} `
          }}
          className={"py-2 px-4 cursor-pointer"}
          onClick={() => setSelectedMap(map)}>
          {map.name}
        </div>)}
    </div>
  );
};

export default MapChange;

