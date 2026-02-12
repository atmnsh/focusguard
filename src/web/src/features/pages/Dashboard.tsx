import { Sidebar } from "../components/Sidebar";
import { Chart } from "../components/Chart";
import { Card } from "@gravity-ui/uikit";

export const Dashboard = () => {
  return (
    <div>
      <Sidebar />
      <Chart />
      <div>
        <p
          style={{ fontSize: "x-large", marginLeft: "10vh", marginTop: "7vh" }}
        >
          Обобщение:
        </p>
        <Card
          style={{
            width: "80%",
            display: "flex",
            justifySelf: "center",
            height: "16vh",
            paddingLeft: "2vh",
            paddingRight: "1.5vh",
          }}
        >
          <p style={{ fontSize: "large" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </Card>
      </div>
    </div>
  );
};
