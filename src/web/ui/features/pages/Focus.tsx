//import { Sidebar } from "../components/Sidebar";
import { Timer } from "../components/Timer";
import "./Focus.css";
import { AppSidebar } from "../components/Sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { ModeToggle } from "../components/mode-toggle";
import { Input } from "../components/ui/input"


//import { useState } from "react";

export const Focus = () => {
  return (
    <div>

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-muted">
          <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 mb-15 ">
            <SidebarTrigger className="ml-3 text-black dark:text-white" />
            <Separator orientation="vertical" className="mr-2 h-4 mb-3 mt-1 " />
            <p className="text-xl ml-2 text-black dark:text-white ">
              Focusguard
            </p>
            <div className="absolute right-0 mr-10">
              <ModeToggle />
            </div>
          </header>
          <div className="flex items-center justify-center -mt-10">
            <div className="">
              <div >
                <div className="flex flex-col items-center justify-center place-content-center text-center mb-7 gap-3">
                  <p className="text-2xl font-bold text-black dark:text-white flex self-center">Фокус режим</p>
                  <p className="text-black dark:text-white flex self-center">
                    Настройте дейност и таймер за максимална продуктивност. Работете
                    концентрирано без разсейване.
                  </p>
                </div>

                <div className="flex flex-col ml-5">

                  <p className="text-black dark:text-white mb-3">Въведете дейността си:</p>
                  <Input
                    placeholder="Например: Програмиране, Четене, Спорт, Учене..."
                    className="w-10/12  "

                  />
                </div>

                <div className="">

                  <p className="text-black dark:text-white ml-5 mt-5 mb-3">
                    Установете интервал за фокусиране:
                  </p>
                  <div className="">
                    <Timer />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};
