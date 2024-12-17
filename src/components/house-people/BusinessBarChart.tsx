import {useEffect, useRef} from "react";
import * as echarts from "echarts";

const BusinessBarChart = () => {
  const div = useRef<HTMLDivElement>(null);
  const myChart = useRef<echarts.ECharts>();
  const initialized = useRef(false);

  useEffect(() => {
    if (!div.current) {
      return;
    }
    if (initialized.current) {
      return;
    }

    myChart.current = echarts.init(div.current);

    initialized.current = true;

    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      legend: {},
      grid: {
        top: "5%",
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        boundaryGap: [0, 0.01],
        axisLabel: {
          textStyle: {
            color: "#fff",
            fontSize: 14
          }
        },
        data: ["一月", "二月", "三月", "四月", "五月", "六月"]
      },
      yAxis: {
        type: "value",
        axisLabel: {
          textStyle: {
            color: "#fff",
            fontSize: 14
          }
        }
      },
      series: [
        {
          type: "bar",
          data: [120, 200, 150, 80, 70, 110, 130],
          barWidth: 24,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: "#83bff6"},
              {offset: 0.5, color: "#188df0"},
              {offset: 1, color: "#188df0"}
            ])
          },
        }
      ]
    };

    myChart.current.setOption(option);
  }, []);

  return (
    <div ref={div} className={"w-full h-full"}></div>
  );
};

export default BusinessBarChart;

