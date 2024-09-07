const express = require("express");
const cors = require("cors");
const port = 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5jhcp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

const client = new MongoClient(uri, {
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully");

    const dashboardCountCollection = client
      .db("taskify")
      .collection("dashboardCount");

    app.get("/dashboardCount", async (req, res) => {
      try {
        const result = await dashboardCountCollection.find().toArray();
        res.status(200).json({
          success: true,
          data: result,
          message: "Dashboard counts retrieved successfully",
        });
      } catch (error) {
        console.error("Error fetching dashboardCount:", error);
        res.status(500).json({
          success: false,
          error: "Failed to fetch dashboardCount",
          message: error.message,
        });
      }
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the process if the MongoDB connection fails
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
