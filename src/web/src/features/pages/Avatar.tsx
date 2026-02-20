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
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </header>
        <div className="flex flex-1 flex-col p-4 pt-0">
          <CarouselComponent />
          <Button className="flex justify-self-center mt-10 w-sm">
            Избери
          </Button>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
