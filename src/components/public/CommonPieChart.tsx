import {FC, useEffect, useRef} from "react";
import * as echarts from "echarts";
import {EChartsOption} from "echarts";
// @ts-ignore
import {LineLabelOption} from "echarts/types/src/util/types";

interface CommonPieChartProps {
  color: string[];
  data: {
    name: string
    value: number
  }[];
  labelLine?: boolean;
  labelPosition?: LineLabelOption;
  radius?: string | string[]
}

const CommonPieChart: FC<CommonPieChartProps> = ({color, data, labelLine = false, labelPosition = "inner",radius = ["40%", "70%"]}) => {
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

    const option: EChartsOption = {
      tooltip: {
        trigger: "item"
      },
      /*legend: {
        top: '5%',
        left: 'center',
      },*/
      color,
      series: [
        {
          type: "pie",
          radius,
          avoidLabelOverlap: false,
          label: {
            color: "#fff",
            fontSize: "16px",
            position: labelPosition
          },
          emphasis: {},
          labelLine: {
            show: labelLine
          },
          data
        }
      ]
    };

    myChart.current.setOption(option);
  }, []);

  return (
    <div ref={div} className={"w-full h-full"}></div>
  );
};

export default CommonPieChart;

