import titleArrowPng from "@/assets/images/drone/title-arrow.png";
import AlgorithmDataTable from "@/components/algorithm/AlgorithmDataTable.tsx";
import AlgorithmGrid from "@/components/algorithm/AlgorithmGrid.tsx";

const AlgorithmConfig = () => {

  return (
    <div className={"w-full h-full flex"}>
      <div className={"flex-1 border-[#43ABFF] border-[1px] border-l-0 flex flex-col rounded-r-lg"}>
        <h1 className={"flex justify-between items-center"}>
          <div className={"py-4 px-4 flex space-x-4"}>
            <img src={titleArrowPng} alt=""/>
            <div className={"space-x-2"}>
              <span>算法配置</span>
            </div>
          </div>
        </h1>
        <div className={"flex-1 p-4"}>
          {/*<AlgorithmDataTable/>*/}
          <AlgorithmGrid/>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmConfig;

