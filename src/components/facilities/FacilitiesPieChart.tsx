import * as echarts from 'echarts';
import {useEffect, useRef} from "react";

const FacilitiesPieChart = () => {
  const div = useRef<HTMLDivElement>(null)
  const myChart = useRef<echarts.ECharts>()
  const initialized = useRef(false)

  useEffect(() => {
    if (!div.current) {
      return
    }
    if (initialized.current) {
      return
    }
    myChart.current = echarts.init(div.current)

    initialized.current = true

    const option = {
      textStyle: {
        color: "#fff"
      },
      tooltip: {
        trigger: 'item'
      },
      legend: false,
      color: ['#4082E4', '#FFA651', '#7ACB4D', '#FF5A5F', '#8B8B8B', '#6B66FF', '#EFA8E4', '#4ACBEB', '#FF7F00', '#B27700', '#00A0B0'],
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            color: '#fff',
            fontSize: '16px'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {value: 10, name: '医疗卫生设施'},
            {value: 32, name: '教育设施'},
            {value: 33, name: '行政管理设施'},
            {value: 21, name: '市政公用设施'},
            {value: 12, name: '文化体育设施'},
          ]
        }
      ]
    };

    myChart.current.setOption(option);
  }, []);

  return (
    <div ref={div} className={'w-full h-full'}></div>
  );
}

export default FacilitiesPieChart

