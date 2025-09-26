import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react"
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, FileText, X, Eye } from "lucide-react";
import { useFormStore } from "@/store/formStore";
import { toast } from "sonner";
import Navbar from "@/components/comp/Navbar";

const steps = [
  { id: 1, label: "ECHS Card / Temporay Slip" },
  { id: 2, label: "Adhar Card" },
  { id: 3, label: "Referral Letter" },
  { id: 4, label: "Prescription" },
];

// Modal Component for Image Preview
const ImageModal = ({ isOpen, onClose, imageUrl, fileName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
        >
          <X className="h-6 w-6" />
        </Button>
        <div className="bg-white rounded-lg p-2">
          <img
            src={imageUrl}
            alt={fileName || "Document preview"}
            className="max-w-full max-h-[80vh] object-contain mx-auto"
          />
          {fileName && (
            <p className="text-center text-sm text-gray-600 mt-2 p-2">
              {fileName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// File Preview Component
const FilePreview = ({
  file,
  onView,
  onRemove,
}: {
  file: File | File[] | null;
  onView: (url: string, name: string) => void;
  onRemove: (index: number) => void;
}) => {
  if (!file) return null;

  const filesArray = Array.isArray(file) ? file : [file];

  return (
    <div className="flex gap-2 flex-wrap">
      {filesArray.map((f, idx) => {
        const isImage = f.type.startsWith("image/");
        const isPDF = f.type === "application/pdf";
        const url = isImage ? URL.createObjectURL(f) : undefined;

        return (
          <div key={idx} className="relative group">
            {isImage ? (
              <div className="relative">
                <img
                  src={url}
                  alt="Document preview"
                  className="h-20 w-20 rounded-md object-cover border border-border cursor-pointer"
                  onClick={() => onView(url!, f.name)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
              </div>
            ) : (
              <div className="h-20 w-20 rounded-md border border-border bg-muted flex flex-col items-center justify-center p-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-center">{isPDF ? "PDF" : "File"}</span>
              </div>
            )}

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemove(idx)}
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>

            <p className="text-xs text-center mt-1 truncate max-w-20">{f.name}</p>
          </div>
        );
      })}
    </div>
  );
};

type UploadTileProps = {
  label: string;
  accept: string;
  file: File | File[] | null;
  onChange: (file: File | File[] | null) => void;
  hint?: string;
  multiple?: boolean;
};

const UploadTile = ({
  label,
  accept,
  file,
  onChange,
  hint,
  multiple = false,
}: UploadTileProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState({ url: "", name: "" });

  const handleViewImage = (url: string, name: string) => {
    setModalImage({ url, name });
    setModalOpen(true);
  };

  const handleRemoveFile = (index: number) => {
    if (!file) return;
    let newFiles: File[] | null = [];
    if (Array.isArray(file)) {
      newFiles = [...file];
      newFiles.splice(index, 1);
    } else {
      newFiles = null;
    }
    onChange(newFiles);
  };

  const filesArray = Array.isArray(file) ? file : file ? [file] : [];

  return (
    <>
      <div className="space-y-3">
        <div
          className="group relative flex-1 rounded-xl border border-dashed border-primary/30 bg-card/70 hover:bg-card transition-colors p-4 cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            multiple={multiple}
            onChange={(e) => {
              if (!e.target.files) return;

              const selectedFiles = Array.from(e.target.files);

              let updatedFiles: File[] = [];

              if (multiple) {
                // Merge old + new files, enforce max 2
                updatedFiles = [...filesArray, ...selectedFiles].slice(0, 2);
              } else {
                updatedFiles = [selectedFiles[0]];
              }

              onChange(multiple ? updatedFiles : updatedFiles[0]);
            }}
          />
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              {accept.startsWith("image") ? <ImageIcon /> : <FileText />}
            </div>
            <div className="flex-1">
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                {hint || (accept.includes("pdf") ? "Image or PDF" : "Image files")}
              </p>
              {!filesArray.length && (
                <p className="text-xs text-primary mt-1">Click to upload</p>
              )}
            </div>
          </div>
        </div>

        {/* File Preview */}
        {filesArray.length > 0 &&
          filesArray.map((f, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
            >
              <FilePreview
                file={f}
                onView={handleViewImage}
                onRemove={() => handleRemoveFile(idx)}
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{f.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(f.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ))}
      </div>

      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        imageUrl={modalImage.url}
        fileName={modalImage.name}
      />
    </>
  );
};


const UploadDocument = () => {
  const [selected, setSelected] = useState<"ECHS" | "Temporary Slip">("ECHS");
  const navigate = useNavigate();
  const [current, setCurrent] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Object | null>(null);

  const { data, updateStep1, updateStep2, updateStep3, updateStep4, updateStep1Temporary } =
    useFormStore();



  useEffect(() => {
    document.title = `Step ${current} | ECHS`;
  }, [current]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") navigate("/");
  }, [navigate]);
  console.log(data, " this is final data")
  const progress = useMemo(() => (current / steps.length) * 100, [current]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!data.step1.name) newErrors.name = "Name is required";
      if (!data.step1.esm) newErrors.department = "ESM Name is required";
      if (!data.step1.serviceNo) newErrors.serviceId = "Service ID is required";
      if (!data.step1.dob) newErrors.date1 = "DOB is required";
      if (!data.step1.relationship)
        newErrors.relationship = "Relationship with ESM is required";
    }
    if (selected === "Temporary Slip") {
      if (!data.step1Temporary.name) newErrors.name = "Name is required";
      if (!data.step1Temporary.esmName)
        newErrors.esmName = "ESM Name is required";
      if (!data.step1Temporary.serviceId)
        newErrors.serviceId = "Service ID is required";
      if (!data.step1Temporary.temporaryId)
        newErrors.temporaryId = "Temporary ID is required";
      if (!data.step1Temporary.category)
        newErrors.category = "Category is required";
      if (!data.step1Temporary.date) newErrors.date = "DOB is required";
      if (!data.step1Temporary.validUpto)
        newErrors.validUpto = "Valid Upto date is required";
    }
    if (step === 2) {
      if (!data.step2.aadhaarNumber)
        newErrors.aadhaarNumber = "Aadhaar Number is required";
      if (!data.step2.nameOnCard) newErrors.nameOnCard = "Name is required";
      if (!data.step2.dob) newErrors.dob = "Date of Birth is required";
    }
    if (step === 3) {
      if (!data.step3.notes) newErrors.notes = "Notes are required";
      if (!data.step3.date) newErrors.date3 = "Date is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onNext = () => {
    if (validateStep(current)) setCurrent((c) => Math.min(c + 1, steps.length));
  };
  const onBack = () => setCurrent((c) => Math.max(c - 1, 1));
  const onSkip = () => {
    if (current < 3) setCurrent((c) => c + 1);
    else navigate("/result", { state: { data, matched: false } });
  };

  const onSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const matched = Math.random() > 0.5;
      navigate("/result", { state: { data, matched } });
    }, 2000);
  };

  const [isloading, setLoading] = useState(false);

  const uploadEChSCard = async (file: File | null) => {
    if (!file) {
      console.log("inside ECHS if condition");
      updateStep1({
        _id: "",
        name: "",
        cardNo: "",
        esm: "",
        relationship: "",
        serviceNo: "",
        dob: "",
        dom: "",
        file: null,
      });
      setErrors((prev) => ({ ...prev, file1: "File is required" }));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access_token");
    updateStep1({
      _id: "",
      name: "",
      cardNo: "",
      esm: "",
      relationship: "",
      serviceNo: "",
      dob: "",
      dom: "",
      file: null,
    });
    console.log("outside ECHS file if condition");
    setErrors((prev) => ({ ...prev, file1: "" }));
    try {
      // const response = await fetch("http://127.0.0.1:8000/extract/echs_card", {
      const response = await fetch("https://echs.aretehealth.tech/extract/echs_card", {

        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error("Failed to upload ECHS card");
      }

      const result = await response.json();
      console.log("Upload successful: ECHS", result);
      console.log(result?.data["DOB"], " this is echs card no ")
      updateStep1({
        _id: result.ocr_result_id || "",
        cardNo: result?.data["Card No"],
        dob: formatDateForInput(result?.data["DOB"]),
        name: result?.data["Patient Name"],
        esm: result?.data["ESM"],
        dom: formatDateForInput(result?.data["DOM"]),
        relationship: result?.data["Relationship with ESM"],
        serviceNo: result?.data["Service No"],
        // serviceIdPhoto: file, // Assuming the uploaded file is the service ID photo
        file: file, // Clear the file field after upload
      });

      setErrors((prev) => ({ ...prev, file1: "" }));
      toast.success("ECHS Card Upload successful!");
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrors((prev) => ({
        ...prev,
        file1: error.message || "Upload failed",
      }));
      toast.error(
        `ECHS Card Upload failed: ${error.message || "Unknown error"}`
      );
    }
  };
  console.log("this is good")
  const uploadTemporaryCard = async (file: File | null) => {
    if (!file) {
      updateStep1Temporary({
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
      });
      console.log("inside temporary file if condition");

      setErrors((prev) => ({ ...prev, file1: "File is required" }));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access_token");

    updateStep1Temporary({
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
    });
    console.log("outside after empty temporary file if condition");

    setErrors((prev) => ({ ...prev, file1: "" }));
    try {
      const response = await fetch(
        "https://echs.aretehealth.tech/extract/temporary_slip",
        {
          method: "POST",
          body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload Temporay card");
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      updateStep1Temporary({
        _id: result.ocr_result_id || "",
        esmName: result?.data["Patient Name"],
        name: result?.data["ESM"],
        relationship: result?.data["Relationship with ESM"],
        serviceId: result?.data["Form No"],
        temporaryId: result?.data["Temporary Slip No"],
        category: result?.data["Category"],
        date: formatDateForInput(result?.data["DOB"]),
        validUpto: formatDateForInput(result?.data["Valid Upto"]),
        oicStamp: result?.data["OIC Stamp"] === "Found",
        file: file, // Clear the file field after upload
      });

      setErrors((prev) => ({ ...prev, file1: "" }));
      toast.success("Temporary Slip Upload successful!");
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrors((prev) => ({
        ...prev,
        file1: error.message || "Upload failed",
      }));
      toast.error(
        `Temporary Slip Upload failed: ${error.message || "Unknown error"}`
      );
    }
  };

  const uploadAdharCard = async (file: File | null) => {
    if (!file) {
      console.log("inside file if condition");
      updateStep2({
        _id: "",
        gender: "",
        aadhaarNumber: "",
        nameOnCard: "",
        dob: "",
        file: null,
        photo: null,
      });
      setErrors((prev) => ({ ...prev, file1: "File is required" }));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("access_token");

    updateStep2({
      _id: "",
      gender: "",
      aadhaarNumber: "",
      nameOnCard: "",
      dob: "",
      file: null,
      photo: null,
    });
    console.log("outside after empty file if condition");

    setErrors((prev) => ({ ...prev, file1: "" }));
    try {
      const response = await fetch(
        "https://echs.aretehealth.tech/extract/aadhar_card",
        {
          method: "POST",
          body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload Adhar card");
      }

      const result = await response.json();
      console.log("Upload successful: ADHAR", result);

      updateStep2({
        _id: result.ocr_result_id || "",
        aadhaarNumber: result?.data["Aadhaar No"],
        gender: result?.data["Gender"] || "",
        dob: formatDateForInput(result?.data["Date of Birth"]),
        nameOnCard: result?.data["Name"],
        file: file, // Clear the file field after upload
      });
      setErrors((prev) => ({ ...prev, file1: "" }));
      toast.success("Adhar Card Upload successful!");
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrors((prev) => ({
        ...prev,
        file1: error.message || "Upload failed",
      }));
      toast.error(
        `Adhar Card Upload failed: ${error.message || "Unknown error"}`
      );
    }
  };
  console.log(data);

  const uploadRefferalLetter = async (file: File | null) => {
    if (!file) {
      updateStep3({
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
      });
      console.log("inside Referral Letter file if condition");
      setErrors((prev) => ({ ...prev, file1: "File is required" }));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    // setFileRefferals(file)

    const token = localStorage.getItem("access_token");
    updateStep3({
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
    });
    console.log("outside after empty Referral Letter file if condition");
    setErrors((prev) => ({ ...prev, file1: "" }));
    try {
      const response = await fetch(
        "https://echs.aretehealth.tech/extract/referral_letter",
        {
          method: "POST",
          body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload Referral Letter");
      }

      const result = await response.json();
      console.log("Upload successful: REFERRAL", result);
      updateStep3({
        _id: result.ocr_result_id || "",
        cardNo: result?.data?.["Card No"] ?? "",
        serviceNo: result?.data?.["Service No"] ?? "",
        patientName: result?.data?.["Name of Patient"] ?? "",
        category: result?.data?.["Category"] ?? "",
        doi: result?.data?.["Date of Issue"] ?? "",
        noOfSessionsAllowed: result?.data?.["No of Sessions Allowed"] ?? "",
        patientType: result?.data?.["Patient Type"] ?? "",
        pdSec: result?.data?.["Polyclinic Remarks"] ?? "",
        contactNo: result?.data?.["ESM Contact Number"] ?? "",
        age: result?.data?.["Age"] ?? "",
        gender: result?.data?.["Gender"] ?? "",
        validityUpto: result?.data?.["Valid Upto"] ?? "",
        referralNo: result?.data?.["Referral No"] ?? "",
        claimId: result?.data?.["Claim ID"] ?? "Not Found",
        notes: result?.data?.["Clinical Notes"] ?? "",
        admission: result?.data?.["Admission"] ?? "",
        consultationFor: result?.data?.["Consultation For"] ?? "",
        esmName: result?.data?.["ESM Name"] ?? "",
        relationshipWithESM: result?.data?.["Relationship with ESM"] ?? "",
        investigation: result?.data?.["Investigation"] ?? "",

        // date: "",
        file: file,
      });

      setErrors((prev) => ({ ...prev, file1: "" }));
      toast.success("Referral Letter Upload successful!");
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

  const uploadPrescription = async (files: File[] | null) => {
    if (!files || files.length === 0) {
      updateStep4({
        _id: "",
        patientName: "",
        age: "",
        diagnosis: "",
        advice: "",
        treatment_plan: "",
        file: null,
      });
      console.log("inside Prescription file if condition");
      setErrors((prev) => ({ ...prev, file1: "File is required" }));
      return;
    }

    const formData = new FormData();
    files.slice(0, 2).forEach((file) => formData.append("files", file));

    const token = localStorage.getItem("access_token");
    updateStep4({
      _id: "",
      patientName: "",
      age: "",
      diagnosis: "",
      advice: "",
      treatment_plan: "",
      // medication: [],
      file: null,
    });
    console.log("outside after empty Referral Letter file if condition");
    setErrors((prev) => ({ ...prev, file1: "" }));
    try {
      const response = await fetch(
        "https://echs.aretehealth.tech/extract/prescription",
        {
          method: "POST",
          body: formData,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload Referral Letter");
      }

      const result = await response.json();
      console.log("Upload successful: prescription", result);

      updateStep4({
        _id: result.ocr_result_id || "",
        age: (result?.data?.["age"] ?? "").match(/\d+/)?.[0] ?? "",
        patientName: result?.data?.["name"] ?? "",
        diagnosis: result?.data?.["diagnosis"] ?? "",
        advice: result?.data?.["advice"] ?? "",
        treatment_plan: result?.data?.["treatment_plan"] ?? [],
        file: files.slice(0, 2), // ✅ enforce max 2 files
      });

      setErrors((prev) => ({ ...prev, file1: "" }));
      toast.success("Prescription Upload successful!");
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrors((prev) => ({
        ...prev,
        file1: error.message || "Upload failed",
      }));
      toast.error(
        `Prescription Upload failed: ${error.message || "Unknown error"}`
      );
    }
  };



  //   const getClaimID = async (file: File | null) => {
  //     if (!file) {
  //       setErrors((prev) => ({ ...prev, file1: "File is required" }));
  //       return;
  //     }

  //     const formData = new FormData();
  //     formData.append("file", file);

  //     const token = localStorage.getItem("access_token");

  //     setErrors((prev) => ({ ...prev, file1: "" }));
  //     try {
  //       const response = await fetch(
  //         "https://echs.aretehealth.tech/generate_claim_id",
  //         {
  //           method: "POST",
  //           body: formData,
  //           headers: token ? { Authorization: `Bearer ${token}` } : {},
  //         }
  //       );
  //       const result = await response.json();
  // console.log(result);
  //       if (!response.ok) {
  //         throw new Error("Failed to get Claim ID");
  //       }

  //       setErrors((prev) => ({ ...prev, file1: "" }));
  //       alert(`${"Claim id is"}${result.claim_id}`);
  //     } catch (error: any) {
  //       console.error("Upload error:", error);
  //       setErrors((prev) => ({
  //         ...prev,
  //         file1: error.message || "Upload failed",
  //       }));
  //       toast.error(
  //         `Referral Letter Upload failed: ${error.message || "Unknown error"}`
  //       );
  //     }
  //   };

  // const formatDateForInput = (dateStr: string) => {
  //   console.log(dateStr, " this is date string");
  //   if (!dateStr) return "";

  //   const parsed = new Date(dateStr);
  //   console.log(parsed, " this is parsed date");
  //   if (!isNaN(parsed.getTime())) {
  //     console.log("this is for yesting purpose ")
  //     console.log(parsed.toISOString().split("T")[0], " this is parsed date");
  //     return parsed.toISOString().split("T")[0];
  //   }

  //   const delimiter = dateStr.includes("/") ? "/" : "-";
  //   const [day, month, year] = dateStr.split(delimiter);
  //   console.log(day, month, year, " split date parts"); 

  //   if (day && month && year) {
  //     return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  //   }

  //   return "";
  // };
  const formatDateForInput = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    console.log(year, month, day, " this is date string");
    return `${year}-${month}-${day}`;
  };


  console.log(data, " this is upload data ")
  const uploadAllDocument = async () => {
    setLoading(true);
    try {
      if (selected === "ECHS") {
        await uploadEChSCard(data.step1.file);
      } else {
        await uploadTemporaryCard(data.step1Temporary.file);
      }

      await uploadAdharCard(data.step2.file);

      await uploadRefferalLetter(data.step3.file);

      await uploadPrescription(data.step4.file);
      // await getClaimID(data.step3.file);
      toast.success("All documents uploaded successfully!");
      // updateStep1({ file: null });
      // updateStep1Temporary({ file: null });
      // updateStep2({ file: null });
      // updateStep3({ file: null });
      setTimeout(async () => {
        setLoading(false);
        navigate("/result", { state: { matched: true } });
      }, 1000);
    } catch (error) {
      console.error("Error uploading documents:", error);
      toast.error("Failed to upload documents. Please try again.");
      setLoading(false);
    }
  };

  const fetchSearchResults = async (query: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`https://echs.aretehealth.tech/search/${query}`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error("Failed to fetch search results");
      }

      const data = await response.json();
      setSearchResults(data); // ✅ store response in state
    } catch (error) {
      console.error("Search API error:", error);
      setSearchResults([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim() && searchTerm !== "") {
      fetchSearchResults(searchTerm);
    } else {
      setSearchResults(null);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-background to-muted">
        <Navbar />

        <section className="container max-w-4xl px-4 pb-16 space-y-6">
          <Card className="bg-card shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Upload Document
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Select Type */}
              <div className="flex items-center gap-4 mb-4">
                <Label className="font-medium">Select Type:</Label>
                <Button
                  variant={selected === "ECHS" ? "default" : "outline"}
                  onClick={() => setSelected("ECHS")}
                  className="px-4"
                >
                  ECHS Card
                </Button>
                <Button
                  variant={
                    selected === "Temporary Slip" ? "default" : "outline"
                  }
                  onClick={() => setSelected("Temporary Slip")}
                  className="px-4"
                >
                  Temporary Slip
                </Button>
                {/* Search Field */}
                <div className="relative ml-auto w-64">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown} // 🔑 listen for Enter key
                  />
                </div>
              </div>

              {/* Show correct file upload input */}
              {selected === "ECHS" ? (
                <div className="grid grid-cols-1 gap-4">
                  <UploadTile
                    label="Upload ECHS Card"
                    accept="image/*,application/pdf"
                    file={data.step1.file || null}
                    onChange={(f) => updateStep1({ file: f as File | null })}
                    hint="Related ECHS Card (Image/PDF)"
                    multiple={false}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <UploadTile
                    label="Upload Temporary Slip"
                    accept="image/*,application/pdf"
                    file={data.step1Temporary.file || null}  // File | null
                    onChange={(f) => updateStep1Temporary({ file: f as File | null })}
                    hint="Related Temporary Slip (Image/PDF)"
                    multiple={false}  // explicitly single-file
                  />
                </div>
              )}

              {/* Step 2 - Aadhaar */}
              <div className="grid grid-cols-1 gap-4">
                <UploadTile
                  label="Aadhaar Card"
                  accept=".jpg,.jpeg,.png,.pdf"
                  file={data?.step2?.file || null} // File | null
                  onChange={(file) => updateStep2({ file: file as File | null })}
                  hint="Upload Aadhaar card scan/photo"
                  multiple={false} // explicitly single-file
                />
              </div>

              {/* Step 3 - Referral & Notes */}
              <div className="grid grid-cols-1 gap-4">
                <UploadTile
                  label="Referral Letter"
                  accept=".jpg,.jpeg,.png,.pdf"
                  file={data.step3.file || null}           // File | null
                  onChange={(file) => updateStep3({ file: file as File | null })}
                  hint="Upload referral letter document"
                  multiple={false}                         // explicitly single-file
                />
              </div>
              {/*Step 4 - Prescription Details */}
              <div className="grid grid-cols-1 gap-4">
                <UploadTile
                  label="Prescription"
                  accept=".jpg,.jpeg,.png,.pdf"
                  file={data.step4.file || null} // File[] | null
                  onChange={(f) => updateStep4({ file: f as File[] | null })}
                  hint="Upload prescription (1-2 files)"
                  multiple={true}
                />
              </div>
              {/* Errors */}
              {Object.keys(errors).length > 0 && (
                <div className="text-destructive text-sm">
                  {Object.values(errors).map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end mt-6">
                <Button
                  onClick={() => {
                    uploadAllDocument();
                  }}
                  disabled={submitting || isloading}
                >
                  {isloading ? "Uploading..." : "Upload Documents"}
                </Button>
              </div>
            </CardContent>

            {isloading && (
              <div className="fixed inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm z-50">
                <div className="flex flex-col items-center">
                  <span className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="mt-4 text-lg text-muted-foreground">
                    Uploading documents...
                  </p>
                </div>
              </div>
            )}
          </Card>
        </section>
        {/* API Data Section */}
        <section className="container max-w-4xl px-4 pb-16 space-y-6">
          <Card className="bg-card shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Searched Data
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* Example of showing results */}
              {searchResults !== null ? (
                <div>
                  <div>
                    {`Name Of the Patient : ${searchResults?.['referral_letter']?.['extracted_data']?.["Name of Patient"]}`}
                  </div>
                  <div>
                    {`Claim ID : ${searchResults?.['referral_letter']?.['extracted_data']?.["Claim ID"]}`}
                  </div>
                  <div>
                    {`Referral No : ${searchResults?.['referral_letter']?.['extracted_data']?.["Referral No"]}`}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available.</p>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default UploadDocument;
