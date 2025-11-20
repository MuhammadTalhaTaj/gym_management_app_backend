import dotenv from "dotenv"
dotenv.config(); 
import { connectDB } from "./src/config/connectDb.js";
import app from "./app.js";

async function startDb() {
  await connectDB()
  console.log("Connected to GymOps Database")
}

startDb()

app.listen(process.env.PORT, ()=>{
    console.log(`Server is listening at port ${process.env.PORT}`)
})