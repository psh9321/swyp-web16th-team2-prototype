import ky from "ky"

export const BACKEND_API = ky.create({
    method : "get",
    prefix : process.env.NEXT_KAKAO_API_BASE_URL as string,
    credentials : "include",
    headers : {
        Authorization : `KakaoAK ${process.env.KAKAO_API_KEY}` 
    },
    timeout : 10000,
    hooks : {
        beforeRequest : [
            async ({ request }) => {
                return request
            }
        ],
        beforeError : [
            async ({ error }) => {
                return error
            }
        ],

        afterResponse : [
            async ({ response }) => {
                return response
            }
        ]
    }
})