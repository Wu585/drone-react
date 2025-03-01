import titleIcon from "@/assets/images/drone/screen/title-icon.png";
import {getScreenImageUrl} from "@/lib/utils.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import CommonBarChart from "@/components/public/CommonBarChart.tsx";

const FlightStatistics = () => {
  const menuList = [
    {
      name: "总架次",
      image: "zjc",
      unit: "架",
      number: 220
    },
    {
      name: "航线数量",
      image: "hxsl",
      unit: "条",
      number: 30
    },
    {
      name: "总时长",
      image: "zsc",
      unit: "时",
      number: 20.5
    },
    {
      name: "总里程",
      image: "zlc",
      unit: "km",
      number: 50
    }
  ];

  return (
    <div className={"bg-screen-content bg-full-size flex flex-col pr-[40px]"}>
      <header className={"bg-screen-title pl-[43px] bg-full-size h-[45px] flex items-center"}>飞行统计</header>
      <div className={"flex-1 pb-[30px] pl-[33px]"}>
        <div className={"flex items-center space-x-[20px] text-[12px] py-[13px]"}>
          <img src={titleIcon} className={"w-[12px]"} alt=""/>
          <span>当月数据</span>
        </div>
        <div className={"grid grid-cols-4 gap-[30px] pl-[8px] mb-[24px]"}>
          {menuList.map(item =>
            <div key={item.name} className={"bg-screen-flight-statis w-[177px] h-[70px] bg-full-size grid grid-cols-3"}>
              <div className={"content-center"}>
                <img src={getScreenImageUrl(item.image)} alt=""/>
              </div>
              <div className={"flex flex-col justify-center pl-[8px]"}>
                <div className={"text-[12px]"}>{item.name}</div>
                <div className={"text-[23px] font-semibold"}>{item.number}</div>
              </div>
              <div className={"flex items-end pb-[13px] pl-[4px]"}>
                ({item.unit})
              </div>
            </div>)}
        </div>
        <div className={"grid grid-cols-2 gap-[30px]"}>
          <div className={"space-y-4"}>
            <Select defaultValue={"2025"}>
              <SelectTrigger style={{
                backgroundSize: "100% 100%"
              }} className="w-[88px] h-[20px] bg-transparent bg-screen-select border-none text-[16px] font-semibold">
                <SelectValue placeholder="Theme"/>
              </SelectTrigger>
              <SelectContent className={"min-w-[88px]"}>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
            <div className={"h-[193px]"}>
              <CommonBarChart xAxisData={["1月", "2月", "3月"]} seriesData={[10, 20, 30]}/>
            </div>
          </div>
          <div className={"space-y-4"}>
            <Select defaultValue={"2025"}>
              <SelectTrigger style={{
                backgroundSize: "100% 100%"
              }} className="w-[100px] h-[20px] bg-transparent bg-screen-select border-none text-[16px] font-semibold">
                <SelectValue placeholder="Theme"/>
              </SelectTrigger>
              <SelectContent className={"min-w-[88px]"}>
                <SelectItem value="2024">2025-1</SelectItem>
                <SelectItem value="2025">2025-2</SelectItem>
                <SelectItem value="2026">2025-3</SelectItem>
              </SelectContent>
            </Select>
            <div className={"h-[193px]"}>
              <CommonBarChart xAxisData={["1", "2", "3", "4", "5", "6"]} seriesData={[10, 20, 30, 20, 10, 8]}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightStatistics;

