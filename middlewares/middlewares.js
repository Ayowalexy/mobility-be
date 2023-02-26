import User from "../models/usermodel.js";
import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'


const { verify } = jwt;


const protect = asyncHandler(async (req, res, next) => {
    let token

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1]

            const decoded = verify(token, process.env.SECRET)

            const user = await User.findById(decoded.id)
            if (user) {
                req.user = user
                next()
            } else {
                res.status(401)
                throw new Error('User does not exists')
            }
        } catch (error) {
            console.error(error)
            res.status(401)
            throw new Error('Not authorized, token failed')
        }
    }

    if (!token) {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})

const canVerifyPhone = asyncHandler(async (req, res, next) => {

    const user = await User.findOne({ phone: req.params?.phone })
    if ( user && user.emailVerified && user.phone && !user.phoneVerfied) {
        next();
        return
    } else {
        res.status(401)
        throw new Error('Cannot access this route')
    }
})

const canConfirmPhone = asyncHandler(async (req, res, next) => {

    const user = await User.findOne({ phone: req.body.phone })
    if ( user && user.emailVerified && user?.phone && !user.phoneVerfied) {
        next();
        return
    } else {
        res.status(401)
        throw new Error('Cannot access this route')
    }
})


export {
    protect,
    canVerifyPhone,
    canConfirmPhone
}