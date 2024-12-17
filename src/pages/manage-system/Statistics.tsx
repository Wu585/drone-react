import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList, BreadcrumbPage,
} from "@/components/ui/breadcrumb.tsx";
import userPng from "@/assets/images/manage-system/user.png";
import BusinessInfoLineChart from "@/components/business/BusinessInfoLineChart.tsx";
import {useOnlineUserCounts, useUserCounts, useUsers} from "@/hooks/manage-system/api.ts";
import UserDataTable from "@/pages/manage-system/UserDataTable.tsx";
import {columns} from "@/pages/manage-system/UserManage.tsx";

const Statistics = () => {
  const {data: userCounts} = useUserCounts();
  const {data: onlineCounts} = useOnlineUserCounts();
  const {data: userList} = useUsers();
  return (
    <div className="pt-8 pb-8 px-8 h-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className={"text-[#263339] font-bold"}>数据统计</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className={"bg-white h-[320px] mt-2 py-8 px-10 flex items-center space-x-10"}>
        <div className={"flex space-x-8 items-center"}>
          <img className={"h-[92px]"} src={userPng} alt=""/>
          <div>
            <div className={"flex flex-col"}>
              <span>用户总数</span>
              <span className={"font-bold text-[42px]"}>{userCounts?.CREATOR ?? 0}</span>
            </div>
            <div className={"flex flex-col"}>
              <span>在线</span>
              <span className={"font-bold text-[42px] text-[#00B42A]"}>{onlineCounts || 0}</span>
            </div>
          </div>
        </div>
        <div className={"w-[1000px] h-full"}>
          <div className={"flex justify-between"}>
            <div className={"font-semibold"}>用户总数变化</div>
            {/*<DateRangePicker/>*/}
          </div>
          <div className={"h-full"}>
            <BusinessInfoLineChart/>
          </div>
        </div>
      </div>
      <div className={"bg-white h-[600px] mt-4 py-8 px-10 space-y-8 overflow-auto"}>
        <UserDataTable columns={columns} data={userList?.content || []}/>
      </div>
    </div>
  );
};

export default Statistics;

