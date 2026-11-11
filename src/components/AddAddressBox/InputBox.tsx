"use client"

import { useRef } from "react";
import type { FormEvent } from "react";
import { useAddressStore } from "@/entities/address/store/useAddressStore";
import { useShallow } from "zustand/shallow";

export const InputBox = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { FindAddressData, AddAddressData } = useAddressStore(useShallow(state => ({
        FindAddressData : state.FindAddressData,
        AddAddressData : state.AddAddressData
    })));

    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const input = inputRef.current;
        if (!input) return;

        const address = input.value.trim();

        if (!address) {
            input.setCustomValidity("주소를 입력해 주세요.");
            input.reportValidity();
            return;
        }

        if (FindAddressData(address)) return alert("이미 등록된 주소 입니다.");


        AddAddressData(address);

        input.value = "";
        input.focus();
    }

    return (
        <form className="flex w-full min-h-[40px] gap-2" onSubmit={onSubmit}>
            <input
                ref={inputRef}
                type="text"
                aria-label="등록할 주소"
                placeholder="주소를 입력해 주세요"
                required
                onChange={(event) => event.currentTarget.setCustomValidity("")}
                className="min-w-0 flex-1 rounded border px-3 py-2 focus:outline-2 focus:outline-blue-500"
            />
            <button type="submit" className="shrink-0 rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50">
                등록
            </button>
        </form>
    );
};
