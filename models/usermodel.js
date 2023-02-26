import mongoose from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const Schema = mongoose.Schema

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        index: true
    },
    accountNumber: String,
    phone: {
        type: String,
        unique: true,
        index: true,

    },
    phoneVerfied: {
        type: Boolean,
        default: false
    },
    password: String,
    otpToken: String,
    emailVerified: {
        type: Boolean,
        default: false
    },
    canResetPassword: {
        type: Boolean,
        default: false
    },
    accountType: {
        type: String,
        default: 'Consumer',
        enum: ['Driver', 'Consumer']
    },
    accountStatus: {
        type: String,
        default: 'active',
        status: ['active', 'suspended']
    },
    accountBalance: {
        type: Number,
        default: 0
    },
    cards: [{
        type: Schema.Types.ObjectId,
        ref: 'Card'
    }],
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: 'transactions'
    }],
    route: String,
    licence: String,
    car_type: String,
    park: String,
    location: String,
    route_from: String,
    route_to: String,
    state: String,
    lga: String

}, { timestamps: true })

userSchema.plugin(mongooseUniqueValidator, {
    message: 'Error, {VALUE} already exists.'
});

userSchema.methods.isEmailVerified = async function () {
    return this.emailVerified
}

const User = mongoose.model("User", userSchema);

export default User;

