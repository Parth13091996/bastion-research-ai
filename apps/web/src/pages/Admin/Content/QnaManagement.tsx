import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  answerQnaQuestion,
  clearQnaAnswer,
  deleteQnaQuestion,
  getAdminQnaQuestions,
  type QnaQuestion,
  type QnaStatus,
} from "@/api/qna-api";
import { queryKeys } from "@/api/queryKeys";
import { useSectionEditAccess } from "@/hooks/use-section-edit-access";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircleQuestion, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { confirmDelete } from "@/utils/confirm";

const tabs: Array<"all" | QnaStatus> = ["all", "pending", "answered"];

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StatusBadge({ status }: { status: QnaStatus }) {
  return (
    <Badge
      className={
        status === "answered"
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
          : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
      }
      variant="outline"
    >
      {status === "answered" ? "Answered" : "Pending"}
    </Badge>
  );
}

export default function QnaManagement() {
  const queryClient = useQueryClient();
  const { canEdit } = useSectionEditAccess("content_qna");
  const [activeTab, setActiveTab] = useState<"all" | QnaStatus>("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: [queryKeys.qna, "admin"],
    queryFn: () => getAdminQnaQuestions(),
  });

  const answerMutation = useMutation({
    mutationFn: ({ id, answer }: { id: string; answer: string }) =>
      answerQnaQuestion(id, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.qna] });
      setEditingId(null);
      setDraft("");
      toast.success("Answer published");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to publish answer");
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearQnaAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.qna] });
      toast.success("Answer removed");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to remove answer");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQnaQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.qna] });
      toast.success("Question deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to delete question");
    },
  });

  const counts = useMemo(
    () => ({
      all: data.length,
      pending: data.filter((q) => q.status === "pending").length,
      answered: data.filter((q) => q.status === "answered").length,
    }),
    [data]
  );

  const visible = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return data
      .filter((q) => activeTab === "all" || q.status === activeTab)
      .filter((q) =>
        [q.question, q.answer, q.author].join(" ").toLowerCase().includes(lower)
      );
  }, [activeTab, data, search]);

  const startEdit = (q: QnaQuestion) => {
    if (!canEdit) return;
    setEditingId(q.id);
    setDraft(q.answer || "");
  };

  const submitAnswer = (id: string) => {
    if (!draft.trim()) return;
    answerMutation.mutate({ id, answer: draft.trim() });
  };

  const handleClear = async (q: QnaQuestion) => {
    if (!canEdit) return;
    const ok = await confirmDelete(`answer for "${q.question.slice(0, 60)}"`);
    if (ok) clearMutation.mutate(q.id);
  };

  const handleDelete = async (q: QnaQuestion) => {
    if (!canEdit) return;
    const ok = await confirmDelete(q.question.slice(0, 80));
    if (ok) deleteMutation.mutate(q.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <MessageCircleQuestion className="h-7 w-7 text-red-500" />
            <h1 className="text-3xl font-bold tracking-tight">QnA Dashboard</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and respond to community questions.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Total", value: counts.all },
          { label: "Pending", value: counts.pending },
          { label: "Answered", value: counts.answered },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>Questions</CardTitle>
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab}
                type="button"
                size="sm"
                variant={activeTab === tab ? "default" : "outline"}
                onClick={() => setActiveTab(tab)}
                className="capitalize"
              >
                {tab} ({counts[tab]})
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading questions...
            </div>
          ) : visible.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No questions here.
            </div>
          ) : (
            visible.map((q) => (
              <div key={q.id} className="rounded-lg border bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium leading-7 text-gray-900">
                      {q.question}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{q.author}</span>
                      <span>•</span>
                      <span>{formatDate(q.created_at)}</span>
                      {q.answered_at && (
                        <>
                          <span>•</span>
                          <span className="text-green-700">
                            answered {formatDate(q.answered_at)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={q.status} />
                </div>

                {q.status === "answered" && editingId !== q.id && (
                  <div className="mt-4 rounded-lg border border-green-100 bg-green-50 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-700">
                      Admin Answer
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                      {q.answer}
                    </p>
                  </div>
                )}

                {editingId === q.id && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      autoFocus
                      rows={5}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Write a clear answer..."
                      className="w-full rounded-lg border border-gray-200 p-3 text-sm leading-6 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setDraft("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => submitAnswer(q.id)}
                        disabled={!draft.trim() || answerMutation.isPending}
                      >
                        {q.status === "answered" ? "Update" : "Publish"}
                      </Button>
                    </div>
                  </div>
                )}

                {editingId !== q.id && (
                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-4">
                    {canEdit && q.status === "answered" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleClear(q)}
                        disabled={clearMutation.isPending}
                      >
                        Remove Answer
                      </Button>
                    )}
                    {canEdit && (
                      <>
                        <Button size="sm" onClick={() => startEdit(q)}>
                          {q.status === "answered" ? "Edit Answer" : "Answer"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(q)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
