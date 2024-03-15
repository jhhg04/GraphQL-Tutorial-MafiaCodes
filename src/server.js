var express = require('express');
var { createHandler } = require('graphql-http/lib/use/express');
var { buildSchema } = require('graphql');
var { ruruHTML } = require('ruru/server');
var axios = require('axios');

let message = 'This is a message';
// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Post {
    userId: Int
    id: Int
    title: String
    body: String
  }

  type User {
    name: String
    age: Int
    college: String
  }

  type Query {
    hello: String!
    welcomeMessage(name: String, dayOfWeek: String!): String
    getUser: User
    getUsers: [User]
    getPostFromExternalAPI: [Post]
    message: String
  }

  input UserInput {
    name: String!
    age: Int!
    college: String!
  }

  type Mutation {
    setMessage(newMessage: String): String
    createUser(user: UserInput): User
  }
`);

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return 'Hello world!';
  },
  welcomeMessage: (args) => {
    return `Hey ${args.name}, hows life, today is ${args.dayOfWeek}`;
  },
  getUser: () => {
    const user = {
      name: 'John Herrera',
      age: 30,
      college: 'Sena',
    };
    return user;
  },
  getUsers: () => {
    const users = [
      {
        name: 'John Herrera',
        age: 30,
        college: 'Sena',
      },
      {
        name: 'Harold Guateque',
        age: 31,
        college: 'UD',
      },
    ];
    return users;
  },
  getPostFromExternalAPI: async () => {
    // Async
    const result = await axios.get(
      'https://jsonplaceholder.typicode.com/posts'
    );
    return result.data;
    /* 
    // Promesa no need async
    return axios
      .get('https://jsonplaceholder.typicode.com/posts')
      .then((result) => result.data);
    */
  },
  setMessage: ({ newMessage }) => {
    message = newMessage;
    return message;
  },
  message: () => {
    return message;
  },
  createUser: (args) => {
    console.log(args);
    return args.user;
  },
};

var app = express();

// Create and use the GraphQL handler.
app.all(
  '/graphql',
  createHandler({
    schema: schema,
    rootValue: root,
  })
);

// Serve the GraphiQL IDE.
app.get('/', (_req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

// Start the server at port
app.listen(4000);
console.log('Running a GraphQL API server at http://localhost:4000/graphql');
