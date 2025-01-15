import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  RedoDot
} from "lucide-react";
import {KeyCode} from "@/hooks/drone/useManualControl.ts";
import {FC} from "react";

interface Props {
  onMouseDown: (type: KeyCode) => void;
  onMouseUp: () => void;
}

const KeyboardControl: FC<Props> = ({onMouseDown, onMouseUp}) => {
  return (
    <div className={" grid grid-cols-4 gap-2"}>
      <div className={"col-span-3 grid grid-cols-3 gap-y-2"}>
        <div className={"flex flex-col content-center space-y-2"}>
          <span className={"text-[10px] text-[#9F9F9F]"}>Q</span>
          <span className={"w-[26px] h-[26px] bg-[#104992]/[.85] content-center cursor-pointer"}>
            <RedoDot
              onMouseDown={() => onMouseDown(KeyCode.KEY_Q)}
              onMouseUp={onMouseUp}
              className={"transform scale-x-[-1]"} size={16}
            />
         </span>
        </div>
        <div className={"flex flex-col content-center space-y-2"}>
          <span className={"text-[10px] text-[#9F9F9F]"}>W</span>
          <span className={"w-[26px] h-[26px] bg-[#104992]/[.85] content-center cursor-pointer"}>
            <ChevronUp onMouseDown={() => onMouseDown(KeyCode.KEY_W)}
                       onMouseUp={onMouseUp} size={16}/>
         </span>
        </div>
        <div className={"flex flex-col content-center space-y-2"}>
          <span className={"text-[10px] text-[#9F9F9F]"}>E</span>
          <span className={"w-[26px] h-[26px] bg-[#104992]/[.85] content-center cursor-pointer"}>
            <RedoDot onMouseDown={() => onMouseDown(KeyCode.KEY_E)}
                     onMouseUp={onMouseUp} size={16}/>
         </span>
        </div>
        <div className={"flex flex-col content-center space-y-2"}>
          <span className={"w-[26px] h-[26px] bg-[#104992]/[.85] content-center cursor-pointer"}>
            <ChevronLeft onMouseDown={() => onMouseDown(KeyCode.KEY_A)}
                         onMouseUp={onMouseUp} size={16}/>
         </span>
          <span className={"text-[10px] text-[#9F9F9F]"}>A</span>
        </div>
        <div className={"flex flex-col content-center space-y-2"}>
          <span className={"w-[26px] h-[26px] bg-[#104992]/[.85] content-center cursor-pointer"}>
            <ChevronDown onMouseDown={() => onMouseDown(KeyCode.KEY_S)}
                         onMouseUp={onMouseUp} size={16}/>
         </span>
          <span className={"text-[10px] text-[#9F9F9F]"}>S</span>
        </div>
        <div className={"flex flex-col content-center space-y-2"}>
          <span className={"w-[26px] h-[26px] bg-[#104992]/[.85] content-center cursor-pointer"}>
            <ChevronRight onMouseDown={() => onMouseDown(KeyCode.KEY_D)}
                          onMouseUp={onMouseUp} size={16}/>
         </span>
          <span className={"text-[10px] text-[#9F9F9F]"}>D</span>
        </div>
      </div>
      <div className={"col-span-1 grid grid-cols-1 gap-y-2"}>
        <div className={"flex flex-col content-center space-y-2"}>
          <span className={"text-[10px] text-[#9F9F9F]"}>↑</span>
          <span className={"w-[26px] h-[26px] bg-[#104992]/[.85] content-center cursor-pointer"}>
            <ArrowUp onMouseDown={() => onMouseDown(KeyCode.ARROW_UP)}
                     onMouseUp={onMouseUp} size={16}/>
         </span>
        </div>
        <div className={"flex flex-col content-center space-y-2"}>
          <span className={"w-[26px] h-[26px] bg-[#104992]/[.85] content-center cursor-pointer"}>
            <ArrowDown onMouseDown={() => onMouseDown(KeyCode.ARROW_DOWN)}
                       onMouseUp={onMouseUp} size={16}/>
         </span>
          <span className={"text-[10px] text-[#9F9F9F]"}>↓</span>
        </div>
      </div>
    </div>
  );
};

export default KeyboardControl;

