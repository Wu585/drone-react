import cameraTestPng from "@/assets/images/camer-test.png";

const Monitor = () => {
  return (
    <div className={"flex"}>
      <div className={"flex flex-col  space-y-2"}>
        <div style={{
          background: "linear-gradient(270deg, rgba(51,218,252,0) 0%, #33DAFC 100%)"
        }} className={"font-semibold w-[110px]"}>监控点位1
        </div>
        <div className={"font-semibold w-[110px]"}>监控点位2</div>
        <div className={"font-semibold w-[110px]"}>监控点位3</div>
        <div className={"font-semibold w-[110px]"}>监控点位4</div>
        <div className={"font-semibold w-[110px]"}>监控点位5</div>
        <div className={"font-semibold w-[110px]"}>监控点位6</div>
      </div>
      <div className={"space-y-4"}>
        <div className={"w-[300px] h-200px] flex justify-center items-center"}>
          <img src={cameraTestPng} alt=""/>
        </div>
        <div className={"bg-rwsjzs-bg flex bg-100% justify-between pb-[8px]"}>
          <span className={"text-[#33DAFC]"}>奉浦酒店后厨2号摄像头</span>
          <div className={"flex items-center space-x-2"}>
            <span className={"w-[6px] h-[6px] bg-[#00FF79] rounded-full"}></span>
            <span className={"text-[#00FF79]"}>在线</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Monitor;

