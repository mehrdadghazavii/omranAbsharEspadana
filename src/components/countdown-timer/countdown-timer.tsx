import React, { useState, useEffect } from 'react';
import { Typography } from "@mui/material";
import { handleTimerCode } from "../../redux/actions/actions";
import { useDispatch } from "react-redux";

const CountdownTimer = ({ seconds }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [timer, setTimer] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setTimeLeft(timeLeft => timeLeft - 1);
    }, 1000);
    setTimer(countdownTimer);

    return () => clearInterval(countdownTimer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      clearInterval(timer);
      dispatch(handleTimerCode(false));
    }
  }, [timeLeft, timer]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
   <>
     {!(timeLeft === 0) ? (
       <>
         <Typography variant="body1" color='error' p={1}>
           {formatTime(timeLeft)}
         </Typography>
       </>
     ) : null}
   </>
  );
};

export default CountdownTimer;