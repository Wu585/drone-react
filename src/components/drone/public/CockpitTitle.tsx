import titleIcon from "@/assets/images/drone/cockpit/title-icon.png";
import titleBar from "@/assets/images/drone/cockpit/title-bar.png";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {AlgorithmConfig, AlgorithmPlatform, useAlgorithmConfigList} from "@/hooks/drone/algorithm";

interface Props {
  title?: string;
  groupList?: {
    name: string
    value: string
  }[];
  onGroupChange?: (value: string) => void;
  groupValue?: string;
  onClickPopoverItem?: (platform: AlgorithmPlatform, sn: string) => void;
  sn?: string;
}

const CockpitTitle = ({title, groupList, onGroupChange, groupValue, sn, onClickPopoverItem}: Props) => {
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

  const result = groupByDevicePlatformAndName(algorithmConfigList?.records || []);

  return (
    <div className={"flex space-x-[16px] items-center whitespace-nowrap"}>
      <img src={titleIcon} alt=""/>
      <div>
        {groupList ? <ToggleGroup value={groupValue} onValueChange={onGroupChange} type="single">
            {groupList.map(item =>
              <ToggleGroupItem
                className={"whitespace-nowrap hover:bg-transparent data-[state=on]:bg-transparent data-[state=on]:text-[#32A3FF]"}
                key={item.value}
                value={item.value}>{item.name}</ToggleGroupItem>)}
          </ToggleGroup> :
          title === "AI识别" ?
            <Popover>
              <PopoverTrigger>
                <span className={"text-[18px]"}>{title}</span>
              </PopoverTrigger>
              <PopoverContent className={"w-48"}>
                <ToggleGroup type="single" className={"flex flex-col"}>
                  {sn && result[sn]?.["0"]?.map(item =>
                    <ToggleGroupItem
                      onClick={() => onClickPopoverItem?.(AlgorithmPlatform.CloudPlatForm, item.instance_id)}
                      value={item.instance_id}
                      key={item.instance_id}>{item.algorithm_name}</ToggleGroupItem>)}
                  {sn && result[sn]?.["1"]?.map(item =>
                    <ToggleGroupItem value={item.instance_id} key={item.instance_id}
                                     onClick={() => onClickPopoverItem?.(AlgorithmPlatform.Other, item.instance_id)}>{item.algorithm_name}</ToggleGroupItem>)}
                </ToggleGroup>
              </PopoverContent>
            </Popover>
            : <span className={"text-[18px]"}>{title}</span>
        }
      </div>
      <img className={"h-[8px]"} src={titleBar} alt=""/>
    </div>
  );
};

export default CockpitTitle;

