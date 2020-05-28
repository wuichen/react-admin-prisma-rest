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
import jwtDecode from "jwt-decode";

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

  const loginAdmin = async (url, entity) => {
    let body = "";
    if (entity === "platform") {
      body = JSON.stringify({
        platformId: entity.id,
      });
    } else {
      body = JSON.stringify({
        companyId: entity.id,
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body,
    });
    const json: any = await response.json();
    localStorage.setItem("token", json.token);
    const decoded = jwtDecode(json.token);

    if (decoded && decoded.permissions) {
      localStorage.setItem("permissions", JSON.stringify(decoded.permissions));
    }
    localStorage.setItem("user", JSON.stringify(json.user));
    window.location.reload();
  };

  return (
    <div>
      <h2>My Companies</h2>
      <CompanyGrid loginAdmin={loginAdmin} companies={companyQuery} />
      <h2>My Platforms</h2>
      <PlatformGrid loginAdmin={loginAdmin} platforms={platformQuery} />
    </div>
  );
};

export default Dashboard;
