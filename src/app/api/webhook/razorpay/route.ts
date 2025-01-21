import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);

        await connectToDB();

        if (event.event === "payment.captured") {
            const payment = event.payload.payment.entity;

            const order = await Order.findOneAndUpdate(
                { razorpayOrderId: payment.razorpay_order_id },
                { 
                    razorpayPaymentId: payment.razorpay_payment_id, status: "completed" 
                },
                { new: true }
            ).populate([
                {
                    path: "productId",
                    select: "name",
                },
                {
                    path: "userId",
                    select: "email",
                }
            ])

            if (order) {
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    port: 587,
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASSWORD
                    }
                })

                await transporter.sendMail({
                    from: process.env.EMAIL,
                    to: order.userId.email,
                    subject: "Order placed",
                    html: `
                        <h1>Order placed</h1>
                        <p>Order ID: ${order._id}</p>
                        <p>Product: ${order.productId.name}</p>
                    `
                })
            }
        }

        return NextResponse.json({ message: "Success" }, { status: 200 });
    } catch (error) {
        console.error("Error processing Razorpay webhook:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}