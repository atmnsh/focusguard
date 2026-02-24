import { AppSidebar } from "../components/Sidebar";
import { CarouselComponent } from "../components/Carousel";
import { Button } from "../components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ModeToggle } from "../components/mode-toggle";

export const Avatar = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-muted">
        <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 mb-15 ">
          <SidebarTrigger className="ml-3 text-black dark:text-white" />
          <Separator orientation="vertical" className="mr-2 h-4 mb-3 mt-1" />
          <Label className="text-xl ml-2 text-black dark:text-white">
            Focusguard
          </Label>
          <div className="absolute right-0 mr-10">
            <ModeToggle />
          </div>
        </header>
        {/* <Card className="flex flex-col p-4 pt-0 self-center items-center w-1/2 h-3/4 ">
          <CardHeader className="flex items-center -ml-70 mt-20 ">
            <CardTitle className="text-center text-2xl text-nowrap">
              Изберете своя аватар
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-12">
            <CarouselComponent />
          </CardContent>
          <CardFooter>
            <Button className="flex justify-self-center h-md  w-xs mb-5 bg-[#f7c44d] text-black hover:bg-accent">
              Избери
            </Button>
          </CardFooter>
        </Card> */}
        <CarouselComponent />
      </SidebarInset>
    </SidebarProvider>
  );
};
