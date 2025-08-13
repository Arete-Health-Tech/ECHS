import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, FileText } from "lucide-react";
import { useFormStore } from "@/store/formStore";

const steps = [
  { id: 1, label: "ECHS Card / Temporay Slip" },
  { id: 2, label: "Adhar Card" },
  { id: 3, label: "Referral Letter" },
];

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
  return (
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
            {hint || (accept.includes("pdf") ? "Image or PDF" : "Image files")}
          </p>
          {file && (
            <p className="text-xs mt-1">
              <span className="text-muted-foreground">Selected:</span>{" "}
              {file.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const FormWizard = () => {
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

  const progress = useMemo(() => (current / steps.length) * 100, [current]);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!data.step1.file) newErrors.file1 = "Document is required";
      if (!data.step1.name) newErrors.name = "Name is required";
      if (!data.step1.department) newErrors.department = "ESM Name is required";
      if (!data.step1.serviceId) newErrors.serviceId = "Service ID is required";
      if (!data.step1.date) newErrors.date1 = "DOB is required";
      if (!data.step1.relationship)
        newErrors.relationship = "Relationship with ESM is required";
    }
    if (selected === "Temporary Slip") {
      if (!data.step1Temporary.file) newErrors.file = "Document is required";
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
      if (!data.step2.file) newErrors.file2 = "Aadhaar card is required";
    }
    if (step === 3) {
      // if (!data.step3.photo) newErrors.photo3 = "Photo is required";
      if (!data.step3.file) newErrors.file3 = "Document is required";
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
    if (!validateStep(3)) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const matched = Math.random() > 0.5;
      navigate("/result", { state: { data, matched } });
    }, 2000);
  };

  const InputField = ({ id, label, type = "text", value }) => (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => updateStep3({ [id]: e.target.value })}
      />
    </div>
  );
  const renderFilePreview = (file?: File | null) => {
    if (!file) return null;
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const url = URL.createObjectURL(file);
      return (
        <img
          src={url}
          alt="Uploaded preview"
          loading="lazy"
          className="h-28 w-28 rounded-md object-cover border border-border"
          onLoad={() => URL.revokeObjectURL(url)}
        />
      );
    }
    return (
      <div className="text-sm text-muted-foreground">
        Uploaded:{" "}
        <span className="font-medium text-foreground">{file.name}</span>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="border-b py-6  mb-10 sticky top-0 z-50 bg-background ">
        <header className="container  flex items-center justify-between  ">
          <div>
            <h1 className="text-lg md:text-2xl font-semibold">CGHS</h1>
            <p className="text-sm text-muted-foreground">
              Please complete all steps
            </p>
          </div>

          <Button
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              navigate("/");
            }}
          >
            Logout
          </Button>
        </header>
      </div>

      <section className="container max-w-4xl px-4 pb-16 space-y-6">
        {/* Progress */}
        <div className="rounded-xl border bg-card/60 p-4">
          <div className="mb-3 flex items-center justify-between text-sm font-medium">
            {steps.map((s) => (
              <div key={s.id} className=" flex items-center justify-between">
                <div
                  className={`flex justify-center items-center h-8 px-3 rounded-full border ${
                    current >= s.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Step {s.id}
                </div>
                {s.id !== steps.length && (
                  <div className="flex-1 h-px bg-border mx-2" />
                )}
              </div>
            ))}
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Card */}
        <Card className="shadow-lg rounded-xl bg-card/80 backdrop-blur-md border border-border">
          <CardHeader>
            <CardTitle className="text-xl">
              {steps[current - 1].label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div key={current} className="grid gap-6 animate-enter">
              {current === 1 && (
                <div className="grid gap-4">
                  {/* Top uploads for Step 1 */}
                  <div className="flex gap-2 p-1 rounded-lg w-fit">
                    {["ECHS", "Temporary Slip"].map((option) => (
                      <button
                        key={option}
                        onClick={() =>
                          setSelected(option as "ECHS" | "Temporary Slip")
                        }
                        className={`px-4 py-2 border rounded-2xl text-sm font-medium transition-all duration-200
            ${
              selected === option
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-gray-700 hover:bg-gray-200"
            }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  {selected === "ECHS" ? (
                    <>
                      <div>
                        <h3 className="text-sm font-medium mb-2">
                          Step 1 Uploads
                        </h3>
                        <div className="flex flex-col gap-3">
                          {/* <UploadTile
                        label="Upload Photo"
                        accept="image/*"
                        file={data.step1.serviceIdPhoto || null}
                        onChange={(f) => updateStep1({ serviceIdPhoto: f })}
                        hint="Service ID Photo (image)"
                      /> */}
                          <UploadTile
                            label="Upload Document"
                            accept="image/*,application/pdf"
                            file={data.step1.file || null}
                            onChange={(f) => updateStep1({ file: f })}
                            hint="Related document (PDF or image)"
                          />
                          <Button onClick={() => {}}>Check Image</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {errors.serviceIdPhoto && (
                            <p className="text-destructive text-sm">
                              {errors.serviceIdPhoto}
                            </p>
                          )}
                          {errors.file1 && (
                            <p className="text-destructive text-sm">
                              {errors.file1}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex gap-3">
                          {renderFilePreview(data.step1.serviceIdPhoto || null)}
                          {renderFilePreview(data.step1.file || null)}
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="serviceId">Card No.</Label>
                          <Input
                            id="serviceId"
                            value={data.step1.serviceId}
                            onChange={(e) =>
                              updateStep1({ serviceId: e.target.value })
                            }
                          />
                          {errors.serviceId && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.serviceId}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="date1">DOB</Label>
                          <Input
                            id="date1"
                            type="date"
                            value={data.step1.date}
                            onChange={(e) =>
                              updateStep1({ date: e.target.value })
                            }
                          />
                          {errors.date1 && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.date1}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="name">Patient Name</Label>
                          <Input
                            id="name"
                            value={data.step1.name}
                            onChange={(e) =>
                              updateStep1({ name: e.target.value })
                            }
                          />
                          {errors.name && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="department">ESM Name</Label>
                          <Input
                            id="department"
                            value={data.step1.department}
                            onChange={(e) =>
                              updateStep1({ department: e.target.value })
                            }
                          />
                          {errors.department && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.department}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="relationship">
                          Relationship with ESM
                        </Label>
                        <Input
                          id="relationship"
                          value={data.step1.relationship}
                          onChange={(e) =>
                            updateStep1({ relationship: e.target.value })
                          }
                        />
                        {errors.relationship && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.relationship}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Upload Section */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">
                          Step 1 Uploads
                        </h3>
                        <div className="flex flex-col gap-3">
                          <UploadTile
                            label="Upload Document"
                            accept="image/*,application/pdf"
                            file={data.step1Temporary?.file || null}
                            onChange={(f) => updateStep1Temporary({ file: f })}
                            hint="Related document (PDF or image)"
                          />
                          <Button onClick={() => {}}>Check Image</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {errors.file && (
                            <p className="text-destructive text-sm">
                              {errors.file}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex gap-3">
                          {renderFilePreview(data.step1Temporary?.file || null)}
                        </div>
                      </div>

                      {/* Fields */}
                      <div className="grid gap-2 sm:grid-cols-2 mt-4">
                        <div>
                          <Label htmlFor="name">Patient Name</Label>
                          <Input
                            id="name"
                            value={data.step1Temporary?.name}
                            onChange={(e) =>
                              updateStep1Temporary({ name: e.target.value })
                            }
                          />
                          {errors.name && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.name}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="esmName">ESM Name</Label>
                          <Input
                            id="esmName"
                            value={data.step1Temporary?.esmName}
                            onChange={(e) =>
                              updateStep1Temporary({ esmName: e.target.value })
                            }
                          />
                          {errors.esmName && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.esmName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="relationship">
                          Relationship with ESM
                        </Label>
                        <Input
                          id="relationship"
                          value={data.step1Temporary?.relationship}
                          onChange={(e) =>
                            updateStep1Temporary({
                              relationship: e.target.value,
                            })
                          }
                        />
                        {errors.relationship && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.relationship}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="serviceId">Service No.</Label>
                          <Input
                            id="serviceId"
                            value={data.step1Temporary?.serviceId}
                            onChange={(e) =>
                              updateStep1Temporary({
                                serviceId: e.target.value,
                              })
                            }
                          />
                          {errors.serviceId && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.serviceId}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="temporaryId">Temporary ID</Label>
                          <Input
                            id="temporaryId"
                            value={data.step1Temporary?.temporaryId}
                            onChange={(e) =>
                              updateStep1Temporary({
                                temporaryId: e.target.value,
                              })
                            }
                          />
                          {errors.temporaryId && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.temporaryId}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Input
                            id="category"
                            value={data.step1Temporary?.category}
                            onChange={(e) =>
                              updateStep1Temporary({ category: e.target.value })
                            }
                          />
                          {errors.category && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.category}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="date">DOB</Label>
                          <Input
                            id="date"
                            type="date"
                            value={data.step1Temporary?.date}
                            onChange={(e) =>
                              updateStep1Temporary({ date: e.target.value })
                            }
                          />
                          {errors.date && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.date}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="validUpto">Valid Upto</Label>
                        <Input
                          id="validUpto"
                          type="date"
                          value={data.step1Temporary?.validUpto}
                          onChange={(e) =>
                            updateStep1Temporary({ validUpto: e.target.value })
                          }
                        />
                        {errors.validUpto && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.validUpto}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="oicStamp"
                          checked={data.step1Temporary?.oicStamp}
                          onChange={(e) =>
                            updateStep1Temporary({ oicStamp: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                        <Label htmlFor="oicStamp">OIC Stamp</Label>
                      </div>
                    </>
                  )}
                </div>
              )}

              {current === 2 && (
                <div className="grid gap-4">
                  {/* Aadhaar Upload Section */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Aadhaar Card Upload
                    </h3>
                    <div className="flex flex-col gap-3">
                      <UploadTile
                        label="Upload Aadhaar Card"
                        accept="image/*,application/pdf"
                        file={data.step2.file || null}
                        onChange={(f) => updateStep2({ file: f })}
                        hint="Aadhaar card (PDF or image)"
                      />
                      <Button onClick={() => {}}>Check Image</Button>
                      {/* <UploadTile
                        label="Upload Passport-size Photo"
                        accept="image/*"
                        file={data.step2.photo || null}
                        onChange={(f) => updateStep2({ photo: f })}
                        hint="Optional passport-size photo"
                      /> */}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {errors.file2 && (
                        <p className="text-destructive text-sm">
                          {errors.file2}
                        </p>
                      )}
                      {errors.photo2 && (
                        <p className="text-destructive text-sm">
                          {errors.photo2}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex gap-3">
                      {renderFilePreview(data.step2.file || null)}
                      {renderFilePreview(data.step2.photo || null)}
                    </div>
                  </div>

                  {/* Aadhaar Details Fields */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                      <Input
                        id="aadhaarNumber"
                        value={data.step2.aadhaarNumber}
                        onChange={(e) =>
                          updateStep2({ aadhaarNumber: e.target.value })
                        }
                        placeholder="XXXX-XXXX-XXXX"
                      />
                      {errors.aadhaarNumber && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.aadhaarNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={data.step2.dob}
                        onChange={(e) => updateStep2({ dob: e.target.value })}
                      />
                      {errors.dob && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.dob}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="nameOnCard">Name (as per Aadhaar)</Label>
                    <Input
                      id="nameOnCard"
                      value={data.step2.nameOnCard}
                      onChange={(e) =>
                        updateStep2({ nameOnCard: e.target.value })
                      }
                      placeholder="Full name as on Aadhaar"
                    />
                    {errors.nameOnCard && (
                      <p className="text-destructive text-sm">
                        {errors.nameOnCard}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {current === 3 && (
                <div className="grid gap-4">
                  {/* Top uploads for Step 3 */}
                  <div>
                    <h3 className="text-sm font-medium mb-2">Step 3 Uploads</h3>
                    <div className="flex flex-col gap-3">
                      <UploadTile
                        label="Upload Document"
                        accept="image/*,application/pdf"
                        file={data.step3.file || null}
                        onChange={(f) => updateStep3({ file: f })}
                        hint="Final document (PDF or image)"
                      />
                      <Button onClick={() => {}}>Check Image</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {errors.file3 && (
                        <p className="text-destructive text-sm">
                          {errors.file3}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex gap-3">
                      {renderFilePreview(data.step3.photo || null)}
                      {renderFilePreview(data.step3.file || null)}
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <InputField
                      id="cardNo"
                      label="Card No."
                      value={data.step3.cardNo}
                    />
                    <InputField
                      id="serviceNo"
                      label="Service No."
                      value={data.step3.serviceNo}
                    />
                    <InputField
                      id="patientName"
                      label="Patient Name"
                      value={data.step3.patientName}
                    />
                    <InputField
                      id="category"
                      label="Category"
                      value={data.step3.category}
                    />
                    <InputField
                      id="doi"
                      label="DOI"
                      type="date"
                      value={data.step3.doi}
                    />
                    <InputField
                      id="noOfSessionsAllowed"
                      label="No. of Sessions Allowed"
                      value={data.step3.noOfSessionsAllowed}
                    />
                    <InputField
                      id="patientType"
                      label="Patient Type"
                      value={data.step3.patientType}
                    />
                    <InputField
                      id="pdSec"
                      label="PD Sec"
                      value={data.step3.pdSec}
                    />
                    <InputField
                      id="contactNo"
                      label="Contact No."
                      value={data.step3.contactNo}
                    />
                    <InputField id="age" label="Age" value={data.step3.age} />
                    <InputField
                      id="gender"
                      label="Gender"
                      value={data.step3.gender}
                    />
                    <InputField
                      id="validityUpto"
                      label="Validity Upto"
                      type="date"
                      value={data.step3.validityUpto}
                    />
                    <InputField
                      id="referralNo"
                      label="Referral No."
                      value={data.step3.referralNo}
                    />
                    <InputField
                      id="claimId"
                      label="Claim Id"
                      value={data.step3.claimId}
                    />

                    <div className="sm:col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={data.step3.notes}
                        onChange={(e) => updateStep3({ notes: e.target.value })}
                      />
                      {errors.notes && (
                        <p className="text-destructive text-sm">
                          {errors.notes}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="date3">Date</Label>
                      <Input
                        id="date3"
                        type="date"
                        value={data.step3.date}
                        onChange={(e) => updateStep3({ date: e.target.value })}
                      />
                      {errors.date3 && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.date3}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="secondary"
                  onClick={onBack}
                  disabled={current === 1 || submitting}
                >
                  Back
                </Button>
                <div className="flex items-center gap-2">
                  {current < 3 ? (
                    <Button
                      variant="secondary"
                      onClick={onSkip}
                      disabled={submitting}
                    >
                      Skip
                    </Button>
                  ) : (
                    <></>
                  )}
                  {current < 3 ? (
                    <Button onClick={onNext} disabled={submitting}>
                      Next
                    </Button>
                  ) : (
                    <Button onClick={onSubmit} disabled={submitting}>
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default FormWizard;
