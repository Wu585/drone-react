import {useEffect} from "react";

export const useEntityCustomSource = (sourceName: string) => {
  useEffect(() => {
    const dataSource = new Cesium.CustomDataSource(sourceName);
    viewer.dataSources.add(dataSource);

    return () => {
      viewer.dataSources.remove(dataSource);
    };
  }, []);
};

export const getCustomSource = (sourceName: string): {
  entities: {
    removeAll: () => void
    add: (option: any) => any
    getById: (id: string) => any
    removeById: (id: string) => boolean
    remove: (entity: any) => boolean
    values: any[]
  }
  show: boolean
} | undefined => viewer.dataSources.getByName(sourceName)?.[0];
