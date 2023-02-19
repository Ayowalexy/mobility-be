import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";
import connectDB from "./config/db.js";
import cors from "cors";
import passport from "passport";
import compression from "compression";
import authRoutes from './routes/authRoutes.js'
import session from "express-session";
import colors from 'colors'

const app = express();

dotenv.config();

connectDB();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const sessionConfig = {
    name: 'session',
    secret: 'session secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(express.json());
app.use(compression());
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(cors());
app.use(session(sessionConfig));
app.use(passport.initialize())
app.use(passport.session())

app.get('/', (req, res) => {
    res.status(200).json({message: 'Server connected', status: 'success'})
})

app.use('/api/v1/users', authRoutes)

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;


app.listen(PORT, console.log(
  `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
));

