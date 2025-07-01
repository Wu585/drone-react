import {CircleCheckBig} from "lucide-react";
import OrderDetail from "@/components/drone/work-order/OrderDetail.tsx";
import {WorkOrder} from "@/hooks/drone";

interface Props {
  currentOrder?: WorkOrder;
}

const Complete = ({currentOrder}: Props) => {
  return (
    <div>
      <OrderDetail currentOrder={currentOrder}/>
      <div
        className="text-lg py-4 text-green-500 font-semibold content-center h-full flex flex-col items-center space-y-4">
        <CircleCheckBig size={64}/>
        <span className={"text-[32px]"}>已归档</span>
      </div>
    </div>
  );
};

export default Complete;

