"use client";

import * as React from "react";
import { Settings, User, PieChart, Bot } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { useNavigate } from "react-router-dom";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  return (
    <Sidebar collapsible="icon" className="flex items-center">
      <SidebarHeader className="p-0 mt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User />
              Моят Профил
            </SidebarMenuButton>
            <Separator
              orientation="horizontal"
              className="mr-2 h-4 mb-3 mt-1"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/dash")}>
              <PieChart />
              Статистика
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/av")}>
              <Bot />
              Аватар
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Separator
              orientation="horizontal"
              className="mr-2 h-4 mt-3 mb-1"
            />

            <SidebarMenuButton>
              <Settings />
              Настройки
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
