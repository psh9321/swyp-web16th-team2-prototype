"use client"

import { useAddressStore } from "@/store/useAddressStore";
import { useEffect } from "react";
import { useShallow } from "zustand/shallow";


const AddressItem = ({ address } : { address : string }) => {

    const { FindAddressData, DeleteAddressData } = useAddressStore(useShallow(state => ({
        FindAddressData : state.FindAddressData,
        DeleteAddressData : state.DeleteAddressData
    })));

    function OnClickDeleteAddress() {
        if(!FindAddressData(address)) return alert(`알수 없는 오류 ${address}`);
        DeleteAddressData(address);
    }

    return (
        <li className="relative max-w-full break-words rounded-[10px] border p-[10px]">
            {address}
            <button onClick={OnClickDeleteAddress} className="absolute top-[-5px] right-[-5px] flex justify-center items-center size-[15px] rounded-[100%] text-[#fff] text-[0.7rem] bg-[#000]">X</button>
        </li>            
    )
}

export const AddressList = () => {
    const addressData = useAddressStore(state => state.addressData);

    return (
        <ul className="mb-2 flex flex-wrap gap-2">
            {addressData.map((address) => <AddressItem key={`입력한주소-${address}`} address={address} />)}
        </ul>
    );
};
