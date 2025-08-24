import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/comp/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  CreditCard,
  Hospital,
  Activity,
  Clock,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface UserHistoryItem {
  _id: string;
  user_id: string;
  matched: boolean;
  echs_card_result_id?: string;
  created_at: string;
  aadhar_card?: {
    data?: {
      [key: string]: any;
    };
    id?: string;
    uploaded_at?: string;
  };
  echs_card_or_temporary_slip?: {
    data?: {
      [key: string]: any;
    };
    id?: string;
    uploaded_at?: string;
  };
  referral_letter?: {
    data?: {
      [key: string]: any;
    };
    id?: string;
    uploaded_at?: string;
  };
}

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<UserHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicketDetail = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const userId = localStorage.getItem("user_id");
        const res = await fetch(
          `http://localhost:8000/admin/user_history/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        const foundTicket = data.history.find(
          (item: UserHistoryItem) => item._id === id
        );
        setTicket(foundTicket || null);
      } catch (err) {
        console.error("Error fetching ticket detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetail();
  }, [id]);

  const [openSections, setOpenSections] = useState({
    aadhar: true,
    echs: false,
    referral: false,
  });

  const toggleSection = (section: "aadhar" | "echs" | "referral") => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const fetchTicketDetail = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const userId = localStorage.getItem("user_id");
        const res = await fetch(
          `http://localhost:8000/admin/user_history/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        const foundTicket = data.history.find(
          (item: UserHistoryItem) => item._id === id
        );
        setTicket(foundTicket || null);
      } catch (err) {
        console.error("Error fetching ticket detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetail();
  }, [id]);

  const formatDataField = (key: string, value: any) => {
    if (typeof value !== "string" && typeof value !== "number") return null;
    return (
      <div
        key={key}
        className="flex justify-between items-center py-2 border-b border-border/30 last:border-b-0"
      >
        <span className="text-sm font-medium text-muted-foreground capitalize">
          {key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
          :
        </span>
        <span className="font-medium text-foreground">{String(value)}</span>
      </div>
    );
  };

  if (!ticket || loading) return null;

  const getStatusBadge = (matched: boolean) => {
    return matched ? (
      <Badge className="bg-success/10 text-success border-success/20 px-3 py-1">
        <CheckCircle2 className="w-4 h-4 mr-1" />
        Verified & Matched
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1"
      >
        <XCircle className="w-4 h-4 mr-1" />
        Verification Failed
      </Badge>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading ticket details...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <FileText className="w-16 h-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground">
              Ticket Not Found
            </h2>
            <p className="text-muted-foreground text-center">
              The requested ticket could not be found or you don't have access
              to it.
            </p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="md:container mx-auto md:p-6 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col  md:flex-row md:justify-between md:items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Ticket Details
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                ID: {ticket._id}
              </p>
            </div>
          </div>

          {/* Status Overview */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="text-sm md:text-lg p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-base md:text-xl ">
                    {" "}
                    Verification Status
                  </div>
                </CardTitle>
                {getStatusBadge(ticket.matched)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {new Date(ticket.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Documents</p>
                    <p className="font-medium">
                      {
                        [
                          ticket.aadhar_card && "Aadhaar",
                          ticket.echs_card_or_temporary_slip && "ECHS",
                          ticket.referral_letter && "Referral",
                        ].filter(Boolean).length
                      }{" "}
                      uploaded
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Details */}
          <div className="md:container mx-auto md:p-6 px-2 space-y-6 ">
            {/* Aadhaar Card */}
            {ticket.aadhar_card?.data && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex justify-between items-left">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    Aadhaar Card
                  </CardTitle>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection("aadhar")}
                    >
                      {openSections.aadhar ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {openSections.aadhar && (
                  <CardContent className="space-y-1">
                    {Object.entries(ticket.aadhar_card.data).map(([k, v]) =>
                      formatDataField(k, v)
                    )}
                    {ticket.aadhar_card.uploaded_at && (
                      <p className="pt-3 mt-3 border-t text-xs text-muted-foreground">
                        Uploaded:{" "}
                        {new Date(
                          ticket.aadhar_card.uploaded_at
                        ).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* ECHS Card */}
            {ticket.echs_card_or_temporary_slip?.data && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex justify-between items-left">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                      <Hospital className="w-5 h-5 text-white" />
                    </div>
                    ECHS Card
                  </CardTitle>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection("echs")}
                    >
                      {openSections.echs ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {openSections.echs && (
                  <CardContent className="space-y-1">
                    {Object.entries(
                      ticket.echs_card_or_temporary_slip.data
                    ).map(([k, v]) => formatDataField(k, v))}
                    {ticket.echs_card_or_temporary_slip.uploaded_at && (
                      <p className="pt-3 mt-3 border-t text-xs text-muted-foreground">
                        Uploaded:{" "}
                        {new Date(
                          ticket.echs_card_or_temporary_slip.uploaded_at
                        ).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Referral Letter */}
            {ticket.referral_letter?.data && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="flex justify-between items-left">
                  <CardTitle className="flex  items-left gap-3 text-lg">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    Referral Letter
                  </CardTitle>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection("referral")}
                    >
                      {openSections.referral ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {openSections.referral && (
                  <CardContent className="space-y-1">
                    {Object.entries(ticket.referral_letter.data).map(([k, v]) =>
                      formatDataField(k, v)
                    )}
                    {ticket.referral_letter.uploaded_at && (
                      <p className="pt-3 mt-3 border-t text-xs text-muted-foreground">
                        Uploaded:{" "}
                        {new Date(
                          ticket.referral_letter.uploaded_at
                        ).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketDetail;
