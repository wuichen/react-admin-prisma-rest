const { PrismaClient } = require('@prisma/client')
import dataGenerator from './index'
const prisma = new PrismaClient()
const data = dataGenerator()
const clonedData = JSON.parse(JSON.stringify(data))

// resource: table name
// comparisonField: the unique field(not id) that are going to be used to compare
function findNewIdFromOldData(resource, comparisonField, element, idField) {
  let fieldValue, newId
  for (let j = 0; j < clonedData[resource].length; j++) {
    const oldElement = clonedData[resource][j];
    if (element[idField] === oldElement.id) {
      fieldValue = oldElement[comparisonField]
    }
  }

  for (let y = 0; y < data[resource].length; y++) {
    const newElement = data[resource][y];
    if (newElement[comparisonField] === fieldValue) {
      newId = newElement.id
    }
  }
  return newId
}

async function seedData() {
  try {
    await prisma.connect()
    if (data.countries) {
      for (let index = 0; index < data.countries.length; index++) {
        const element = data.countries[index];
        let oldId = element.id
        delete element.id
        const country = await prisma.country.create({
          data: {
            ...element
          }
        })

        data.countries[index].oldId = oldId
        data.countries[index].newId = country.id
      }
    }
    if (data.categories) {
      for (let index = 0; index < data.categories.length; index++) {
        const element = data.categories[index];
        let oldId = element.id
        delete element.id
        const category = await prisma.categories.create({
          data: {
            ...element
          }
        })
        data.categories[index].oldId = oldId
        data.categories[index].newId = category.id
      }
    }
    if (data.customers) {
      for (let index = 0; index < data.customers.length; index++) {
        const element = data.customers[index];
        let oldId = element.id
        delete element.id

        const customer = await prisma.customers.create({
          data: {
            ...element,
            groups: {
              set: element.groups
            }
          }
        })
        data.customers[index].oldId = oldId
        data.customers[index].newId = customer.id
      }
    }

    if (data.products) {
      for (let index = 0; index < data.products.length; index++) {
        const element = data.products[index];

        // const category_id = findNewIdFromOldData("categories", "name", element, "category_id")
        console.log("dis", element, data.categories.find((category) => category.oldId === element.category_id))
        const category_id = data.categories.find((category) => category.oldId === element.category_id)?.newId
        let oldId = element.id
        delete element.id
        delete element.category_id

        const product = await prisma.products.create({
          data: {
            ...element,
            category: {
              connect: {
                id: category_id
              }
            }
          }
        })
        data.products[index].oldId = oldId
        data.products[index].newId = product.id
      }
    }

    if (data.commands) {
      for (let index = 0; index < data.commands.length; index++) {
        const element = data.commands[index];
        const baskets = JSON.parse(JSON.stringify(element.basket))
        const customer_id = data.customers.find((customer) => customer.oldId === element.customer_id)?.newId

        let oldId = element.id
        delete element.id
        delete element.customer_id
        delete element.basket
        const command = await prisma.commands.create({
          data: {
            ...element,
            basket: {
              create: baskets.map((basket) => {
                const product_id = data.products.find((product) => product.oldId === basket.product_id)?.newId
                return {
                  product: {
                    connect: {
                      id: product_id,
                    }
                  },
                  quantity: basket.quantity
                }
              })
            },
            customer: {
              connect: {
                id: customer_id
              }
            }
          }
        })
        data.commands[index].oldId = oldId
        data.commands[index].newId = command.id
      }
    }

    if (data.invoices) {
      for (let index = 0; index < data.invoices.length; index++) {
        const element = data.invoices[index];
        const command_id = data.commands.find((command) => command.oldId === element.command_id)?.newId
        const customer_id = data.customers.find((customer) => customer.oldId === element.customer_id)?.newId
        delete element.command_id
        delete element.customer_id
        let oldId = element.id
        delete element.id

        const invoice = await prisma.invoices.create({
          data: {
            ...element,
            customer: {
              connect: {
                id: customer_id
              }
            },
            command: {
              connect: {
                id: command_id
              }
            }
          }
        })
        data.invoices[index].oldId = oldId
        data.invoices[index].newId = invoice.id
      }
    }

    if (data.reviews) {
      for (let index = 0; index < data.reviews.length; index++) {
        const element = data.reviews[index];
        const product_id = data.products.find((product) => product.oldId === element.product_id)?.newId
        const command_id = data.commands.find((command) => command.oldId === element.command_id)?.newId
        const customer_id = data.customers.find((customer) => customer.oldId === element.customer_id)?.newId


        let oldId = element.id
        delete element.id
        delete element.command_id
        delete element.product_id
        delete element.customer_id
        const review = await prisma.reviews.create({
          data: {
            ...element,
            customer: {
              connect: {
                id: customer_id
              }
            },
            command: {
              connect: {
                id: command_id
              }
            },
            product: {
              connect: {
                id: product_id
              }
            }
          }
        })
        data.reviews[index].oldId = oldId
        data.reviews[index].newId = review.id
      }
    }


    await prisma.disconnect()
    return
  } catch (err) {
    console.log(err)
    return
  }

}

seedData()
