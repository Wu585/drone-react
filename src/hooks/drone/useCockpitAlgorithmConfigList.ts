import {AlgorithmConfig, useAlgorithmConfigList} from "@/hooks/drone/algorithm";

export const useCockpitAlgorithmConfigList = () => {
  const {data: algorithmConfigList} = useAlgorithmConfigList({
    page: 1,
    size: 1000,
  });

  function groupByDevicePlatformAndName(algorithms: AlgorithmConfig[]): Record<string, Record<number, any[]>> {
    const result: Record<string, Record<number, any[]>> = {};

    algorithms.forEach(algorithm => {
      const platform = algorithm.algorithm_platform;
      const algorithmName = algorithm.algorithm_name;

      if (algorithm.device_list && algorithm.device_list.length > 0) {
        algorithm.device_list.forEach(device => {
          const sn = device.device_sn;

          // Initialize device_sn entry if not exists
          if (!result[sn]) {
            result[sn] = {};
          }

          // Initialize platform entry if not exists
          if (!result[sn][platform]) {
            result[sn][platform] = [];
          }

          // Add instance detail with algorithm name
          result[sn][platform].push({
            algorithm_name: algorithmName,
            instance_id: device.instance_id
          });
        });
      }
    });

    return result;
  }

  return groupByDevicePlatformAndName(algorithmConfigList?.records || []);
};
