import mongoose from "mongoose";
import { config } from "dotenv";

config()

const password  = encodeURIComponent(process.env.ATLAS_PASSWORD)
const db = "VideoConference"
const uri = `mongodb+srv://arpana036:${password}@apex.2k0me.mongodb.net/${db}?appName=apex`;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch(err) {
    console.log(err);
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
  }
}
export default run