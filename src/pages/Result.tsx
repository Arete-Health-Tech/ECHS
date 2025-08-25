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
import type { FormDataAll } from "@/store/formStore";
import Image1 from "@/assets/Cooreecr.png";
import Image2 from "@/assets/Screenshot 2025-08-12 at 3.18.25 PM.png";
import Navbar from "@/components/comp/Navbar";
import { Badge } from "@/components/ui/badge";

interface LocationState {
  data: FormDataAll;
  matched: boolean;
}

const Result = () => {
  const [selected, setSelected] = useState<"ECHS" | "Temporary Slip">("ECHS");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    step1: false,
    step1Temporary: false,
    step2: false,
    step3: false,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const data = state?.data; // ✅ use data from location
  const [Matched, setMatched] = useState<boolean>(false);

  const toggleSection = (step: keyof FormDataAll) => {
    setExpanded((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  const renderDetails = (obj: Record<string, any> | undefined | null) => {
    if (!obj)
      return <div className="text-sm text-gray-500">No data available.</div>;

    return Object.entries(obj).map(([key, value]) => {
      // Skip file or photo fields
      if (key === "file" || key === "file") return null;
      if (key === "photo" || key === "photo") return null;
      if (key === "_id" || key === "_id") return null;

      return (
        <div
          key={key}
          className="flex justify-between border-b py-2 md:py-3 text-sm"
        >
          <span className="font-medium capitalize text-[12px] md:text-[16px]">
            {key}:
          </span>
          <span className="text-gray-700 text-right text-[10px] md:text-[16px]">
            {value ? String(value) : ""}
          </span>
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

  // Comparisons
  const comparisons = useMemo(() => {
    if (!data) return null;

    const step1Name = data.step1?.name || data.step1Temporary?.name;
    const step2Name = data.step2?.nameOnCard;
    const step3Name = data.step3?.patientName;

    const step1Gender =
      data.step1?.category || data.step1Temporary?.category || "";
    const step2Gender = data.step2?.gender || "";
    const step3Gender = data.step3?.gender || "";

    const step1Age = data.step1?.date
      ? calculateAge(data.step1.date)
      : data.step1Temporary?.date
      ? calculateAge(data.step1Temporary.date)
      : undefined;

    const step2Age = data.step2?.dob ? calculateAge(data.step2.dob) : undefined;
    const step3Age = data.step3?.age ? Number(data.step3.age) : undefined;

    const isNameMatched =
      step1Name &&
      step2Name &&
      step3Name &&
      step1Name.trim().toLowerCase() === step2Name.trim().toLowerCase() &&
      step1Name.trim().toLowerCase() === step3Name.trim().toLowerCase();

    const isGenderMatched =
      step1Gender &&
      step2Gender &&
      step3Gender &&
      step1Gender.trim().toLowerCase() === step2Gender.trim().toLowerCase() &&
      step1Gender.trim().toLowerCase() === step3Gender.trim().toLowerCase();

    const isAgeMatched =
      step1Age !== undefined &&
      step2Age !== undefined &&
      step3Age !== undefined &&
      Number(step1Age) === Number(step2Age) &&
      Number(step1Age) === Number(step3Age);

    return {
      step1Name,
      step2Name,
      step3Name,
      step1Gender,
      step2Gender,
      step3Gender,
      step1Age,
      step2Age,
      step3Age,
      isNameMatched,
      isGenderMatched,
      isAgeMatched,
      allMatched: isNameMatched && isGenderMatched && isAgeMatched,
    };
  }, [data]);

  const submitRequest = async (matched: boolean) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/submit_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ matched }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to submit request");
      }

      return await res.json();
    } catch (err) {
      console.error("Error submitting request:", err);
      throw err;
    }
  };

  useEffect(() => {
    document.title = "Result | ECHS";
    console.log(data);
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") navigate("/");

    if (comparisons) {
      setMatched(comparisons.allMatched);
    }
    submitRequest(comparisons.allMatched);
  }, [navigate, comparisons]);

  if (!data) {
    navigate("/form");
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <Navbar />

      <div className="container flex flex-row justify-between">
        <div
          className="border rounded-sm bg-muted/50 backdrop-blur-md p-4 mb-6 text-center cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={() => {
            navigate("/form");
            setMatched(false);
            data.step1 = {
              ...data.step1,
              name: "",
              serviceId: "",
              date: "",
              serviceIdPhoto: null,
              file: null,
              category: undefined,
            };
            data.step1Temporary = {
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
            };
          }}
        >
          New Submission
        </div>
        <Button
          // onClick={handleValidateAgain}
          className="gap-2 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
          // disabled={isEditing}
        >
          <RotateCcw className="h-4 w-4" />
          Validate Again
        </Button>
      </div>

      <section className="container max-w-5xl py-10 ">
        <Card className="shadow-sm rounded-xl bg-card/80 backdrop-blur-md border border-border animate-enter">
          <div className="flex items-center justify-center gap-3 p-6">
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
          </div>
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
                      ECHS Card
                    </th>
                    <th className="text-left p-2 border text-[10px] md:text-[14px]">
                      Aadhaar Card
                    </th>
                    <th className="text-left p-2 border text-[10px] md:text-[14px]">
                      Referral Letter
                    </th>
                    <th className="text-left p-2 border text-[10px] md:text-[14px]">
                      Match
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
                    <td className="p-2 border  text-[10px] md:text-[14px]">
                      {comparisons.isNameMatched ? (
                        <Check className="text-green-600 inline" />
                      ) : (
                        <X className="text-red-600 inline" />
                      )}
                    </td>
                  </tr>

                  {/* Gender */}
                  <tr>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      Gender
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step1Gender || "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step2Gender || "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step3Gender || "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.isGenderMatched ? (
                        <Check className="text-green-600 inline" />
                      ) : (
                        <X className="text-red-600 inline" />
                      )}
                    </td>
                  </tr>

                  {/* Age */}
                  <tr>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      Age
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step1Age ?? "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step2Age ?? "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.step3Age ?? "-"}
                    </td>
                    <td className="p-2 border text-[10px] md:text-[14px]">
                      {comparisons.isAgeMatched ? (
                        <Check className="text-green-600 inline" />
                      ) : (
                        <X className="text-red-600 inline" />
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      {/* Step Sections */}
      <section className=" container  max-w-5xl pb-20  space-y-6">
        <Card>
          <CardHeader
            className="flex justify-between cursor-pointer"
            onClick={() => toggleSection("step1")}
          >
            <CardTitle className="text-base">Step 1 - ECHS Card</CardTitle>
            {expanded.step1 ? <ChevronUp /> : <ChevronDown />}
          </CardHeader>
          {expanded.step1 && (
            <CardContent>{renderDetails(data.step1)}</CardContent>
          )}
        </Card>

        {data.step1Temporary.name && (
          <Card>
            <CardHeader
              className="flex justify-between cursor-pointer"
              onClick={() => toggleSection("step1Temporary")}
            >
              <CardTitle className="text-base">
                Step 1 - Temporary Slip
              </CardTitle>
              {expanded.step1Temporary ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>
            {expanded.step1Temporary && (
              <CardContent>{renderDetails(data.step1Temporary)}</CardContent>
            )}
          </Card>
        )}

        <Card>
          <CardHeader
            className="flex justify-between cursor-pointer"
            onClick={() => toggleSection("step2")}
          >
            <CardTitle className="text-base">Step 2 - Aadhaar Card</CardTitle>
            {expanded.step2 ? <ChevronUp /> : <ChevronDown />}
          </CardHeader>
          {expanded.step2 && (
            <CardContent>{renderDetails(data.step2)}</CardContent>
          )}
        </Card>

        <Card>
          <CardHeader
            className="flex justify-between cursor-pointer"
            onClick={() => toggleSection("step3")}
          >
            <CardTitle className="text-base">
              Step 3 - Referral Letter
            </CardTitle>
            {expanded.step3 ? <ChevronUp /> : <ChevronDown />}
          </CardHeader>
          {expanded.step3 && (
            <CardContent>{renderDetails(data.step3)}</CardContent>
          )}
        </Card>
      </section>
    </main>
  );
};

export default Result;
