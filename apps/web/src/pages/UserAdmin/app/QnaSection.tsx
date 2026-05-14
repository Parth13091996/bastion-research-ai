import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQnaQuestions, submitQnaQuestion, type QnaQuestion } from "@/api/qna-api";
import { queryKeys } from "@/api/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircleQuestion, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: QnaQuestion["status"] }) {
  return (
    <Badge
      variant="outline"
      className={
        status === "answered"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }
    >
      {status === "answered" ? "Answered" : "Pending"}
    </Badge>
  );
}

function AskQuestionModal({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (question: string) => void;
  isSubmitting: boolean;
}) {
  const [text, setText] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl border bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Ask a Question</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Be specific so the team can answer clearly.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <textarea
          autoFocus
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What would you like to know?"
          className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm leading-6 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit(text.trim())}
            disabled={!text.trim() || isSubmitting}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function QnaSection() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: [queryKeys.qna, "user"],
    queryFn: () => getQnaQuestions(),
  });

  const submitMutation = useMutation({
    mutationFn: submitQnaQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.qna] });
      setShowModal(false);
      toast.success("Question submitted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to submit question");
    },
  });

  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return data.filter((q) =>
      [q.question, q.answer, q.author].join(" ").toLowerCase().includes(lower)
    );
  }, [data, search]);

  const answeredCount = data.filter((q) => q.status === "answered").length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <MessageCircleQuestion className="h-7 w-7 text-red-500" />
            <h1 className="text-3xl font-bold tracking-tight">QnA</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.length} questions · {answeredCount} answered
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ask Question
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search questions..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            Loading questions...
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-sm text-muted-foreground">
            No questions match your search.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => {
            const expanded = expandedId === q.id;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setExpandedId(expanded ? null : q.id)}
                className="w-full rounded-xl border bg-white p-5 text-left shadow-sm transition hover:border-gray-300"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium leading-7 text-gray-900">
                      {q.question}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{q.author}</span>
                      <span>•</span>
                      <span>{formatDate(q.created_at)}</span>
                    </div>
                  </div>
                  <StatusBadge status={q.status} />
                </div>

                {expanded && (
                  <div className="mt-4 border-t pt-4">
                    {q.status === "answered" ? (
                      <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                        {q.answer}
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-amber-700">
                        Awaiting a response...
                      </p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {showModal && (
        <AskQuestionModal
          onClose={() => setShowModal(false)}
          onSubmit={(question) => submitMutation.mutate(question)}
          isSubmitting={submitMutation.isPending}
        />
      )}
    </div>
  );
}
