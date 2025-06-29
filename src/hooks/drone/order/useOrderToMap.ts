import {useAjax} from "@/lib/http.ts";
import useSWR from "swr";
import {WorkOrder} from "@/hooks/drone";
import bmssPng from "@/assets/images/bmss-point.png";
import {useEffect} from "react";
import {getCustomSource} from "@/hooks/public/custom-source.ts";
import {EntitySize} from "@/assets/datas/enum.ts";
import {generateLabelConfig} from "@/hooks/drone/elements";

const OPERATION_HTTP_PREFIX = "operation/api/v1";

export const useOrderListVisual = (departId?: number) => {
  const {get} = useAjax();
  const url = departId ? [`${OPERATION_HTTP_PREFIX}/order/listVisual?organ=${departId}`] : undefined;
  return useSWR(url, async ([path]) => (await get<Resource<WorkOrder[]>>(path)).data.data);
};

export const useOrderToMap = () => {
  const departId = localStorage.getItem("departId");

  const {data: orderListVisual} = useOrderListVisual(departId ? +departId : undefined);
  useEffect(() => {
    const source = getCustomSource("map-orders");
    if (source) {
      source.entities.removeAll();
      orderListVisual?.forEach(order => {
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
