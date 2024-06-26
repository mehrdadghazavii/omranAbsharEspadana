import ListItem from "@mui/material/ListItem";
import { Box, Collapse, Tooltip, Typography } from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import { alpha } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ListItemProps } from "@mui/material/ListItem";
import { connect } from "react-redux";

interface ListProps extends ListItemProps {
  type: "parent" | "child";
  active: boolean;
}

const ListItemStyled = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== "type" && prop !== "active",
})<ListProps>(({ theme, type, active }) => ({
  borderRadius: theme.shape.borderRadius,
  paddingTop: 4,
  paddingBottom: 4,
  marginBottom: 5,
  color: theme.palette.text.disabled,
  "& .collapse-icon": {
    visibility: "hidden",
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    color: theme.palette.primary.main,
    "& .collapse-icon": {
      visibility: "unset",
    },
  },
  ...(active && {
    color: theme.palette.primary.main,
    backgroundColor: type === "child" && alpha(theme.palette.primary.main, 0.05),
  }),
}));

function ItemMenu(props: any) {
  const { title, icon, children, history, category, currentPage, menuOpen, employee, isAdmin } = props;
  const [open, setOpen] = useState(false);

  const changePage = (route: string) => {
    history.push(route);
  };

  return (
    (isAdmin || employee) && (
      <>
        <Tooltip title={title} disableInteractive arrow>
          <Box mx={1}>
            <ListItemStyled type={"parent"} active={currentPage.includes(category)} onClick={() => setOpen(!open)}>
              <ListItemIcon className="icon-menu-layout" style={{ color: "inherit" }}>
                {" "}
                {icon}
              </ListItemIcon>
              {menuOpen && (
                <>
                  <ListItemText primary={<Typography style={{ color: "inherit" }}>{title}</Typography>} />
                  {open ? <ExpandLess fontSize="small" /> : <ExpandMore className={"collapse-icon"} fontSize="small" />}
                </>
              )}
            </ListItemStyled>
          </Box>
        </Tooltip>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box mr={1} ml={3}>
            <List component="div" disablePadding>
              {children.map(
                (item: any) =>
                  (item.employee || isAdmin) && (
                    <Tooltip key={item.title} arrow disableInteractive title={item.title}>
                      <ListItemStyled
                        type={"child"}
                        active={currentPage.includes(item.route)}
                        onClick={() => changePage(String(item.route))}
                      >
                        <ListItemIcon style={{ color: "inherit" }}>{item.icon}</ListItemIcon>
                        <ListItemText style={{ color: "inherit" }} primary={item.title} />
                      </ListItemStyled>
                    </Tooltip>
                  )
              )}
            </List>
          </Box>
        </Collapse>
      </>
    )
  );
}

const withRouterItems = withRouter(ItemMenu);

export { withRouterItems as ItemMenu };
