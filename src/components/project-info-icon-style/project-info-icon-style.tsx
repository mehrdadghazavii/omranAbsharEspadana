import { Paper, Typography } from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import React from "react";

interface ProjectInfoIconStyleProps {
  title: string;
  titleValue: string;
  icon: any;
  fullWidthInLg?: boolean;
}

function ProjectInfoIconStyle({ title, titleValue, icon, fullWidthInLg }: ProjectInfoIconStyleProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        width: { xs: "100%", lg: fullWidthInLg ? "100%" : "50%" },
        backgroundColor: "rgba(216, 246, 238)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={1}
        sx={{ backgroundColor: "rgba(102, 208, 151)", display: "inline-block", px: 1.2, pt: 0.7, pb: 0.1, m: 1 }}
      >
        {icon}
      </Paper>
      <Typography variant={"body1"}> &nbsp; {title}: &nbsp;</Typography>
      <Typography variant={"subtitle2"}>{titleValue}</Typography>
    </Paper>
  );
}

export default ProjectInfoIconStyle;
