declare global {
    interface API_CLIENT_ADDRESS_SEARCH_PARAMS {
        x : number,
        y : number
    }

    interface SEARCH_ADDRESS_META_ITEM {
        is_end: boolean,
        pageable_count: number,
        same_name: {
            keyword: string,
            region: [],
            selected_region: string
        },
        total_count: number
    }

    interface SEARCH_ADDRESS_ITEM {
        address_name: string,
        category_group_code: string,
        category_group_name: string,
        category_name: string,
        distance: string,
        id: string,
        phone: string,
        place_name: string,
        place_url: string,
        road_address_name: string,
        x: string,
        y: string
    }

    type API_SERVER_ADDRESS_SEARCH = KAKAO_RESPONSE_MODEL<SEARCH_ADDRESS_META_ITEM, SEARCH_ADDRESS_ITEM[]>;

    type API_CLIENT_ADDRESS_SEARCH = SEARCH_ADDRESS_ITEM[]
}

export {}