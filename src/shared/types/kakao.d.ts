declare global {
    interface Window {
        Kakao: {
            init: (key: string) => void;
            isInitialized: () => boolean;
            Share: {
                sendDefault: (params: unknown) => void;
            };
        };
        kakao: {
            maps: {
                load: (callback: () => void) => void;
                Polygon: new (options: kakao.maps.PolygonOptions) => kakao.maps.Polygon;
                LatLng: new (lat: number, lng: number) => kakao.maps.LatLng;
                Size: new (width: number, height: number) => kakao.maps.Size;
                Point: new (x: number, y: number) => kakao.maps.Point;
                MarkerImage: new (
                    src: string,
                    size: kakao.maps.Size,
                    options?: {
                        offset?: kakao.maps.Point;
                    }
                ) => kakao.maps.MarkerImage;
                Map: new (
                    container: HTMLElement,
                    options: {
                        center: kakao.maps.LatLng;
                        level: number;
                        disableDoubleClickZoom?: boolean;
                        minLevel?: number;
                        maxLevel?: number;
                    }
                ) => kakao.maps.Map;
                Marker: new (options: {
                    position: kakao.maps.LatLng;
                    image?: kakao.maps.MarkerImage;
                }) => kakao.maps.Marker;
                CustomOverlay: new (options: {
                    position: kakao.maps.LatLng;
                    content: HTMLElement | string;
                    yAnchor?: number;
                    xAnchor?: number;
                    zIndex?: number;
                }) => kakao.maps.CustomOverlay;
                event: {
                    addListener: (
                        target: kakao.maps.Map,
                        type: string,
                        handler: () => void
                    ) => void;
                };
            };
        };
    }

    namespace kakao.maps {
        interface PolygonOptions {
            path: LatLng[] | LatLng[][];
            strokeWeight?: number;
            strokeOpacity?: number;
            fillColor?: string;
            fillOpacity?: number;
        }
        class Polygon {
            constructor(options: PolygonOptions);
            setMap(map: Map | null): void;
        }
        class LatLng {
            constructor(lat: number, lng: number);
            getLat(): number;
            getLng(): number;
        }
        class Size {
            constructor(width: number, height: number);
        }
        class Point {
            constructor(x: number, y: number);
        }
        class MarkerImage {
            constructor(
                src: string,
                size: Size,
                options?: {
                    offset?: Point;
                }
            );
        }
        class LatLngBounds {
            getSouthWest(): LatLng;
            getNorthEast(): LatLng;
        }
        class Map {
            getBounds(): LatLngBounds;
            getLevel(): number;
            setLevel(level: number): void;
            setMinLevel(level: number): void;
            setMaxLevel(level: number): void;
            setDisableDoubleClickZoom(disable: boolean): void;
        }
        class Marker {
            constructor(options: {
                position: LatLng;
                image?: MarkerImage;
            });
            setMap(map: Map | null): void;
            setImage(image: MarkerImage): void;
        }
        class CustomOverlay {
            constructor(options: {
                position: LatLng;
                content: HTMLElement | string;
                yAnchor?: number;
                xAnchor?: number;
                zIndex?: number;
            });
            setMap(map: Map | null): void;
        }
    }
}

export {};
