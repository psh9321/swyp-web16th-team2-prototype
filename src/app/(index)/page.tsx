"use client"

import { useEffect, useRef } from "react";
import { useGeolocationHook } from "@/hooks/useGeolocationHook";
import { AddAddressBox } from "@/components/AddAddressBox";
import seoulBoundary from "@/data/seoul-boundary.json";
import { API_CLIENT_ADDRESS_SEARCH } from "@/entities/address/api/api.client.address";

const DEFAULT_MIN_ZOOM_LEVEL = 3;
const DEFAULT_MAX_ZOOM_LEVEL = 12;
const DEFAULT_INITIAL_ZOOM_LEVEL = 3;

export default function Home() {
  const { isLoad, nx, ny } = useGeolocationHook();
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoad) return;

    // API_CLIENT_ADDRESS_SEARCH("영등포")
    // .then(rs => {
    //   console.log("rs", rs)
    // })

    // console.log(nx, ny)

    let disposed = false;
    let initialized = false;
    let marker: kakao.maps.Marker | undefined;
    let mask: kakao.maps.Polygon | undefined;

    const renderMap = () => {
      const maps = window.kakao?.maps;
      const mapElement = mapRef.current;
      if (!maps || !mapElement || initialized) return;
      initialized = true;

      maps.load(() => {
        if (disposed) return;

        const center = new maps.LatLng(ny, nx);
        const map = new maps.Map(mapElement, {
          center,
          level: DEFAULT_INITIAL_ZOOM_LEVEL,
          minLevel: DEFAULT_MIN_ZOOM_LEVEL,
          maxLevel: DEFAULT_MAX_ZOOM_LEVEL,
        });

        // Leave Seoul transparent inside a mask covering the Korean map area.
        const outerPath = [
          new maps.LatLng(20, 110),
          new maps.LatLng(50, 110),
          new maps.LatLng(50, 150),
          new maps.LatLng(20, 150),
        ];
        const seoulPath = seoulBoundary.map(([lng, lat]) => new maps.LatLng(lat, lng));
        mask = new maps.Polygon({
          path: [outerPath, seoulPath],
          strokeWeight: 0,
          strokeOpacity: 0,
          fillColor: "#64748b",
          fillOpacity: 0.55,
        });
        mask.setMap(map);

        marker = new maps.Marker({ position: center });
        marker.setMap(map);
      });
    };

    window.addEventListener("kakao-maps-ready", renderMap);
    renderMap();

    return () => {
      disposed = true;
      window.removeEventListener("kakao-maps-ready", renderMap);
      marker?.setMap(null);
      mask?.setMap(null);
    };
  }, [isLoad, nx, ny]);

  return (
    <div className="flex justify-center items-center w-dvw h-dvh">
      <AddAddressBox/>
      <div className="w-[80dvw] h-[80dvh]" ref={mapRef} />
    </div>
  );
}
