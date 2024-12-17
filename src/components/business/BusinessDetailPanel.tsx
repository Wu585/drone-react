const BusinessDetailPanel = () => {
  return (
    <div className={'w-[500px] h-[504px] bg-bicycle-detail-bg pl-[22px] bg-contain relative bg-no-repeat'}>
      <div className={'py-[28px] text-[#f3f3f3] text-[20px] font-[600]'}>商铺详情</div>
      <div className={"absolute right-[8px] top-[8px] text-[36px] cursor-pointer"}>×</div>
      <div className={"flex flex-col"}>
        <div className={"py-[6px] flex space-x-[64px]"}>
          <span className={"w-[100px]"}>企业名称: </span>
          <span className={'text-[16px] text-[#57b2ff] font-[500]'}>上海美妆有限公司</span>
        </div>
      </div>
    </div>
  );
}

export default BusinessDetailPanel

