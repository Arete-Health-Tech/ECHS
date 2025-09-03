import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, FileText, X, Eye } from "lucide-react";
import { useFormStore } from "@/store/formStore";
import { toast } from "sonner";
import Navbar from "@/components/comp/Navbar";

const steps = [
  { id: 1, label: "ECHS Card / Temporay Slip" },
  { id: 2, label: "Adhar Card" },
  { id: 3, label: "Referral Letter" },
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
const FilePreview = ({ file, onView, onRemove }) => {
  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const isPDF = file.type === "application/pdf";

  if (isImage) {
    const url = URL.createObjectURL(file);
    return (
      <div className="relative group">
        <div className="relative">
          <img
            src={url}
            alt="Document preview"
            className="h-20 w-20 rounded-md object-cover border border-border cursor-pointer"
            onClick={() => onView(url, file.name)}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
            <Eye className="h-5 w-5 text-white" />
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={onRemove}
          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
        >
          <X className="h-3 w-3" />
        </Button>
        <p className="text-xs text-center mt-1 truncate max-w-20">
          {file.name}
        </p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="h-20 w-20 rounded-md border border-border bg-muted flex flex-col items-center justify-center p-2">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <span className="text-xs text-center">{isPDF ? "PDF" : "File"}</span>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={onRemove}
        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
      >
        <X className="h-3 w-3" />
      </Button>
      <p className="text-xs text-center mt-1 truncate max-w-20">{file.name}</p>
    </div>
  );
};

const UploadTile = ({
  label,
  accept,
  file,
  onChange,
  hint,
}: {
  label: string;
  accept: string;
  file: File | null | undefined;
  onChange: (file: File | null) => void;
  hint?: string;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState({ url: "", name: "" });

  const handleViewImage = (url: string, name: string) => {
    setModalImage({ url, name });
    setModalOpen(true);
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    onChange(null);
  };

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
            onChange={(e) => onChange(e.target.files?.[0] || null)}
          />
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              {accept.startsWith("image") ? <ImageIcon /> : <FileText />}
            </div>
            <div className="flex-1">
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                {hint ||
                  (accept.includes("pdf") ? "Image or PDF" : "Image files")}
              </p>
              {!file && (
                <p className="text-xs text-primary mt-1">Click to upload</p>
              )}
            </div>
          </div>
        </div>

        {/* File Preview Section */}
        {file && (
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <FilePreview
              file={file}
              onView={handleViewImage}
              onRemove={handleRemoveFile}
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}
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

  const { data, updateStep1, updateStep2, updateStep3, updateStep1Temporary } =
    useFormStore();

   

  useEffect(() => {
    document.title = `Step ${current} | ECHS`;
  }, [current]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") navigate("/");
  }, [navigate]);
console.log(data," this is final data")
  const progress = useMemo(() => (current / steps.length) * 100, [current]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!data.step1.name) newErrors.name = "Name is required";
      if (!data.step1.department) newErrors.department = "ESM Name is required";
      if (!data.step1.serviceId) newErrors.serviceId = "Service ID is required";
      if (!data.step1.date) newErrors.date1 = "DOB is required";
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
        department: "",
        relationship: "",
        serviceId: "",
        date: "",
        serviceIdPhoto: null,
        file: null,
        category: undefined,
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
      department: "",
      relationship: "",
      serviceId: "",
      date: "",
      serviceIdPhoto: null,
      file: null,
      category: undefined,
    });
    console.log("outside ECHS file if condition");
    setErrors((prev) => ({ ...prev, file1: "" }));
    try {
      const response = await fetch("http://localhost:8000/extract/echs_card", {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error("Failed to upload ECHS card");
      }

      const result = await response.json();
      console.log("Upload successful: ECHS", result);

      updateStep1({
        _id: result.ocr_result_id || "",
        serviceId: result?.data["Card No"],
        date: formatDateForInput(result?.data["DOB"]),
        name: result?.data["Patient Name"],
        department: result?.data["ESM"],
        relationship: result?.data["Relationship with ESM"],
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

  const uploadTemporaryCard = async (file: File | null) => {
    if (!file) {
      updateStep1Temporary  ({
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

    updateStep1Temporary  ({
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
        "http://localhost:8000/extract/temporary_slip",
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
        "http://localhost:8000/extract/aadhar_card",
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
        "http://localhost:8000/extract/referral_letter",
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
        doi: formatDateForInput(result?.data?.["Date of Issue"] ?? ""),
        noOfSessionsAllowed: result?.data?.["No of Sessions Allowed"] ?? "",
        patientType: result?.data?.["Patient Type"] ?? "",
        pdSec: result?.data?.["Polyclinic Remarks"] ?? "",
        contactNo: result?.data?.["ESM Contact Number"] ?? "",
        age: result?.data?.["Age"] ?? "",
        gender: result?.data?.["Gender"] ?? "",
        validityUpto: formatDateForInput(result?.data?.["Valid Upto"] ?? ""),
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
  //         "http://localhost:8000/generate_claim_id",
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

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";

    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }

    const delimiter = dateStr.includes("/") ? "/" : "-";
    const [day, month, year] = dateStr.split(delimiter);

    if (day && month && year) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return "";
  };
console.log(data," this is upload data ")
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
              </div>

              {/* Show correct file upload input */}
              {selected === "ECHS" ? (
                <div className="grid grid-cols-1 gap-4">
                  <UploadTile
                    label="Upload ECHS Card"
                    accept="image/*,application/pdf"
                    file={data.step1.file || null}
                    onChange={(f) => updateStep1({ file: f })}
                    hint="Related ECHS Card (Image/PDF)"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  <UploadTile
                    label="Upload Temporary Slip"
                    accept="image/*,application/pdf"
                    file={data.step1Temporary.file || null}
                    onChange={(f) => updateStep1Temporary({ file: f })}
                    hint="Related Temporary Slip (Image/PDF)"
                  />
                </div>
              )}

              {/* Step 2 - Aadhaar */}
              <div className="grid grid-cols-1 gap-4">
                <UploadTile
                  label="Aadhaar Card"
                  accept=".jpg,.jpeg,.png,.pdf"
                  file={data?.step2?.file}
                  onChange={(file) => updateStep2({ file })}
                  hint="Upload Aadhaar card scan/photo"
                />
              </div>

              {/* Step 3 - Referral & Notes */}
              <div className="grid grid-cols-1 gap-4">
                <UploadTile
                  label="Referral Letter"
                  accept=".jpg,.jpeg,.png,.pdf"
                  file={data.step3.file}
                  onChange={(file) => updateStep3({ file })}
                  hint="Upload referral letter document"
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
      </main>
    </>
  );
};

export default UploadDocument;
