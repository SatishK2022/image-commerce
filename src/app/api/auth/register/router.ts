import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        await connectToDB();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            )
        }

        const newUser = await User.create({
            email,
            password,
            role: "user"
        });

        return NextResponse.json(
            { message: "User registered successfully" },
            { status: 201 }
        )
    } catch (error) {
        console.error("Error registering user: ", error);
        return NextResponse.json(
            { error: "Error registering user" },
            { status: 500 }
        )
    }
}