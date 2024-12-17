import parkingCountsPng from "@/assets/images/parking-counts-bg.png"

const ParkingCounts = () => {
  return (
    <div className={"flex relative"}>
      <img className={"h-[180px] w-full"} src={parkingCountsPng} alt=""/>
      <div style={{
        transform: 'translate(-50%,-50%)'
      }} className={"absolute left-1/2 top-1/2 flex justify-center items-center space-x-4"}>
        <div className={"flex flex-col justify-center items-center pl-16"}>
          <span className={"text-[38px] font-bold"}>230</span>
          <span>总车位</span>
        </div>
        <div className={"flex flex-col justify-center items-center pl-8"}>
          <span className={"text-[38px] text-[#FFA82F] font-bold"}>126</span>
          <span className={"whitespace-nowrap"}>已使用车位</span>
        </div>
      </div>
    </div>
  );
};

export default ParkingCounts;

