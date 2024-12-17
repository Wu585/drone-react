import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select.tsx";
import {areaIdNameMap} from "@/assets/datas/range.ts";
import {useBicycleStore} from "@/store/useBicycleStore.ts";

const AreaSelect = () => {
  const {queryParams, setQueryParams} = useBicycleStore();

  const onValueChange = (value: string) => {
    setQueryParams({
      ...queryParams,
      areaId: +value
    });
  };
  return (
    <Select defaultValue={"all"} onValueChange={onValueChange}>
      <SelectTrigger className="w-[120px] h-full bg-transparent border-none">
        <SelectValue placeholder="选择区域"/>
      </SelectTrigger>
      <SelectContent className={""}>
        <SelectGroup>
          <SelectItem value={"all"}>所有区域</SelectItem>
          {Object.keys(areaIdNameMap).map(areaId =>
            <SelectItem key={areaId} value={areaId}>{areaIdNameMap[areaId]}</SelectItem>)}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default AreaSelect;

