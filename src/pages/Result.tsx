import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FormDataAll } from "@/store/formStore";
import Image1 from "@/assets/Cooreecr.png";
import Image2 from "@/assets/Screenshot 2025-08-12 at 3.18.25 PM.png";

interface LocationState {
  data: FormDataAll;
  matched: boolean;
}

const Result = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  useEffect(() => {
    document.title = "Result | ECHS";
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") navigate("/");
  }, [navigate]);

  if (!state) {
    navigate("/form");
    return null;
  }

  const clearAllData = () => {
    localStorage.removeItem("formData");
    navigate("/form");
  };

  const { data, matched } = state;

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="container py-6 flex items-center justify-between">
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
      <section className="container max-w-3xl py-10 px-4">
        <Card className="shadow-lg rounded-xl bg-card/80 backdrop-blur-md border border-border animate-enter">
          <CardHeader>
            <CardTitle className="text-xl">Verification Result</CardTitle>
            <p className="text-sm text-muted-foreground">
              Summary of your submission
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {matched ? (
              <>
                <img src={Image1} />
              </>
            ) : (
              <>
                {" "}
                <div className="flex justify-center mb-4">
                  <img src={Image2} className="w-4/6 h-2/6" />
                </div>
              </>
            )}
            <div
              className={`rounded-lg p-4 border ${
                matched
                  ? "bg-green-50/60 border-green-400 text-green-700"
                  : "bg-red-50/60 border-red-400 text-red-700"
              }`}
            >
              <p className="font-medium">
                {matched ? "Information Matched" : "Information Not Matched"}
              </p>
              <p className="text-sm opacity-90">
                {matched
                  ? "All provided details are consistent."
                  : "Some discrepancies were detected in the submitted information."}
              </p>
            </div>

            <div className="grid gap-4 mt-2">
              <h2 className="text-lg font-semibold">Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-md border p-3">
                  <h3 className="font-medium mb-2">Step 1</h3>
                  <ul className="text-sm space-y-1">
                    <li>
                      <span className="text-muted-foreground">Name:</span>{" "}
                      {data.step1.name}
                    </li>
                    <li>
                      <span className="text-muted-foreground">Department:</span>{" "}
                      {data.step1.department}
                    </li>
                    <li>
                      <span className="text-muted-foreground">Service ID:</span>{" "}
                      {data.step1.serviceId}
                    </li>
                    <li>
                      <span className="text-muted-foreground">Date:</span>{" "}
                      {data.step1.date}
                    </li>
                    {data.step1.serviceIdPhoto && (
                      <li>
                        <span className="text-muted-foreground">ID Photo:</span>{" "}
                        {data.step1.serviceIdPhoto.name}
                      </li>
                    )}
                  </ul>
                </div>
                <div className="rounded-md border p-3">
                  <h3 className="font-medium mb-2">Step 2</h3>
                  <ul className="text-sm space-y-1">
                    <li>
                      <span className="text-muted-foreground">
                        Aadhaar Number:
                      </span>{" "}
                      {data.step2.aadhaarNumber}
                    </li>
                    <li>
                      <span className="text-muted-foreground">
                        Name on Card:
                      </span>{" "}
                      {data.step2.nameOnCard}
                    </li>
                    <li>
                      <span className="text-muted-foreground">
                        Date of Birth:
                      </span>{" "}
                      {data.step2.dob}
                    </li>
                    {data.step2.file && (
                      <li>
                        <span className="text-muted-foreground">
                          Aadhaar Card:
                        </span>{" "}
                        {data.step2.file.name}
                      </li>
                    )}
                  </ul>
                </div>
                <div className="rounded-md border p-3 sm:col-span-2">
                  <h3 className="font-medium mb-2">Step 3</h3>
                  <ul className="text-sm space-y-1">
                    <li>
                      <span className="text-muted-foreground">Notes:</span>{" "}
                      {data.step3.notes}
                    </li>
                    <li>
                      <span className="text-muted-foreground">Date:</span>{" "}
                      {data.step3.date}
                    </li>
                    <li className="truncate">
                      <span className="text-muted-foreground">File:</span>{" "}
                      {data.step3.file?.name}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => clearAllData()}>
                New Submission
              </Button>
              {/* <Button
                onClick={() => {
                  localStorage.removeItem("isLoggedIn");
                  navigate("/");
                }}
              >
                Logout
              </Button> */}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Result;
