import express from "express";
import mongoose from 'mongoose';
import {graphqlHTTP} from "express-graphql";
import schema from "./schema/schema.js";
import 'dotenv/config'
import cors from "cors"
const app = express();
const PORT = 4000;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors())

// Add  GraphQL middleware to a unique GraphQL endpoint
app.use("/graphql", graphqlHTTP({
    schema: schema,
    graphiql: true
}))

// Start an app
app.listen(PORT, async () => {
    console.log(`Server has started on port: ${PORT}`);

    await mongoose.connect(MONGO_URL);
    console.log(`Connected to the database succesfully!`)
});