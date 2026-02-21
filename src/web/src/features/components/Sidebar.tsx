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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" className="flex items-center">
      <SidebarHeader className="p-0 mt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User />
              <a>Моят Профил</a>
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
            <a href="/dash">
              <SidebarMenuButton>
                <PieChart />
                Статистика
              </SidebarMenuButton>
            </a>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <a href="/av">
              <SidebarMenuButton>
                <Bot />
                Аватар
              </SidebarMenuButton>
            </a>
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
