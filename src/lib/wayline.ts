export const waylinePointConfig = ({
                                     longitude, latitude, height, text
                                   }: {
  longitude: number
  latitude: number
  height: number
  text: string
}) => {
  return {
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    billboard: {
      image: (() => {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext("2d");
        if (context) {
          context.beginPath();
          context.moveTo(16, 28);
          context.lineTo(4, 4);
          context.lineTo(28, 4);
          context.closePath();
          context.fillStyle = "#4CAF50";
          context.fill();

          context.font = "bold 16px Arial";
          context.fillStyle = "white";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(text, 16, 14);
        }
        return canvas;
      })(),
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      width: 32,
      height: 32,
      color: Cesium.Color.WHITE
    }
  };
};
