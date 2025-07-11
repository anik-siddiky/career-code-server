const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@codesbynik.lieljty.mongodb.net/?retryWrites=true&w=majority&appName=codesbynik`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const jobsCollection = client.db('careerCode').collection('jobs');
        const applicationsCollection = client.db('careerCode').collection('applications');

        // Jobs API
        app.get('/jobs', async (req, res) => {
            const cursor = jobsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollection.findOne(query);
            res.send(result);
        });


        // Job applications related APIs

        app.get('/applications', async (req, res) => {
            const email = req.query.email;
            const query = { applicant: email };
            const result = await applicationsCollection.find(query).toArray();

            // Bad way to aggregate data
            for (const application of result) {
                const jobId = application.jobId;
                const jobQuery = { _id: new ObjectId(jobId) }
                const job = await jobsCollection.findOne(jobQuery);
                application.company = job.company
                application.title = job.title
                application.company_logo = job.company_logo
            }

            res.send(result);
        })

        app.post('/applications', async (req, res) => {
            const application = req.body;
            const result = await applicationsCollection.insertOne(application);
            res.send(result);
        })



        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Career Code Testing Bro');
});

app.listen(port, () => {
    console.log(`Career code server is running on port ${port}`);
});