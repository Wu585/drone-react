import {FC, useEffect, useRef} from "react";
import * as echarts from "echarts";
import {EChartsOption} from "echarts";
// @ts-ignore
import {LineLabelOption} from "echarts/types/src/util/types";

interface CommonFullPieProps extends EChartsOption {
  color: string[];
  data: {
    name: string
    value: number
  }[];
  labelLine?: boolean;
  labelPosition?: LineLabelOption;
  radius?: string | string[];
}

const CommonFullPie: FC<CommonFullPieProps> = ({color, data, ...restProps}) => {
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
          radius: "50%",
          avoidLabelOverlap: false,
          label: {
            color: "#fff",
            fontSize: "14px",
          },
          labelLine: {
            show: true
          },
          data
        }
      ],
      ...restProps
    };

    myChart.current.setOption(option);
  }, []);

  useEffect(() => {
    const option: EChartsOption = {
      series: [{
        data
      }]
    };
    myChart.current?.setOption(option);
  }, [data]);

  return (
    <div ref={div} className={"w-full h-full"}></div>
  );
};

export default CommonFullPie;

