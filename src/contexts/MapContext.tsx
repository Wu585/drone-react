import {createContext, useContext, ReactNode} from 'react';
import type {Map, MouseTool} from '@amap/amap-jsapi-loader';

interface MapContextType {
  AMap: any;
  map: Map | null;
  mouseTool: MouseTool | null;
}

const MapContext = createContext<MapContextType>({
  AMap: null,
  map: null,
  mouseTool: null,
});

export const useMapContext = () => useContext(MapContext);

interface MapProviderProps {
  children: ReactNode;
  value: MapContextType;
}

export const MapProvider = ({children, value}: MapProviderProps) => {
  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}; 