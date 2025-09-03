import Navbar from "@/components/comp/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Activity,
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
      "Aadhaar No"?: string;
      Name?: string;
      "Date of Birth"?: string;
      Gender?: string;
    };
    id?: string;
    uploaded_at?: string;
  };
  echs_card_or_temporary_slip?: {
    data?: {
      [key: string]: any;
      "Card No"?: string;
      "Patient Name"?: string;
      ESM?: string;
      DOB?: string;
      "Relationship with ESM"?: string;
    };
    id?: string;
    uploaded_at?: string;
  };
  referral_letter?: {
    data?: {
      [key: string]: any;
      "Name of Patient"?: string;
      "Referral No"?: string;
      "Valid Upto"?: string;
      "Date of Issue"?: string;
      "No of Sessions Allowed"?: string;
    };
    id?: string;
    uploaded_at?: string;
  };
}

const Dashboard = () => {
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    matched: 0,
    unmatched: 0,
    recent: 0,
  });
  const navigate = useNavigate();
  console.log(history," this is hostoery ")

  useEffect(() => {
    const fetchHistory = async () => {
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
        console.log("Fetched history:", data);
        setHistory(data.history.reverse()); // Show latest first

        // Calculate stats
        const total = data.history.length;
        const matched = data.history.filter(
          (item: UserHistoryItem) => item.matched
        ).length;
        const unmatched = total - matched;
        const recent = data.history.filter((item: UserHistoryItem) => {
          const itemDate = new Date(item.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return itemDate > weekAgo;
        }).length;

        setStats({ total, matched, unmatched, recent });
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getPatientName = (item: UserHistoryItem) => {
    return (
      item?.aadhar_card?.data?.Name ||
      item?.echs_card_or_temporary_slip?.data?.["Patient Name"] ||
      item?.referral_letter?.data?.["Claim ID"] ||
      "Unknown Patient"
    );
  };
  const getClaimID = (item: UserHistoryItem) => {
    return (
     
      item?.referral_letter?.data?.["Claim ID"] ||
      "NOT PROVIDED"
    );
  };

  const getStatusIcon = (matched: boolean) => {
    return matched ? (
      <CheckCircle2 className="w-5 h-5 text-success" />
    ) : (
      <XCircle className="w-5 h-5 text-destructive" />
    );
  };

  const getStatusBadge = (matched: boolean) => {
    return matched ? (
      <Badge className="bg-success/10 text-success border-success/20">
        ✓ Verified
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-destructive/10 text-destructive border-destructive/20"
      >
        ⚠ Unmatched
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
              <p className="text-muted-foreground">
                Loading patient records...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-lg md:text-2xl">
                {" "}
                Patient Records Dashboard{" "}
              </div>
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground">
              Monitor and verify patient document submissions
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Records
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {stats.total}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-primary/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-success/5 to-success/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Verified
                    </p>
                    <p className="text-2xl font-bold text-success">
                      {stats.matched}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-success/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-destructive/5 to-destructive/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Unmatched
                    </p>
                    <p className="text-2xl font-bold text-destructive">
                      {stats.unmatched}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-destructive/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-warning/5 to-warning/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      This Week
                    </p>
                    <p className="text-2xl font-bold text-warning">
                      {stats.recent}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-warning/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Records List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Recent Submissions
              </h2>
              <p className="text-sm text-muted-foreground">
                {history.length} total records
              </p>
            </div>

            <div className="grid gap-4">
              {history.map((item) => (
                <Card
                  key={item._id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm bg-card/80 backdrop-blur-sm"
                  onClick={() => navigate(`/ticket/${item._id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-3">
                        {getStatusIcon(item.matched)}
                        <div>
                          <p className="font-semibold">
                            {getPatientName(item)}
                          </p>
                        
                          <p className="text-sm font-normal text-muted-foreground">
                            ID: {item._id.slice(-8)}
                          </p>
                        </div>
                      </CardTitle>
                      <p  className="font-medium">
                          Claim ID: {getClaimID(item)}
                          </p>
                      {getStatusBadge(item.matched)}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Patient:</span>
                        <span className="font-medium">
                          {getPatientName(item)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Submitted:
                        </span>
                        <span className="font-medium">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Documents:
                        </span>
                        <span className="font-medium">
                          {[
                            item.aadhar_card && "Aadhaar",
                            item.echs_card_or_temporary_slip && "ECHS",
                            item.referral_letter && "Referral",
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        Last updated:{" "}
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary"
                      >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {history.length === 0 && (
                <Card className="border-dashed border-2 border-muted">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No records found
                    </h3>
                    <p className="text-muted-foreground text-center">
                      Patient document submissions will appear here once they
                      are uploaded.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
