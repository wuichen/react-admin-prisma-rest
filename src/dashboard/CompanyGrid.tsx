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
  Button,
} from "@material-ui/core";
import jwtDecode from "jwt-decode";

// import LinkToRelatedProducts from './LinkToRelatedProducts';

// TODO: make company type
// import { Company } from '../types';

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

const CompanyGrid = (props) => {
  const classes = useStyles(props);
  const { data } = props.companies;
  return data ? (
    <Grid container spacing={2} className={classes.root}>
      {data.map((company) => (
        <Grid key={company.id} xs={12} sm={6} md={4} lg={3} xl={2} item>
          <Card>
            <CardMedia image={company.bannerImg} className={classes.media} />
            <CardContent className={classes.title}>
              <Typography variant="h5" component="h2" align="center">
                {inflection.humanize(company.name)}
              </Typography>
            </CardContent>
            <CardActions classes={{ spacing: classes.actionSpacer }}>
              {/* <LinkToRelatedProducts record={data[id]} /> */}
              <Button
                onClick={async () => {
                  props.loginAdmin("/loginCompany", company);
                }}
              >
                Enter
              </Button>
              <EditButton basePath="/categories" record={company} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  ) : null;
};

// const CompanyList = (props: any) => (
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
//         <CompanyGrid />
//     </List>
// );

export default CompanyGrid;
