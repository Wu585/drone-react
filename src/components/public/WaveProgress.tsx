import Wavify from "react-wavify";
import {cn} from "@/lib/utils.ts";

const WaveBall = ({progress, fill = "#3b82f6", border = "border-blue-500"}: {
  progress: number,
  fill?: string,
  border?: string
}) => {
  return (
    <div
      className={cn("relative w-full h-full rounded-full overflow-hidden border-4 " +
        "flex items-center justify-center text-2xl font-bold text-white", border)}>
      <div className="absolute inset-0 bottom-0">
        <Wavify
          fill={fill}
          paused={false}
          options={{
            height: 0,
            amplitude: 20,
            speed: 0.15,
            points: 3,
          }}
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: `${progress}%`,
          }}
        />
      </div>
      <div className="z-10">{progress}%</div>
    </div>
  );
};

export default WaveBall;
