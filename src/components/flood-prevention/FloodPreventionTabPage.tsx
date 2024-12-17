import NewCommonTabs from "@/components/public/NewCommonTabs.tsx";
import Supplies from "@/components/facilities/Supplies.tsx";

const FloodPreventionTabPage = () => {
  return (
    <div className={"w-[500px] font-NotoCJK h-full"}>
      <div className={"bg-display-item-title  bg-cover h-[54px] bg-no-repeat flex justify-center"}>
          <NewCommonTabs tabs={[
            {
              value: "1",
              label: "防汛物资",
              content: <Supplies/>
            },
            {
              value: "2",
              label: "生态环境",
              content: <div>22222</div>
            },
            {
              value: "3",
              label: "流速/流量",
            },
            {
              value: "4",
              label: "广告牌",
            },
            {
              value: "5",
              label: "应急预案",
            }
          ]}/>
      </div>
    </div>
  );
};

export default FloodPreventionTabPage;

