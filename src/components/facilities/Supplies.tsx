import SuppliesCounts from "@/components/flood-prevention/SuppliesCounts.tsx";
import NewCommonTable from "@/components/public/NewCommonTable.tsx";
import CommonPieChart from "@/components/public/CommonPieChart.tsx";
import {useQueryRegion} from "@/hooks/public/layers.ts";
import {useEffect, useRef, useState} from "react";
import {getCustomSource, useEntityCustomSource} from "@/hooks/public/custom-source.ts";
import {useVisible} from "@/hooks/public/utils.ts";
import {useAddLeftClickListener} from "@/hooks/public/event-listen.ts";
import {createPortal} from "react-dom";
import SuppliesPanel from "@/components/flood-prevention/SuppliesPanel.tsx";

const Supplies = () => {
  const {data} = useQueryRegion("WorkSpace", "fp", "奉浦街道社区");
  const {visible, show, hide} = useVisible();
  const [address, setAddress] = useState("");
  useEntityCustomSource("streetPolygon");
  const panelRef = useRef<HTMLDivElement>(null);

  const handleClickEntity = (description: any) => {
    show();
    console.log("description");
    console.log(description);
    setAddress(description.address);
  };

  useAddLeftClickListener(panelRef, handleClickEntity, false);
  useEffect(() => {
    if (!data) return;
    data?.features?.map((feature: any) => {
      const center = feature.geometry.center;
      const label = feature.fieldValues[5];
      getCustomSource("streetPolygon")?.entities.add({
        position: Cesium.Cartesian3.fromDegrees(center.x, center.y, 100),
        label: {
          text: label, // 标签文本
          font: "24px Helvetica", // 字体样式
          fillColor: Cesium.Color.YELLOW, // 填充颜色
          outlineWidth: 2, // 轮廓宽度
          style: Cesium.LabelStyle.FILL_AND_OUTLINE, // 标签样式
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 垂直原点
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 水平原点
          height: 200
        }
      });
      const poiArray = [];
      const geometryPoints = feature.geometry.points;
      geometryPoints.forEach((poi: any) => poiArray.push(poi.x, poi.y));
      poiArray.push(geometryPoints[0].x, geometryPoints[0].y);
      getCustomSource("streetPolygon")?.entities.add({
        id: feature.ID,
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(poiArray),
          material: new Cesium.Color.fromCssColorString("rgba(255, 167, 62, 0.5)")
        },
        description: JSON.stringify({
          address: feature.fieldValues[5]
        }),
      });
    });
  }, [data]);

  return (
    <>
      <div>
        <div className={"text-[20px] font-semibold px-4"}>物资总量统计</div>
        <SuppliesCounts/>
        <div className={"w-full h-[300px]"}>
          <CommonPieChart
            labelLine={true}
            labelPosition={"outside"}
            color={
              ["#2AB3B8", "#FFA551", "#FFD956", "#9EEBFF", "#2B74D3", "#6D57FF"]
            } data={[
            {name: "保障物资", value: 39},
            {name: "抢险物资", value: 7373},
            {name: "救生器材", value: 19},
            {name: "抢险器具", value: 2605},
            {name: "大型抢险器械", value: 14},
          ]}/>
        </div>
        <div className={"text-[20px] font-semibold px-4 py-4"}>防汛抢险物资信息</div>
        <NewCommonTable
          data={[
            {
              name: "折叠床",
              type: "救灾物资",
              address: "奉浦街道",
              person: "芦二广",
              phone: "138828818"
            },
            {
              name: "睡袋",
              type: "保温物资",
              address: "奉浦街道",
              person: "芦二广",
              phone: "138828818"
            },
            {
              name: "医疗急救箱",
              type: "医疗物资",
              address: "奉浦街道",
              person: "芦二广",
              phone: "138828818"
            },
            {
              name: "编织袋",
              type: "编织物料",
              address: "奉浦街道",
              person: "芦二广",
              phone: "138828818"
            },
            {
              name: "麻袋",
              type: "编织物料",
              address: "奉浦街道",
              person: "芦二广",
              phone: "138828818"
            }
          ]}
          columns={[
            {
              key: "物资名称",
              render: (item) => <>{item.name}</>
            },
            {
              key: "类型",
              render: (item) => <>{item.type}</>
            },
            {
              key: "储备地点",
              render: (item) => <>{item.address}</>
            },
            {
              key: "联系人",
              render: (item) => <>{item.person}</>
            },
            {
              key: "联系方式",
              render: (item) => <>{item.phone}</>
            },
          ]}/>
      </div>
      {visible && createPortal(
        <div style={{
          transform: "translate(-50%,-50%)"
        }} className={"w-[700px] absolute h-[710px] left-1/2 top-1/2"}>
          <SuppliesPanel address={address} onClose={hide}/>
        </div>, document.body)}
    </>
  );
};

export default Supplies;

