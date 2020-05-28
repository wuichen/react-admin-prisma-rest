const { PrismaClient } = require('@prisma/client')
import dataGenerator from './index'
const prisma = new PrismaClient()
const data = dataGenerator()
const clonedData = JSON.parse(JSON.stringify(data))

// TIPS: The order of data creation matters!
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
    if (data.customers) {
      for (let index = 0; index < data.customers.length; index++) {
        const element = data.customers[index];
        let oldId = element.id
        delete element.id

        const customer = await prisma.customers.create({
          data: {
            ...element,
            user: {
              create: {
                firstName: element.first_name,
                lastName: element.last_name,
                email: element.email,
                password: 'test'
              }
            },
            groups: {
              set: element.groups
            }
          }
        })
        data.customers[index].oldId = oldId
        data.customers[index].newId = customer.id
      }
    }
    if (data.platforms) {
      for (let index = 0; index < data.platforms.length; index++) {
        const element = data.platforms[index];
        const countryId = element.countryId
        const ownerId = element.ownerId
        let oldId = element.id
        delete element.id
        delete element.countryId
        delete element.ownerId
        const platform = await prisma.platform.create({
          data: {
            ...element,
            owner: {
              connect: {
                id: ownerId
              }
            },
            country: {
              connect: {
                id: countryId
              }
            }
          }
        })

        data.platforms[index].oldId = oldId
        data.platforms[index].newId = platform.id
      }
    }
    if (data.companies) {
      for (let index = 0; index < data.companies.length; index++) {
        const element = data.companies[index];
        const platformId = element.platformId
        const ownerId = element.ownerId
        const address = element.address
        const contact = element.contact
        let oldId = element.id
        delete element.id
        delete element.ownerId
        delete element.platformId
        delete element.address
        delete element.contact
        const company = await prisma.company.create({
          data: {
            ...element,
            address: {
              create: {
                type: address.type,
                info: address.info,
                name: address.name,
              }
            },
            contact: {
              create: {
                type: contact.type,
                number: contact.number
              }
            },
            owner: {
              connect: {
                id: ownerId
              }
            },
            platform: {
              connect: {
                id: platformId
              }
            }
          }
        })

        data.companies[index].oldId = oldId
        data.companies[index].newId = company.id
      }
    }
    if (data.categories) {
      for (let index = 0; index < data.categories.length; index++) {
        const element = data.categories[index];
        const platformId = element.platformId
        let oldId = element.id
        delete element.id
        delete element.platformId
        const category = await prisma.categories.create({
          data: {
            ...element,
            platform: {
              connect: {
                id: platformId
              }
            }
          }
        })
        data.categories[index].oldId = oldId
        data.categories[index].newId = category.id
      }
    }

    if (data.products) {
      for (let index = 0; index < data.products.length; index++) {
        const element = data.products[index];
        const category_id = data.categories.find((category) => category.oldId === element.category_id)?.newId
        const companyId = data.companies.find((company) => company.oldId === element.companyId)?.newId
        let oldId = element.id
        delete element.id
        delete element.category_id
        delete element.companyId

        const product = await prisma.products.create({
          data: {
            ...element,
            company: {
              connect: {
                id: companyId
              }
            },
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
