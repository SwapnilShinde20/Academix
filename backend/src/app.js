import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express()

app.use(cors({
    origin: ["https://academix-ruby.vercel.app", "http://localhost:5173","http://localhost:5174"],
    credentials:true
}));

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())
app.set("trust proxy",1);

import teacherRouter from "./routes/teacher.routes.js";
import studentRouter from "./routes/student.routes.js";
import classroomRouter from "./routes/classroom.routes.js";
import { errorHandler } from "./middlewares/errorHandling.middleware.js";


app.use("/api/faculty", teacherRouter)
app.use("/api/student", studentRouter)
app.use("/api/class", classroomRouter)

app.use(errorHandler);

export { app }