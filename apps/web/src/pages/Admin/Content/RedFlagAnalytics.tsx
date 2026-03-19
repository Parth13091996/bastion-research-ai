import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { redFlagApi, type RedFlagCompanyStats } from "@/api/red-flag-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Plus } from "lucide-react";
import { RED_FLAG_QUESTIONS, type RedFlagQuestionKey } from "@/config/redFlagQuestions";

const getQuestionLabel = (key: string) =>
  (RED_FLAG_QUESTIONS as Partial<Record<RedFlagQuestionKey, { name: string }>>)[
    key as RedFlagQuestionKey
  ]?.name ?? key;

const RedFlagAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<RedFlagCompanyStats[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await redFlagApi.admin.getStats();
      setStats(data);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    const name = newCompanyName.trim();
    if (!name) return;
    try {
      await redFlagApi.admin.createCompany(name);
      toast.success("Company created");
      setNewCompanyName("");
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to create company");
    }
  };

  const rows = useMemo(() => {
    return [...stats].sort((a, b) =>
      a.company.name.localeCompare(b.company.name)
    );
  }, [stats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Red Flag Analytics</h1>
          <p className="text-muted-foreground">
            Company-wise flagged questions and unique user frequency
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={load}
          disabled={loading}
          className="text-white"
        >
          <RefreshCw className="mr-2 h-4 w-4 text-white" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Company</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 max-w-xl">
            <Input
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              placeholder="e.g. PB Fintech"
            />
            <Button onClick={handleCreate} disabled={!newCompanyName.trim()}>
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Flagged Questions</TableHead>
                <TableHead className="text-right">Users Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    {loading ? "Loading..." : "No companies found"}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.company.id}>
                    <TableCell className="font-medium">{r.company.name}</TableCell>
                    <TableCell>
                      {r.flaggedQuestions.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div className="space-y-1">
                          {r.flaggedQuestions.map((fq) => (
                            <div key={fq.key} className="flex items-start gap-2">
                              <span className="text-sm">{getQuestionLabel(fq.key)}</span>
                              <span className="text-sm text-muted-foreground">
                                — {fq.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{r.usersFrequency}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedFlagAnalytics;

