import rwsjzsPng from "@/assets/images/food-supervision.png";

interface FoodSupervisionItemProps {
  title: string;
  amount: number;
}

const FoodSupervisionItem = ({title, amount}: FoodSupervisionItemProps) => {
  return (
    <div className={"bg-100% bg-rwsjzs-bg flex justify-between px-[16px] py-[4px] items-center"}>
      <span>{title}</span>
      <span className={"text-[#11FF88] font-bold text-[20px]"}>{amount}</span>
    </div>
  );
};

const FoodSupervision = () => {
  return (
    <div className={"space-y-2"}>
      <div className={"flex items-center space-x-[20px]"}>
        <img src={rwsjzsPng} alt=""/>
        <span className={"text-[#F3F3F3]"}>入网商家总数</span>
        <span className={"text-[38px] text-[#33DAFC] font-bold"}>21</span>
      </div>
      <div className={"grid grid-cols-2 gap-x-[26px] gap-y-[8px]"}>
        <FoodSupervisionItem title={"连锁餐饮"} amount={20}/>
        <FoodSupervisionItem title={"社区食堂"} amount={1}/>
      </div>
    </div>
  );
};

export default FoodSupervision;

