import { create } from "zustand";
import { persist } from "zustand/middleware";

// ------------------- Interfaces -------------------
export interface Step1 {
  _id?: string;
  name: string;              // Patient Name
  department: string;        // ESM Name
  relationship: string;      // Relationship with ESM
  serviceId: string;         // Card No.
  date: string;              // DOB
  category?: string;         // category
  serviceIdPhoto?: File | null;
  file?: File | null;
}

export interface Step1_Temporary {
  _id?: string;
  name: string;              // Patient Name
  esmName: string;           // ESM Name
  relationship: string;      // Relationship with ESM
  serviceId: string;         // Service No.
  temporaryId: string;       // Temporary Slip No.
  category: string;          // category
  date: string;              // DOB
  validUpto: string;         // Valid Upto
  file?: File | null;
  oicStamp: boolean;         // OIC Stamp
}

export interface Step2 {
  _id?: string;
  aadhaarNumber: string;
  nameOnCard: string;
  gender?: string;
  dob: string;
  file?: File | null;        // Aadhaar scan
  photo?: File | null;       // Passport-size photo
}

export interface Step3 {
  _id?: string;
  cardNo: string;
  serviceNo: string;
  patientName: string;
  category: string;
  doi: string;
  noOfSessionsAllowed: string;
  patientType: string;
  pdSec: string;
  contactNo: string;
  age: string;
  gender: string;
  validityUpto: string;
  referralNo: string;
  claimId: string;
  notes: string;
  date: string;
  file?: File | null;
  photo?: File | null;
  admission?: string;
  consultationFor?: string;
  esmName: string;
  relationshipWithESM: string;
  investigation: string;
}
export interface Step4 {
  _id?: string;
  cardNo: string;
  serviceNo: string;
  patientName: string;
  category: string;
  doi: string;
  noOfSessionsAllowed: string;
  patientType: string;
  pdSec: string;
  contactNo: string;
  age: string;
  gender: string;
  validityUpto: string;
  referralNo: string;
  claimId: string;
  notes: string;
  date: string;
  file?: File | null;
  photo?: File | null;
  admission?: string;
  consultationFor?: string;
  esmName: string;
  relationshipWithESM: string;
  investigation: string;
}

export interface FormDataAll {
  step1: Step1;
  step1Temporary: Step1_Temporary;
  step2: Step2;
  step3: Step3;
  step4: Step4;
}

export interface FormStoreState {
  data: FormDataAll;
  updateStep1: (patch: Partial<Step1>) => void;
  updateStep1Temporary: (patch: Partial<Step1_Temporary>) => void;
  updateStep2: (patch: Partial<Step2>) => void;
  updateStep3: (patch: Partial<Step3>) => void;
  updateStep4: (patch: Partial<Step4>) => void;
  reset: () => void;
}

// ------------------- Initial State -------------------
const initialData: FormDataAll = {
  step1: {
    _id: "",
    name: "",
    department: "",
    relationship: "",
    serviceId: "",
    date: "",
    category: undefined,
    serviceIdPhoto: null,
    file: null,
  },
  step1Temporary: {
    _id: "",
    name: "",
    esmName: "",
    relationship: "",
    serviceId: "",
    temporaryId: "",
    category: "",
    date: "",
    validUpto: "",
    file: null,
    oicStamp: false,
  },
  step2: {
    _id: "",
    aadhaarNumber: "",
    nameOnCard: "",
    gender: "",
    dob: "",
    file: null,
    photo: null,
  },
  step3: {
    _id: "",
    cardNo: "",
    serviceNo: "",
    patientName: "",
    category: "",
    doi: "",
    noOfSessionsAllowed: "",
    patientType: "",
    pdSec: "",
    contactNo: "",
    age: "",
    gender: "",
    validityUpto: "",
    referralNo: "",
    claimId: "",
    notes: "",
    date: "",
    file: null,
    photo: null,
    admission: "",
    consultationFor: "",
    esmName: "",
    relationshipWithESM: "",
    investigation: "",
  },
  step4: {
    _id: "",
    cardNo: "",
    serviceNo: "",
    patientName: "",
    category: "",
    doi: "",
    noOfSessionsAllowed: "",
    patientType: "",
    pdSec: "",
    contactNo: "",
    age: "",
    gender: "",
    validityUpto: "",
    referralNo: "",
    claimId: "",
    notes: "",
    date: "",
    file: null,
    photo: null,
    admission: "",
    consultationFor: "",
    esmName: "",
    relationshipWithESM: "",
    investigation: "",
  },
};

// ------------------- Store -------------------
export const useFormStore = create<FormStoreState>()(
  persist(
    (set) => ({
      data: structuredClone(initialData),

      updateStep1: (patch) =>
        set((s) => ({
          data: { ...s.data, step1: { ...s.data.step1, ...patch } },
        })),

      updateStep1Temporary: (patch) =>
        set((s) => ({
          data: { ...s.data, step1Temporary: { ...s.data.step1Temporary, ...patch } },
        })),

      updateStep2: (patch) =>
        set((s) => ({
          data: { ...s.data, step2: { ...s.data.step2, ...patch } },
        })),

      updateStep3: (patch) =>
        set((s) => ({
          data: { ...s.data, step3: { ...s.data.step3, ...patch } },
        })),

        updateStep4: (patch) =>
          set((s) => ({
            data: { ...s.data, step4: { ...s.data.step4, ...patch } },
          })),

      reset: () => set({ data: structuredClone(initialData) }),
    }),
    {
      name: "form-store",
      partialize: (state) => ({
        // Avoid persisting non-serializable fields like File
        data: {
          ...state.data,
          step1: { ...state.data.step1, serviceIdPhoto: null, file: null },
          step1Temporary: { ...state.data.step1Temporary, file: null, oicStamp: false },
          step2: { ...state.data.step2, file: null, photo: null },
          step3: { ...state.data.step3, file: null, photo: null },
          step4: { ...state.data.step4, file: null, photo: null },
        },
      }),
      storage: {
        getItem: (name) =>
          typeof window !== "undefined"
            ? JSON.parse(window.sessionStorage.getItem(name) || "null")
            : null,
        setItem: (name, value) =>
          typeof window !== "undefined" &&
          window.sessionStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) =>
          typeof window !== "undefined" && window.sessionStorage.removeItem(name),
      },
    }
  )
);
