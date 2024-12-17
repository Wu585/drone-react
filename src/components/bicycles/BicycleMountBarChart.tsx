import * as echarts from 'echarts';
import {useEffect, useRef} from "react";
import {useBicycleDistributedInfo} from "@/hooks/bicycles/api.ts";

const BicycleMountBarChart = () => {
  const div = useRef<HTMLDivElement>(null);
  const myChart = useRef<echarts.ECharts>();
  const initialized = useRef(false);

  const {data: distributedInfo} = useBicycleDistributedInfo()

  useEffect(() => {
    if (distributedInfo) {
      console.log('distributedInfo');
      console.log(distributedInfo);
    }
  }, [distributedInfo])

  useEffect(() => {
    if (!div.current) {
      return;
    }
    if (initialized.current) {
      return;
    }
    if (!distributedInfo) {
      return;
    }

    myChart.current = echarts.init(div.current);

    initialized.current = true;

    const data = Object.keys(distributedInfo).map(key => {
      return {
        name: key,
        value: distributedInfo[key]
      }
    })
    console.log('data');
    console.log(data);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {},
      grid: {
        top: '5%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        axisLabel: {
          textStyle: {
            color: "#fff",
            fontSize: 16
          }
        }
      },
      yAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLabel: {
          textStyle: {
            color: "#fff",
            fontSize: 16
          }
        }
      },
      series: [
        {
          type: 'bar',
          data: data.map(item => item.value),
        }
      ]
    };

    myChart.current.setOption(option);
  }, [distributedInfo]);

  return (
    <div ref={div} className={'w-full h-full'}></div>
  );
};

export default BicycleMountBarChart;

