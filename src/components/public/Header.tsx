import {useEffect, useState} from "react";
import {Icon} from "@/components/public/Icon.tsx";
import {cn, parseUrl} from "@/lib/utils.ts";
import {useLocation, useNavigate} from "react-router-dom";
import UserInfo from "@/components/public/UserInfo.tsx";

interface Menu {
  name: string;
  icon?: string;
  children?: Menu[],
  router?: string
}

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuList] = useState<Menu[]>([
    {
      name: "街道管理",
      icon: "street",
      router: "street",
      children: [
        {
          name: "便民设施",
          router: "/street/facilities"
        },
        {
          name: "明厨亮灶",
          router: "/street/bright-kitchen"
        },
        {
          name: "云上旅游",
          router: "/street/travel-cloud"
        },
        {
          name: "无人超市",
          router: "/street/unmanned-supermarket"
        },
        {
          name: "小蓝车",
          router: "/street/bicycles"
        },
        {
          name: "小浦共享仓",
          router: "/street/shared-warehouse"
        },
      ]
    },
    {
      name: "智慧物业管理",
      icon: "sygl",
      router: "smart-property",
      children: [
        {
          name: "人员管理",
          router: "/smart-property/house-people"
        },
        {
          name: "商业管理",
          router: "/smart-property/business"
        },
        {
          name: "独居老人管理",
          router: "/smart-property/elderly"
        },
        {
          name: "垃圾清运管理",
          router: "/smart-property/garbage"
        },
        {
          name: "智慧垃圾厢房管理",
          router: "/smart-property/garbage-house"
        },
        {
          name: "智慧停车管理",
          router: "/smart-property/parking"
        },
      ]
    },
    {
      name: "风险评估",
      icon: "fangxunfangtai",
      router: "flood-prevention",
    },
    {
      name: "街道体检",
      icon: "jdtj",
      router: "street-physical",
      children: [
        {
          name: "生态宜居",
          router: "/street-physical/styj"
        },
        {
          name: "健康舒适",
          router: "/street-physical/jkss"
        },
        {
          name: "安全韧性",
          router: "/street-physical/aqrx"
        },
        {
          name: "整洁有序",
          router: "/street-physical/zjyx"
        },
        {
          name: "风貌特色",
          router: "/street-physical/fmts"
        },
        {
          name: "多元包容",
          router: "/street-physical/dybr"
        },
        {
          name: "创新活力",
          router: "/street-physical/cxhl"
        },
      ]
    },
    {
      name: "无人机平台",
      icon: "wurenji",
      router: "drone"
    }
  ]);

  /*const [menuList] = useState<Menu[]>([
    {
      name: "房屋人口管理",
      icon: "house-people",
      router: 'house-people',
    },
    {
      name: "商业信息管理",
      icon: "sygl",
      router: 'business',
    },
    {
      name: "单车数据展示",
      icon: "bicycle",
      router: 'bicycles',
    },
    {
      name: "风险评估管理",
      icon: "fangxunfangtai",
      router: 'flood-prevention',
    },
    {
      name: "公共设施管理",
      icon: "gonggongsheshi",
      router: 'facilities',
    }
  ]);*/

  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const [selectedChildMenu, setSelectedChildMenu] = useState<Menu | null>(null);

  const onClickMenu = (menu: Menu) => {
    setSelectedMenu(menu);
    menu.router && navigate(menu.router);
  };

  const onClickChildMenu = (menu: Menu) => {
    setSelectedChildMenu(menu);
    menu.router && navigate(menu.router);
  };

  // 根据路由参数设置活动状态
  useEffect(() => {
    const currentPath = location.pathname;
    const [firstPath, secondPath] = parseUrl(currentPath);
    const currentMenu = menuList.find(menu => menu.router === firstPath);
    currentMenu ? setSelectedMenu(currentMenu) : setSelectedMenu(null);
    const childMenu = currentMenu?.children?.find(item => item.router?.includes(secondPath));
    childMenu ? setSelectedChildMenu(childMenu) : setSelectedChildMenu(null);
  }, [location.pathname, menuList]);

  return <>
    <div className={"h-[100px] bg-header-bg bg-cover bg-no-repeat"}>
      <div className={"h-full flex items-center justify-center relative"}>
        <div className={"flex text-white font-bold text-[18px] whitespace-nowrap"}>
          {menuList.map(menu =>
            <div
              key={menu.name}
              onClick={() => onClickMenu(menu)}
              className={cn("w-[144px] h-20 text-[20px] cursor-pointer bg-cover bg-center bg-no-repeat font-Alimama" +
                " flex items-center justify-center", selectedMenu?.name === menu.name ? "text-[#3DCAFF]" : "")}>
              {menu.icon && <Icon name={menu.icon} className={"mr-2"}/>}
              {menu.name}
            </div>)}
        </div>
        <div className={"absolute top-0 right-0 h-full flex"}>
          <UserInfo/>
        </div>
      </div>
    </div>
    {
      selectedMenu?.children && <div
        className={"bg-100 bg-children-menu w-[900px] h-[48px] text-white mx-auto flex text-[18px] items-center justify-center space-x-4"}>
        {selectedMenu.children.map(item =>
          <div
            style={{
              textShadow: selectedChildMenu?.name === item.name ? "0px 2px 4px #104053" : ""
            }}
            className={cn("z-10 font-fzdh cursor-pointer text-[18px] whitespace-nowrap",
              selectedChildMenu?.name === item.name ? "text-[#6AD6FF]" : "")}
            key={item.name}
            onClick={() => onClickChildMenu(item)}>
            {item.name}
          </div>)}
      </div>
    }
  </>;
};
