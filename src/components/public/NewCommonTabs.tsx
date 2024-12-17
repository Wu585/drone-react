import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {ReactNode, useState} from "react";
import tabActiveIcon from "@/assets/images/tab-active-icon.png";

interface TabItem<T extends string> {
  value: T;
  label: ReactNode;
  content?: ReactNode;
}

interface NewCommonTabsProps<T extends string> {
  tabs: TabItem<T>[];
  defaultValue?: T;
  onChangeTab?: (tab: string) => void;
}

const NewCommonTabs = <T extends string>({tabs, defaultValue = tabs[0]?.value, onChangeTab}: NewCommonTabsProps<T>) => {
  const [activeTab, setActiveTab] = useState<string>(defaultValue);

  const onChangeValue = (value: string) => {
    setActiveTab(value);
    onChangeTab?.(value);
  };

  return (
    <Tabs onValueChange={onChangeValue} defaultValue={defaultValue} className="w-full h-full">
      <TabsList
        className={`w-full grid bg-transparent`}
        style={{
          gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`
        }}>
        {tabs.map(({label, value}) =>
          <TabsTrigger
            key={value}
            value={value}
            className={"text-[#ccc] text-[16px] data-[state=active]:bg-transparent data-[state=active]:text-[#3DCAFF] "}>
            {activeTab === value && <img src={tabActiveIcon} alt=""/>}
            {label}
          </TabsTrigger>)}
      </TabsList>
      {tabs.map(({value, content}) => <TabsContent key={value} value={value}>{content}</TabsContent>)}
    </Tabs>
  );
};

export default NewCommonTabs;

