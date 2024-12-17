import {Progress} from "@/components/ui/progress.tsx";

const HousePeopleImportantPeople = () => {
  return (
    <div className={"space-y-4"}>
      <div>
        <div className={"flex items-center justify-center"}>
          <span className={"whitespace-nowrap mr-6"}>秀枫苑</span>
          <Progress value={80}/>
        </div>
        <div className={"flex items-center justify-center"}>
          <span className={"whitespace-nowrap mr-6"}>九华新园</span>
          <Progress value={20}/>
        </div>
        <div className={"flex items-center justify-center"}>
          <span className={"whitespace-nowrap mr-6"}>九华苑</span>
          <Progress value={30}/>
        </div>
        <div className={"flex items-center justify-center"}>
          <span className={"whitespace-nowrap mr-6"}>景河苑</span>
          <Progress value={30}/>
        </div>
        <div className={"flex items-center justify-center"}>
          <span className={"whitespace-nowrap mr-6"}>奉浦苑</span>
          <Progress value={10}/>
        </div>
      </div>
    </div>
  );
};

export default HousePeopleImportantPeople;

