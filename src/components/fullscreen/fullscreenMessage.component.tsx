import {FullScreen, useFullScreenHandle} from "react-full-screen";
import React from "react";
import {CardMedia} from "@mui/material";
import classes from "./fullscreenMessage.module.scss";
import {styled} from "@mui/material/styles";

const FullScreenStyled = styled(FullScreen)(({theme}) => ({
  "&:not(:root):fullscreen::backdrop": {
    background:
        theme.palette.mode === "dark" ? "black" : theme.palette.background.paper,
  },
  "&.entireScreen": {
    height: "100vh",
  },
}));


function FullscreenMessage({message}: any) {
  const handleFullscreen = useFullScreenHandle();
  // @ts-ignore

  return (
      <div className={classes.root} onClick={handleFullscreen.enter}>
        <FullScreenStyled
            className={`${classes.fullscreen}`}
            handle={handleFullscreen}>
          {handleFullscreen.active === true ? (
              <CardMedia
                  style={{height: "100vh", objectFit: "contain"}}
                  component="img"
                  image={message?.pictureUrl}
                  alt={message?.title}
              />
          ) : (
              <CardMedia
                  sx={{
                    objectFit: 'contain', height: {
                      md: 500,
                      xs: 300,
                    }
                  }}
                  component="img"
                  // height="500"
                  image={message?.pictureUrl}
                  alt={message?.title}
              />
          )}
        </FullScreenStyled>
      </div>
  );
}

export {FullscreenMessage};
