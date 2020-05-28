import React, { FC } from "react";
import { EditButton, List } from "react-admin";
import { ListControllerProps } from "ra-core";
import inflection from "inflection";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  makeStyles,
} from "@material-ui/core";

// import LinkToRelatedProducts from './LinkToRelatedProducts';

// TODO: make platform type
// import { Platform } from '../types';

const useStyles = makeStyles({
  root: {
    marginTop: "1em",
  },
  media: {
    height: 140,
  },
  title: {
    paddingBottom: "0.5em",
  },
  actionSpacer: {
    display: "flex",
    justifyContent: "space-around",
  },
});

const PlatformGrid = (props) => {
  const classes = useStyles(props);
  const { data } = props.platforms;
  return data ? (
    <Grid container spacing={2} className={classes.root}>
      {data.map((platform) => (
        <Grid key={platform.id} xs={12} sm={6} md={4} lg={3} xl={2} item>
          <Card>
            <CardMedia image={platform.bannerImg} className={classes.media} />
            <CardContent className={classes.title}>
              <Typography variant="h5" component="h2" align="center">
                {inflection.humanize(platform.name)}
              </Typography>
            </CardContent>
            <CardActions classes={{ spacing: classes.actionSpacer }}>
              {/* <LinkToRelatedProducts record={data[id]} /> */}
              <EditButton basePath="/categories" record={platform} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  ) : null;
};

// const PlatformList = (props: any) => (
//     <List
//         {...props}
//         sort={{ field: 'name', order: 'ASC' }}
//         perPage={20}
//         pagination={false}
//         component="div"
//         actions={false}
//     >
//         {/*
//         // @ts-ignore */}
//         <PlatformGrid />
//     </List>
// );

export default PlatformGrid;
