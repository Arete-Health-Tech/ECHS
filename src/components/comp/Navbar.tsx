import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DownloadCloudIcon, Menu, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFormStore } from "@/store/formStore";

type FlattenedRow = Record<string, unknown>;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { data, updateStep1, updateStep2, updateStep3, updateStep4, updateStep1Temporary } =
    useFormStore();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.setItem("isLoggedIn", "false");
    localStorage.setItem("user_name", "");
    localStorage.setItem("user_phone", "");
    localStorage.setItem("user_id", "");
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
    updateStep1Temporary({
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
      oicStamp: false
    });
    updateStep2({
      _id: "",
      gender: "",
      aadhaarNumber: "",
      nameOnCard: "",
      dob: "",
      file: null,
      photo: null,
    });

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
    updateStep4({
      _id: "",
      patientName: "",
      age: "",
      diagnosis: "",
      advice: "",
      treatment_plan: "",
      // medication: [],
      file: null,
    })

    navigate("/login");
  };

  const handleUploadDocs = () => {
    // Clear all form states before navigating
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
  
    updateStep1Temporary({
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
      oicStamp: false
    });
  
    updateStep2({
      _id: "",
      gender: "",
      aadhaarNumber: "",
      nameOnCard: "",
      dob: "",
      file: null,
      photo: null,
    });
  
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
  
    updateStep4({
      _id: "",
      patientName: "",
      age: "",
      diagnosis: "",
      advice: "",
      treatment_plan: "",
      file: null,
    });
  
    navigate("/form");
  };
  
  const fetchAndOpenCSV = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("https://echs.aretehealth.tech/echs_data", {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json();

      const data = json.echs_data;
      if (!data || !data.length) {
        console.log("No data to download!");
        return;
      }

      // Flatten each object: merge echs_data + referral_letter_data + top-level
      const flattened: FlattenedRow[] = data.map(row => ({
        echs_upload_date: row.echs_upload_date,
        refferal_upload_date: row.refferal_upload_date,
        echs_img: row.echs_img,
        refferal_img: row.refferal_img,
        ...row.echs_data,
        ...row.referral_letter_data,
      }));

      // Map for renaming headers
      const headerMap = {
        echs_upload_date: "ECHS Upload Date",
        refferal_upload_date: "Refferal Upload Date",
        echs_img: "ECHS Image",
        refferal_img: "Refferal Image",
        // Add more custom mappings here if needed
      };

      // Get all unique keys for CSV headers
      const headers = [...new Set(flattened.flatMap(obj => Object.keys(obj)))];

      // Convert to CSV string
      let csv = headers.map(h => headerMap[h] || h).join(",") + "\n";

      flattened.forEach(row => {
        const values = headers.map(h => {
          let val = row[h] ?? "";

          // Replace empty with "-"
          if (val === "") {
            val = "-";
          }

          // Format ISO date → dd-mm-yyyy
          if (typeof val === "string" && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
            const d = new Date(val);
            val = `${String(d.getDate()).padStart(2, "0")}-${String(
              d.getMonth() + 1
            ).padStart(2, "0")}-${d.getFullYear()}`;
          }

          // Make image links clickable
          if (
            h.toLowerCase().includes("img") ||
            h.toLowerCase().includes("image")
          ) {
            if (val !== "-" && val !== "") {
              val = `=HYPERLINK("${val}", "View Image")`;
            }
          }

          // Escape quotes/commas if needed
          if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
            val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        });

        csv += values.join(",") + "\n";
      });

      // Save as CSV
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "echs_data.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Failed to download CSV:", error);
    }
  };


  return (
    <header className="w-full bg-white shadow-sm border-b sticky top-0 z-50 mb-12 py-2">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div>
          <h1 className="text-lg md:text-2xl font-semibold">ECHS</h1>
          <p className="text-sm text-muted-foreground">
            Please complete all steps
          </p>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-4">
          {/* <Button variant="ghost" onClick={fetchAndOpenCSV}>
            Download
            <DownloadCloudIcon
              className="cursor-pointer"
            />
          </Button> */}
          <Button variant="ghost" onClick={handleUploadDocs}>
            Upload Docs
          </Button>
          <Button variant="ghost" onClick={() => navigate("/history")}>
            History
          </Button>
          {/* <Button variant="ghost" onClick={() => navigate("/profile")}>
            Profile
          </Button> */}

          {/* Logout with confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default">Logout</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will log you out from the application.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </nav>

        {/* Mobile Toggle Button */}
        <div className="md:hidden flex items-center gap-2">
          {/* <div>
            <DownloadCloudIcon
              className="cursor-pointer"
              onClick={fetchAndOpenCSV}
            />
          </div> */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-800 focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-md">
          <nav className="flex flex-col p-4 gap-2">
          {/* <Button variant="ghost" onClick={fetchAndOpenCSV}>
            Download
            <DownloadCloudIcon
              className="cursor-pointer"
            />
          </Button> */}
            <Button variant="ghost" onClick={() => navigate("/form")}>
              Upload Docs
            </Button>
            <Button variant="ghost" onClick={() => navigate("/history")}>
              History
            </Button>
            <Button variant="ghost" onClick={() => navigate("/profile")}>
              Profile
            </Button>

            {/* Mobile Logout with confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Logout</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will log you out from the application.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Logout
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
