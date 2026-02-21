import { AppSidebar } from "../components/Sidebar";
import { CarouselComponent } from "../components/Carousel";
import { Button } from "../components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";

export const Avatar = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 mb-15 ">
          <SidebarTrigger className="ml-2" />
          <Separator
            orientation="vertical"
            className="mr-2 h-4 mb-3 mt-1 bg-accent"
          />
          <p className="text-xl ml-2">Focusguard</p>
        </header>
        <div className="flex flex-col p-4 pt-0 justify-self-center items-center s">
          <CarouselComponent />
          <Button className="flex justify-self-center mt-10 w-sm">
            Избери
          </Button>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
