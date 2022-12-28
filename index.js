const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

//middle wares
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://FaceFie:3vJue90Mh0yMLWYK@cluster0.d7ug9.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access found 1' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}
//3vJue90Mh0yMLWYK
//FaceFie


async function run(){
    try{
        const mediaCollection = client.db('FaceFie').collection('media');
        const comments = client.db('FaceFie').collection('comments');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token })
        })

        //add new media
        app.post('/', async (req, res) => {
            const media = req.body;
            const result = await mediaCollection.insertOne(media);
            res.send(result);
        })

        //get all media
        app.get('/all-media', async (req, res) => {
            const query = {};
            const cursor = mediaCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
         //see the media details
         app.get('/media/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await mediaCollection.findOne(query);
            res.send(result);
        })

        //add comments to database
        app.post('/comments', async (req, res) => {
            const comment = req.body;
            const result = await comments.insertOne(comment);
            res.send(result);
        })
        //show all comments
        app.get('/comments', verifyJWT, async (req, res) => {
            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access found' })
            }
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = comments.find(query).sort({ date: 'desc' });
            const result = await cursor.toArray();
            res.send(result);
        })
        //single service all review
        app.get('/comments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id };
            const cursor = comments.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(err =>console.error(err))

app.get('/', (req,res)=>{
    res.send('FaceFie server is up and running');
})

app.listen(port, ()=>{
    console.log(`server is ruuning at port ${port}`)
})