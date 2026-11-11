import { API_SERVER_ADDRESS_SEARCH } from '@/entities/address/api/api.server.address';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req : NextRequest) {
    try {

        const query : string = await req.json();

        

        const result = await API_SERVER_ADDRESS_SEARCH(query);

        return NextResponse.json(result, { status : 200 });
    }
    catch(err) {
        console.log(err)
        return NextResponse.json({status : 500});
    }
}