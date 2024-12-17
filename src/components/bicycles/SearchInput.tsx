import {Search} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {ChangeEventHandler} from "react";
import {useBicycleStore} from "@/store/useBicycleStore.ts";

const SearchInput = () => {
  const {queryParams, setQueryParams} = useBicycleStore();
  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setQueryParams({
      ...queryParams,
      bikeId: e.target.value
    });
  };

  return (
    <div className={"flex items-center"}>
      <Search className={"w-4 h-4"}/>
      <Input placeholder={"输入单车编号"} className={"bg-transparent text-white border-none focus-visible:outline-none"} onChange={onChange}/>
    </div>
  );
};

export default SearchInput;

