import {CircleCheckBig} from "lucide-react";

const Complete = () => {
  return (
    <div
      className="text-lg py-4 text-green-500 font-semibold content-center h-full flex flex-col items-center space-y-4">
      <CircleCheckBig size={64}/>
      <span className={"text-[32px]"}>已归档</span>
    </div>
  );
};

export default Complete;

