import {FC, useEffect, useRef} from "react";
import * as echarts from "echarts";
import {EChartsOption} from "echarts";

interface Props extends EChartsOption {
  xAxisData: string[];
  seriesData: number[];
  rotate?: number;
  interval?: number;
}

const CommonLineChart: FC<Props> = ({xAxisData, seriesData, rotate = 300, interval, ...rest}) => {
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
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xAxisData,
        axisLabel: {
          interval,
          textStyle: {
            color: "#fff",
            fontSize: 14
          },
          rotate   //标签倾斜的角度，显示不全时可以通过旋转防止标签重叠（-90到90）
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
          data: seriesData,
          type: "line",
          smooth: true
        }
      ],
      ...rest
    };

    myChart.current.setOption(option);
  }, []);

  useEffect(() => {
    const option: EChartsOption = {
      xAxis: {
        data: xAxisData
      },
      series: [{
        data: seriesData
      }]
    };
    myChart.current?.setOption(option);
  }, [xAxisData, seriesData, rest]);

  return (
    <div ref={div} className={"w-full h-full"}></div>
  );
};

export default CommonLineChart;

