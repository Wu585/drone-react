import { Cascader, CascaderOption } from "@/components/ui/cascader"
import {useState} from "react";

const options: CascaderOption[] = [
  {
    label: "浙江省",
    value: "zhejiang",
    children: [
      {
        label: "杭州市",
        value: "hangzhou",
        children: [
          {
            label: "西湖区",
            value: "xihu"
          },
          {
            label: "上城区",
            value: "shangcheng"
          }
        ]
      },
      {
        label: "宁波市",
        value: "ningbo",
        children: [
          {
            label: "海曙区",
            value: "haishu"
          }
        ]
      }
    ]
  },
  {
    label: "江苏省",
    value: "jiangsu",
    children: [
      {
        label: "南京市",
        value: "nanjing",
        children: [
          {
            label: "玄武区",
            value: "xuanwu"
          }
        ]
      }
    ]
  }
]

export function CascaderExample() {
  const [value, setValue] = useState<(string | number)[]>([])

  return (
    <Cascader
      className={"bg-transparent"}
      options={options}
      value={value}
      onChange={setValue}
      placeholder="请选择地区"
    />
  )
}
