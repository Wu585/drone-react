import {FC, useEffect, useRef} from "react";
import * as echarts from "echarts";
import {EChartsOption, SeriesOption} from "echarts";

interface Props extends EChartsOption {
  xAxisData: string[];
  seriesData: SeriesOption[];
  rotate?: number;
}

const CommonMultiBarChart: FC<Props> = ({xAxisData, seriesData, rotate = 0, ...rest}) => {
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
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        }
      },
      xAxis: {
        type: "category",
        boundaryGap: true,
        data: xAxisData,
        axisLabel: {
          textStyle: {
            color: "#fff",
            fontSize: 14
          },
          rotate  //标签倾斜的角度，显示不全时可以通过旋转防止标签重叠（-90到90）
        }
      },
      yAxis: [
        {
          type: "value",
          axisLabel: {
            textStyle: {
              color: "#fff",
              fontSize: 14
            }
          }
        }
      ],
      series: seriesData,
      ...rest
    };
    myChart.current?.setOption(option, true);
  }, [xAxisData, seriesData, rest]);

  return (
    <div ref={div} className={"w-full h-full"}></div>
  );
};

export default CommonMultiBarChart;

