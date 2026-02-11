import { Drawer, Button, Divider, Icon } from "@gravity-ui/uikit";
import React from "react";
import "./Sidebar.css";
//import { SidebarSVG } from "../../assets/icons/SidebarSVG";
import { Bars } from "@gravity-ui/icons";

export const Sidebar = () => {
  const [isVisible, setVisible] = React.useState(false);

  return (
    <div>
      <Button size="l" view="flat" onClick={() => setVisible(true)}>
        <Bars />
      </Button>
      <Drawer
        onOpenChange={setVisible}
        open={isVisible}
        placement="left"
        className="sidebar-drawer"
      >
        <div className="sidebar-content" onClick={() => setVisible(false)}>
          <div className="sidebar-profile-section">
            <Button className="sidebar-button" view="flat">
              My Profile
            </Button>
          </div>

          <Divider className="sidebar-divider" />

          <div className="sidebar-middle-section">
            <Button className="sidebar-button" view="flat">
              Avatar
            </Button>
            <Button className="sidebar-button" view="flat">
              Dashboard
            </Button>
          </div>

          <Divider className="sidebar-divider" />

          <div className="sidebar-bottom-section">
            <Button className="sidebar-button" view="flat">
              Settings
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
};
