import generateCustomers from "./customers";
import generateCategories from "./categories";
import generateProducts from "./products";
import generateCommands from "./commands";
import generateInvoices from "./invoices";
import generateReviews from "./reviews";
import generateCountries from "./countries";
import generatePlatforms from "./platforms";
import generateCompanies from "./companies";

import finalize from "./finalize";

export default (options = { serializeDate: true }) => {
  const db = {};
  db.companies = generateCompanies(db, options);
  db.platforms = generatePlatforms(db, options);
  db.countries = generateCountries(db, options);
  db.customers = generateCustomers(db, options);
  db.categories = generateCategories(db, options);
  db.products = generateProducts(db, options);
  db.commands = generateCommands(db, options);
  db.invoices = generateInvoices(db, options);
  db.reviews = generateReviews(db, options);
  finalize(db);

  return db;
};
