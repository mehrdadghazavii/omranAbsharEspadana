import { styled } from "@mui/material/styles";
import ListItem, { ListItemProps } from "@mui/material/ListItem";
import { alpha, Badge, Drawer, GlobalStyles, List, Toolbar } from "@mui/material";
import React from "react";
import { Drawer as DrawerIpa } from "../menu.layout";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { itemsDrawers } from "../../../../utils/items-drawers.utils";
import { SET_CURRENT_PAGE } from "../../../../redux/types/type";
import { useLocation, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { drawerWidth } from "../../header/header.layout";

export const drawerListWidth = 240;

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
    backgroundColor: alpha(theme.palette.secondary.main, 0.05),
    color: theme.palette.secondary.main,
    "& .collapse-icon": {
      visibility: "unset",
    },
  },
  ...(active && {
    color: theme.palette.secondary.main,
    backgroundColor: type === "child" && alpha(theme.palette.secondary.main, 0.05),
  }),
}));

interface DrawersProps {
  value: number;
  openDrawer: boolean;
  closeDrawer: Function;
  badges: any;
  startDate: string;
  history: any;
  currentPage: string;
  userAccess: any;
  setCurrentPage: Function;
}

function DrawersMenu({
  value,
  openDrawer,
  closeDrawer,
  badges,
  startDate,
  history,
  currentPage,
  setCurrentPage,
  userAccess,
}: DrawersProps) {
  const pathName = useLocation().pathname.split("/");
  const projectId = pathName[3];
  const companyId = pathName[1];

  const storedVisitedItemIds = localStorage.getItem("visitedItemIds");
  const initialVisitedItemIds = storedVisitedItemIds ? JSON.parse(storedVisitedItemIds) : [];

  const [visitedItemIds, setVisitedItemIds] = React.useState<string[]>(initialVisitedItemIds);

  const handleChangePage = (id: string) => {
    setCurrentPage(id);
    if (value === 0) {
      history.replace(`/${companyId}/projects/${projectId}/report-daily/${startDate}/${id} `);
    }
  };

  const handleBadge = (id: string) => {
    if (!visitedItemIds.includes(id)) {
      setVisitedItemIds((prevIds) => [...prevIds, id]);
    }
    localStorage.setItem("visitedItemIds", JSON.stringify([...visitedItemIds, id]));
  };

  return (
    <>
      {/*mobile menu*/}
      {itemsDrawers[value].length ? (
        <Drawer
          anchor={"left"}
          open={openDrawer}
          onClose={() => {
            closeDrawer();
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            body: {
              overflow: "auto",
            },
            display: { xs: "block", sm: "none" },
            width: drawerListWidth,
            "& .MuiDrawer-paper": { boxSizing: "border-box" },
          }}
        >
          <Toolbar />
          <List>
            {React.Children.toArray(
              itemsDrawers[value].map((item: any) => {
                if (userAccess) {
                  return (
                    (!item?.idAccess || (item?.idAccess && userAccess[item?.idAccess])) && (
                      <ListItemStyled
                        onClick={() => {
                          handleChangePage(item.id);
                          handleChangePage(item.id);
                          if (item.badge) {
                            handleBadge(item.id);
                          }
                        }}
                        type={"parent"}
                        active={currentPage === item.id}
                      >
                        {item.badge ? (
                          <Badge
                            color="error"
                            variant="dot"
                            invisible={visitedItemIds.includes(item.id)}
                            anchorOrigin={{
                              vertical: "top",
                              horizontal: "left",
                            }}
                          >
                            <ListItemIcon style={{ color: "inherit", minWidth: 30 }}>{item.icon}</ListItemIcon>
                          </Badge>
                        ) : (
                          <ListItemIcon style={{ color: "inherit", minWidth: 30 }}>{item.icon}</ListItemIcon>
                        )}
                        <ListItemText
                          style={{ color: "inherit" }}
                          primary={`${item.title} ${badges && value === 0 ? badges[item.id] : ""}`}
                        />
                      </ListItemStyled>
                    )
                  );
                }
              })
            )}
          </List>
        </Drawer>
      ) : null}
      {/*desktop menu*/}
      {openDrawer && itemsDrawers[value].length ? (
        <>
          <GlobalStyles
            styles={{
              body: {
                overflow: "auto!important",
              },
            }}
          />
          <DrawerIpa
            // container={window !== undefined ? () => window.document.body : undefined}
            variant="permanent"
            open={true}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              position: "fixed",
              left: drawerWidth,
              zIndex: 2,
              height: "100%",
              display: { xs: "none", sm: "block" },
              width: drawerListWidth,
              "& .MuiDrawer-paper": { boxSizing: "border-box" },
            }}
          >
            <Toolbar />
            <List>
              {React.Children.toArray(
                itemsDrawers[value].map((item: any) => {
                  if (userAccess) {
                    return (
                      (!item?.idAccess || (item?.idAccess && userAccess[item?.idAccess])) && (
                        <ListItemStyled
                          onClick={() => {
                            handleChangePage(item.id);
                            handleBadge(item.id);
                          }}
                          type={"parent"}
                          active={currentPage === item.id}
                        >
                          {item.badge ? (
                            <Badge
                              color="error"
                              variant="dot"
                              invisible={visitedItemIds.includes(item.id)}
                              anchorOrigin={{
                                vertical: "top",
                                horizontal: "left",
                              }}
                            >
                              <ListItemIcon style={{ color: "inherit", minWidth: 30 }}>{item.icon}</ListItemIcon>
                            </Badge>
                          ) : (
                            <ListItemIcon style={{ color: "inherit", minWidth: 30 }}>{item.icon}</ListItemIcon>
                          )}
                          <ListItemText
                            style={{ color: "inherit" }}
                            primary={`${item.title} ${badges && value === 0 ? badges[item.id] : ""}`}
                          />
                        </ListItemStyled>
                      )
                    );
                  }
                })
              )}
            </List>
          </DrawerIpa>
        </>
      ) : null}
    </>
  );
}

const mapStateToProps = (state: any) => {
  return {
    userAccess: state.userAccess,
    currentPage: state.currentPage,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    setCurrentPage: (value: string) => dispatch({ type: SET_CURRENT_PAGE, data: value }),
  };
};

const reduxDrawer = connect(mapStateToProps, mapDispatchToProps)(withRouter(DrawersMenu));

export { reduxDrawer as DrawersMenu };
