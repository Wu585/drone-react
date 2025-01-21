import {useMapContext} from '@/contexts/MapContext';

const SomeComponent = () => {
  const {map, mouseTool} = useMapContext();

  useEffect(() => {
    if (map) {
      // 使用地图实例
      map.setZoom(15);
    }
  }, [map]);

  return <div>Some Component</div>;
}; 