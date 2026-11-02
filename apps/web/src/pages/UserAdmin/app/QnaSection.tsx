import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatAdminDate } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getQnaQuestions, submitQnaQuestion, type QnaQuestion } from "@/api/qna-api";
import { queryKeys } from "@/api/queryKeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, ChevronDown, MessageCircleQuestion, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import useSheetStocks from "@/hooks/use-sheets-stocks";

function formatDate(value?: string | null) {
  return formatAdminDate(value);
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

function CompanySelect({
  value,
  onChange,
  stocks,
}: {
  value: string;
  onChange: (val: string) => void;
  stocks: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 30);
      return () => clearTimeout(timer);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  const companies = useMemo(() => {
    if (!stocks || !Array.isArray(stocks)) return [];
    const set = new Set<string>();
    stocks.forEach((stock: any) => {
      const name = stock?.name || stock?.company || stock?.symbol;
      if (name && typeof name === "string" && name.trim()) {
        set.add(name.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [stocks]);

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies;
    const lower = search.toLowerCase();
    return companies.filter((c) => c.toLowerCase().includes(lower));
  }, [companies, search]);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm transition focus:outline-none focus:border-[#CD2841] focus:ring-2 focus:ring-[#CD2841]/15 ${isOpen
          ? "border-[#CD2841] ring-2 ring-[#CD2841]/15"
          : "border-gray-200 hover:border-gray-300"
          }`}
      >
        <span
          className={`truncate ${value ? "font-medium text-gray-900" : "text-gray-400"
            }`}
        >
          {value || "Select company"}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {value && (
            <span
              role="button"
              tabIndex={0}
              className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              title="Clear selection"
              aria-label="Clear selection"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
              }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 flex flex-col rounded-lg border border-gray-200 bg-white shadow-xl animate-in fade-in-0 zoom-in-95">
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company..."
                className="w-full rounded-md border border-gray-200 bg-gray-50/60 py-1.5 pl-8 pr-3 text-xs outline-none transition focus:bg-white"
              />
            </div>
          </div>

          <div className="max-h-36 overflow-y-auto p-1 text-sm">
            {filteredCompanies.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                No company found
              </div>
            ) : (
              filteredCompanies.map((name) => {
                const isSelected = value === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      onChange(name);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition ${isSelected
                      ? "bg-[#CD2841]/10 font-medium text-[#CD2841]"
                      : "text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    <span className="truncate">{name}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-[#CD2841] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AskQuestionModal({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (payload: { question: string; category?: string }) => void;
  isSubmitting: boolean;
}) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const { stocks } = useSheetStocks();

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return createPortal(
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
        <div className="mb-3">
          <label className="mb-1.5 block text-xs font-medium text-gray-600">
            Company (optional)
          </label>
          <CompanySelect
            value={category}
            onChange={setCategory}
            stocks={stocks}
          />
        </div>

        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What would you like to know?"
          className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm leading-6 outline-none transition focus:border-[#CD2841] focus:ring-2 focus:ring-[#CD2841]/15"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => onSubmit({ question: text.trim(), category })}
            disabled={!text.trim() || isSubmitting}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function QnaSection() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  // Add category to the client-side filter
  const filtered = useMemo(() => {
    const lower = search.trim().toLowerCase();
    return data.filter((q) => {
      const matchesSearch = [q.question, q.answer, q.author]
        .join(" ")
        .toLowerCase()
        .includes(lower);
      const matchesCategory = !selectedCategory || q.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data, search, selectedCategory]);

  const categories = Array.from(new Set(data.map((q) => q.category).filter(Boolean)));

  const answeredCount = data.filter((q) => q.status === "answered").length;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <MessageCircleQuestion className="h-7 w-7 text-red-500" />
            <h1 className="text-3xl font-bold tracking-tight">QnA</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.length} questions · {answeredCount} answered
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
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

      <div className="flex flex-col md:flex-row gap-6">
        {/* Categories card */}
        <div className="w-full md:w-56 shrink-0">
          <div className="rounded-xl border bg-white p-2 shadow-sm md:sticky md:top-6">
            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Categories
            </p>

            <div className="space-y-1">
              <button
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${selectedCategory === null
                  ? "bg-[#CD2841]/10 font-medium text-[#CD2841]"
                  : "text-muted-foreground hover:bg-gray-50"
                  }`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat as string}
                  type="button"
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${selectedCategory === cat
                    ? "bg-[#CD2841]/10 font-medium text-[#CD2841]"
                    : "text-muted-foreground hover:bg-gray-50"
                    }`}
                  onClick={() => setSelectedCategory(cat as string)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
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
              <p className="mt-1 text-sm text-muted-foreground">
                {filtered.length} questions · {filtered.filter((q) => q.status === "answered").length} answered
              </p>
              {filtered.map((q) => {
                const expanded = expandedId === q.id;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : q.id)}
                    className="w-full rounded-xl border bg-white p-4 sm:p-5 text-left shadow-sm transition hover:border-gray-300"
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
        </div>
      </div>

      {showModal && (
        <AskQuestionModal
          onClose={() => setShowModal(false)}
          onSubmit={(payload) => submitMutation.mutate(payload)}
          isSubmitting={submitMutation.isPending}
        />
      )}
    </div>
  );
}
