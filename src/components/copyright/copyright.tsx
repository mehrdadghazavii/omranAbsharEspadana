import {Link, Typography} from "@mui/material";
import React from "react";


function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" target={'_blank'} href="https://ipasoft.co/">
                IPASOFT
            </Link>{' '}
            {new Date().getFullYear()}
        </Typography>
    );
}

const memoFc = React.memo(Copyright)

export {memoFc as Copyright}