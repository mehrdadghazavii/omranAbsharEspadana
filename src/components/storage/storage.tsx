import React from 'react';
import './storage.module.css';
import {Typography} from "@mui/material";

function Storage({remainStorage, totalStorage, usedStorage}) {
    return (
        <>
            <progress value={usedStorage} max={totalStorage} style={{borderRadius: '4px', direction: 'rtl', width: '100%',}}/>
            <Typography
                variant='caption'
                display='block'
                fontSize={12}>
                {`${Math.floor(remainStorage)} مگابایت آزاد، از ${totalStorage} مگابایت`}
            </Typography>
        </>
    );
}

export default Storage;



//react-circular-progressbar package
//TODO should be run this command for use  react-circular-progressbar package: npm i react-circular-progressbar

// import React from 'react';
// import {
//     CircularProgressbar,
//     buildStyles
// } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
// import {Box, Typography} from "@mui/material";
//
// function Storage({totalSpace ,usedSpace, remainSpace}) {
//     return (
//         <Box display='flex' justifyContent='space-between' alignItems='end'>
//             <Box width={80} height={80}>
//                 <CircularProgressbar
//                     value={usedSpace}
//                     strokeWidth={50}
//                     maxValue={totalSpace}
//                     minValue={0}
//                     text={`${Math.floor(usedSpace / totalSpace * 100)} %`}
//                     styles={buildStyles({
//                         strokeLinecap: "butt",
//                         textColor:'#4e4e4e',
//                         textSize: '16px',
//                         // pathColor: "gold",
//                         // trailColor: "rgba(216, 246, 238)"
//                     })}
//                 />
//             </Box>
//             <Box>
//                 <Typography variant='overline' display='block' fontSize={12}>{`فضای استفاده شده : ${(usedSpace/1024).toFixed(1)}`}</Typography>
//                 <Typography variant='overline' display='block' fontSize={12}>{`فضای باقی مانده : ${(remainSpace/1024).toFixed(1)}`}</Typography>
//             </Box>
//         </Box>
//     );
// }
//
// export default Storage;