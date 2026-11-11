"use client"

import Script from "next/script"

export const KakaoMapInitializer = () => {
    return (
        <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY}&autoload=false&libraries=services,clusterer`}
        strategy="afterInteractive"
        onReady={() => {
            window.dispatchEvent(new Event("kakao-maps-ready"));
        }}
        />
    )
}
