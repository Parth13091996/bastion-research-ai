import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { researchApi } from "@/api/content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type Research = {
  id: string;
  created_at: string;
  company: string;
  coverage_initiation_date?: string;
  sector?: string;
  action?: string;
  comments?: string;
  percent_return_since_recommendation?: number;
  percent_irr_potential_from_cmp?: number;
  research_material_url?: string;
};

function PDFViewer({ pdfUrl }: { pdfUrl: string }) {
  // Optionally, you can add a loading state for the iframe
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex flex-col items-center py-4">
      {loading && (
        <div className="p-4">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <iframe
        src={pdfUrl}
        title="PDF Viewer"
        width="100%"
        height="700px"
        style={{
          border: 0,
          borderRadius: 8,
          display: loading ? "none" : "block",
        }}
        onLoad={() => setLoading(false)}
        allow="autoplay"
      />
    </div>
  );
}

const SingleResearchPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Research | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await researchApi.getById(id!);
      setItem(data);
    } catch (e) {
      toast.error("Failed to load research");
      navigate("/research");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Research not found</h1>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-secondary">{item.company}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {item.coverage_initiation_date
                    ? format(
                        new Date(item.coverage_initiation_date),
                        "MMMM dd, yyyy"
                      )
                    : item.created_at
                      ? format(new Date(item.created_at), "MMMM dd, yyyy")
                      : ""}
                </span>
              </div>
              <CardTitle className="text-2xl">{item.company}</CardTitle>
              {item.sector && (
                <p className="text-gray-600">Sector: {item.sector}</p>
              )}
            </CardHeader>
          </Card>

          {item.research_material_url ? (
            <Card>
              <CardHeader>
                <CardTitle>Research Material</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <PDFViewer pdfUrl={item.research_material_url} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-6 text-gray-600">
                No research material uploaded.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Action:</span>{" "}
                {item.action || "-"}
              </div>
              <div>
                <span className="text-gray-500">
                  % Return since Recommendation:
                </span>{" "}
                {item.percent_return_since_recommendation ?? "-"}
              </div>
              <div>
                <span className="text-gray-500">% IRR Potential from CMP:</span>{" "}
                {item.percent_irr_potential_from_cmp ?? "-"}
              </div>
              {item.comments && (
                <div className="pt-2">
                  <div className="text-gray-500">Comments:</div>
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {item.comments}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SingleResearchPage;
