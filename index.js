const { ApolloServer, gql, PubSub, withFilter  } = require('apollo-server');
const controller = require('./controller');
require('./connect');

const pubsub = new PubSub();

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Subscription {
    personAdded: Person
    winner(cc: String): Person
  }

  type Query {
    persons: [Person]
  }

  type Mutation {
    addPerson(cc: String, name: String, comment: String): Person
    winner: Person
  }

  type Person {
    id: ID
    name: String
    comment: String
    winner: Boolean
  }
`;

const PERSON_ADDED = 'PERSON_ADDED';
const WINNER = 'WINDER';
// Provide resolver functions for your schema fields
const resolvers = {
    Subscription: {
        personAdded: {
            // Additional event labels can be passed to asyncIterator creation
            subscribe: () => pubsub.asyncIterator([PERSON_ADDED]),
        },
        winner: {
            // Additional event labels can be passed to asyncIterator creation
            subscribe: withFilter(
                () => pubsub.asyncIterator(WINNER),
                (payload, variables) => {
                    return payload.winner.cc === variables.cc;
                },
            ),
        },
    },
    Query: {
        persons(root, args, context) {
            return controller.persons();
        },
    },
    Mutation: {
        addPerson(root, { cc, name, comment }, context) {
            const newPerson = controller.add(cc, name, comment);
            pubsub.publish(PERSON_ADDED, { personAdded: newPerson });
            return newPerson;
        },
        async winner(root, args, context) {
            const winner = await controller.winner();
            pubsub.publish(WINNER, { winner });
            return winner;
        }
    },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
