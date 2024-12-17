import {
  BarChartBig,
  BookText, ListOrdered, ScrollText, Send, Server
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "statistics",
          label: "数据统计",
          active: pathname.includes("/statistics"),
          icon: BarChartBig,
          submenus: []
        },
        {
          href: "service-manage",
          label: "服务管理",
          active: pathname.includes("/service-manage"),
          icon: BookText,
          submenus: []
        },
        {
          href: "",
          label: "安全管理",
          active: pathname.includes("/posts"),
          icon: Server,
          submenus: [
            {
              href: "user-manage",
              label: "用户管理",
              active: pathname.includes("/user-manage")
            },
            {
              href: "acl-manage",
              label: "权限管理",
              active: pathname.includes("/acl-manage")
            },
            {
              href: "role-manage",
              label: "角色管理",
              active: pathname.includes("/role-manage")
            }
          ]
        },
        {
          href: "log-manage",
          label: "日志管理",
          active: pathname.includes("/log-manage"),
          icon: ScrollText,
          submenus: []
        },
        {
          href: "work-order-manage",
          label: "工单管理",
          active: pathname.includes("/work-order-manage"),
          icon: ListOrdered,
          submenus: []
        },
        {
          href: "",
          label: "信息推送配置",
          active: pathname.includes("/message-send"),
          icon: Send,
          submenus: [
            {
              href: "address-book-manage",
              label: "通讯录管理",
              active: pathname.includes("/address-book-manage")
            },
            {
              href: "message-template-manage",
              label: "信息模板管理",
              active: pathname.includes("/message-template-manage")
            },
          ]
        }
      ]
    },

  ];
}
