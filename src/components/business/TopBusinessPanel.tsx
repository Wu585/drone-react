import closePng from "@/assets/images/panel-close.png";
import {ChangeEventHandler, FC, useEffect, useState} from "react";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import {businessExcel} from "@/assets/datas/business-excel.ts";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Input} from "@/components/ui/input.tsx";
import {ArrowUpDown} from "lucide-react";

interface TopBusinessPanelProps {
  onClose?: () => void;
}

const TopBusinessPanel: FC<TopBusinessPanelProps> = ({onClose}) => {
  const [businessData, setBusinessData] = useState(businessExcel);

  const firstLevelLabel = Array.from(new Set(businessExcel.map(item => item["一级标签"])));
  const secondLevelLabel = Array.from(new Set(businessExcel.map(item => item["二级标签"]))).filter(item => item);

  const [searchParam, setSearchParam] = useState({
    firstLevelLabel: "all",
    secondLevelLabel: "all",
    searchLabel: ""
  });

  const onChangeInput: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearchParam({
      ...searchParam,
      searchLabel: e.target.value
    });
  };

  useEffect(() => {
    let filteredData = businessExcel;

    if (searchParam.firstLevelLabel !== "all") {
      filteredData = filteredData.filter(item => item["一级标签"] === searchParam.firstLevelLabel);
    }

    if (searchParam.secondLevelLabel !== "all") {
      filteredData = filteredData.filter(item => item["二级标签"] === searchParam.secondLevelLabel);
    }

    if (searchParam.searchLabel !== "") {
      filteredData = filteredData.filter(item => item["关键词"]?.includes(searchParam.searchLabel));
    }

    setBusinessData(filteredData);
  }, [searchParam]);

  const [sortDirections, setSortDirections] = useState({
    jzmj: 'asc',
    dyxse: 'asc',
    yjxse: 'asc',
    nxse: 'asc'
  });

  const onSort = (type: "jzmj" | "dyxse" | "yjxse" | "nxse") => {
    const newDirection = sortDirections[type] === 'asc' ? 'desc' : 'asc';
    setSortDirections({
      ...sortDirections,
      [type]: newDirection
    });

    switch (type) {
      case "jzmj":
        setBusinessData(businessData.sort((a, b) => {
          if (a["计租面积"] === undefined) return 1;
          if (b["计租面积"] === undefined) return -1;
          const diff = a["计租面积"] - b["计租面积"];
          return newDirection === 'asc' ? diff : -diff;
        }));
        break;
      case "dyxse":
        setBusinessData(businessData.sort((a, b) => {
          if (a["当月销售额（万元）"] === undefined) return 1;
          if (b["当月销售额（万元）"] === undefined) return -1;
          const diff = a["当月销售额（万元）"] - b["当月销售额（万元）"];
          return newDirection === 'asc' ? diff : -diff;
        }));
        break;
      case "nxse":
        setBusinessData(businessData.sort((a, b) => {
          if (a["月均销售（万元）"] === undefined) return 1;
          if (b["月均销售（万元）"] === undefined) return -1;
          const diff = a["月均销售（万元）"] - b["月均销售（万元）"];
          return newDirection === 'asc' ? diff : -diff;
        }));
        break;
      case "yjxse":
        setBusinessData(businessData.sort((a, b) => {
          if (a["年销售（万元）"] === undefined) return 1;
          if (b["年销售（万元）"] === undefined) return -1;
          const diff = a["年销售（万元）"] - b["年销售（万元）"];
          return newDirection === 'asc' ? diff : -diff;
        }));
        break;
    }
  };

  const onClosePanel = () => {
    onClose?.();
  };

  return (
    <div style={{
      backgroundSize: "100% 100%"
    }} className="bg-top-business h-full w-full relative">
      <div className={"absolute top-[28px] left-[36px] text-[22px] font-semibold"}>
        奉贤宝龙城市广场24年度TOP商铺列表
      </div>
      <img onClick={onClosePanel} className={"absolute right-[24px] top-[48px] cursor-pointer"} src={closePng} alt=""/>
      <div className={"absolute top-[90px] right-2 w-full pl-[32px] flex space-x-4"}>
        <div className={"flex justify-center items-center"}>
          <span className={"whitespace-nowrap"}>一级标签：</span>
          <Select value={searchParam.firstLevelLabel} defaultValue={"all"} onValueChange={(value) => setSearchParam({
            ...searchParam,
            firstLevelLabel: value
          })}>
            <SelectTrigger className="w-[120px] h-full bg-transparent">
              <SelectValue placeholder="选择区域"/>
            </SelectTrigger>
            <SelectContent className={""}>
              <SelectGroup>
                <SelectItem value={"all"}>所有标签</SelectItem>
                {firstLevelLabel.map(label => <SelectItem key={label} value={label}>{label}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className={"flex justify-center items-center"}>
          <span className={"whitespace-nowrap"}>二级标签：</span>
          <Select value={searchParam.secondLevelLabel} defaultValue={"all"} onValueChange={(value) => setSearchParam({
            ...searchParam,
            secondLevelLabel: value
          })}>
            <SelectTrigger className="w-[120px] h-full bg-transparent">
              <SelectValue placeholder="选择区域"/>
            </SelectTrigger>
            <SelectContent className={""}>
              <SelectGroup>
                <SelectItem value={"all"}>所有标签</SelectItem>
                {secondLevelLabel.map(label => <SelectItem key={label} value={label!}>{label}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className={"flex justify-center items-center"}>
          <span className={"whitespace-nowrap"}>关键词搜索：</span>
          <Input placeholder={"输入关键词"} value={searchParam.searchLabel} onChange={onChangeInput}
                 className={"bg-transparent text-white"}/>
        </div>
      </div>
      <div className={"absolute top-[140px] right-2 w-full h-[550px] overflow-auto pl-[16px]"}>
        <NewCommonTable
          height={550}
          data={businessData}
          columns={[
            {
              key: "序号",
              render: (item) => <>{item["序号"]}</>
            },
            {
              key: <div className={"w-[164px]"}>商铺号</div>,
              render: (item) => <>
                <div className={"w-[164px]"}>{item["商铺号"]}</div>
              </>
            },
            {
              key: "品  牌",
              render: (item) => <>{item["品  牌"]}</>
            },
            {
              key: "一级标签",
              render: (item) => <>{item["一级标签"]}</>
            },
            {
              key: "二级标签",
              render: (item) => <>{item["二级标签"]}</>
            },
            {
              key: "关键词",
              render: (item) => <>{item["关键词"]}</>
            },
            {
              key: <div className={"flex items-center justify-center"}>
                <span>计租面积</span>
                <ArrowUpDown onClick={() => onSort("jzmj")} className="ml-2 h-4 w-4 cursor-pointer"/>
              </div>,
              render: (item) => <>{item["计租面积"]}</>
            },
            {
              key: <div className={"flex items-center justify-center"}>
                <span>当月销售额（万元）</span>
                <ArrowUpDown onClick={() => onSort("dyxse")} className="h-4 w-4 cursor-pointer"/>
              </div>,
              render: (item) => <>{item["当月销售额（万元）"]?.toFixed(2)}</>
            },
            {
              key: <div className={"flex items-center justify-center"}>
                <span>月均销售（万元）</span>
                <ArrowUpDown onClick={() => onSort("yjxse")} className="ml-2 h-4 w-4 cursor-pointer"/>
              </div>,
              render: (item) => <>{item["月均销售（万元）"].toFixed(2)}</>
            },
            {
              key: <div className={"flex items-center justify-center"}>
                <span>年销售（万元）</span>
                <ArrowUpDown onClick={() => onSort("nxse")} className="ml-2 h-4 w-4 cursor-pointer"/>
              </div>,
              render: (item) => <>{item["年销售（万元）"].toFixed(2)}</>
            },
          ]}
        />
      </div>
    </div>
  );
};

export default TopBusinessPanel;

