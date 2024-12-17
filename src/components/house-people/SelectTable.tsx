import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {useEffect, useState} from "react";
import {humanMigrationsByAgeRange, humanMigrationsByGender} from "@/assets/datas/human-migration.ts";
import CommonMultiLineChart from "@/components/public/CommonMultiLineChart.tsx";
import {SeriesOption} from "echarts";

const SelectTable = () => {
  const [params, setParams] = useState({
    region: "绿地智尊",
    type1: "0",
    type2: "0"
  });

  const [groupData, setGroupData] = useState<Record<string, {
    "date": number,
    "name": string,
    "gender": string,
    "effective": number | string,
    "unEffective": number
  }[]>>({});

  const [chartData, setChartData] = useState<SeriesOption[]>([]);

  useEffect(() => {
    let afterFilterData;
    if (params.type2 === "0") {
      afterFilterData = humanMigrationsByGender.filter(item => item.gender !== "NULL"
        && item.gender !== "未说明" && item.effective !== "NULL").filter(item => item.name === params.region);
      const groupByGender = afterFilterData.reduce((group: any, item) => {
        const {gender} = item;
        group[gender] = group[gender] ?? [];
        group[gender].push(item);
        return group;
      }, {});
      const _chartData: any[] = Object.keys(groupByGender).map(key => ({
        name: key,
        type: "line",
        data: params.type1 === "0" ? groupByGender[key].map((item: any) => item.effective) :
          groupByGender[key].map((item: any) => item.unEffective)
      }));
      setGroupData(groupByGender);
      setChartData(_chartData);
    } else {
      afterFilterData = humanMigrationsByAgeRange.filter(item => item.ageRange !== "NULL"
        && item.ageRange !== "未说明" && item.effective !== "NULL").filter(item => item.name === params.region);
      const groupByAgeRange = afterFilterData.reduce((group: any, item) => {
        const {ageRange} = item;
        group[ageRange] = group[ageRange] ?? [];
        group[ageRange].push(item);
        return group;
      }, {});
      const _chartData: any[] = Object.keys(groupByAgeRange).map(key => ({
        name: key,
        type: "line",
        data: params.type1 === "0" ? groupByAgeRange[key].map((item: any) => item.effective) :
          groupByAgeRange[key].map((item: any) => item.uneffecttive)
      }));
      setGroupData(groupByAgeRange);
      setChartData(_chartData);
    }
  }, [params]);

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between">
        <div className={"flex items-center whitespace-nowrap"}>
          <span>区域：</span>
          <Select value={params.region} onValueChange={(value) => setParams({...params, region: value})}>
            <SelectTrigger className="w-[180px] h-full bg-transparent">
              <SelectValue placeholder={"请选择区域"}/>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
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
          <span>人流类型：</span>
          <Select value={params.type1} onValueChange={(value) => setParams({...params, type1: value})}>
            <SelectTrigger className="w-[180px] h-full bg-transparent">
              <SelectValue placeholder={"请选择人流类型"}/>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"0"}>有效人流数</SelectItem>
                <SelectItem value={"1"}>无限制人流数</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className={"flex space-x-4 mt-[12px]"}>
        <div className={"flex justify-center items-center whitespace-nowrap"}>
          <span>类型：</span>
          <Select value={params.type2} onValueChange={(value) => setParams({...params, type2: value})}>
            <SelectTrigger className="w-[180px] h-full bg-transparent">
              <SelectValue placeholder={"请选择性别或年龄段"}/>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"0"}>性别</SelectItem>
                <SelectItem value={"1"}>年龄段</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className={"h-[250px] mt-[12px]"}>
        <CommonMultiLineChart
          tooltip={{
            trigger: "axis",
          }}
          xAxisData={groupData[Object.keys(groupData)[0]]?.map((item: any) => item.date) || []}
          seriesData={chartData || []}
        />
      </div>
    </div>
  );
};

export default SelectTable;

