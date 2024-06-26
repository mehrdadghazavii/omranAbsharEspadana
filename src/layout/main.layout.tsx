import { HeaderLayout } from "./components/header/header.layout";
import React from "react";
import { BackgroundBubbles } from "../components";
import GoftinoComponent from "../components/goftino/goftino";

function MainLayout(props: any) {
  return (
    <>
      <HeaderLayout>{props.children}</HeaderLayout>
      <GoftinoComponent />
      <BackgroundBubbles />
    </>
  );
}

export { MainLayout };
