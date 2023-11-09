const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors({
    origin: [
        'https://travel-india-8e5eb.web.app',
        'https://travel-india-8e5eb.firebaseapp.com'
    ],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser())


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

// custom omidlewere
const twtVerify = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(402).send({ success: 'unathorized 401' });
    }
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            return res.status(401).send({ success: 'unathorized 401' });
        }
        req.user = decoded;
        next();
    })

}



async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const database = client.db("travel_India");
        const Blogs = database.collection("Blogs");
        const wishlist = database.collection("wishlist");
        const comments = database.collection("comments");





        app.get('/allBlogs', async (req, res) => {
            const jwtUser = req.user;
            const result = await Blogs.find().toArray();
            res.send(result);
        });
        app.get('/allBlogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await Blogs.find(query).toArray();
            res.send(result);
        });
        app.get('/wishlist', async (req, res) => {
            const userFromToken = req.user;
            const user = req.query;
            const query = { email: user?.email };
            const result = await wishlist.find(query).toArray();
            res.send(result);
        });
        // it's blog comment
        app.get('/comment/:id', async (req, res) => {
            const blogId = req.params.id;
            const query = { blog_id: blogId };
            const result = await comments.find(query).toArray();
            res.send(result);
        });
        app.post('/addBlog', async (req, res) => {
            const user = req.body;
            const result = await Blogs.insertOne(user);
            res.send(result);
        });
        app.post('/comment', async (req, res) => {
            const user = req.body;
            const result = await comments.insertOne(user);
            res.send(result);
        });

        app.post('/wishlist/:id', async (req, res) => {
            const id = req.params.id;
            const { currentTime, currentDay, title, imgUrl, category, shortDescription, LongDescription, email } = req.body;
            const user = { _id: id, currentTime, currentDay, title, imgUrl, category, shortDescription, LongDescription, email }
            const result = await wishlist.insertOne(user);
            res.send(result);
        });
        app.delete('/:id', async (req, res) => {
            const id = req?.params?.id;
            const query = { _id: id };
            const result = await wishlist.deleteOne(query);
            res.send(result);
        });
        app.put('/update/:id', async (req, res) => {
            const blog = req.body;
            const { title, imgUrl, category, shortDescription, LongDescription } = blog;
            const id = req.params.id;
            const _id = id.id;
            const filter = { _id: new ObjectId(_id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    title: title,
                    imgUrl: imgUrl,
                    category: category,
                    shortDescription: shortDescription,
                    LongDescription: LongDescription,
                }
            };


            const result = await Blogs.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        // token
        app.post('/jwt', async (req, res) => {
            user = req.body;
            // const user = { email: "car@doc.com" }
            const token = await jwt.sign(user, 'secret', { expiresIn: '1h' })
            res
                .cookie('token', token,
                    {
                        httpOnly: true,
                        secure: false,
                        sameSite: true,
                    },
                )
                .send({ success: true })
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch();





app.listen(port, () => { console.log('port is:', port) });
