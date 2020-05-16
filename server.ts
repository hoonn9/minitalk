import { GraphQLServer } from "graphql-yoga";
import axios from "axios";
import { prisma } from "./generated/prisma-client";
import "dotenv/config";

const typeDefs = `
  type Message{
    id: String!
    text: String!
  }
  type Query {
    messages: [Message!]!
  }
  type Mutation {
    sendMessage(text:String!): Message!
  }
  type Subscription {
    newMessage: Message!
  }
`;

const TOKEN = process.env.token;

const resolvers = {
  Query: {
    messages: () => prisma.messages(),
  },
  Mutation: {
    sendMessage: async (_, { text }) => {
      console.log(TOKEN);
      const { data } = await axios.post(
        "https://exp.host/--/api/v2/push/send",
        {
          to: TOKEN,
          title: "NEW message!",
          body: text,
          badge: 1,
        }
      );
      return prisma.createMessage({
        text,
      });
    },
  },
  Subscription: {
    newMessage: {
      subscribe: () => prisma.$subscribe.message().node(),
      resolve: (payload) => payload,
    },
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on http://localhost:4000"));
