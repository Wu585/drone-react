import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {ReactNode} from "react";
import {cn} from "@/lib/utils.ts";

interface TabItem<T extends string> {
  value: T;
  label: ReactNode;
  content?: ReactNode;
}

interface CommonTabsProps<T extends string> {
  tabs: TabItem<T>[];
  defaultValue?: T;
  action?: ReactNode;
}

const CommonTabs = <T extends string>({tabs, defaultValue = tabs[0]?.value, action}: CommonTabsProps<T>) => {
  return (
    <Tabs defaultValue={defaultValue} className="w-full h-full">
      <div className={cn("", action ? "flex justify-between" : "")}>
        <TabsList
          className={cn(`grid bg-[#0076B0]/[.4]`, action ? "" : "w-full")}
          style={{
            gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`
          }}>
          {tabs.map(({label, value}) =>
            <TabsTrigger key={value} value={value}
                         className={"data-[state=active]:bg-[#43ABFF]"}>{label}</TabsTrigger>)}
        </TabsList>
        {action}
      </div>
      {tabs.map(({value, content}) => <TabsContent key={value} value={value}>{content}</TabsContent>)}
    </Tabs>
  );
};

export default CommonTabs;

