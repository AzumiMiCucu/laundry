"use client";

import { create } from "zustand";

/**
 * Draft state for the multi-step new-order form. Persists across steps
 * within the /order/new flow.
 */
export const useOrderStore = create((set) => ({
  step: 1,
  service: null, // full service object
  estimatedWeight: "",
  photos: [], // [{url, delete_url, thumb}]
  pickupAddress: "",
  pickupDatetime: "",
  specialNotes: "",

  setStep: (step) => set({ step }),
  next: () => set((s) => ({ step: Math.min(4, s.step + 1) })),
  prev: () => set((s) => ({ step: Math.max(1, s.step - 1) })),

  setService: (service) => set({ service }),
  setEstimatedWeight: (estimatedWeight) => set({ estimatedWeight }),
  setPhotos: (photos) => set({ photos }),
  addPhoto: (photo) => set((s) => ({ photos: [...s.photos, photo] })),
  removePhoto: (url) =>
    set((s) => ({ photos: s.photos.filter((p) => p.url !== url) })),
  setPickup: ({ pickupAddress, pickupDatetime, specialNotes }) =>
    set((s) => ({
      pickupAddress: pickupAddress ?? s.pickupAddress,
      pickupDatetime: pickupDatetime ?? s.pickupDatetime,
      specialNotes: specialNotes ?? s.specialNotes,
    })),

  reset: () =>
    set({
      step: 1,
      service: null,
      estimatedWeight: "",
      photos: [],
      pickupAddress: "",
      pickupDatetime: "",
      specialNotes: "",
    }),
}));
