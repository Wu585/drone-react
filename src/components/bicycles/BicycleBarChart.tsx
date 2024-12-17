import {FC, useEffect, useRef} from "react";
import * as echarts from "echarts";

interface BicycleBarChartProps {
  xAxisData: string[];
  activeData: number[];
  inActiveData: number[];
}

const BicycleBarChart: FC<BicycleBarChartProps> = ({xAxisData, activeData, inActiveData}) => {
  const div = useRef<HTMLDivElement>(null);
  const myChart = useRef<echarts.ECharts>();

  useEffect(() => {
    if (!div.current) {
      return;
    }

    myChart.current = echarts.init(div.current);

    const option = {
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["进入总数", "出去总数"],
        textStyle: {
          color: "#fff",
          fontSize: 16
        },
        right: 0,
        top: 12
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      toolbox: {
        show: true,
        orient: "vertical",
        left: "right",
        top: "center",
        feature: {
          mark: {show: true},
          dataView: {show: true, readOnly: false},
          magicType: {show: true, type: ["line", "bar", "stack"]},
          restore: {show: true},
          saveAsImage: {show: true}
        }
      },
      xAxis: [
        {
          type: "category",
          axisTick: {show: false},
          data: xAxisData,
          axisLabel: {
            textStyle: {
              color: "#fff"
            }
          }
        }
      ],
      yAxis: [
        {
          type: "value",
          axisLabel: {
            textStyle: {
              color: "#fff"
            }
          }
        }
      ],
      series: [
        {
          name: "进入总数",
          type: "bar",
          barGap: 0,
          emphasis: {
            focus: "series"
          },
          data: activeData
        },
        {
          name: "出去总数",
          type: "bar",
          emphasis: {
            focus: "series"
          },
          data: inActiveData
        },
      ]
    };

    myChart.current.setOption(option);
  }, [xAxisData, inActiveData, activeData]);

  return (
    <div ref={div} className={"w-full h-full"}></div>
  );
};

export default BicycleBarChart;

