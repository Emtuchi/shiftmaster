import {NextRequest, NextResponse} from "next/server";
import { loginUser } from "@/lib/auth/auth.service";
import { setAuthCookie } from "@/lib/auth/auth.utils";

export async function POST(req: NextRequest) {
    try {
        const {email, password} = await req.json();

        if (!email || !password) {
            return NextResponse.json({message: "missing fields"}, {status: 400})
        };
   
        const {token, role} = await loginUser(email, password)

        const response = NextResponse.json(
            { message: "Login successful", role },
            { status: 200 }
        );

        setAuthCookie(response, token)

        return response
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        return NextResponse.json(
            { message: err.message || "Login failed" },
            { status: 401 }
        );
    }
}