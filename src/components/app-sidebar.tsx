"use client"

import * as React from "react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  UsersIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  CommandIcon,
  CoffeeIcon,
  RockingChairIcon,
  CreditCard,
  ShoppingBasket,
  DiscIcon,
  CookingPot,
} from "lucide-react"

import { hasPermission, type AppRole, type Permission } from "@/lib/auth/permissions"

export interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  permission?: Permission
  isActive?: boolean
}

const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Cafe",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      permission: "dashboard:view" as Permission,
    },
    {
      title: "Products",
      url: "/dashboard/product",
      icon: <CoffeeIcon />,
      permission: "products:view" as Permission,
    },
    {
      title: "Sitting",
      url: "/dashboard/sitting",
      icon: <RockingChairIcon />,
      permission: "tables:view" as Permission,
    },
    {
      title: "Payment",
      url: "/dashboard/payment",
      icon: <CreditCard />,
      permission: "payments:view" as Permission,
    },
    {
      title: "Category",
      url: "/dashboard/catagory",
      icon: <ShoppingBasket />,
      permission: "products:view" as Permission,
    },
    {
      title: "Employees",
      url: "/dashboard/employees",
      icon: <UsersIcon />,
      permission: "employees:view" as Permission,
    },
    {
      title: "Discounts",
      url: "/dashboard/discounts",
      icon: <DiscIcon />,
      permission: "discounts:view" as Permission,
    },
    {
      title: "Kitchen",
      url: "/dashboard/kitchen",
      icon: <CookingPot />,
      permission: "kitchen:view" as Permission,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Settings2Icon />,
      permission: "settings:manage" as Permission,
    },
    {
      title: "Get Help",
      url: "/get-help",
      icon: <CircleHelpIcon />,
    },
    {
      title: "Search",
      url: "/search",
      icon: <SearchIcon />,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "/data-library",
      icon: <DatabaseIcon />,
    },
    {
      name: "Reports",
      url: "/dashboard/reports",
      icon: <FileChartColumnIcon />,
      permission: "reports:view" as Permission,
    },
    {
      name: "Word Assistant",
      url: "/dashboard/word-assistant",
      icon: <FileIcon />,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole?: AppRole
}

export function AppSidebar({ userRole = "ADMIN", ...props }: AppSidebarProps) {
  const filteredNavMain = React.useMemo(() => {
    return data.navMain.filter((item) => {
      if (!item.permission) return true
      return hasPermission(userRole, item.permission)
    })
  }, [userRole])

  const filteredNavSecondary = React.useMemo(() => {
    return data.navSecondary.filter((item) => {
      if (!item.permission) return true
      return hasPermission(userRole, item.permission)
    })
  }, [userRole])

  const filteredDocuments = React.useMemo(() => {
    return data.documents.filter((item) => {
      if (!item.permission) return true
      return hasPermission(userRole, item.permission)
    })
  }, [userRole])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/" />}
            >
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Cafe Inc.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavDocuments items={filteredDocuments} />
        <NavSecondary items={filteredNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
