import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import {cn} from "@/lib/utils.ts";
import {BicyclesInfo, useBicyclesInfo} from "@/hooks/bicycles/api.ts";
import {FC, useEffect, useState} from "react";
import {flyToDegree} from "@/lib/view.ts";
import {
  BicycleRideStateEnum,
  BicycleRideStateMap,
  BicycleTypeMap,
  BikeStatusEnum,
  BikeStatusMap
} from "@/assets/datas/enum.ts";
import {FadeLoader} from "react-spinners";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useBicycleStore} from "@/store/useBicycleStore.ts";
import {useDebouncedValue} from "@/hooks/public/utils.ts";

export const BiyCleTable: FC<{
  amount?: number
  bicycles?: {
    items: BicyclesInfo[],
    total: number
  }
  onClickRow?: (bicycle: BicyclesInfo) => void
}> = ({onClickRow}) => {
  const [page, setPage] = useState(1);

  const {queryParams, setQueryParams} = useBicycleStore();

  const debouncedQueryParams = useDebouncedValue(queryParams);

  const {data: bicycles, isLoading} = useBicyclesInfo(page, 6, debouncedQueryParams);

  useEffect(() => {
    setQueryParams({});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedQueryParams]);

  const onLastPage = () => {
    if (page === 1) {
      return;
    }
    setPage(page - 1);
  };

  const onNextPage = () => {
    if (page === Math.ceil((bicycles?.total || 0) / 6)) {
      return;
    }
    setPage(page + 1);
  };

  const _onClickRow = (bicycle: BicyclesInfo) => {
    const {longitude, latitude} = bicycle;
    flyToDegree(longitude, latitude);
    onClickRow?.(bicycle);
  };

  return (
    <>
      <div className={"h-[400px] overflow-auto flex flex-col justify-between"}>
        <Table>
          <TableHeader>
            <TableRow className={"border-none bg-[#2D63A6]"}>
              <TableHead className="w-[100px] text-center">单车编号</TableHead>
              <TableHead className={"text-center"}>单车类型</TableHead>
              <TableHead className={"w-[140px] text-center"}>
                <Select defaultValue={"all"} onValueChange={(value: string) => setQueryParams({
                  ...queryParams,
                  rideState: +value
                })}>
                  <SelectTrigger className="h-full bg-transparent border-none">
                    <SelectValue placeholder="骑行状态"/>
                  </SelectTrigger>
                  <SelectContent className={""}>
                    <SelectGroup>
                      {/*<SelectItem value={"all"}>骑行状态</SelectItem>*/}
                      <SelectItem value={"all"}>所有状态</SelectItem>
                      <SelectItem value={BicycleRideStateEnum.InUse.toString()}>骑行中</SelectItem>
                      <SelectItem value={BicycleRideStateEnum.InStop.toString()}>停放中</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead className={"w-[140px] text-center"}>
                <Select defaultValue={"all"} onValueChange={(value: string) => setQueryParams({
                  ...queryParams,
                  bikeStatus: +value
                })}>
                  <SelectTrigger className="h-full bg-transparent border-none">
                    <SelectValue placeholder="车辆状态"/>
                  </SelectTrigger>
                  <SelectContent className={""}>
                    <SelectGroup>
                      {/*<SelectItem value={"all"}>车辆状态</SelectItem>*/}
                      <SelectItem value={"all"}>所有状态</SelectItem>
                      <SelectItem value={BikeStatusEnum.Open.toString()}>开锁</SelectItem>
                      <SelectItem value={BikeStatusEnum.Close.toString()}>关锁</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={""}>
            {isLoading ? <TableRow>
              <TableCell
                colSpan={4}
                className="h-64 text-center bg-[#0F2046]/50"
              >
                <div className={"flex justify-center items-center"}>
                  <FadeLoader color={"#fff"}/>
                </div>
              </TableCell>
            </TableRow> : bicycles?.items.map((bicycle, index) => (
              <TableRow
                onClick={() => _onClickRow(bicycle)}
                className={cn("border-none cursor-pointer", index % 2 !== 0 ? "bg-[#4281CF] bg-opacity-40" : "bg-[#0F2046]/50")}
                key={bicycle.bikeId}>
                <TableCell className={"text-center"}>{bicycle.bikeId}</TableCell>
                <TableCell className={"text-center"}>{BicycleTypeMap[bicycle.bikeType]}</TableCell>
                <TableCell className={"text-center"}>{BicycleRideStateMap[bicycle.rideState]}</TableCell>
                <TableCell
                  className={"text-center"}>{BikeStatusMap[bicycle.bikeStatus]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className={"bg-[#0F2046]/50 flex justify-center items-center py-[8px]"}>
          <span className={"cursor-pointer"} onClick={() => onLastPage()}>{"<<"}</span>
          <span className={"px-[6px]"}>{page}</span>
          <span className={"cursor-pointer"} onClick={() => onNextPage()}>{">>"}</span>
          <span className={"px-[32px]"}>
            {page} / {Math.ceil((bicycles?.total || 0) / 6)}
          </span>
        </div>
      </div>
    </>
  );
};
