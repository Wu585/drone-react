import {Button, ButtonProps} from "@/components/ui/button.tsx";
import {FC} from "react";
import {cn} from "@/lib/utils.ts";

const CockpitButton: FC<ButtonProps> = (props) => {
  return (
    <Button style={{
      backgroundSize: "100% 100%"
    }} className={cn("bg-cockpit-button", props.className)} {...props}/>
  );
};

export default CockpitButton;

