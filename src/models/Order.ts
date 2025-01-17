import mongoose, { Schema, model, models } from "mongoose";
import { ImageVariant, ImageVariantType } from "./Product";

interface PopulatedUser {
    _id: mongoose.Types.ObjectId;
    email: string;
}

interface PopulatedProduct {
    _id: mongoose.Types.ObjectId;
    name: string;
    imageUrl: string;
}

export interface IOrder {
    _id?: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId | PopulatedUser;
    productId: mongoose.Types.ObjectId | PopulatedProduct;
    variant: ImageVariant;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    amount: number;
    status: "PENDING" | "SUCCESS" | "FAILED";
    downloadUrl?: string;
    previewUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const orderSchema = new Schema<IOrder>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    variant: {
        type: {
            type: String,
            required: true,
            enum: ["SQUARE", "WIDE", "PORTRAIT"] as ImageVariantType[],
            set: (value: string) => value.toUpperCase()
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        licence: {
            type: String,
            required: true,
            enum: ["PERSONAL", "COMMERCIAL"],
            set: (value: string) => value.toUpperCase()
        }
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["PENDING", "SUCCESS", "FAILED"],
        default: "PENDING",
        set: (value: string) => value.toUpperCase()
    },
    downloadUrl: {
        type: String
    },
    previewUrl: {
        type: String
    }
}, { timestamps: true, versionKey: false });

const Order = models?.Order || model<IOrder>("Order", orderSchema);
export default Order;