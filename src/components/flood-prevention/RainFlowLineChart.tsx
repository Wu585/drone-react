import {useEffect, useRef} from "react";
import * as echarts from "echarts";

const RainFlowLineChart = () => {
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
        data: ["降雨量", "水位线"],
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
        data: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
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
          name: "降雨量",
          type: "line",
          stack: "Total",
          data: [120, 132, 101, 134, 90, 230, 210],
          smooth: true,
          symbol: "none"
        },
        {
          name: "水位线",
          type: "line",
          stack: "Total",
          data: [220, 182, 191, 234, 290, 330, 310],
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

export default RainFlowLineChart;

