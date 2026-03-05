import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AppSidebar } from "../components/Sidebar";
import { Chart, chartData } from "../components/Chart";
import { Card } from "../components/ui/card";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { ModeToggle } from "../components/mode-toggle";

export const Dashboard = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = chartData.map((d) => ({
          day: d.month,
          productive: d.desktop,
          distracted: d.mobile,
        }));
        const result = await invoke<string>("generate_dashboard_summary", { data });
        setSummary(result);
      } catch (err) {
        console.error("Failed to generate summary:", err);
        setSummary("Не успяхме да заредим обобщението.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

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
            >
              {loading ? (
                <p className="text-lg text-muted-foreground italic animate-pulse">
                  Генериране на обобщение...
                </p>
              ) : (
                <p className="text-lg">{summary}</p>
              )}
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};
