import React, { useState } from "react";
import { Box, Button, Menu, MenuItem, AppBar, Toolbar } from "@mui/material";
// 引入 Link 组件
import { Link } from "react-router-dom";
// 导入 logo
import Logo from "../assets/logo.svg";
import WalletConnect from "./WalletConnect";

// 菜单数据
const menuItems = [
  {
    label: "首页",
    path: "/",
  },
  {
    label: "我的债权",
    path: "/my-credits",
    subItems: [
      { label: "我的票据", path: "/my-credits/my-bills" },
      { label: "我发行的 token", path: "/my-credits/my-issued-tokens" },
    ],
  },
  {
    label: "Token市场",
    path: "/token-market",
  },
  {
    label: "我的token",
    path: "/my-tokens",
  },
  {
    label: "我的债务",
    path: "/my-debts",
    subItems: [
      { label: "待我签名", path: "/my-debts/my-todolist" },
      { label: "偿还债务", path: "/my-debts/repay-debt" },
    ],
  },
  // 其他菜单项
];

const Header: React.FC = () => {
  // Create a separate state for each menu with subItems
  const [anchorEls, setAnchorEls] = useState<{
    [key: string]: HTMLElement | null;
  }>({});

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    label: string
  ) => {
    setAnchorEls({
      ...anchorEls,
      [label]: event.currentTarget,
    });
  };

  const handleMenuClose = (label: string) => {
    setAnchorEls({
      ...anchorEls,
      [label]: null,
    });
  };

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
    >
      <Toolbar sx={{ p: 0 }}>
        {/* Logo 部分无背景 */}
        <Box sx={{ mr: "auto", p: 1 }}>
          <Link to="/">
            <img src={Logo} alt="RBT Logo" height="40" />
          </Link>
        </Box>
        {/* 渐变背景部分 */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            ml: "auto",
            p: 1,
            borderRadius: "4px",
          }}
        >
          {menuItems.map((item) =>
            item.subItems ? (
              <React.Fragment key={item.label}>
                <Button
                  color="primary"
                  onClick={(e) => handleMenuOpen(e, item.label)}
                  aria-controls={`${item.label}-menu`}
                  aria-haspopup="true"
                >
                  {item.label}
                </Button>
                <Menu
                  id={`${item.label}-menu`}
                  anchorEl={anchorEls[item.label]}
                  open={Boolean(anchorEls[item.label])}
                  onClose={() => handleMenuClose(item.label)}
                  MenuListProps={{
                    "aria-labelledby": `${item.label}-button`,
                  }}
                >
                  {item.subItems.map((subItem) => (
                    <MenuItem
                      key={subItem.label}
                      component={Link}
                      to={subItem.path}
                      onClick={() => handleMenuClose(item.label)}
                    >
                      {subItem.label}
                    </MenuItem>
                  ))}
                </Menu>
              </React.Fragment>
            ) : (
              <Button
                key={item.label}
                color="primary"
                component={Link}
                to={item.path}
              >
                {item.label}
              </Button>
            )
          )}
        </Box>
        <Box sx={{ ml: 2 }}>
          {/* 钱包连接组件 */}
          <WalletConnect />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
