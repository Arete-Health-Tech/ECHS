import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
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

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
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
          <Button variant="ghost" onClick={() => navigate("/form")}>
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
        <div className="md:hidden">
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
