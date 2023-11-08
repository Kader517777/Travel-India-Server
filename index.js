const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://kader2020:enu2zPQPCBnD8bO5@cluster0.m2hfneo.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db("travel_India");
        const Blogs = database.collection("Blogs");
        const wishlist = database.collection("wishlist");





        app.get('/allBlogs', async (req, res) => {
            const user = req.body;
            const result = await Blogs.find().toArray();
            res.send(result);
        });
        app.get('/wishlist', async (req, res) => {
            const user = req.query;
            const query = { email: user?.email };
            console.log(user);
            const result = await wishlist.find(query).toArray();
            res.send(result);
        });
        app.post('/addBlog', async (req, res) => {
            const user = req.body;
            const result = await Blogs.insertOne(user);
            res.send(result);
        });

        app.post('/wishlist', async (req, res) => {
            const user = req.body;
            const result = await wishlist.insertOne(user);
            res.send(result);
        });
        app.delete('/:id', async (req, res) => {
            const user = req?.params?.id;
            const query = { _id: new ObjectId(user) };
            const result = await wishlist.deleteOne(query);
            res.send(result);
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.listen(port, () => { console.log('port is:', port) });
