import {getImageUrl} from "@/lib/utils.ts";

const SuppliesCounts = () => {
  return (
    <div className={"grid grid-cols-3 p-4 gap-4"}>
      <div className={"flex items-center"}>
        <img src={getImageUrl("choushuibeng")} alt=""/>
        <div className={"flex flex-col justify-center items-center"}>
          <span className={"text-[22px] font-bold"}>39</span>
          <span>保障物资</span>
        </div>
      </div>
      <div className={"flex items-center"}>
        <img src={getImageUrl("zhangpeng")} alt=""/>
        <div className={"flex flex-col justify-center items-center"}>
          <span className={"text-[22px] font-bold"}>7373</span>
          <span>抢险物资</span>
        </div>
      </div>
      <div className={"flex items-center"}>
        <img src={getImageUrl("chuan")} alt=""/>
        <div className={"flex flex-col justify-center items-center"}>
          <span className={"text-[22px] font-bold"}>19</span>
          <span>救生器材</span>
        </div>
      </div>
      <div className={"flex items-center"}>
        <img src={getImageUrl("yuxue")} alt=""/>
        <div className={"flex flex-col justify-center items-center"}>
          <span className={"text-[22px] font-bold"}>2605</span>
          <span>抢险器具</span>
        </div>
      </div>
      <div className={"flex items-center"}>
        <img src={getImageUrl("yuyi")} alt=""/>
        <div className={"flex flex-col justify-center items-center"}>
          <span className={"text-[22px] font-bold"}>14</span>
          <span className={"whitespace-nowrap"}>大型抢险器械</span>
        </div>
      </div>
      {/*<div className={"flex items-center"}>
        <img src={getImageUrl("shadai")} alt=""/>
        <div className={"flex flex-col justify-center items-center"}>
          <span className={"text-[22px] font-bold"}>200</span>
          <span>沙袋</span>
        </div>
      </div>*/}
    </div>
  );
};

export default SuppliesCounts;

