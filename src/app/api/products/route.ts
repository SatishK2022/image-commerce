import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Product, { IProduct } from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectToDB();

        const products = await Product.find({}).lean();

        if (!products || products.length === 0) {
            return NextResponse.json({
                error: "No products found"
            }, { status: 404 });
        }

        return NextResponse.json(
            { products },
            { status: 200 }
        )
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session: { user?: { role?: string } } | null = await getServerSession(authOptions);

        if (!session || session?.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDB();

        const body: IProduct = await request.json();

        if (!body.name || !body.description || !body.imageUrl || body.variants.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newProduct = await Product.create(body);

        return NextResponse.json(
            { newProduct },
            { status: 201 }
        )
    } catch (error) {
        console.log("Error adding product:", error);
        return NextResponse.json({ error }, { status: 500 });
    }
}