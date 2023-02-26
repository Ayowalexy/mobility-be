import mongoose from "mongoose";

const Schema = mongoose.Schema

const cardSchema = new Schema({
    cards: {
        type: Object,
    }
}, { timestamps: true });

const Card = mongoose.model("Card", cardSchema);

export default Card;