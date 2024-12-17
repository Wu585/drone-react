import shuiweiPng from "@/assets/images/shuiwei.png";

const WaterLevelInfo = () => {
  return (
    <div style={{
      background: "linear-gradient(270deg, rgba(57,107,196,0) 0%, rgba(33, 96, 217, 0.6) 100%)",
      borderTopLeftRadius: "50px",
      borderBottomLeftRadius: "50px"
    }} className={"w-full h-[100px] flex items-center justify-center mb-2 space-x-8"}>
      <img src={shuiweiPng} alt=""/>
      <div className={"flex flex-col justify-center items-center"}>
        <span className={"text-[#FFB24D] text-[30px]"}>25.2M</span>
        <span>预估水位</span>
      </div>
      <div className={"flex flex-col justify-center items-center"}>
        <span className={"text-[#4DFFF9] text-[30px]"}>12.2M</span>
        <span>安全水位</span>
      </div>
    </div>
  );
};

export default WaterLevelInfo;

