import {FC, useEffect, useRef} from "react";
import * as echarts from "echarts";
import {EChartsOption} from "echarts";

interface Props extends EChartsOption {
  xAxisData: string[];
  seriesData: number[];
  rotate?: number;
  interval?: number;
}

const AreaLineChart: FC<Props> = ({xAxisData, seriesData, rotate = 300, interval, ...rest}) => {
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
      grid: {
        top: "8px",
        left: "10px",
        right: "20px",
        bottom: "10px",
        containLabel: true
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          animation: false,
          label: {
            backgroundColor: "#505765"
          }
        }
      },
      legend: {
        data: ["Flow"],
        left: 10
      },
      xAxis: [
        {
          axisLabel: {
            interval,
            textStyle: {
              color: "#fff",
              fontSize: 14
            },
          },
          type: "category",
          boundaryGap: false,
          axisLine: {onZero: false},
          // prettier-ignore
          data: xAxisData.map(str => str.replace(" ", "\n"))
        }
      ],
      yAxis: [
        {
          name: "累积流量",
          type: "value",
          axisLabel: {
            textStyle: {
              color: "#fff",
              fontSize: 14
            }
          },
        }
      ],
      series: [
        {
          name: "累积流量",
          type: "line",
          areaStyle: {},
          lineStyle: {
            width: 1
          },
          emphasis: {
            focus: "series"
          },
          markArea: {
            silent: true,
            itemStyle: {
              opacity: 0.3
            },
            data: [
              [
                {
                  xAxis: "2009/9/12\n7:00"
                },
                {
                  xAxis: "2009/9/22\n7:00"
                }
              ]
            ]
          },
          // prettier-ignore
          data: seriesData
        }
      ],
      ...rest
    };
    myChart.current?.setOption(option, true);
  }, [xAxisData, seriesData, rest]);

  return (
    <div ref={div} className={"w-full h-full"}></div>
  );
};

export default AreaLineChart;

