import { NextRequest, NextResponse } from 'next/server'

export async function POST(req : NextRequest) {
    try {

        const {} = await req.json();

        return NextResponse.json({ status : 200 });
    }
    catch(err) {
        console.log(err)
        return NextResponse.json({status : 500});
    }
}