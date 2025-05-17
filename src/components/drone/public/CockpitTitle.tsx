import titleIcon from "@/assets/images/drone/cockpit/title-icon.png";
import titleBar from "@/assets/images/drone/cockpit/title-bar.png";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";

interface Props {
  title?: string;
  groupList?: {
    name: string
    value: string
  }[];
  onGroupChange?: (value: string) => void;
  groupValue?: string;
}

const CockpitTitle = ({title, groupList, onGroupChange, groupValue}: Props) => {
  return (
    <div className={"flex space-x-[16px] items-center"}>
      <img src={titleIcon} alt=""/>
      {groupList ? <ToggleGroup value={groupValue} onValueChange={onGroupChange} type="single">
        {groupList.map(item =>
          <ToggleGroupItem
            className={"whitespace-nowrap hover:bg-transparent data-[state=on]:bg-transparent data-[state=on]:text-[#32A3FF]"}
            key={item.value}
            value={item.value}>{item.name}</ToggleGroupItem>)}
      </ToggleGroup> : <span className={"text-[18px]"}>{title}</span>}
      <img className={"h-[8px]"} src={titleBar} alt=""/>
    </div>
  );
};

export default CockpitTitle;

