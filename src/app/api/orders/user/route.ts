import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {

    try {
        const session = await getServerSession(authOptions) as { user?: { id: string } } | null;

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();

        const orders = await Order.find({ userId: session.user?.id }).populate({
            path: "productId",
            select: "name imageUrl",
            options: { strictPopulate: false }
        })
        .sort({ createdAt: -1 })
        .lean();

        if (!orders || orders.length === 0) {
            return NextResponse.json({ error: "No orders found" }, { status: 404 });
        }

        return NextResponse.json({ orders }, { status: 200 });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}