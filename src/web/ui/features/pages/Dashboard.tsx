import { AppSidebar } from "../components/Sidebar";
import { Chart } from "../components/Chart";
import { Card } from "../components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { ModeToggle } from "../components/mode-toggle";

export const Dashboard = () => {
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

          <Chart />
          <div>
            <p
              style={{
                fontSize: "x-large",
                marginLeft: "10vh",
                marginTop: "5vh",
              }}
              className="text-black dark:text-white"
            >
              Обобщение:
            </p>
            <Card
              style={{
                width: "80%",
                display: "flex",
                justifySelf: "center",
                padding: "2vh",
                marginTop: "3vh",
              }}
              className=""
            >
              <p className="text-lg ">
                За изминалата седмица потребителят е провел 12 работни сесии с
                обща продължителност от 8 часа и 34 минути, от които 73% са
                прекарани в концентрирана работа. Най-продуктивните му часове са
                между 10:00 и 12:00, докато най-честото разсейване е засечено
                следобед около 15:00. В сравнение с предходната седмица
                продуктивността му е нараснала с 18%, което показва устойчива
                положителна тенденция в навиците му.
              </p>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};
