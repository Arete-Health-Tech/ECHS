import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Step1
{
  category: any;
  _id?: string; // Optional ID for the step, if needed
  name: string;              // Patient Name
  department: string;        // ESM Name
  relationship: string;      // Relationship with ESM
  serviceId: string;         // Card No.
  date: string;              // DOB
  serviceIdPhoto?: File | null;
  file?: File | null;
}
export interface Step1_Temporary
{
  _id?: string; // Optional ID for the step, if needed
  name: string;              // Patient Name
  esmName: string;        // ESM Name
  relationship: string;      // Relationship with ESM
  serviceId: string;         // service No.
  temporaryId: string;        // service No.
  category: string;         // category
  date: string;             // DOB
  validUpto: string;        // Valid Upto
  file?: File | null;
  oicStamp: boolean; // OIC Stamp
}

export interface Step2
{
  _id?: string; // Optional ID for the step, if needed
  aadhaarNumber: string;     // Aadhaar Number
  nameOnCard: string;        // Name as per Aadhaar
  gender?: string;
  dob: string;               // Date of Birth
  file?: File | null;        // Aadhaar card scan/photo
  photo?: File | null;       // Passport-size photo
}

export interface Step3
{
  _id?: string; // Optional ID for the step, if needed
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
  file?: File | null;  // document for step 3
  photo?: File | null; // photo for step 3
  admission?: string;
  consultationFor?: string; // Consultation For
  esmName: string; // ESM Name
  relationshipWithESM: string; // Relationship with ESM
  investigation: string; // Investigation
}

export interface FormDataAll {
  step1: Step1;
  step1Temporary: Step1_Temporary; // Optional for temporary slip
  step2: Step2;
  step3: Step3;
}

export interface FormStoreState {
  data: FormDataAll;
  updateStep1: ( patch: Partial<Step1> ) => void;
  updateStep1Temporary: ( patch: Partial<Step1_Temporary> ) => void;
  updateStep2: (patch: Partial<Step2>) => void;
  updateStep3: (patch: Partial<Step3>) => void;
  reset: () => void;
}

const initialData: FormDataAll = {
  step1: {
    _id: "",
    name: "",
    department: "",
    relationship: "",
    serviceId: "",
    date: "",
    serviceIdPhoto: null,
    file: null,
    category: undefined
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
    oicStamp: false
  },
  step2: { _id:"",gender:"",aadhaarNumber: "", nameOnCard: "", dob: "", file: null, photo: null },
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
}
}

export const useFormStore = create<FormStoreState>()(
  persist(
    (set) => ({
      data: initialData,
      updateStep1: ( patch ) => set( ( s ) => ( { data: { ...s.data, step1: { ...s.data.step1, ...patch } } } ) ),
      updateStep1Temporary: ( patch ) => set( ( s ) => ( { data: { ...s.data, step1Temporary: { ...s.data.step1Temporary, ...patch } } } ) ),
      updateStep2: (patch) => set((s) => ({ data: { ...s.data, step2: { ...s.data.step2, ...patch } } })),
      updateStep3: (patch) => set((s) => ({ data: { ...s.data, step3: { ...s.data.step3, ...patch } } })),
      reset: () => set({ data: initialData }),
    }),
    {
      name: "form-store",
      partialize: (state) => ({
        // Avoid persisting File objects which are not serializable
        data: {
          ...state.data,
          step1: { ...state.data.step1, serviceIdPhoto: null, file: null },
          step1Temporary: { ...state.data.step1Temporary, file: null, oicStamp: false },
          step2: { ...state.data.step2, file: null, photo: null },
          step3: { ...state.data.step3, file: null, photo: null },
        },
      }),
      storage: {
        getItem: (name) => {
          const value = window.sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => window.sessionStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => window.sessionStorage.removeItem(name),
      },
    }
  )
);
