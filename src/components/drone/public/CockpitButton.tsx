import {Button, ButtonProps} from "@/components/ui/button.tsx";
import {FC} from "react";

const CockpitButton: FC<ButtonProps> = (props) => {
  return (
    <Button className={"bg-cockpit-button w-[117px] h-[36px]"} {...props}/>
  );
};

export default CockpitButton;

