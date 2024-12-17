import * as echarts from "echarts";
import {useEffect, useRef} from "react";

const BicycleLineChart = (
  {comeInData, comeOutData}:
    {
      comeInData?: number[]
      comeOutData?: number[]
    }) => {
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
        trigger: "axis"
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
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["0:00", "03:00", "6:00", "9:00", "12:00", "15:00", "18:00", "21:00", "24:00"],
        axisLabel: {
          textStyle: {
            color: "#fff"
          }
        }
      },
      yAxis: {
        type: "value",
        axisLabel: {
          textStyle: {
            color: "#fff"
          }
        }
      },
      series: [
        {
          name: "进入总数",
          type: "line",
          stack: "Total",
          data: comeInData,
          smooth: true,
          symbol: "none"
        },
        {
          name: "出去总数",
          type: "line",
          stack: "Total",
          data: comeOutData,
          smooth: true,
          symbol: "none"
        }
      ]
    };

    myChart.current.setOption(option);
  }, []);

  return (
    <div ref={div} className={"w-full h-full"}></div>
  );
};

export default BicycleLineChart;

