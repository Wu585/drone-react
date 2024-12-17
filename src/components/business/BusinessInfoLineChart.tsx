import {useEffect, useRef} from "react";
import * as echarts from "echarts";

const BusinessInfoLineChart = () => {
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
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["一月", "二月", "三月", "四月", "五月"],
        axisLabel: {
          textStyle: {
            color: "#fff",
            fontSize: 14
          }
        }
      },
      yAxis: {
        type: "value",
        axisLabel: {
          textStyle: {
            color: "#fff",
            fontSize: 14
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: [10, 10],
            dashOffset: 10,
            color: ["rgba(255,255,255,0.3)"]
          },
        },
      },
      grid: {
        top: "8px",
        left: "0px",
        right: "16px",
        bottom: "10px",
        containLabel: true
      },
      series: [
        {
          data: [4492.53, 4221.9, 4471.77, 3824.09, 4258.85],
          type: "line",
          smooth: true,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgb(51, 140, 247,1)"
              },
              {
                offset: 1,
                color: "rgba(51, 140, 246, 0)"
              }
            ])
          }
        }
      ]
    };

    myChart.current.setOption(option);
  }, []);

  return (
    <div ref={div} className={"w-full h-full"}></div>
  );
};

export default BusinessInfoLineChart;

