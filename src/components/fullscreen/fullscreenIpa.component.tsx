import { FullScreen, useFullScreenHandle } from "react-full-screen";
import React from "react";
import { IconButton } from "@mui/material";
import { BsFullscreen } from "react-icons/bs";
import classes from "./fullscreen.module.scss";
import { styled } from "@mui/material/styles";

const FullScreenStyled = styled(FullScreen)(({ theme }) => ({
  "&:not(:root):fullscreen::backdrop": {
    background:
      theme.palette.mode === "dark" ? "black" : theme.palette.background.paper,
  },
}));

function FullscreenIpa({ children }: { children: React.ReactNode }) {
  const handleFullscreen = useFullScreenHandle();
  // @ts-ignore
  return (
    <div className={classes.root}>
      <IconButton
        className={classes.icon}
        onClick={handleFullscreen.enter}
        size="large">
        <BsFullscreen size={24} />
      </IconButton>

      <FullScreenStyled
        className={classes.fullscreen}
        handle={handleFullscreen}>
        {children}
      </FullScreenStyled>
    </div>
  );
}

export { FullscreenIpa };
