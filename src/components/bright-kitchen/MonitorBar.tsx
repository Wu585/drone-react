import {useEffect, useRef} from "react";
import * as echarts from "echarts";

const MonitorBar = () => {
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
        trigger: 'axis',
        axisPointer: {
          type: 'none'
        },
        formatter: function (params:any) {
          return params[0].name + ': ' + params[0].value;
        }
      },
      grid: {
        top: "5%",
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: {
        data: ['区域1', '区域2', '区域3', '区域4', '区域5', '区域6'],
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: 'white'
        }
      },
      yAxis: {
        splitLine: { show: false },
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: 'white'
        }
      },
      series: [
        {
          name: 'hill',
          type: 'pictorialBar',
          barCategoryGap: '-80%',
          symbol: 'path://M0,10 L10,10 C5.5,10 5.5,5 5,0 C4.5,5 4.5,10 0,10 z',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: "#58FFD9"},
              {offset: 1, color: "#6ECC7C"},
            ])
          },
          emphasis: {
            itemStyle: {
              opacity: 1
            }
          },
          data: [125, 80, 160, 80, 160, 80, 120, 70],
          z: 10
        },
        {
          name: 'glyph',
          barGap: '-100%',
          symbolPosition: 'end',
          symbolSize: 50,
          symbolOffset: [0, '-120%'],
          data: [
            {
              value: 123,
              symbolSize: [60, 60]
            },
            {
              value: 60,
              symbolSize: [50, 60]
            },
            {
              value: 25,
              symbolSize: [65, 35]
            },
            {
              value: 18,
              symbolSize: [50, 30]
            },
            {
              value: 12,
              symbolSize: [50, 35]
            },
            {
              value: 9,
              symbolSize: [40, 30]
            },
            {
              value: 2,
              symbolSize: [40, 50]
            },
            {
              value: 1,
              symbolSize: [40, 50]
            }
          ]
        }
      ]
    };

    myChart.current.setOption(option);
  }, []);

  return (
    <div ref={div} className={"w-full h-full"}></div>
  );
};

export default MonitorBar;

