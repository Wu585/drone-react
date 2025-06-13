import {FC, useEffect, useRef} from "react";
import * as echarts from "echarts";
import {EChartsOption} from "echarts";

interface Props extends EChartsOption {
  xAxisData?: string[];
  seriesData?: number[];
  rotate?: number;
  interval?: number;
  value?: number;
  name?: string;
  min?: number;
  max?: number;
  unit?: string;
}

const GaugeBar: FC<Props> = ({
  value = 0,
  name = '水平速度',
  min = 0,
  max = 100,
  unit = 'm/s'
}) => {
  const div = useRef<HTMLDivElement>(null);
  const myChart = useRef<echarts.ECharts>();
  const initialized = useRef(false);

  // 初始化图表
  const initChart = () => {
    if (!div.current) return;

    if (!initialized.current) {
      myChart.current = echarts.init(div.current);
      initialized.current = true;
    }

    const option = {
      backgroundColor: 'transparent',
      /*tooltip: {
        formatter: '{a} <br/>{b} : {c}%',
        textStyle: {
          color: '#63E5FF'
        },
        backgroundColor: 'rgba(31,109,214,0.7)',
        borderColor: '#63E5FF',
        borderWidth: 1
      },*/
      series: [
        {
          name: 'Pressure',
          type: 'gauge',
          radius: '80%',
          startAngle: 240,
          endAngle: -60,
          min,
          max,
          progress: {
            show: true,
            width: 12,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: 'rgba(31,109,214,0.8)' },
                { offset: 1, color: '#63E5FF' }
              ])
            }
          },
          axisLine: {
            lineStyle: {
              width: 12,
              color: [
                [0.3, 'rgba(36,113,193,0.3)'],
                [0.7, 'rgba(31,109,214,0.5)'],
                [1, 'rgba(31,109,214,0.8)']
              ]
            }
          },
          axisTick: {
            distance: 12,
            length: 4,
            lineStyle: {
              color: '#91C4E8',
              width: 1
            }
          },
          splitLine: {
            distance: 12,
            length: 10,
            lineStyle: {
              color: '#91C4E8',
              width: 1,
              opacity: 0.5
            }
          },
          axisLabel: {
            color: '#91C4E8',
            fontSize: 12,
            distance: 15
          },
          pointer: {
            itemStyle: {
              color: '#63E5FF'
            },
            length: '60%'
          },
          anchor: {
            show: true,
            size: 6,
            itemStyle: {
              color: '#63E5FF'
            }
          },
          detail: {
            valueAnimation: true,
            formatter: `{value}${unit}`,
            color: '#63E5FF',
            fontSize: 16,
            fontWeight: 'bold',
            offsetCenter: [0, '30%']
          },
          title: {
            color: '#63E5FF',
            fontSize: 14,
            offsetCenter: [0, '75%']
          },
          data: [
            {
              value: value,
              name: name
            }
          ]
        }
      ]
    };

    myChart.current?.setOption(option);
  };

  // 处理图表大小调整
  const handleResize = () => {
    myChart.current?.resize();
  };

  useEffect(() => {
    initChart();

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (div.current) {
      resizeObserver.observe(div.current);
    }

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    return () => {
      // 清理监听器
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      myChart.current?.dispose();
    };
  }, []);

  // 更新图表数据
  useEffect(() => {
    if (!myChart.current) return;

    myChart.current.setOption({
      series: [{
        data: [{
          value: value,
          name: name
        }],
        min,
        max,
      }]
    });
  }, [value, name, min, max, unit]);

  return (
    <div
      ref={div}
      className="w-full h-full min-h-[255px] min-w-[255px]"
      style={{
        borderRadius: '8px',
        padding: '10px',
        boxSizing: 'border-box',
        position: 'relative'
      }}
    />
  );
};

export default GaugeBar;
