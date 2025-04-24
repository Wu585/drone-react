import {useMemo} from "react";

const tickNumbers = [
  '北', '30', '60', '东', '120', '150',
  '南', '210', '240', '西', '300', '330'
];

interface Props {
  heading: number
}

const Compass = ({heading}:Props) => {
  // 生成刻度线
  const tickLines = useMemo(() => {
    return Array.from({length: 60}, (_, i) => {
      const rotation = `rotate(${i * 6}deg) translateY(-75px)`;
      const isMainTick = i % 5 === 0;

      return (
        <div
          key={i}
          className={`absolute w-[1px] ${isMainTick ? 'h-[15px] bg-neutral-400' : 'h-[4px] bg-neutral-400'}`}
          style={{
            transform: isMainTick ? rotation : `rotate(${i * 6}deg) translateY(-80px)`
          }}
        />
      );
    });
  }, []);

  // 生成刻度数字
  const tickLabels = useMemo(() => {
    return tickNumbers.map((number, i) => {
      const isMainDirection = [0].includes(i); // 北方向特殊标记

      return (
        <div
          key={i}
          className={`absolute text-[11px] ${isMainDirection ? 'text-blue-500' : 'text-neutral-200'}`}
          style={{
            transform: `rotate(${i * 30}deg) translateY(-52px)`
          }}
        >
          {number}
        </div>
      );
    });
  }, []);

  const rotationStyle = useMemo(() => ({
    transform: `rotate(${-(heading * (180 / Math.PI)).toFixed(0)}deg)`
  }), [heading]);

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* 指针 */}
      <div
        className="absolute top-[5px] z-[1] w-0 h-0 border-[10px] border-transparent border-t-blue-500"
      />

      {/* 主体 */}
      <div className="relative flex items-center justify-center w-[170px] aspect-square mt-[10px] overflow-hidden bg-black/[.6] rounded-full">
        {/* 外环 */}
        <div className="w-[130px] aspect-square bg-neutral-500 rounded-full" />

        {/* 内环 */}
        <div
          className="absolute w-[80px] aspect-square bg-neutral-200 bg-[url('@/assets/images/world.svg')] bg-no-repeat bg-center bg-[length:80%] rounded-full"
        />

        {/* 刻度面板 */}
        <div
          className="absolute flex items-center justify-center w-[170px] aspect-square"
          style={rotationStyle}
        >
          {tickLines}
          {tickLabels}
        </div>
      </div>
    </div>
  );
};

export default Compass;

