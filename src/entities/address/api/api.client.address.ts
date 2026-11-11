import { CLIENT_API } from "@/shared/api/client.instance";

export async function API_CLIENT_ADDRESS_SEARCH(params : string) {
    try {
        const result = await CLIENT_API.post("address", {
            json : params
        })
        .json<API_CLIENT_ADDRESS_SEARCH>();

        return result
    }
    catch(err) { 
        console.log(err);
        throw err;
    }
}