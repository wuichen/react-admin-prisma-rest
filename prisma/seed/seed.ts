const { PrismaClient } = require('@prisma/client')
import dataGenerator from './index'
const prisma = new PrismaClient()

async function seedData() {
  try {
    await prisma.connect()
    const data = dataGenerator()
    if (data.categories) {
      for (let index = 0; index < data.categories.length; index++) {
        const element = data.categories[index];
        await prisma.categories.create({
          data: {
            ...element
          }
        })
      }
    }
    if (data.customers) {
      for (let index = 0; index < data.customers.length; index++) {
        const element = data.customers[index];
        await prisma.customers.create({
          data: {
            ...element,
            groups: {
              set: element.groups
            }
          }
        })
      }
    }

    if (data.products) {
      for (let index = 0; index < data.products.length; index++) {
        const element = data.products[index];
        const category_id = element.category_id
        delete element.category_id
        await prisma.products.create({
          data: {
            ...element,
            category: {
              connect: {
                id: category_id
              }
            }
          }
        })
      }
    }

    if (data.commands) {
      for (let index = 0; index < data.commands.length; index++) {
        const element = data.commands[index];
        const baskets = JSON.parse(JSON.stringify(element.basket))
        const customer_id = element.customer_id
        delete element.customer_id
        delete element.basket
        await prisma.commands.create({
          data: {
            ...element,
            basket: {
              create: baskets.map((basket) => {
                return {
                  product: {
                    connect: {
                      id: basket.product_id,
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
      }
    }

    if (data.invoices) {
      for (let index = 0; index < data.invoices.length; index++) {
        const element = data.invoices[index];
        const command_id = element.command_id;
        const customer_id = element.customer_id;
        delete element.command_id
        delete element.customer_id
        await prisma.invoices.create({
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
      }
    }

    if (data.reviews) {
      for (let index = 0; index < data.reviews.length; index++) {
        const element = data.reviews[index];
        const command_id = element.command_id;
        const customer_id = element.customer_id;
        const product_id = element.product_id;

        delete element.command_id
        delete element.product_id
        delete element.customer_id
        await prisma.reviews.create({
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
