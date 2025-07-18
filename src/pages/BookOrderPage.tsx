import titleArrowPng from "@/assets/images/drone/title-arrow.png";
import WorkOrderDataTable from "@/components/drone/work-order/WorkOrderDataTable.tsx";

const BookOrderPage = () => {

  return (
    <div className={"flex-1 border-[#43ABFF] border-[1px] border-l-0 flex flex-col " +
      "rounded-r-lg w-full h-full bg-gradient-to-r from-[#172A4F]/[.6] to-[#233558]/[.6]"}>
      <h1 className={"flex justify-between items-center"}>
        <div className={"py-4 px-4 flex space-x-4"}>
          <img src={titleArrowPng} alt=""/>
          <span>工单管理</span>
        </div>
      </h1>
      <div className={"flex-1 px-4"}>
        <WorkOrderDataTable/>
      </div>
    </div>
  );
};

export default BookOrderPage;

