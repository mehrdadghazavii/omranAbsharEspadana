import {GoftinoSnippet} from "@mohsen007/react-goftino";
import { useEffect } from "react";

const GoftinoKey = "52VDCr";
const localStorageData = localStorage.getItem("omranUser");
const user = JSON.parse(localStorageData);
const GoftinoComponent = () => {

  useEffect(() => {
    if (user) {
      if (!(window as any).Goftino) {
        const script = document.createElement("script");
        script.referrerPolicy = "no-referrer-when-downgrade";
        window.addEventListener("goftino_ready", function () {
          // @ts-ignore
          Goftino.setUser({
            name: `${user.firstName} ${user.lastName} | ${user.userName}`,
            phone: user.userName,
            forceUpdate: true,
          });
        });
        document.body.appendChild(script);
      }
    }
  }, []);

  return (
    <>
      <GoftinoSnippet
        goftinoKey={GoftinoKey}
      />
    </>
  )
}



export default GoftinoComponent;