import {useAjax} from "@/lib/http.ts";
import useSWR from "swr";
import {WorkOrder} from "@/hooks/drone";
import bmssPng from "@/assets/images/bmss-point.png";
import {useEffect} from "react";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import {EntitySize} from "@/assets/datas/enum.ts";
import {generateLabelConfig} from "@/hooks/drone/elements";

const OPERATION_HTTP_PREFIX = "operation/api/v1";

export const useOrderListVisual = () => {
  const {get} = useAjax();
  const url = `${OPERATION_HTTP_PREFIX}/order/listVisual`;
  return useSWR(url, async (path) => (await get<Resource<WorkOrder[]>>(path)).data.data);
};

export const useOrderToMap = () => {
  const {data: orderListVisual} = useOrderListVisual();
  console.log("orderListVisual");
  console.log(orderListVisual);
  useEffect(() => {
    const source = getCustomSource("map-orders");
    if (source) {
      source.entities.removeAll();
      orderListVisual?.forEach(order => {
        console.log("order");
        console.log(order);
        if (!order.longitude || !order.latitude) return;
        if (!order.visual) return;
        source.entities.add({
          id: `order-${order.id}`,
          position: Cesium.Cartesian3.fromDegrees(order.longitude, order.latitude, 0),
          billboard: {
            image: bmssPng,
            width: EntitySize.Width,
            height: EntitySize.Height,
            heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          label: generateLabelConfig(order.name)
        });
      });
    }
  }, [orderListVisual]);
};
