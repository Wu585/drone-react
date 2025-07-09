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

/**
 * 为图形添加边框和聊天框样式
 * @param url 图片地址
 * @param width 图片宽度
 * @param height 图片高度
 * @param borderColor 边框颜色
 * @returns 返回带有边框和聊天框样式的Canvas图像
 */
const createBubbleImage = async (url: string, width: number, height: number, borderColor = 'green'): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas 2D context not supported'));
      return;
    }

    const borderWidth = 6;
    const pointerHeight = 10;
    const pointerWidth = 20;
    const borderRadius = 8;

    // 调整Canvas大小以容纳边框和指针
    canvas.width = width + borderWidth * 2;
    canvas.height = height + borderWidth * 2 + pointerHeight;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        // 绘制白色背景（聊天框主体）
        ctx.fillStyle = 'white';

        // 绘制圆角矩形（主体部分）
        ctx.beginPath();
        ctx.roundRect(
          borderWidth / 2,
          borderWidth / 2,
          width + borderWidth,
          height + borderWidth,
          borderRadius
        );

        // 绘制三角形指针（底部中间）
        const centerX = canvas.width / 2;
        const pointerY = height + borderWidth;
        ctx.moveTo(centerX - pointerWidth / 2, pointerY);
        ctx.lineTo(centerX, pointerY + pointerHeight);
        ctx.lineTo(centerX + pointerWidth / 2, pointerY);

        ctx.fill();

        // 绘制边框
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.stroke();

        // 绘制原始图片（居中）
        ctx.drawImage(
          img,
          borderWidth,
          borderWidth,
          width,
          height
        );

        resolve(canvas);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
};

export const useOrderToMap = () => {
  const departId = localStorage.getItem("departId");
  const { data: orderListVisual } = useOrderListVisual(departId ? +departId : undefined);

  useEffect(() => {
    const source = getCustomSource("map-orders");
    if (source) {
      source.entities.removeAll();
      orderListVisual?.forEach(async (order) => {
        if (!order.longitude || !order.latitude || !order.visual) return;

        const imageUrl = order.pic_list[1] || order.pic_list[0];
        if (!imageUrl) return;

        try {
          // 创建带有边框和聊天框样式的图像
          const bubbleCanvas = await createBubbleImage(
            imageUrl,
            EntitySize.Width,
            EntitySize.Height,
            '#32547E' // 可以自定义边框颜色
          );

          // 添加实体到Cesium
          source.entities.add({
            id: `order-${order.id}`,
            position: Cesium.Cartesian3.fromDegrees(order.longitude, order.latitude, 30),
            billboard: {
              image: bubbleCanvas,
              width: EntitySize.Width * 1.3, // 适当放大以容纳边框和指针
              height: EntitySize.Height * 1.4,
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
          });
        } catch (error) {
          console.error('Failed to create bubble image:', error);
          // 如果失败，回退到原始图片
          source.entities.add({
            id: `order-${order.id}`,
            position: Cesium.Cartesian3.fromDegrees(order.longitude, order.latitude, 30),
            billboard: {
              image: imageUrl,
              width: EntitySize.Width,
              height: EntitySize.Height,
              heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
          });
        }
      });
    }
  }, [orderListVisual]);
};
