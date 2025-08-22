import Navbar from "@/components/comp/Navbar";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserHistoryItem {
  _id: string;
  user_id: string;
  matched: boolean;
  echs_card_result_id?: string;
  created_at: string;
  aadhar_card?: {
    data?: {
      [key: string]: any;
      AadhaarNo?: string;
      Name?: string;
      DateofBirth?: string;
      Gender?: string;
    };
    id?: string;
    uploaded_at?: string;
  };
  echs_card_or_temporary_slip?: {
    data?: {
      [key: string]: any;
      CardNo?: string;
      PatientName?: string;
      ESM?: string;
      DOB?: string;
      RelationshipwithESM?: string;
    };
    id?: string;
    uploaded_at?: string;
  };
  referral_letter?: {
    data?: {
      [key: string]: any;
      NameofPatient?: string;
      ReferralNo?: string;
      ValidUpto?: string;
      DateofIssue?: string;
      NoofSessionsAllowed?: string;
    };
    id?: string;
    uploaded_at?: string;
  };
}

const Dashboard = () => {
  const [history, setHistory] = useState<UserHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        setHistory(data.history);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <p className="text-center py-6">Loading...</p>;

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">User History</h1>
        <div className="grid gap-4">
          {history.map((item) => (
            <Card
              key={item._id}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(`/admin/user_history/ticket/${item._id}`)}
            >
              <CardHeader>
                <CardTitle>Ticket ID: {item._id}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Patient Name:</strong>{" "}
                  {item?.aadhar_card.data.Name || "N/A"}
                </p>
                <p>
                  <strong>Matched:</strong>{" "}
                  {item.matched ? " Matched" : "Not Matched"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
