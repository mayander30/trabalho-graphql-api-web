const { ApolloServer, gql, PubSub } = require('apollo-server');
const Sequelize = require('./database');
const User = require('./models/User')
const Registered_Time = require('./models/Registered_Time')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const AuthDirective = require('./directives/auth')

const pubSub = new PubSub();

// The GraphQL schema
const typeDefs = gql`

  enum Roles {
    ADMIN
    FUNCIONARIO
  }

  directive @auth(
    role: Roles
  ) on OBJECT | FIELD_DEFINITION


  type Subscription {
    onCreateUser: User
  }

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
    teste: String
  }

  type Mutation {
    createRegistered_Time(data: CreateRegistered_TimeInput): Registered_Time
    deleteRegistered_Time(id: ID!): Boolean @auth(role: ADMIN)

    createUser(data: CreateUserInput): User @auth(role: ADMIN)
    updateUser(id: ID!, data: CreateUserInput): User @auth(role: ADMIN)
    deleteUser(id: ID!): Boolean @auth(role: ADMIN)

    signin(
        email: String!
        password: String!
    ): PayloadAuth
  }

  type PayloadAuth {
    token: String!
    user: User!
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
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    async allRegistered_Times(parent, args, context) {

      const user = await User.findByPk(context.userId);
      
      let where = {};

      if (user.role !== 'ADMIN') {
        where.userId = user.id;
      }
      
      return Registered_Time.findAll({
        include: [User],
        where: where
      });
    },
    allUser() {
      return User.findAll({
       include: [Registered_Time]
      });
    },
    teste() {
      return "oi";
    }
  },
  Mutation: {
    async createRegistered_Time(parent, body, context, info) {
      console.log(body)
      const [createUser, create] = await User.findOrCreate({
        where: body.data.user
      });

      body.data.User = null;
      const registered_time = await Registered_Time.create(body.data);
      await registered_time.setUser(createUser.get('id'));
      return registered_time.reload({ include: [User]});

    },
    async deleteRegistered_Time(parent, body, context, info) {
      const registered_time = await Registered_Time.findOne({
        id: body.id
      });
      await registered_time.destroy();
      return true;
    },

    async createUser(parent, body, context, info) {
      body.data.password = await bcrypt.hash(body.data.password, 10)
      const w = await User.create(body.data);
      const reloadW = w.reload({include: [Registered_Time]});
      pubSub.publish('createdUser', { onCreateUser: reloadW });
      return reloadW;
    },
    async updateUser(parent, body, context, info) {

      if (body.data.password) {
        body.data.password = await bcrypt.hash(body.data.password, 10)
      }
      const w = await User.findOne({
        id: body.id
      });
      
      if (!w) {
        throw new Error('Usuario nao encontrado.');
      }
      const wAc = await w.update(body.data);

      return wAc;
    },
    async deleteUser(parent, body, context, info) {
      const w = await User.findOne({
        id: body.id
      });
      await w.destroy();
      return true;
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
    onCreateUser: {
      subscribe: () => pubSub.asyncIterator('createdUser')
    }
  },
  User: {
    
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    auth: AuthDirective
  },
  context({ req, connection }) {
      if (connection) {
          return connection.context
      }
      const token = req.headers.authorization
      if (!token) {
          throw new AuthenticationError('Você não está autorizado')
      }
      const jwtData = jwt.decode(token.replace('Bearer ', ''))
      if(jwtData){
        const { id } = jwtData
        return {
            headers: req.headers,
            userId: id
        }
      }

      return {
        headers: req.headers
      }
  }
});

Sequelize.sync().then(() => {

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
});
