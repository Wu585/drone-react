interface Props {
  keyboard: string;
}

const Keyboard = ({keyboard}: Props) => {
  return (
    <div style={{
      backgroundSize: "100% 100%"
    }} className={"bg-cockpit-keyboard w-[46px] h-[46px] content-center cursor-pointer"}>
      <span className={"-translate-x-[2px] -translate-y-[2px] text-[18px]"}>{keyboard}</span>
    </div>
  );
};

export default Keyboard;
