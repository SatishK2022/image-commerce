import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
})

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions) as { user?: { id: string } } | null;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId, variant } = await request.json();

        if (!productId || !variant) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDB();

        // Create razorpay order
        const order = await razorpay.orders.create({
            amount: Math.round(variant.price * 100),
            currency: "INR",
            receipt: `receipt-${Date.now()}`,
            notes: {
                productId: productId.toString(),
            }
        })

        const newOrder = await Order.create({
            userId: session.user?.id ?? "",
            productId,
            variant,
            razorpayOrderId: order.id,
            status: "pending",
            amount: Math.round(variant.price * 100)
        })

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            dbOrderId: newOrder._id,
            message: "Order created successfully"
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}