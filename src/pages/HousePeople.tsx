import DisPlayItemLayout from "@/components/public/DisPlayItemLayout.tsx";
import {useSceneStore} from "@/store/useSceneStore.ts";
import {cn} from "@/lib/utils.ts";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import ToolBarWithPosition from "@/components/public/ToolBarWithPosition.tsx";
import {useEffect, useState} from "react";
import {humanMigrations} from "@/assets/datas/human-migration.ts";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CalendarIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar.tsx";
import dayjs from "dayjs";
import SelectTable from "@/components/house-people/SelectTable.tsx";
import SelectChartByDateAndTime from "@/components/house-people/SelectChartByDateAndTime.tsx";

const HousePeople = () => {
  const {isFullScreen} = useSceneStore();

  const [month, setMonth] = useState(7);

  const [filterTableData, setFilterTableData] = useState<{
    "date": number,
    "time": number,
    "name": string,
    "effective-counts": number,
    "uneffective-counts": number
  }[]>([]);

  const [filterParams, setFilterParams] = useState<{
    date: Date | undefined;
    region: string,
    time: string
  }>({
    date: new Date(2024, 6, 3),
    region: "all",
    time: "all"
  });

  useEffect(() => {
    let tmpData = humanMigrations;
    const date = +dayjs(filterParams["date"]).format("YYYYMMDD");
    if (filterParams.date) {
      tmpData = tmpData.filter(item => item.date === date);
    }
    if (filterParams.region !== "all") {
      tmpData = tmpData.filter(item => item.name === filterParams.region).sort((a, b) => a.time - b.time);
    }
    if (filterParams.time !== "all") {
      tmpData = tmpData.filter(item => item.time === +filterParams.time);
    }
    setFilterTableData(tmpData);
  }, [filterParams]);

  const groupByName = humanMigrations.reduce((group: any, item) => {
    const {name} = item;
    group[name] = group[name] ?? [];
    group[name].push(item);
    return group;
  }, {});

  const groupByCounts = Object.keys(groupByName).map(name => ({
    name,
    effectiveCounts: groupByName[name].reduce((counts: number, item: any) => {
      counts += item["effective-counts"];
      return counts;
    }, 0),
    uneffectiveCounts: groupByName[name].reduce((counts: number, item: any) => {
      counts += item["uneffective-counts"];
      return counts;
    }, 0),
  })).sort((a, b) => b.effectiveCounts - a.effectiveCounts);

  /*useEffect(() => {
    flyToView(-2857800.500386217, 4670971.063061702, 3259613.688213728,
      3.6966562017560847, -0.23731012326766177, 0.0000013286370093013034);
  }, []);*/

  return (
    <>
      {isFullScreen &&
        <>
          <div className={"z-10 absolute top-[100px] left-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"人口流量统计"}>
              {/*<div className={"w-full h-[250px] flex"}>
                <CommonFullPie
                  color={["#0CFFC4", "#4082E4"]}
                  data={[
                    {name: "有效人流数", value: effectiveCounts},
                    {name: "无限制人流数", value: unEffectiveCounts},
                  ]}
                  legend={{
                    data: ["有效人流数", "无限制人流数"],
                    textStyle: {
                      color: "#fff",
                      fontSize: 16
                    },
                    right: 0,
                    top: 12
                  }}
                />
              </div>*/}
              <div>
                <div className={"flex items-center whitespace-nowrap mb-[12px]"}>
                  <span>月份：</span>
                  <Select value={month.toString()} onValueChange={(value) => setMonth(+value)}>
                    <SelectTrigger className="w-[180px] h-full bg-transparent">
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={"1"}>1</SelectItem>
                        <SelectItem value={"2"}>2</SelectItem>
                        <SelectItem value={"3"}>3</SelectItem>
                        <SelectItem value={"4"}>4</SelectItem>
                        <SelectItem value={"5"}>5</SelectItem>
                        <SelectItem value={"6"}>6</SelectItem>
                        <SelectItem value={"7"}>7</SelectItem>
                        <SelectItem value={"8"}>8</SelectItem>
                        <SelectItem value={"9"}>9</SelectItem>
                        <SelectItem value={"10"}>10</SelectItem>
                        <SelectItem value={"11"}>11</SelectItem>
                        <SelectItem value={"12"}>12</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <NewCommonTable
                height={350}
                data={month === 7 ? groupByCounts : []}
                columns={
                  [
                    {
                      key: "位置名称",
                      render: (item) => <>{item.name}</>
                    },
                    {
                      key: "有效人流数",
                      render: (item) => <>{item.effectiveCounts}</>
                    },
                    {
                      key: "无限制人流数",
                      render: (item) => <>{item.uneffectiveCounts}</>
                    },
                  ]
                }
              />
            </DisPlayItemLayout>
            <DisPlayItemLayout title={"按日期/时间段筛选"}>
              <SelectChartByDateAndTime/>
            </DisPlayItemLayout>
            {/*<DisPlayItemLayout title={"重点关怀人员"}>*/}
            {/*  <HousePeopleImportantPeople/>*/}
            {/*</DisPlayItemLayout>*/}
          </div>
          <div className={"z-10 absolute top-[100px] right-[30px] mt-[24px]"}>
            <DisPlayItemLayout title={"信息筛选"}>
              <div className={"space-y-4"}>
                <div className={"flex items-center"}>
                  <span>日期：</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        style={{
                          background: "transparent",
                        }}
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal text-white hover:text-white",
                          !filterParams.date && "text-white"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4"/>
                        {filterParams.date ? dayjs(filterParams.date).format("YYYY-MM-DD") : <span>请选择日期</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filterParams.date}
                        onSelect={(date) => setFilterParams({
                          ...filterParams,
                          date
                        })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className={"flex space-x-4"}>
                  <div className={"flex justify-center items-center whitespace-nowrap"}>
                    <span>区域：</span>
                    <Select value={filterParams.region} onValueChange={(value) => setFilterParams({
                      ...filterParams,
                      region: value
                    })}>
                      <SelectTrigger className="w-[180px] h-full bg-transparent">
                        <SelectValue placeholder={"请选择区域"}/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={"all"}>所有区域</SelectItem>
                          <SelectItem value={"绿地智尊"}>绿地智尊</SelectItem>
                          <SelectItem value={"宝龙商圈"}>宝龙商圈</SelectItem>
                          <SelectItem value={"悦澜天地商办楼"}>悦澜天地商办楼</SelectItem>
                          <SelectItem value={"韩村路"}>韩村路</SelectItem>
                          <SelectItem value={"亿阳菜场"}>亿阳菜场</SelectItem>
                          <SelectItem value={"锦梓家园"}>锦梓家园</SelectItem>
                          <SelectItem value={"航星二村"}>航星二村</SelectItem>
                          <SelectItem value={"华龙别墅"}>华龙别墅</SelectItem>
                          <SelectItem value={"半岛君望"}>半岛君望</SelectItem>
                          <SelectItem value={"百合苑"}>百合苑</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className={"flex justify-center items-center whitespace-nowrap"}>
                    <span>时间：</span>
                    <Select value={filterParams.time} onValueChange={(value) => setFilterParams({
                      ...filterParams,
                      time: value
                    })}>
                      <SelectTrigger className="w-[180px] h-full bg-transparent">
                        <SelectValue placeholder={"请选择时间"}/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">所有时间</SelectItem>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(item =>
                            <SelectItem value={item.toString()}>{item.toString()}</SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <NewCommonTable
                    height={350}
                    data={filterTableData}
                    columns={
                      [
                        {
                          key: "位置名称",
                          render: (item) => <>{item.name}</>
                        },
                        {
                          key: "时间",
                          render: (item) => <>{item.time}</>
                        },
                        {
                          key: "有效人流数",
                          render: (item) => <>{item["effective-counts"]}</>
                        },
                        {
                          key: "无限制人流数",
                          render: (item) => <>{item["uneffective-counts"]}</>
                        },
                      ]
                    }
                  />
                </div>
              </div>
            </DisPlayItemLayout>
            <DisPlayItemLayout title={"人口流动数量性别/年龄段分类"}>
              <div className={"h-[350px] w-full"}>
                <SelectTable/>
              </div>
            </DisPlayItemLayout>
          </div>
          <div style={{
            backgroundSize: "100% 100%"
          }} className={cn("bg-side-container bg-no-repeat w-[560px] h-full absolute top-0 left-0 z-5 my-[80px]",
            isFullScreen ? "w-[560px]" : "w-0")}/>
          <div style={{
            backgroundSize: "100% 100%"
          }} className={cn("bg-side-container bg-no-repeat w-[560px] h-full absolute top-0 right-0 z-5 my-[80px]",
            isFullScreen ? "w-[560px]" : "w-0")}/>
        </>}
      <ToolBarWithPosition/>
    </>
  );
};

export default HousePeople;

