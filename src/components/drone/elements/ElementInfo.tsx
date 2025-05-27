import {calcManyPointsDistance, ElementParam} from "@/hooks/drone/elements";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {MapElementEnum} from "@/types/map.ts";
import {useState, useEffect} from "react";
import {changeColor} from "@/hooks/drone/elements";
import * as turf from "@turf/turf";

export interface Element {
  name: string;
  id: string;
  color: string;
}

export const ColorPanel = ({element, setParam}: {
  element: Element,
  setParam: (param: Element) => void
}) => {
  const colorList = [
    {id: 1, name: "BLUE", color: "#2D8CF0"},
    {id: 2, name: "GREEN", color: "#19BE6B"},
    {id: 3, name: "YELLOW", color: "#FFBB00"},
    {id: 4, name: "ORANGE", color: "#B620E0"},
    {id: 5, name: "RED", color: "#E23C39"},
  ];

  const onChangeColor = (color: string) => {
    // 更新视觉效果
    changeColor(element.id, color);

    // 更新状态
    setParam({
      ...element,
      color: color
    });
  };

  return <div className={"flex space-x-2"}>
    {colorList.map(item =>
      <span
        onClick={() => onChangeColor(item.color)}
        key={item.id}
        style={{
          background: item.color,
          border: element.color === item.color ? "2px solid white" : "none"
        }}
        className={"w-4 h-4 cursor-pointer rounded-full"}
      />
    )}
  </div>;
};

export const PointElement = ({element, param, setParam}: {
  element: ElementParam,
  param: Element,
  setParam: (param: Element) => void
}) => {

  useEffect(() => {
    setParam({
      id: element.id,
      name: element.name,
      color: element.resource.content.properties.color
    });
  }, [element, setParam]);

  const map: Record<MapElementEnum, Element> = {
    [MapElementEnum.PIN]: () => <div className={"grid grid-cols-4 gap-2 my-4 text-base"}>
      <span>经度：</span>
      <span className={"col-span-3"}>{element.resource.content.geometry.coordinates[0]}</span>
      <span>纬度：</span>
      <span className={"col-span-3"}>{element.resource.content.geometry.coordinates[1]}</span>
      <span>高度：</span>
      <span className={"col-span-3"}>{element.resource.content.geometry.coordinates[2]}</span>
    </div>,
    [MapElementEnum.LINE]: () => <div className={"grid grid-cols-4 text-sm gap-2 my-4"}>
      <span>水平距离：</span>
      <span className={"col-span-3"}>
        {calcManyPointsDistance(element.resource.content.geometry.coordinates as [number, number][])} m</span>
    </div>,
    [MapElementEnum.POLY]: () => <div className={"grid grid-cols-4 text-sm gap-2 my-4"}>
      <span>面积：</span>
      <span
        className={"col-span-3"}>{turf.area(turf.polygon([[...element.resource.content.geometry.coordinates.flat(), element.resource.content.geometry.coordinates.flat()[0]]])).toFixed(2)} ㎡</span>
      <span>周长：</span>
      <span
        className={"col-span-3"}>{calcManyPointsDistance(element.resource.content.geometry.coordinates[0] as [number, number][])} m</span>
    </div>,
    [MapElementEnum.CIRCLE]: () => <div className={"grid grid-cols-4 text-sm gap-2 my-4"}>
      <span>圆心经度：</span>
      <span className={"col-span-3"}>{element.resource.content.geometry.coordinates[0]}</span>
      <span>圆心纬度：</span>
      <span className={"col-span-3"}>{element.resource.content.geometry.coordinates[1]}</span>
      <span>半径：</span>
      <span className={"col-span-3"}>{element.resource.content.geometry.radius} m</span>
    </div>,
  };

  return <div className={"my-2 space-y-4"}>
    <div className={"grid grid-cols-6 items-center text-base"}>
      <Label className={"col-span-1 text-base"}>标注名</Label>
      <Input
        className={"bg-transparent col-span-5"}
        value={param.name}
        onChange={(e) => {
          setParam({
            ...param,
            name: e.target.value
          });
        }}
      />
    </div>
    <div className={"grid grid-cols-6 items-center"}>
      <Label className={"col-span-1 text-base"}>颜色</Label>
      <div className={"col-span-5"}>
        <ColorPanel element={param} setParam={setParam}/>
      </div>
    </div>
    <div>
      <h3>标注数据：</h3>
      {map[element.resource.type]() || <div>暂无数据</div>}
    </div>
  </div>;
};

const ElementInfo = ({element, onParamChange}: {
  element: ElementParam,
  onParamChange: (param: Element) => void  // 添加回调函数属性
}) => {
  const [elementParam, setElementParam] = useState<Element>({
    id: element.id,
    name: element.name,
    color: element.resource.content.properties.color
  });

  // 当 elementParam 变化时通知父组件
  useEffect(() => {
    onParamChange(elementParam);
  }, [elementParam, onParamChange]);

  return (
    <div className={"space-y-4 "}>
      <PointElement element={element} param={elementParam} setParam={setElementParam}/>
    </div>
  );
};

export default ElementInfo;

