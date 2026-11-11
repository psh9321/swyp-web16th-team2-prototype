import { useEffect, useState } from "react"

export const useGeolocationHook = () => {

    const [ isLoad, SetIsLoad ] = useState<boolean>();

    /** 위도 (남 - 북) */
    const [ny, SetNy] = useState<number>(-1);

    /** 경도 (동 - 서) */
    const [nx, SetNx] = useState<number>(-1);

    async function GetCurrentPositionSuccess(pos : GeolocationPosition) {

        const { latitude, longitude } = pos.coords;

        SetNy(latitude);
        SetNx(longitude);

        SetIsLoad(true);
    }

    function GetCurrentPositionFail(err : GeolocationPositionError) {
        console.log(err.code, err.message)
    }

    useEffect(() => {
        if (!navigator.geolocation) {
            console.log("Geolocation 미지원");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            GetCurrentPositionSuccess,
            GetCurrentPositionFail,
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

    }, []);

    return { isLoad, nx, ny }
}