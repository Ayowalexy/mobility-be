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
    password: String,
    otpToken: String,
    emailVerified: {
        type: Boolean,
        default: false
    },
    canResetPassword: {
        type: Boolean,
        default: false
    }

}, { timestamps: true})

userSchema.plugin(mongooseUniqueValidator, {
    message: 'Error, {VALUE} already exists.'
});

userSchema.methods.isEmailVerified = async function() {
    return this.emailVerified
}

const User = mongoose.model("User", userSchema);

export default User;

