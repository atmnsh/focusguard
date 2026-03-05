"use client";

import { useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "../components/ui/card";

export const chartData = [
  { month: "Понеделник", desktop: 186, mobile: 80 },
  { month: "Вторник", desktop: 305, mobile: 200 },
  { month: "Сряда", desktop: 237, mobile: 120 },
  { month: "Четвъртък", desktop: 73, mobile: 190 },
  { month: "Петък", desktop: 209, mobile: 130 },
  { month: "Събота", desktop: 214, mobile: 140 },
  { month: "Неделя", desktop: 220, mobile: 110 },
];

// Кастомный компонент для тултипа
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          padding: "12px 16px",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
        className="bg-white dark:bg-black "
      >
        <p
          style={{ margin: "0 0 8px 0", fontWeight: "bold" }}
          className="text-black dark:text-white"
        >
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div
            key={`item-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
            className="text-black dark:text-white"
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: entry.color,
                borderRadius: "2px",
              }}
              className="text-black dark:text-white"
            />
            <span className="text-black dark:text-white">
              {entry.name === "desktop" ? "Продуктивност:" : "Разсейване:"}
            </span>
            <span
              style={{ fontWeight: "bold" }}
              className="text-black dark:text-white"
            >
              {entry.value} мин.
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Chart = () => {
  const [data] = useState(chartData);

  // useEffect(() => {
  //   const fetchUsage = async () => {
  //     try {
  //       const usage: { productive_sec: number; distracted_sec: number } =
  //         await invoke("get_daily_usage");
  //       const newData = [...initialChartData];
  //       const productiveMins = Math.round(usage.productive_sec / 60);
  //       const distractedMins = Math.round(usage.distracted_sec / 60);
  //       newData[6] = { month: "Неделя", desktop: productiveMins, mobile: distractedMins };
  //       setData(newData);
  //     } catch (err) {
  //       console.error("Failed to fetch daily usage:", err);
  //     }
  //   };
  //   fetchUsage();
  //   const interval = setInterval(fetchUsage, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <Card className="w-10/12 flex self-center -mt-5">
      <div
        style={{
          display: "flex",
          justifySelf: "center",
          flexDirection: "column",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "x-large" }}>Статистика</p>
        <p style={{ fontSize: "large", marginTop: "2vh" }}>
          За последна седмица
        </p>
      </div>
      <CardContent>
        <div
          style={{
            width: "85%",
            height: "45vh",
            display: "flex",
            justifySelf: "center",
            marginTop: "2vh",
            paddingRight: "3.5vh",
          }}
        >
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              />

              <Bar
                name="desktop"
                dataKey="desktop"
                fill="#f7c44d"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="mobile"
                dataKey="mobile"
                fill="#c9910e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
