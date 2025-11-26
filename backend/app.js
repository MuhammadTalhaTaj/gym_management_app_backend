import express from "express"
import cors from "cors"

const app = express()
app.use(cors({
  origin: true, 
  credentials: true
}));

app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err); // log full error
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});


app.get('/', ()=>{
    console.log("server is working")
})

import {userRouter} from "./src/route/auth.route.js";
app.use('/auth',userRouter)

import { memberRouter } from "./src/route/member.route.js";
app.use('/member', memberRouter)

import { planRouter } from "./src/route/plan.route.js";
app.use('/plan',planRouter)

import { enquiryRouter } from "./src/route/enquiry.route.js";
app.use('/enquiry', enquiryRouter)

import { paymentRouter } from "./src/route/payment.route.js";
app.use('/payment',paymentRouter)

import { expenseRouter } from "./src/route/expense.route.js";
app.use('/expense',expenseRouter)

import { staffRouter } from "./src/route/staff.route.js";
app.use('/staff',staffRouter)
export default app