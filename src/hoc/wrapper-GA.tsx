import {useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import ReactGA from "react-ga";

export const WrapperGA = ({children}: any) => {
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!window.location.href.includes("localhost")) {
      ReactGA.initialize("G-D4K35HV7PE");
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized) {
      ReactGA.pageview(location.pathname + location.search);
    }
  }, [initialized, location]);

  return children

}