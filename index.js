const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cnnr8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);

async function run() {
    try {
        await client.connect();
        // console.log('database connect successfully');
        const database = client.db("touristTravel");
        const serviceCollection = database.collection("services");
        const bookingCollection = database.collection("bookings");
        const usersCollection = database.collection("users");

        //SERVICE DATA SHOW
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        //BOOKING COLLECTION
        app.post('/bookings', async (req, res) => {
            //ei comment diye dekha databackend e aise kina
            // const appointment = req.body;
            // console.log(appointment);
            // res.json({message:'hello'})

            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            // console.log(result);
            res.json(result)
        })
        //GET BOOKING SPECIFIC USER DATA
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const date = req.query.date;
            // console.log(date);
            const query = { email: email, date: date }
            const cursor = bookingCollection.find(query);
            const bookings = await cursor.toArray();
            res.json(bookings);
        })
        //ALL BOOKING SHOW
        app.get('/allBookings', async (req, res) => {
            const cursor = bookingCollection.find({});
            const bookings = await cursor.toArray();
            res.json(bookings);
        });
        //UPDATE BOOKING DATA
        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    status: "Booked"
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })
        //DELETE BOOKING DATA
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id:ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.json(result);
        })
        //USER INFO POST TO THE DATABASE
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result)
        })
        //USER PUT FOR GOOGLE SIGN IN METHOD(upsert)
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        //MAKE ADMIN OR NORMAL USERS
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        //DIFFERENTIATE ADMIN CAN ONLY ADD ADMIN
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            // console.log(email);
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            console.log(user);
            let isAdmin = false;
            if (user) {
                if (user.role === 'admin') {
                    isAdmin = true;
                }
                res.json({ admin: isAdmin });
            }
            else {
                res.json({ admin: isAdmin });
            }
            // res.json('dd');
        })



    } finally {
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('i am from tourist travel server');
})

app.listen(port, () => {
    console.log('running server on port', port);
})