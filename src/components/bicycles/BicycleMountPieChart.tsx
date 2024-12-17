import * as echarts from 'echarts';
import {useEffect, useRef} from "react";
import {useBicycleDistributedInfo} from "@/hooks/bicycles/api.ts";

const BicycleMountPieChart = () => {
  const div = useRef<HTMLDivElement>(null);
  const myChart = useRef<echarts.ECharts>();
  const initialized = useRef(false);

  const {data:distributedInfo} = useBicycleDistributedInfo()

  useEffect(() => {
      if(distributedInfo){
        console.log('distributedInfo');
        console.log(distributedInfo);
      }
  },[distributedInfo])

  useEffect(() => {
    if (!div.current) {
      return;
    }
    if (initialized.current) {
      return;
    }
    if(!distributedInfo){
      return;
    }

    myChart.current = echarts.init(div.current);

    initialized.current = true;

    const data = Object.keys(distributedInfo).map(key=>{
      return {
        name: key,
        value: distributedInfo[key]
      }
    })
    console.log('data');
    console.log(data);
    const option = {
      tooltip: {
        trigger: 'item'
      },
      /*legend: {
        top: '5%',
        left: 'center',
      },*/
      color: ['#4082E4', '#FFA651', '#7ACB4D', '#FF5A5F', '#8B8B8B', '#6B66FF', '#EFA8E4', '#4ACBEB', '#FF7F00', '#B27700', '#00A0B0'],
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label:{
            color:'#fff',
            fontSize: '16px'
          },
          emphasis: {
          },
          labelLine: {
            show: true
          },
          data
        }
      ]
    };

    myChart.current.setOption(option);
  }, [distributedInfo]);

  return (
    <div ref={div} className={'w-full h-full'}></div>
  );
};

export default BicycleMountPieChart;

