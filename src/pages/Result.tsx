import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import { Step1_Temporary, Step2, Step3, Step4, useFormStore, type FormDataAll } from "@/store/formStore";
import Image1 from "@/assets/Cooreecr.png";
import Image2 from "@/assets/Screenshot 2025-08-12 at 3.18.25 PM.png";
import Navbar from "@/components/comp/Navbar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface LocationState {
  data: FormDataAll;
  matched: boolean;
}

const Result = () => {
  const [selected, setSelected] = useState<"ECHS" | "Temporary Slip">("ECHS");
  const [loadingAgain, setLoadingAgain] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    step1: false,
    step1Temporary: false,
    step2: false,
    step3: false,
    step4: false,
  });
  const [loading, setLoading] = useState(false);
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [claimId, setClaimId] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string>("");
  const [approvals, setApprovals] = useState<Record<string, boolean>>({
    name: false,
    gender: false,
    age: false,
    surgery: false,
  });

  // ✅ include update actions from store
  const {
    data,
    updateStep1,
    updateStep1Temporary,
    updateStep2,
    updateStep3,
    updateStep4,
    reset,
  } = useFormStore();

  const [match, setMatch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [Matched, setMatched] = useState<boolean>(false);

  const toggleSection = (step: keyof FormDataAll) => {
    setExpanded((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  // ✅ fixed renderDetails to use update actions
  const renderDetails = (
    obj: Record<string, any> | undefined | null,
    step: keyof FormDataAll
  ) => {
    if (!obj)
      return <div className="text-sm text-gray-500">No data available.</div>;

    const updateField = (key: string, value: any) => {
      if (step === "step1") updateStep1({ [key]: value } as any);
      if (step === "step1Temporary")
        updateStep1Temporary({ [key]: value } as any);
      if (step === "step2") updateStep2({ [key]: value } as any);
      if (step === "step3") updateStep3({ [key]: value } as any);
      if (step === "step4") updateStep4({ [key]: value } as any);
    };


    return Object.entries(obj).map(([key, value]) => {
      if (["file", "photo", "_id"].includes(key)) return null;

      const displayValue =
        key === "medication" && Array.isArray(value)
          ? value.map((m: any) => `${m.name}, ${m.dosage}`).join(", ")
          : value ?? "";

      return (
        <div
          key={key}
          className="flex flex-col md:flex-row md:items-center justify-between border-b py-3 gap-2 text-sm"
        >
          <label className="font-medium capitalize text-xs md:text-sm md:w-1/3">
            {key === "date" ? "date" : key === "serviceNo" ? "Service No" : key === "esm" ? "ESM" : key === "patient_name" ? "Patient Name" : key === "dob" ? "DOB" : key === "dom" ? "DOM" : key === "nameOnCard" ? "Name on Aadhaar Card" : key === "patientName" ? "Name of Patient" : key === "pdSec" ? "Polyclinic Remarks" : key === "doi" ? "Date of Issue" : key === "noOfSessionsAllowed" ? "No of Sessions Allowed" : key === "patientType" ? "Patient Type" : key === "contactNo" ? "ESM Contact Number" : key === "validityUpto" ? "Valid Upto" : key === "valid_upto" ? "Valid Upto" : key === "relationship_with_esm" ? "Relationship With Esm" : key === "registration_no" ? "Registration No" : key === "category_of_ward" ? "Category of Ward" : key === "form_no" ? "Form No" : key === "referralNo" ? "Referral No" : key === "referredTo" ? "Referred To" : key === "relationshipWithESM" ? "Relationship with ESM" : key === "claimId" ? "Claim ID" : key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
          </label>

          <input
            type={
              key.toLowerCase().includes("date") || key === "dob" || key === "dom"
                ? "date"
                : "text"
            }
            value={displayValue}
            onChange={(e) => updateField(key, e.target.value)}
            className="flex-1 border rounded-md px-2 py-1 text-xs md:text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />

        </div>
      );
    });
  };

  // Helper: calculate age from DOB
  function calculateAge(dob: string): number {
    if (!dob) return NaN;
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
  const toggleApproval = (field: string) => {
    setApprovals((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };


  // Comparisons
  const comparisons = useMemo(() => {
    if (!data) return null;

    //Name for prescription 


    const step1Name = data.step1?.name || data.step1Temporary?.patient_name;
    const step2Name = data.step2?.nameOnCard;
    const step3Name = data.step3?.patientName;
    const step4Name = data.step4?.patientName;

    // const step4Surgery = data.step4?.surgeryName;


    // const step1Gender =
    //   data.step1?.category || data.step1Temporary?.category || "";
    const step2Gender = data.step2?.gender || "";
    const step3Gender = data.step3?.gender || "";
    const step4Gender = data.step4?.gender || "";

    // const step1Age = data.step1?.dob
    //   ? calculateAge(data.step1.dob)
    //   : data.step1Temporary?.date
    //     ? calculateAge(data.step1Temporary.date)
    //     : undefined;

    const step1Age = data.step1Temporary?.dob
      ? calculateAge(data.step1Temporary.dob)
      : undefined;

    const step2Age = data.step2?.dob ? calculateAge(data.step2.dob) : undefined;
    const step3Age = data.step3?.age ? Number(data.step3.age) : undefined;
    const step4Age = data.step4?.age?.match(/\d+/)?.[0] ?? "";

    const step1Surgery = "";
    const step2Surgery = "";
    const step3Surgery = data.step3?.admission || "";
    const step4Surgery = data.step4.advice || "";

    const isNameMatched = (() => {
      const names = [step1Name, step3Name, step4Name]
        .filter((n) => n !== undefined && n !== null && n.trim() !== "")
        .map((n) => n.trim().toLowerCase());

      if (names.length === 0) return false; // both empty
      if (names.length === 1) return true;  // only one filled → nothing to compare

      return names.every((n) => n === names[0]);
    })();


    setMatch(Boolean(isNameMatched));

    // const isGenderMatched =
    //   step1Gender &&
    //   step2Gender &&
    //   step3Gender &&
    //   step1Gender.trim().toLowerCase() === step2Gender.trim().toLowerCase() &&
    //   step1Gender.trim().toLowerCase() === step3Gender.trim().toLowerCase();
    const isGenderMatched = (() => {
      // helper to normalize gender values
      const normalize = (g: string) => {
        const val = g.trim().toLowerCase();
        if (val === "m" || val === "male") return "male";
        if (val === "f" || val === "female") return "female";
        return val; // fallback in case of unexpected values
      };

      const genders = [step2Gender, step3Gender, step4Gender]
        .filter(Boolean)
        .map(normalize);

      if (genders.length === 0) return false; // nothing provided → false
      if (genders.length === 1) return true;  // only one → true
      return genders.every((g) => g === genders[0]); // all must match after normalization
    })();


    // const isAgeMatched =
    //   step1Age !== undefined &&
    //   // step2Age !== undefined &&
    //   step3Age !== undefined &&
    //   // Math.floor(Number(step1Age)) === Math.floor(Number(step2Age)) &&
    //   Math.floor(Number(step1Age)) === Math.floor(Number(step3Age));
    const isAgeMatched = (() => {
      const ages = [step3Age, step4Age].filter(
        (a) => a !== undefined && a !== null && String(a).trim() !== ""
      );

      if (ages.length === 0) return false; // both empty
      if (ages.length === 1) return true;  // only one filled → nothing to compare

      return Math.floor(Number(step4Age)) === Math.floor(Number(step3Age));
    })();


    // const isSurgeryMatched = step3Surgery && step4Surgery && step3Surgery.trim().toLowerCase() === step4Surgery.trim().toLowerCase();
    const isSurgeryMatched = (() => {
      const s3 = step3Surgery?.trim().toLowerCase() || "";
      const s4 = step4Surgery?.trim().toLowerCase() || "";

      if (!s3 && !s4) return false; // both empty → false
      if (!s3 || !s4) return true;  // only one filled → true

      return s3 === s4; // both filled → must match
    })();


    return {
      step4Name,
      step4Surgery,
      step4Age,
      step1Name,
      step2Name,
      step3Name,
      // step1Gender,
      step2Gender,
      step3Gender,
      step4Gender,
      step1Age,
      step2Age,
      step3Age,
      isNameMatched,
      isGenderMatched,
      isAgeMatched,
      step1Surgery,
      step2Surgery,
      step3Surgery,
      isSurgeryMatched,
      allMatched: isNameMatched && isGenderMatched && isAgeMatched && isSurgeryMatched,
    };
  }, [data]);

  const submitRequest = async (matched: boolean) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("https://echs.aretehealth.tech/submit_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ match: Boolean(matched) }),
      });
      // if (!res.ok) {
      //   const errorData = await res.json();
      //   throw new Error(errorData.detail || "Failed to submit request");
      // }
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json(); // ✅ resolves the promise
      setRequestId(data.request_id);
      return await res.json();
    } catch (err) {
      console.error("Error submitting request:", err);
      throw err;
    }
  };
  const allApproved = Object.values(approvals).every((val) => val === true);

  const getClaimID = async (file: File | null) => {
    if (!file) {
      setErrors((prev) => ({ ...prev, file1: "File is required" }));
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access_token");

    setErrors((prev) => ({ ...prev, file1: "" }));
    try {
      const response = await fetch("https://echs.aretehealth.tech/generate_claim_id", {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error("Failed to get Claim ID");
      }

      // setClaimId(result.message);
      setClaimId(result.claim_id ? result.claim_id : result.message);
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrors((prev) => ({
        ...prev,
        file1: error.message || "Upload failed",
      }));
      toast.error(
        `Referral Letter Upload failed: ${error.message || "Unknown error"}`
      );
    }
  };

  const handleClaimID = async () => {
    if (data?.step3?.file) {
      setLoading(true);
      try {
        await getClaimID(data.step3.file);
      } finally {
        setLoading(false);
      }
    } else {
      setErrors((prev) => ({ ...prev, file1: "File is required" }));
    }
  };

  const getClaimIDFollowup = async (file: File | null) => {
    if (!file) {
      setErrors((prev) => ({ ...prev, file1: "File is required" }));
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access_token");

    setErrors((prev) => ({ ...prev, file1: "" }));
    try {
      const response = await fetch("https://echs.aretehealth.tech/generate_claim_id_followup", {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (!response.ok) throw new Error("Failed to get Repeat Claim ID");

      // Store old + new claim id
      setClaimId(
        result.new_claim_id
          ? `New: ${result.new_claim_id} | Old: ${result.claim_id ?? "N/A"}`
          : result.message
      );
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrors((prev) => ({
        ...prev,
        file1: error.message || "Upload failed",
      }));
      toast.error(`Repeat Claim ID generation failed: ${error.message || "Unknown error"}`);
    }
  };

  const handleClaimIDFollowup = async () => {
    if (data?.step3?.file) {
      setLoadingFollowUp(true);
      try {
        await getClaimIDFollowup(data.step3.file);
      } finally {
        setLoadingFollowUp(false);
      }
    } else {
      setErrors((prev) => ({ ...prev, file1: "File is required" }));
    }
  };

  const callForHistory = async () => {
    document.title = "Result | ECHS";
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") navigate("/");

    if (comparisons) {
      setMatched(comparisons.allMatched);
      submitRequest(comparisons.allMatched);
    }
  }

  useEffect(() => {
    callForHistory();
  }, [navigate]);

  if (!data) {
    navigate("/form");
    return null;
  }

  // helper function to format date
  const formatDate = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const transformStep1 = (step1: {
    name: string;
    esm: string;
    dom: string;
    cardNo: string;
    relationship: string;
    serviceNo: string;
    dob: string;
  }) => {
    return {
      "Card No": step1.cardNo,
      "Patient Name": step1.name,
      "ESM": step1.esm,
      "DOB": formatDateForInput(step1.dob),
      "Relationship with ESM": step1.relationship,
      "Service No": step1.serviceNo,
      "DOM": formatDateForInput(step1.dom),
    };
  };


  function transformStep1Temporary(step1Temporary: Step1_Temporary) {
    return {
      "Patient Name": step1Temporary.patient_name || "",
      "ESM": step1Temporary.esm || "",
      "Relationship With ESM": step1Temporary.relationship_with_esm || "",
      "Form No": step1Temporary.form_no || "",
      "Registration No": step1Temporary.registration_no || "",
      "Category of Ward": step1Temporary.category_of_ward || "",
      "DOB": step1Temporary.dob || "",
      "Valid Upto": step1Temporary.valid_upto || "",
      "OIC Stamp": step1Temporary.oicStamp ? "Found" : "Not Found",
    };
  }

  function transformStep2(step2: Step2) {
    return {
      "Aadhaar Number": step2.aadhaarNumber || "",
      "Name on Aadhaar Card": step2.nameOnCard || "",
      "Gender": step2.gender || "",
      "Date of Birth": step2.dob || "",
    };
  }

  const formatDateForBackend = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    // backend needs dd-mm-yyyy
    return date.toLocaleDateString("en-GB").replace(/\//g, "-");
  };
  function transformStep3(step3: Step3) {
    return {
      "Polyclinic Name": step3.pdSec || "",
      "Name of Patient": step3.patientName || "",
      "Referral No": step3.referralNo || "",
      "Valid Upto": formatDateForBackend(step3.validityUpto) || "",
      "Date of Issue": formatDateForBackend(step3.doi) || "",
      "No of Sessions Allowed": step3.noOfSessionsAllowed || "",
      "Patient Type": step3.patientType || "",
      "Age": step3.age || "",
      "Gender": step3.gender || "",
      "Relationship with ESM": step3.relationshipWithESM || "",
      "Category": step3.category || "",
      "Service No": step3.serviceNo || "",
      "Card No": step3.cardNo || "",
      "ESM Name": step3.esmName || "",
      "ESM Contact Number": step3.contactNo || "",
      "Clinical Notes": step3.notes || "",
      "Admission": step3.admission || "",
      "Investigation": step3.investigation || "",
      "Consultation For": step3.consultationFor || "",
      "Polyclinic Remarks": step3.pdSec || "",
      "Claim ID": step3.claimId || "Not Found",
      "Referred To": step3.referredTo || "",
    };
  }
  function transformStep4(step4: Step4) {
    return {
      "name": step4.patientName || "",
      "age": step4.age || "",
      "diagnosis": step4.diagnosis || "",
      "advice": step4.advice || "",
    };
  }

  const handleValidateAgain = async () => {
    try {
      setLoadingAgain(true);
      const token = localStorage.getItem("access_token");
      const echs_card_file = data.step1.file;
      const temporary_slip_file = data.step1Temporary.file;
      const aadhar_card_file = data.step2.file;
      const referral_letter_file = data.step3.file;
      const prescription_file = data.step4.file;
      const payload: Record<string, any> = {};
      payload.echs_card = transformStep1(data.step1);
      payload.temporary_slip = transformStep1Temporary(data.step1Temporary);
      payload.aadhar_card = transformStep2(data.step2)
      payload.referral_letter = transformStep3(data.step3);
      payload.prescription = transformStep4(data.step4);
      const res = await fetch(`https://echs.aretehealth.tech/request_update/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          "updates": [
            {
              "doc_type": "echs_card",
              extracted_data: payload.echs_card
            },
            {
              "doc_type": "temporary_slip",
              extracted_data: payload.temporary_slip
            },
            {
              "doc_type": "aadhar_card",
              extracted_data: payload.aadhar_card
            },
            {
              "doc_type": "referral_letter",
              extracted_data: payload.referral_letter
            },
            {
              "doc_type": "prescription",
              extracted_data: payload.prescription
            }
          ]
        })// send whatever your API needs
      });

      if (!res.ok) {
        throw new Error("Validation failed");
      }

      const result = await res.json();
      // ⚡️ Update Zustand store with new values from response
      if (result.step1) updateStep1({
        _id: result.ocr_result_id || "",
        cardNo: result?.data["Card No"],
        dob: formatDateForInput(result?.data["DOB"]),
        name: result?.data["Patient Name"],
        esm: result?.data["ESM"],
        relationship: result?.data["Relationship with ESM"],
        dom: formatDateForInput(result?.data["DOM"]),
        serviceNo: result?.data["Service No"],
        file: echs_card_file, // Clear the file field after upload
      });
      if (result.step1Temporary) updateStep1Temporary({
        _id: result.ocr_result_id || "",
        esm: result?.data["ESM"],
        patient_name: result?.data["Patient Name"],
        relationship_with_esm: result?.data["Relationship With Esm"],
        form_no: result?.data["Form No"],
        registration_no: result?.data["Registration No"],
        category_of_ward: result?.data["Category of Ward"],
        dob: formatDateForInput(result?.data["DOB"]),
        valid_upto: formatDateForInput(result?.data["Valid Upto"]),
        oicStamp: result?.data["OIC Stamp"] === "Found",
        file: temporary_slip_file, // Clear the file field after upload
      });
      if (result.step2) updateStep2({
        _id: result.ocr_result_id || "",
        aadhaarNumber: result?.data["Aadhaar Number"],
        nameOnCard: result?.data["Name on Card"],
        dob: formatDateForInput(result?.data["DOB"]),
        file: aadhar_card_file, // Clear the file field after upload
      });
      if (result.step3) updateStep3({
        _id: result.ocr_result_id || "",
        cardNo: result?.data["Card No"],
        serviceNo: result?.data["Service No"],
        patientName: result?.data["Patient Name"],
        category: result?.data["Category"],
        doi: formatDateForInput(result?.data["Date of Injury"]),
        noOfSessionsAllowed: result?.data["No of Sessions Allowed"],
        patientType: result?.data["Patient Type"],
        pdSec: result?.data["PD Sec"],
        contactNo: result?.data["Contact No"],
        age: result?.data["Age"],
        gender: result?.data["Gender"],
        validityUpto: formatDateForInput(result?.data["Validity Upto"]),
        referralNo: result?.data["Referral No"],
        claimId: result?.data["Claim ID"],
        notes: result?.data["Notes"],
        date: formatDateForInput(result?.data["Date"]),
        esmName: result?.data["ESM Name"],
        relationshipWithESM: result?.data["Relationship with ESM"],
        investigation: result?.data["Investigation"],
        file: referral_letter_file, // Clear the file field after upload
        referredTo: result?.data["Referred To"],
      });
      if (result.step4) updateStep4({
        _id: result.ocr_result_id || "",
        patientName: result?.data["name"],
        age: result?.data["age"],
        diagnosis: result?.data["diagnosis"],
        advice: result?.data["advice"],
        file: prescription_file, // Clear the file field after upload

      });
      callForHistory();
      toast.success("Validation completed");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Validation failed");
    } finally {
      setLoadingAgain(false);
    }
  };

  // helper function
  const isEmptyObject = (obj: Record<string, any>) => {
    if (!obj || typeof obj !== "object") return true;

    return Object.values(obj).every((value) => {
      if (Array.isArray(value)) return value.length === 0; // ✅ empty array check
      if (value && typeof value === "object") return isEmptyObject(value); // nested object support
      return value === "" || value === null || value === undefined;
    });
  };

  useEffect(() => {
    if (comparisons.isNameMatched === true) {
      setApprovals((prev) => ({ ...prev, name: true }));
    }
    if (comparisons.isAgeMatched === true) {
      setApprovals((prev) => ({ ...prev, age: true }));
    }
    if (comparisons.isGenderMatched === true) {
      setApprovals((prev) => ({ ...prev, gender: true }));
    }
    if (comparisons.isSurgeryMatched === true) {
      setApprovals((prev) => ({ ...prev, surgery: true }));
    }
  }, [comparisons]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar />

      <div className="container flex flex-row gap-2 justify-between items-center">
        <div
          className="border rounded-sm bg-muted/50 backdrop-blur-md p-4 md:mb-6 text-center cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={() => {
            useFormStore.getState().reset();
            navigate("/form");
            setMatched(false);
            data.step1 = {
              ...data.step1,
              name: "",
              cardNo: "",
              dob: "",
              esm: "",
              relationship: "",
              serviceNo: "",
              dom: "",
              file: null,
              category: undefined,
            };
            data.step1Temporary = {
              _id: "",
              patient_name: "",
              esm: "",
              relationship_with_esm: "",
              form_no: "",
              registration_no: "",
              category_of_ward: "",
              dob: "",
              valid_upto: "",
              file: null,
              oicStamp: false,
            };
            data.step2 = {
              _id: "",
              aadhaarNumber: "",
              nameOnCard: "",
              dob: "",
            };
            data.step3 = {
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
              esmName: "",
              relationshipWithESM: "",
              investigation: "",
              file: null,
              referredTo: "",
            };
            data.step4 = {
              _id: "",
              patientName: "",
              age: "",
              gender: "",
              diagnosis: "",
              advice: "",
              treatment_plan: "",
              medication: [],
              file: null,
            };
          }}
        >
          New Submission
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Button
            onClick={handleClaimIDFollowup}
            disabled={loadingFollowUp || !allApproved}
            className={`gap-2 transition-colors ${loadingFollowUp
              ? "bg-primary text-white hover:bg-primary/90"
              : allApproved
                ? "bg-green-600 text-white border border-green-600 hover:bg-green-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
          >
            {loadingFollowUp ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Claim ID (Repeat)"
            )}
          </Button>
          <Button
            onClick={handleClaimID}
            disabled={loading || !allApproved}
            className={`gap-2 transition-colors ${loading
              ? "bg-primary text-white hover:bg-primary/90"
              : allApproved
                ? "bg-green-600 text-white border border-green-600 hover:bg-green-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Claim ID (New)"
            )}
          </Button>
        </div>
        {/* <Button
          onClick={handleValidateAgain}
          className="gap-2 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
          disabled={loadingAgain}
        >
          {loadingAgain ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4" />
              Validate Again
            </>
          )}
        </Button> */}
      </div>

      <section className="container max-w-5xl py-10 ">
        <Card className="shadow-sm rounded-xl bg-card/80 backdrop-blur-md border border-border animate-enter">
          {/* <div className="flex items-center justify-center gap-3 p-6">
            {Matched ? (
              <>
                <CheckCircle className="h-8 w-8 text-success" />
                <Badge
                  variant="secondary"
                  className="text-lg px-4 py-2 bg-success/10 text-success border-success/20"
                >
                  All Documents Matched
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-8 w-8 text-destructive" />
                <Badge
                  variant="secondary"
                  className="text-lg px-4 py-2 bg-destructive/10 text-destructive border-destructive/20"
                >
                  Documents Don't Match
                </Badge>
              </>
            )}
          </div> */}
          {/* Match Table */}
          {comparisons && (
            <div className="overflow-x-auto p-4">
              <table className="w-full border rounded-lg text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2 border text-[10px] md:text-[14px]">
                      Field
                    </th>
                    <th className="text-left p-2 border text-[10px] md:text-[14px]">
                      ECHS Card / Temporary Slip
                    </th>
                    <th className="text-left p-2 border text-[10px] md:text-[14px]">
                      Aadhaar Card
                    </th>
                    <th className="text-left p-2 border text-[10px] md:text-[14px]">
                      Referral Letter
                    </th>
                    <th className="text-left p-2 border text-[10px] md:text-[14px]">
                      Prescription
                    </th>
                    <th className="text-left p-2 border text-[10px] md:text-[14px]">
                      Match
                    </th>
                    <th className="text-left p-2 border text-[10px] md:text-[14px]">
                      Approval
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Name */}
                  <tr>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      Name
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step1Name || "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step2Name || "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step3Name || "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step4Name || "-"}
                    </td>
                    <td className="p-2 border  text-[10px] md:text-[14px]">
                      {comparisons.isNameMatched ? (
                        <Check className="text-green-600 inline" />
                      ) : (
                        <X className="text-red-600 inline" />
                      )}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px] text-center">
                      <button
                        onClick={() => toggleApproval("name")}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        {approvals.name ? "✅" : "❌"}
                      </button>
                    </td>
                  </tr>

                  {/* Gender */}
                  <tr>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      Gender
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {"-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step2Gender || "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step3Gender || "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step4Gender}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.isGenderMatched ? (
                        <Check className="text-green-600 inline" />
                      ) : (
                        <X className="text-red-600 inline" />
                      )}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px] text-center">
                      <button
                        onClick={() => toggleApproval("gender")}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        {approvals.gender ? "✅" : "❌"}
                      </button>
                    </td>
                  </tr>

                  {/* Age */}
                  <tr>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      Age
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {"-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step2Age ?? "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step3Age ?? "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step4Age || "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.isAgeMatched ? (
                        <Check className="text-green-600 inline" />
                      ) : (
                        <X className="text-red-600 inline" />
                      )}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px] text-center">
                      <button
                        onClick={() => toggleApproval("age")}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        {approvals.age ? "✅" : "❌"}
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      Surgery Name
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {"-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {"-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step3Surgery ?? "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step4Surgery || "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.isSurgeryMatched ? (
                        <Check className="text-green-600 inline" />
                      ) : (
                        <X className="text-red-600 inline" />
                      )}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px] text-center">
                      <button
                        onClick={() => toggleApproval("surgery")}
                        className="px-2 py-1 border rounded hover:bg-gray-100"
                      >
                        {approvals.surgery ? "✅" : "❌"}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <div
          className="border border-primary rounded-sm bg-muted/50 backdrop-blur-md p-4 mb-4 text-center cursor-pointer hover:bg-muted/70 transition-colors"
        >
          Validity Upto :{" "}
          {(() => {
            const validity = data.step3?.validityUpto;

            if (!validity) return "N/A";

            // Parse DD-MM-YYYY
            const [day, month, year] = validity.split("-").map(Number);
            const validityDate = new Date(year, month - 1, day); // month is 0-based

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            validityDate.setHours(0, 0, 0, 0);

            // Format back to DD-MM-YYYY
            const formattedDate = `${day.toString().padStart(2, "0")}-${month
              .toString()
              .padStart(2, "0")}-${year}`;

            return validityDate < today ? (
              <span>
                {formattedDate} <b>(Invalid Date)</b>
              </span>
            ) : (
              formattedDate
            );
          })()}
        </div>

        <div
          className="border border-primary rounded-sm bg-muted/50 backdrop-blur-md p-4 mb-6 text-center cursor-pointer hover:bg-muted/70 transition-colors"
        >
          Referred To :{" "} {data?.step3?.referredTo}
        </div>
      </section>


      {/* Step Sections */}
      <section className="container max-w-5xl pb-20 space-y-6">
        <Card className={isEmptyObject(data.step1) ? "opacity-50 pointer-events-none" : ""}>
          <CardHeader
            className="flex justify-between cursor-pointer"
            onClick={() => !isEmptyObject(data.step1) && toggleSection("step1")}
          >
            <CardTitle className="text-base">Step 1 - ECHS Card</CardTitle>
            {expanded.step1 ? <ChevronUp /> : <ChevronDown />}
          </CardHeader>
          {expanded.step1 && (
            <CardContent>{renderDetails(data.step1, "step1")}</CardContent>
          )}
        </Card>

        {!isEmptyObject(data.step1Temporary) && data.step1Temporary.patient_name && (
          <Card>
            <CardHeader
              className="flex justify-between cursor-pointer"
              onClick={() => toggleSection("step1Temporary")}
            >
              <CardTitle className="text-base">Step 1 - Temporary Slip</CardTitle>
              {expanded.step1Temporary ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            {expanded.step1Temporary && (
              <CardContent>
                {renderDetails(data.step1Temporary, "step1Temporary")}
              </CardContent>
            )}
          </Card>
        )}

        <Card className={isEmptyObject(data.step2) ? "opacity-50 pointer-events-none" : ""}>
          <CardHeader
            className="flex justify-between cursor-pointer"
            onClick={() => !isEmptyObject(data.step2) && toggleSection("step2")}
          >
            <CardTitle className="text-base">Step 2 - Aadhaar Card</CardTitle>
            {expanded.step2 ? <ChevronUp /> : <ChevronDown />}
          </CardHeader>
          {expanded.step2 && (
            <CardContent>{renderDetails(data.step2, "step2")}</CardContent>
          )}
        </Card>

        <Card className={isEmptyObject(data.step3) ? "opacity-50 pointer-events-none" : ""}>
          <CardHeader
            className="flex justify-between cursor-pointer"
            onClick={() => !isEmptyObject(data.step3) && toggleSection("step3")}
          >
            <CardTitle className="text-base">Step 3 - Referral Letter</CardTitle>
            {expanded.step3 ? <ChevronUp /> : <ChevronDown />}
          </CardHeader>
          {expanded.step3 && (
            <CardContent>{renderDetails(data.step3, "step3")}</CardContent>
          )}
        </Card>
        <Card className={isEmptyObject(data.step4) ? "opacity-50 pointer-events-none" : ""}>
          <CardHeader
            className="flex justify-between cursor-pointer"
            onClick={() => !isEmptyObject(data.step4) && toggleSection("step4")}
          >
            <CardTitle className="text-base">Step 4 - Prescription</CardTitle>
            {expanded.step4 ? <ChevronUp /> : <ChevronDown />}
          </CardHeader>
          {expanded.step4 && (
            <CardContent>{renderDetails(data.step4, "step4")}</CardContent>
          )}
        </Card>
        <Button
          onClick={handleValidateAgain}
          className="gap-2 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
          disabled={loadingAgain}
        >
          {loadingAgain ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4" />
              Validate Again
            </>
          )}
        </Button>

      </section>

      {claimId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-[90%] max-w-sm text-center animate-enter">
            <h2 className="text-lg font-semibold text-gray-800">
              Claim ID Generated
            </h2>
            <p className="mt-3 text-xl font-mono text-primary">{claimId}</p>
            <Button
              onClick={() => { setClaimId(null); reset(); navigate("/form") }}
              className="mt-6 bg-primary text-white hover:bg-primary/80"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Result;
