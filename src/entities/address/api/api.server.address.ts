import { BACKEND_API } from "@/shared/api/server.instance";

export async function API_SERVER_ADDRESS_SEARCH(query : string) {
    try {
        const result = await BACKEND_API("search/keyword.json", {
            searchParams : {
                query
            }
        }).json<API_SERVER_ADDRESS_SEARCH>();

        return result?.["documents"]?.[0]??null
    }
    catch(err) { 
        console.log(err);
        throw err;
    }
}