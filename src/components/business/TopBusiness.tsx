import {Progress} from "@/components/ui/progress.tsx";

const TopBusiness = () => {
  return (
    <div className={"space-y-2"}>
      <div className={"text-[18px]"}>
        <div className={"flex justify-between"}>
          <div className={"space-x-2"}>
            <span className={"text-[#FFCE38] font-bold"}>Top1</span>
            <span>华为</span>
          </div>
          <span>693.25万元</span>
        </div>
        <Progress className={"h-[12px]"} value={90}/>
      </div>

      <div className={"text-[18px]"}>
        <div className={"flex justify-between"}>
          <div className={"space-x-2"}>
            <span className={"text-[#FFCE38] font-bold"}>Top2</span>
            <span>荣威</span>
          </div>
          <span>626.05万元</span>
        </div>
        <Progress className={"h-[12px]"} value={80}/>
      </div>

      <div className={"text-[18px]"}>
        <div className={"flex justify-between"}>
          <div className={"space-x-2"}>
            <span className={"text-[#FFCE38] font-bold"}>Top3</span>
            <span>老庙黄金</span>
          </div>
          <span>592.36万元</span>
        </div>
        <Progress className={"h-[12px]"} value={70}/>
      </div>

      <div className={"text-[18px]"}>
        <div className={"flex justify-between"}>
          <div className={"space-x-2"}>
            <span className={"text-[#FFCE38] font-bold"}>Top4</span>
            <span>西塔老太太泥炉烤肉</span>
          </div>
          <span>539.34万元</span>
        </div>
        <Progress className={"h-[12px]"} value={60}/>
      </div>

      <div className={"text-[18px]"}>
        <div className={"flex justify-between"}>
          <div className={"space-x-2"}>
            <span className={"text-[#FFCE38] font-bold"}>Top5</span>
            <span>HOTMAXX</span>
          </div>
          <span>527.78万元</span>
        </div>
        <Progress className={"h-[12px]"} value={50}/>
      </div>
    </div>
  );
};

export default TopBusiness;

