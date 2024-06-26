import { Grid ,Skeleton, Stack} from "@mui/material";

function SkeletonProject() {
  return (
    <Grid container rowSpacing={2} columnSpacing={8}>
        {Array(16).fill(0).map((element , index) => 
        <Grid key={index} item xs={12} sm={6} md={4} lg={3} xl={2} sx={{maxWidth: 320, margin: 'auto',my: 5}}>
            <Stack direction='column' spacing={1}>
                <Skeleton variant="rectangular" height={150} animation='wave'/>
                <Skeleton variant="rectangular" height={30} animation='wave'/>
            </Stack>
        </Grid>
    )}
  </Grid>
  )
}

export default SkeletonProject;