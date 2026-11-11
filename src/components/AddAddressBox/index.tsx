"use client"

import { InputBox } from "./InputBox";
import { AddressList } from "./AddressList";

export const AddAddressBox = () => {

    return (
        <div className="absolute top-[50px] right-[50px] w-[350px] p-[15px] bg-[#fff] border rounded-[10px] z-[999]">
            <AddressList/>
            <InputBox/>
        </div>
    )
}
