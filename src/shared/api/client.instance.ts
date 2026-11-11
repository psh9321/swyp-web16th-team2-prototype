"use client"

import ky from "ky"

export const CLIENT_API = ky.create({
    prefix : "/api",
    credentials : "include",
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