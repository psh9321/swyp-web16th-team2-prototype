import { create } from 'zustand'

interface USE_ADDRESS_STORE {
    addressData : string[];
    AddAddressData : (address : string) => void;
    FindAddressData : (address : string) => boolean;
    DeleteAddressData : (address : string) => void;
}

export const useAddressStore = create<USE_ADDRESS_STORE>((set, get) => ({
    addressData : [],
    AddAddressData(address) {
      
      set(prev => ({
        addressData: [...prev.addressData, address],
      }));
    },
    FindAddressData(address) {
      const { addressData } = get();

      return addressData.some(
        el => address.trim().includes(el.trim())
      );
    },

    DeleteAddressData(address) {
      set(prev => ({
        addressData: prev.addressData.filter(item => item !== address),
      }));
    }

}))
