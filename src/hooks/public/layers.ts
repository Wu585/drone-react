import {Http} from "@/lib/http.ts";
import useSWRImmutable from "swr/immutable";

interface S3mLayer {
  name: string,
  path: string
}

export const iServerHttp = new Http("iServerApi");

export const useS3mLayerList = (url: string) => {
  return useSWRImmutable(url, async (path) => (await iServerHttp.get<S3mLayer[]>(path)).data);
};

// 查询数据集下所有子集名
export function queryChildren(serviceName: string, dataSourceName: string) {
  const url = `iserver/services/data-${serviceName}/rest/data/datasources/${dataSourceName}/datasets.json`;
  return iServerHttp.get(url);
}

export const useQueryChildrenDatasets = (serviceName: string, dataSourceName: string) => {
  return useSWRImmutable(`iserver/services/data-${serviceName}/rest/data/datasources/${dataSourceName}/datasets.json`,
    async (path) => (await iServerHttp.get<{
      datasetNames: string[]
      childUriList: string[]
      datasetCount: number
    }>(path)).data);
};

export const useQueryRegion = (serviceName: string, dataSourceName: string, dataSetName: string) => {
  const dataServiceUrl = `iserver/services/data-${serviceName}/rest/data/featureResults.rjson?returnContent=true`;
  const queryObj = {
    getFeatureMode: "SQL",
    datasetNames: [dataSourceName + ":" + dataSetName],
    maxFeatures: -1,
    queryParameter: {
      attributeFilter: `SMID>0`
    }
  };
  return useSWRImmutable(dataServiceUrl, async (path) => (await iServerHttp.post<any>(path, queryObj)).data);
};

export const queryRegion = (serviceName: string, dataSourceName: string, dataSetName: string) => {
  const dataServiceUrl = `iserver/services/data-${serviceName}/rest/data/featureResults.rjson?returnContent=true`;
  const queryObj = {
    getFeatureMode: "SQL",
    datasetNames: [dataSourceName + ":" + dataSetName],
    maxFeatures: -1,
    queryParameter: {
      attributeFilter: `SMID>0`
    }
  };
  return iServerHttp.post(dataServiceUrl, queryObj);
};
