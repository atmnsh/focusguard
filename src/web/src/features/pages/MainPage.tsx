import { Installation } from "../components/installation";
import { Download } from "../components/download";
import { AppSidebar } from "../components/Sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { ModeToggle } from "../components/mode-toggle";

export const MainPage = () => {
  return (
    <div>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
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
          <Installation />
          <Download />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};
