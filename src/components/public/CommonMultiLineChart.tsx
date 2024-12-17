import { FC, useEffect, useRef } from "react";
import * as echarts from "echarts";
import { EChartsOption, SeriesOption } from "echarts";

interface Props extends EChartsOption {
  xAxisData: string[];
  seriesData: SeriesOption[];
  rotate?: number;
  interval?: number;
  yAxisUnit?: string; // 新增的属性
}

const CommonMultiLineChart: FC<Props> = ({ xAxisData, seriesData, interval, rotate = 300, yAxisUnit, ...rest }) => {
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
  }, []);

  useEffect(() => {
    const option = {
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
          rotate  // 标签倾斜的角度
        }
      },
      yAxis: {
        type: "value",
        axisLabel: {
          textStyle: {
            color: "#fff",
            fontSize: 14
          },
          formatter: (value: number) => {
            return `${value}${yAxisUnit ? ` ${yAxisUnit}` : ''}`; // 使用自定义单位
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
        right: "60px",
        bottom: "10px",
        containLabel: true
      },
      series: seriesData,
      ...rest
    };
    myChart.current?.setOption(option, true);
  }, [xAxisData, seriesData, rest, yAxisUnit]); // 添加 yAxisUnit 作为依赖项

  return (
    <div ref={div} className={"w-full h-full"}></div>
  );
};

export default CommonMultiLineChart;
