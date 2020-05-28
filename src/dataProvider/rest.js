import simpleRestProvider from "ra-data-simple-rest";
import { fetchUtils, Admin, Resource } from "react-admin";

const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }
  const token = localStorage.getItem("token");
  options.headers.set("Authorization", `Bearer ${token}`);
  return fetchUtils.fetchJson(url, options);
};
const restProvider = simpleRestProvider("http://localhost:3000", httpClient);

const delayedDataProvider = new Proxy(restProvider, {
  get: (target, name, self) =>
    name === "then" // as we await for the dataProvider, JS calls then on it. We must trap that call or else the dataProvider will be called with the then method
      ? self
      : (resource, params) =>
          new Promise((resolve) =>
            setTimeout(() => resolve(restProvider[name](resource, params)), 500)
          ),
});

export default delayedDataProvider;
