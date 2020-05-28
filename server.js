const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const jwtDecode = require("jwt-decode");

app.use(bodyParser.json()); // for parsing application/json
// app.use(
//   cors({
//     origin: "*",
//     credentials: true,
//     exposedHeaders: ["Content-Range"],
//     allowedHeaders: ["Content-Range", "Content-Type", "Authorization"],
//   })
// );
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(path.join(__dirname, "build")));
app.use(function (req, res, next) {
  if (req.headers.authorization) {
    const decoded = jwtDecode(
      req.headers.authorization.replace("Bearer", "").trim()
    );
    req.user = decoded;
  }
  next();
});
app.get("/ping", function (req, res) {
  return res.send("pong");
});

const validUntil = new Date(Date.parse(new Date()) + 12 * 24 * 60 * 60 * 1000);
// middleware that is specific to this router
app.use(function timeLog(req, res, next) {
  console.log("Time: ", Date.now());
  next();
});

app.post("/loginCompany", async (req, res) => {
  const {
    body: { companyId },
    user,
  } = req;

  const staffs = await prisma.staff.findMany({
    where: {
      company: {
        id: companyId,
      },
      user: {
        id: user.id,
      },
    },
    include: {
      company: true,
      user: true,
    },
  });
  if (staffs && staffs.length && staffs.length > 0) {
    const token = jwt.sign(
      {
        ...user,
        permissions: { role: staffs[0].role, companyId: staffs[0].company.id },
      },
      "secret"
    );
    res.send({
      token,
      user,
    });
  } else {
    res.sendStatus(404);
  }
});

app.post("/loginPlatform", async (req, res) => {
  const {
    body: { platformId },
    user,
  } = req;
  console.log("user!!!", user);
  const loginUser = await prisma.user.findOne({
    where: {
      id: user.id,
    },
    include: {
      platforms: true,
    },
  });
  console.log("loginuser!!!", loginUser);

  const platforms = loginUser.platforms;
  const selectedPlatform = platforms.find(
    (platform) => platformId === platform.id
  );
  if (selectedPlatform) {
    const token = jwt.sign(
      {
        ...user,
        permissions: {
          platformId: selectedPlatform.id,
        },
      },
      "secret"
    );
    res.send({
      token,
      user,
    });
  } else {
    res.sendStatus(404);
  }
});

app.post("/login", async (req, res) => {
  const {
    body: { email, password },
  } = req;
  console.log(req);
  const user = await prisma.user.findOne({
    where: {
      email,
    },
  });
  if (user) {
    const token = jwt.sign(user, "secret");
    res.send({
      token,
      user,
    });
  } else {
    res.sendStatus(404);
  }
});

