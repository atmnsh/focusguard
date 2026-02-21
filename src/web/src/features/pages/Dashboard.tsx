import { AppSidebar } from "../components/Sidebar";
import { Chart } from "../components/Chart";
import { Card } from "../components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";

export const Dashboard = () => {
  return (
    <div>
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

          <Chart />
          <div>
            <p
              style={{
                fontSize: "x-large",
                marginLeft: "10vh",
                marginTop: "7vh",
              }}
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
            >
              <p style={{ fontSize: "large" }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};
