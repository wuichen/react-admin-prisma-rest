import React, {
  useState,
  useEffect,
  useCallback,
  FC,
  CSSProperties,
} from "react";
import { useVersion, useDataProvider, useQueryWithStore } from "react-admin";
import { useMediaQuery, Theme } from "@material-ui/core";
import CompanyGrid from "./CompanyGrid";
import PlatformGrid from "./PlatformGrid";

interface State {
  companies?: any;
  platforms?: any;
  // TODO: come back and use gql generator for types
  //   platforms?: Platform[];
}

const Dashboard: FC = () => {
  const version = useVersion();

  const companyQuery = useQueryWithStore({
    type: "getMany",
    resource: "company",
    payload: {
      sort: { field: "date", order: "DESC" },
      pagination: { page: 1, perPage: 50 },
    },
  });

  const platformQuery = useQueryWithStore({
    type: "getMany",
    resource: "platform",
    payload: {
      sort: { field: "date", order: "DESC" },
      pagination: { page: 1, perPage: 50 },
    },
  });

  return (
    <div>
      <h2>My Companies</h2>
      <CompanyGrid companies={companyQuery} />
      <h2>My Platforms</h2>
      <PlatformGrid platforms={platformQuery} />
    </div>
  );
};

export default Dashboard;