app.get("/:resource", async (req, res) => {
  const { resource } = req.params;
  console.log("resource!!", resource);
  const queries = req.query;
  console.log(queries);
  let page, perPage, field, order, from, to;
  const { pagination, sort, filter, range } = queries;

  if (range) {
    let rangeArray = JSON.parse(range);

    from = rangeArray[0];
    to = rangeArray[1];
  }

  if (pagination) {
    if (pagination.page) {
      page = pagination.page;
    }
    if (pagination.perPage) {
      perPage = pagination.perPage;
    }
  }

  if (sort) {
    let sortArray = JSON.parse(sort);
    field = sortArray[0];
    order = sortArray[1].toLowerCase();
  }

  let query = {};
  if (perPage && page) {
    query.first = perPage;
    query.skip = page * perPage;
  } else if (typeof from === "number" && typeof to === "number") {
    query.first = to - from;
    query.skip = from;
  }
  if (field && order) {
    query.orderBy = {
      [field]: order,
    };
  }
  let filterObject;
  let where = {};

  // TIPS: Middlewares
  if (resource === "platform" || resource === "company") {
    where = {
      ...where,
      owner: {
        id: req.user.id,
      },
    };
  } else if (
    resource === "products"
    // ||
    // resource === "commands" ||
    // resource === "invoices" ||
    // resource === "customers"
  ) {
    where = {
      ...where,
      company: {
        id: req.user.permissions.companyId,
      },
    };
  }

  if (filter) {
    const filterObject = JSON.parse(filter);

    for (const key in filterObject) {
      if (filterObject.hasOwnProperty(key)) {
        const value = filterObject[key];
        const thisField = getField(key);

        if (key.endsWith("_gte")) {
          console.log(key);
          // TODO: find better way to organize this
          // first_seen, last_seen is a datetime field in customers
          // date is a datetime field in most other resources
          const isDateField =
            thisField === "date" ||
            thisField === "first_seen" ||
            thisField === "last_seen";
          where = {
            ...where,
            [thisField]: {
              gte: isDateField ? new Date(value) : parseFloat(value),
            },
          };
        } else if (key === "q") {
          if (resource === "reviews") {
            where = {
              ...where,
              comment: {
                contains: value,
              },
            };
          } else if (resource === "customers") {
            where = {
              ...where,
              OR: [
                {
                  first_name: {
                    contains: value,
                  },
                },
                {
                  last_name: {
                    contains: value,
                  },
                },
              ],
            };
          } else if (resource === "commands") {
            where = {
              ...where,
              OR: [
                {
                  customer: {
                    first_name: {
                      contains: value,
                    },
                  },
                },
                {
                  customer: {
                    last_name: {
                      contains: value,
                    },
                  },
                },
              ],
            };
          } else if (resource === "products") {
            where = {
              ...where,

              // Todo: find a universal field name for search
              description: {
                contains: value,
              },
            };
          }
          // getManyReference
        } else if (key.endsWith("_lte")) {
          console.log(key);

          where = {
            ...where,
            [thisField]: {
              lte: thisField === "date" ? new Date(value) : parseFloat(value),
            },
          };
          // getManyReference
        } else if (key.endsWith("_id")) {
          where = {
            ...where,
            [thisField]: {
              id: {
                equals: parseInt(value),
              },
            },
          };
        } else if (key === "id" && Array.isArray(value)) {
          where = {
            ...where,
            id: {
              in: value,
            },
          };
        } else if (resource === "customers" && key === "groups") {
          // TODO: find a way to query from string array
          console.log(value);
          where = {
            ...where,
            // groups: {
            //   in: [value],
            // },
          };
        } else {
          where = {
            ...where,
            [key]: value,
          };
        }
      }
    }
    if (where) {
      query.where = where;
    }
  }

  // HACK: include basket in retuning data for those entities
  if (resource === "commands" || resource === "products") {
    query.include = {
      basket: true,
    };
  }
  console.log(query);
  const total = await prisma[resource].count({ where });
  const data = await prisma[resource].findMany(query);
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  // res.header("Access-Control-Allow-Headers", "Content-Type,x-access-token");
  // res.header("Access-Control-Expose-Headers", "X-Total-Count");
  // res.header("X-Total-Count", "30");
  if (typeof from === "number" && typeof to === "number") {
    res.header("Access-Control-Expose-Headers", "Content-Range");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Content-Range", `${resource} ${from}-${to}/${total}`);
  }

  res.json(data);
});

app.get("/:resource/:id", async (req, res) => {
  const { resource, id } = req.params;
  let query = {};
  query.where = { id: parseInt(id) };

  if (resource === "commands") {
    query.include = {
      basket: true,
    };
  }

  const data = await prisma[resource].findOne(query);
  res.json(data);
});

app.post("/:resource", async (req, res) => {
  const { resource } = req.params;
  const { body } = req;

  const data = await prisma[resource].create({
    data: generateInput(body),
  });
  res.json(data);
});

app.delete("/:resource/:id", async (req, res) => {
  const { resource, id } = req.params;
  const data = await prisma[resource].delete({
    where: {
      id: parseInt(id),
    },
  });
  res.json(data);
});

app.put("/:resource/:id", async (req, res) => {
  const { resource, id } = req.params;
  const { body } = req;
  const data = await prisma[resource].update({
    where: {
      id: parseInt(id),
    },
    data: generateInput(body),
  });
  res.json(data);
});

const generateInput = (body) => {
  let query = {};
  for (const key in body) {
    if (body.hasOwnProperty(key)) {
      const value = body[key];
      const thisField = getField(key);

      // TODO: only dealing with array strings currently.
      // not handling model object saves
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "string"
      ) {
        query = {
          ...query,
          [key]: {
            set: value,
          },
        };
      } else if (key.endsWith("_id")) {
        query = {
          ...query,
          [thisField]: {
            connect: {
              id: parseInt(value),
            },
          },
        };
      }
      // Skipping model fields
      else if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "object"
      ) {
        query = {
          ...query,
        };
      } else {
        query = {
          ...query,
          [key]: value,
        };
      }
    }
  }
  return query;
};

const getField = (field) => {
  // return field.split("_")[0];
  return field.replace("_id", "").replace("_gte", "").replace("_lte", "");
};

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(process.env.PORT || 8080);
