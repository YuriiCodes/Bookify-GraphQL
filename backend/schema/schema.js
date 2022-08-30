import graphql, {GraphQLError} from "graphql";
import _ from "lodash";
import Book from "../models/book.js";
import Author from "../models/author.js";


const {GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull} = graphql;


// mocked data
// let books = [
//     {name: "Name of the Wind", genre: "Fantasy", id: "1", authorId: "1"},
//     {name: "The Final Empire", genre: "Fantasy", id: "2", authorId: "2"},
//     {name: "The Hero of Ages", genre: "Fantasy", id: "4", authorId: "2"},
//     {name: "The Long Earth", genre: "Sci-Fi", id: "3", authorId: "3"},
//     {name: "The Colour of Magic", genre: "Fantasy", id: "5", authorId: "3"},
//     {name: "The Light Fantastic", genre: "Fantasy", id: "6", authorId: "3"},
// ];
//
// let authors = [
//     {name: "Patrick Rothfuss", age: 44, id: "1"},
//     {name: "Brandon Sanderson", age: 42, id: "2"},
//     {name: "Terry Pratchett", age: 66, id: "3"}
// ];

const BookType = new GraphQLObjectType({
    name: "Book",
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        genre: ({type: GraphQLString}),

        // Now, when user queries book info, he can also get info about the author back.
        author: {
            type: AuthorType,
            // Here in arguments, parent is book object, for example. We can then use the authorID field to get author info.
            // { name: "The long Earth", genre: "Sci-FI", id: "2", authorId: "3" }
            async resolve(parent, args) {
                // return authors.find(author => author.id === parent.authorId)
                try {
                    return await Author.findById(parent.authorId)
                } catch (err) {
                    return new GraphQLError(err);
                }
            }
        }
    })
});

const AuthorType = new GraphQLObjectType({
    name: "Author",
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        age: ({type: GraphQLInt}),
        books: {
            // One author can have more than one book, so that's why we use a list of BookType, and not just BookType.
            type: new GraphQLList(BookType),
            async resolve(parent, args) {
                // return books.filter(book => book.authorId === parent.id)
                try {
                    return await Book.find({});
                } catch (err) {
                    return new GraphQLError(err);
                }
            }
        }
    })
});

// RootQuery is a query that defines how we initially jump into the graph.
const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        book: {
            type: BookType,
            args: {id: {type: GraphQLID}},
            async resolve(parent, args) {
                // code to get data from db
                try {
                    return await Book.findById(args.id)
                } catch (err) {
                    return new GraphQLError(err);
                }

            }
        },
        author: {
            type: AuthorType,
            args: {id: {type: GraphQLID}},
            async resolve(parent, args) {
                // code to get data from db
                // return authors.find(author => author.id === args.id);
                try {
                    return await Author.findById(args.id);
                } catch (err) {
                    return new GraphQLError(err);
                }
            }
        },
        // New query to get all the books available in DB, returns a list of BookType
        books: {
            type: GraphQLList(BookType),
            async resolve(parent, args) {
                // return books
                try {
                    return await Book.find({});
                } catch (err) {
                    return new GraphQLError(err);
                }
            }
        },
        // New query to get all the authors available in DB, returns a list of AuthorType
        authors: {
            type: GraphQLList(AuthorType),
            async resolve(parent, args) {
                // return authors
                try {
                    return await Author.find({});
                } catch (err) {
                    return new GraphQLError(err);
                }
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addAuthor: {
            type: AuthorType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)}
            },
            async resolve(parent, args) {
                let authorTmp = new Author({
                    name: args.name,
                    age: args.age
                });
                // saving to the database is async, and something can go wrong, so we wrap it into try catch and make it async
                try {
                    return await authorTmp.save();
                } catch (err) {
                    return new GraphQLError(err);
                }
            }
        },
        addBook: {
            type: BookType,
            args: {
                name: {type: new GraphQLNonNull(GraphQLString)},
                genre: {type: new GraphQLNonNull(GraphQLString)},
                authorId: {type: new GraphQLNonNull(GraphQLID)}
            },
            async resolve(parent, args) {
                let bookTmp = new Book({
                    name: args.name,
                    genre: args.genre,
                    authorId: args.authorId
                });
                try {
                    return await bookTmp.save();
                } catch (err) {
                    return new GraphQLError(err);
                }
            }
        }
    }
})

export default new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});