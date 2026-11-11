declare global {
    interface KAKAO_RESPONSE_MODEL<META, DOCUMENTS> {
        meta : META,
        documents : DOCUMENTS
    }
}

export {}