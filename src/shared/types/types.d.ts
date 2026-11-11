declare global {
    /** 부모 컴포넌트 */
    interface LAYOUT_CHILD {
        children?: React.ReactNode;
    }

    /** 현재 좌표 */
    interface COORDINATES {
        fromY : number
        fromX : number
        toY : number
        toX : number
    }
}

export {};
