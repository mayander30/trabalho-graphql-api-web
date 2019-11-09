const { ApolloServer, gql, PubSub } = require('apollo-server')
const Sequelize = require('./database')
const User = require('./models/user')
const Registered_Time = require('./models/registered_time')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const AuthDirective = require('./directives/auth')

const pubSub = new PubSub()

const typeDefs = gql`
    enum RoleEnum {
        USER
        WRITER
    }

    enum Roles {
        ADMIN
        FUNCIONARIO
    }

    directive @auth(
        role: RoleEnum
    ) on OBJECT | FIELD_DEFINITION

    type User {
        id: ID!
        name: String!
        email: String!
        password: String
        role: Roles
        registered_times: [Registered_Time]
    }

    type Registered_Time {
        id: ID!
        time_registered: String!
        user: User!    
    }
    

    type Query {
        allRegistered_Times: [Registered_Time]
        allUser: [User]
    }

    type Mutation {
        createRegistered_Time(data: CreateRegistered_TimeInput): Registered_Time @auth(role: WRITER)
        deleteRegistered_Time(id: ID!): Boolean 

        createUser(data: CreateUserInput): User
        updateUser(id: ID! data: UpdateUserInput): User 
        deleteUser(id: ID!): Boolean 

        signin(
            email: String!
            password: String!
        ): PayloadAuth
    }

    type PayloadAuth {
        token: String!
        user: User!
    }

    type Subscription {
        onCreatedUser: User
        onCreatedRegistered_Time: Registered_Time
    }

    input CreateRegistered_TimeInput {
        time_registered: String!
        user: CreateUserInput! 
    }

    input CreateUserInput {
        name: String!
        email: String!
        password: String
        role: Roles
    }
    
    input UpdateUserInput {
        name: String!
        email: String!
        password: String
        role: Roles
    }
`

const resolver = {
    Query: {
        allRegistered_Times() {
            return Registered_Time.findAll({ include: [User] })
        },
        allUsers() {
            return User.findAll({ include: [Registered_Time] })
        }
    },
    Mutation: {
        async createRegistered_Time(parent, body, context, info) {
            if (body.data.user) {
                const [createdUser, created] =
                    await User.findOrCreate(
                        { where: body.data.user }
                    )
                body.data.user = null
                const registered_time = await Registered_Time.create(body.data)
                await registered_time.setUser(createdUser.get('id'))
                const newRegistered_Time = await registered_time.reload({ include: [User] })
                pubSub.publish('createdRegistered_Time', {
                    onCreatedRegistered_Time: newRegistered_Time
                })
                return newRegistered_Time

            } else {
                const registered_time = await Registered_Time.create(body.data, { include: [User] })
                pubSub.publish('createdRegistered_Time', {
                    onCreatedRegistered_Time: registered_time
                })
                return registered_time
            }
        },
        async deleteRegistered_Time(parent, body, context, info) {
            const registered_time = await Registered_Time.findOne({
                where: { id: body.id }
            })
            await registered_time.destroy()
            return true
        },
        async createUser(parent, body, context, info) {
            body.data.password = await bcrypt.hash(body.data.password, 10)
            const user = await User.create(body.data)
            const reloadedUser = user.reload({ include: [Registered_Time] })
            pubSub.publish('createdUser', {
                onCreatedUser: reloadedUser
            })
            return reloadedUser
        },
        async updateUser(parent, body, context, info) {
            if (body.data.password) {
                body.data.password = await bcrypt.hash(body.data.password, 10)
            }
            const user = await User.findOne({
                where: { id: body.id }
            })
            if (!user) {
                throw new Error('Autor não encontrado')
            }
            const updateUser = await user.update(body.data)
            return updateUser
        },
        async deleteUser(parent, body, context, info) {
            const user = await User.findOne({
                where: { id: body.id }
            })
            await user.destroy()
            return true
        },
        async signin(parent, body, context, info) {
            const user = await User.findOne({
                where: { email: body.email }
            })

            if (user) {
                const isCorrect = await bcrypt.compare(
                    body.password,
                    user.password
                )
                if (!isCorrect) {
                    throw new Error('Senha inválida')
                }

                const token = jwt.sign({ id: user.id }, 'secret')

                return {
                    token,
                    user
                }
            }
        }
    },
    Subscription: {
        onCreatedUser: {
            subscribe: () => pubSub.asyncIterator('createdUser')
        },
        onCreatedRegistered_Time: {
            subscribe: () => pubSub.asyncIterator('createdRegistered_Time')
        }
    },
    User: {

    }
}

const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolver,
    schemaDirectives: {
        auth: AuthDirective
    },
    context({ req, connection }) {
        if (connection) {
            return connection.context
        }
        return {
            headers: req.headers
        }
    }
});


Sequelize.sync().then(() => {
    server.listen()
        .then(() => {
            console.log('Servidor rodando')
        })
})
