import titleIcon from "@/assets/images/drone/cockpit/title-icon.png";
import titleBar from "@/assets/images/drone/cockpit/title-bar.png";

interface Props {
  title: string;
}

const CockpitTitle = ({title}: Props) => {
  return (
    <div className={"flex space-x-[16px] items-center"}>
      <img src={titleIcon} alt=""/>
      <span className={"text-[18px]"}>{title}</span>
      <img className={"h-[8px]"} src={titleBar} alt=""/>
    </div>
  );
};

export default CockpitTitle;

