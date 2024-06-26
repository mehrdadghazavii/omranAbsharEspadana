import { Grid ,Skeleton, Stack} from "@mui/material";

function SkeletonCompany() {
  return (
    <Grid container rowSpacing={2} columnSpacing={8}>
        {Array(16).fill(0).map((element , index) => 
            <Grid key={index} item xs={12} sm={6} md={4} lg={3} xl={2} sx={{maxWidth: 320, margin: 'auto',my: 5}}>
                <Stack direction='column' spacing={.2}>
                    <Skeleton variant="rectangular" height={50} animation='wave'
                    sx={{borderTopRightRadius:(theme:any) =>theme.shape.borderRadius - 4 ,
                        borderTopLeftRadius:(theme:any) =>theme.shape.borderRadius - 4}}
                    />
                    <Skeleton variant="rectangular" height={250} animation='wave'
                     sx={{borderBottomRightRadius:(theme:any) =>theme.shape.borderRadius - 4 ,
                        borderBottomLeftRadius:(theme:any) =>theme.shape.borderRadius - 4}}
                    />
                    {/* <Skeleton variant="rectangular" height={50} animation='wave'/> */}
                </Stack>
            </Grid>
        )}
  </Grid>
  )
}

export default SkeletonCompany;