import Navbar from "@/components/comp/Navbar";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface UserHistoryItem {
  _id: string;
  user_id: string;
  matched: boolean;
  echs_card_result_id?: string;
  created_at: string;
  aadhar_card?: {
    data?: Record<string, any>;
    id?: string;
    uploaded_at?: string;
  };
  echs_card_or_temporary_slip?: {
    data?: Record<string, any>;
    id?: string;
    uploaded_at?: string;
  };
  referral_letter?: {
    data?: Record<string, any>;
    id?: string;
    uploaded_at?: string;
  };
}

const TicketDetail = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<UserHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `http://localhost:8000/admin/ticket/${ticketId}`, // ✅ your detail API
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        console.log("Fetched ticket detail:", data);
        setTicket(data);
      } catch (err) {
        console.error("Error fetching ticket:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [ticketId]);

  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (!ticket) return <p className="text-center py-6">No ticket found.</p>;

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">
          Ticket Details - {ticket._id}
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>General Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>User ID:</strong> {ticket.user_id}
            </p>
            <p>
              <strong>Matched:</strong> {ticket.matched ? "✅ Yes" : "❌ No"}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(ticket.created_at).toLocaleString()}
            </p>
            <p>
              <strong>ECHS Card Result ID:</strong>{" "}
              {ticket.echs_card_result_id || "N/A"}
            </p>
          </CardContent>
        </Card>

        {ticket.aadhar_card && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Aadhar Card</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.aadhar_card.data &&
                Object.entries(ticket.aadhar_card.data).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}:</strong> {String(value)}
                  </p>
                ))}
            </CardContent>
          </Card>
        )}

        {ticket.echs_card_or_temporary_slip && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>ECHS Card / Temporary Slip</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.echs_card_or_temporary_slip.data &&
                Object.entries(ticket.echs_card_or_temporary_slip.data).map(
                  ([key, value]) => (
                    <p key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </p>
                  )
                )}
            </CardContent>
          </Card>
        )}

        {ticket.referral_letter && (
          <Card>
            <CardHeader>
              <CardTitle>Referral Letter</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.referral_letter.data &&
                Object.entries(ticket.referral_letter.data).map(
                  ([key, value]) => (
                    <p key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </p>
                  )
                )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default TicketDetail;
