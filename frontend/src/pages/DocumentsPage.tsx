import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import {
  ArrowLeft,
  ArrowUpDown,
  FileText,
  Filter,
  Grid2X2,
  List,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  fetchDocuments,
  type DashboardDocument,
} from "../services/dashboard";

import {
  deleteDocument,
  generateWorkflow,
  uploadPdf,
} from "../services/documents";

import {
  logHistory,
} from "../services/history";

import {
  ThemeSwitcher,
} from "../components/ui/ThemeSwitcher";

import {
  Skeleton,
} from "../components/ui/Skeleton";

import DocumentDetailsDrawer from "../components/ui/DocumentDetailsDrawer";

import ConfirmModal from "../components/ui/ConfirmModal";

const PAGE_SIZE = 6;

export default function DocumentsPage() {
  const navigate = useNavigate();

  const [documents, setDocuments] =
    useState<DashboardDocument[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [sort, setSort] =
    useState("newest");

  const [viewMode, setViewMode] =
    useState<"cards" | "table">("cards");

  const [page, setPage] =
    useState(1);

  const [uploadOpen, setUploadOpen] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [generatingId, setGeneratingId] =
    useState<string | null>(null);

  const [selectedDocument, setSelectedDocument] =
    useState<DashboardDocument | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<DashboardDocument | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [clearFailedOpen, setClearFailedOpen] =
    useState(false);

  const [clearingFailed, setClearingFailed] =
    useState(false);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      const data = await fetchDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load documents"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const filtered = useMemo(() => {
    let result = [...documents];

    const query = search
      .trim()
      .toLowerCase();

    if (query) {
      result = result.filter((document) =>
        document.filename
          .toLowerCase()
          .includes(query)
      );
    }

    if (filter !== "all") {
      result = result.filter(
        (document) =>
          document.status === filter
      );
    }

    result.sort((a, b) => {
      if (sort === "name") {
        return a.filename.localeCompare(
          b.filename
        );
      }

      const aTime = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const bTime = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return sort === "oldest"
        ? aTime - bTime
        : bTime - aTime;
    });

    return result;
  }, [
    documents,
    search,
    filter,
    sort,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / PAGE_SIZE
    )
  );

  const visibleDocuments = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const selectFile = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0] ?? null;

    if (
      file &&
      file.type !== "application/pdf"
    ) {
      toast.error(
        "Only PDF files are supported."
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(
        "Choose a PDF first."
      );
      return;
    }

    try {
      setUploading(true);

      const uploaded = await uploadPdf(selectedFile);

      try {
        await logHistory(
          "document_upload",
          "Document uploaded",
          `${selectedFile.name} was uploaded and processed for AI retrieval.`,
          {
            filename: selectedFile.name,
            documentId:
              uploaded?._id ||
              uploaded?.document?._id ||
              uploaded?.id,
          }
        );
      } catch {
        // Main upload should still succeed if history logging fails.
      }

      toast.success(
        "Document processed successfully."
      );

      setUploadOpen(false);
      setSelectedFile(null);

      await loadDocuments();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateWorkflow = async (
    documentId: string
  ) => {
    try {
      setGeneratingId(documentId);

      const generated =
        await generateWorkflow(documentId);

      try {
        await logHistory(
          "workflow_generated",
          "AI workflow generated",
          "Navigator AI converted a processed document into a structured workflow.",
          {
            documentId,
            workflowId:
              generated?._id ||
              generated?.id ||
              generated?.workflow?._id ||
              generated?.workflow?.id,
          }
        );
      } catch {
        // Workflow generation remains successful even if logging fails.
      }

      toast.success(
        "AI workflow generated successfully."
      );

      navigate("/workflows");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Workflow generation failed"
      );
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(deleteTarget._id);

      await deleteDocument(
        deleteTarget._id
      );

      setDocuments((current) =>
        current.filter(
          (document) =>
            document._id !==
            deleteTarget._id
        )
      );

      toast.success(
        "Document deleted successfully."
      );

      if (
        selectedDocument?._id ===
        deleteTarget._id
      ) {
        setSelectedDocument(null);
      }

      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete document"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearFailed = async () => {
    const failed = documents.filter(
      (document) =>
        document.status === "failed"
    );

    if (failed.length === 0) {
      toast(
        "There are no failed documents to clear."
      );
      setClearFailedOpen(false);
      return;
    }

    try {
      setClearingFailed(true);

      await Promise.all(
        failed.map((document) =>
          deleteDocument(document._id)
        )
      );

      setDocuments((current) =>
        current.filter(
          (document) =>
            document.status !== "failed"
        )
      );

      toast.success(
        `${failed.length} failed document${
          failed.length === 1 ? "" : "s"
        } removed.`
      );

      setClearFailedOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to clear failed documents"
      );
    } finally {
      setClearingFailed(false);
    }
  };

  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <div>
          <button
            className="back-workspace-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>

          <p className="section-kicker">
            DOCUMENT LIBRARY
          </p>

          <h1>
            Your knowledge workspace
          </h1>

          <p>
            Upload, process and transform
            complex PDFs into grounded AI
            workflows.
          </p>
        </div>

        <div className="workspace-header-actions">
          <ThemeSwitcher />

          <button
            className="dashboard-primary"
            onClick={() =>
              setUploadOpen(true)
            }
          >
            <Upload size={17} />
            Upload PDF
          </button>
        </div>
      </header>

      <section className="documents-toolbar">
        <div className="dashboard-search documents-search">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
              setPage(1);
            }}
            placeholder="Search documents..."
          />
        </div>

        <label className="select-control">
          <Filter size={16} />

          <select
            value={filter}
            onChange={(event) => {
              setFilter(
                event.target.value
              );
              setPage(1);
            }}
          >
            <option value="all">
              All statuses
            </option>
            <option value="processed">
              Processed
            </option>
            <option value="processing">
              Processing
            </option>
            <option value="failed">
              Failed
            </option>
          </select>
        </label>

        <button
          className="clear-failed-button"
          disabled={
            !documents.some(
              (document) =>
                document.status === "failed"
            )
          }
          onClick={() =>
            setClearFailedOpen(true)
          }
        >
          <Trash2 size={16} />
          Clear failed
        </button>

        <div className="document-view-toggle">
          <button
            className={
              viewMode === "cards"
                ? "active"
                : ""
            }
            onClick={() =>
              setViewMode("cards")
            }
            aria-label="Card view"
          >
            <Grid2X2 size={16} />
          </button>

          <button
            className={
              viewMode === "table"
                ? "active"
                : ""
            }
            onClick={() =>
              setViewMode("table")
            }
            aria-label="Table view"
          >
            <List size={17} />
          </button>
        </div>

        <label className="select-control">
          <ArrowUpDown size={16} />

          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value)
            }
          >
            <option value="newest">
              Newest first
            </option>
            <option value="oldest">
              Oldest first
            </option>
            <option value="name">
              Name A-Z
            </option>
          </select>
        </label>
      </section>

      {loading ? (
        <section className="document-grid">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <Skeleton
              className="document-card-skeleton"
              key={index}
            />
          ))}
        </section>
      ) : visibleDocuments.length === 0 ? (
        <section className="documents-empty">
          <div className="documents-empty-icon">
            <FileText size={30} />
          </div>

          <h2>
            No documents found
          </h2>

          <p>
            Upload your first PDF to start
            extracting grounded intelligence.
          </p>

          <button
            className="dashboard-primary"
            onClick={() =>
              setUploadOpen(true)
            }
          >
            <Upload size={17} />
            Upload document
          </button>
        </section>
      ) : viewMode === "cards" ? (
        <section className="document-grid">
          {visibleDocuments.map(
            (document) => (
              <article
                className="document-card"
                key={document._id}
              >
                <div className="document-card-top">
                  <div className="document-file-icon">
                    <FileText size={22} />
                  </div>

                  <span
                    className={`status-pill ${document.status}`}
                  >
                    {document.status}
                  </span>
                </div>

                <div className="document-card-copy">
                  <h3>
                    {document.filename}
                  </h3>

                  <p>
                    {document.pageCount
                      ? `${document.pageCount} pages`
                      : "PDF document"}

                    {document.fileSize
                      ? ` • ${(
                          document.fileSize /
                          1024
                        ).toFixed(1)} KB`
                      : ""}
                  </p>
                </div>

                <div className="document-card-actions">
                  <button
                    className="secondary-action-button"
                    onClick={() =>
                      setSelectedDocument(document)
                    }
                  >
                    View details
                  </button>

                  <button
                    className="document-delete-button"
                    onClick={() =>
                      setDeleteTarget(document)
                    }
                    disabled={
                      deletingId === document._id
                    }
                    aria-label={`Delete ${document.filename}`}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>

                  <button
                    className="ai-action-button"
                    disabled={
                      document.status !==
                        "processed" ||
                      generatingId ===
                        document._id
                    }
                    onClick={() =>
                      handleGenerateWorkflow(
                        document._id
                      )
                    }
                  >
                    <Sparkles size={15} />

                    {generatingId ===
                    document._id
                      ? "Generating..."
                      : "Generate workflow"}
                  </button>
                </div>
              </article>
            )
          )}
        </section>
      ) : (
        <section className="document-table-shell">
          <div className="document-table-header">
            <span>Document</span>
            <span>Status</span>
            <span>Pages</span>
            <span>Actions</span>
          </div>

          {visibleDocuments.map((document) => (
            <div
              className="document-table-row"
              key={document._id}
            >
              <div className="document-table-name">
                <div className="document-file-icon compact">
                  <FileText size={17} />
                </div>

                <div>
                  <strong>
                    {document.filename}
                  </strong>

                  <span>
                    PDF document
                  </span>
                </div>
              </div>

              <div>
                <span
                  className={`status-pill ${document.status}`}
                >
                  {document.status}
                </span>
              </div>

              <span className="table-muted">
                {document.pageCount ?? "—"}
              </span>

              <div className="table-actions">
                <button
                  className="secondary-action-button"
                  onClick={() =>
                    setSelectedDocument(document)
                  }
                >
                  Details
                </button>

                <button
                  className="document-delete-button compact"
                  onClick={() =>
                    setDeleteTarget(document)
                  }
                  disabled={
                    deletingId === document._id
                  }
                >
                  <Trash2 size={14} />
                  Delete
                </button>

                <button
                  className="ai-action-button"
                  disabled={
                    document.status !== "processed" ||
                    generatingId === document._id
                  }
                  onClick={() =>
                    handleGenerateWorkflow(
                      document._id
                    )
                  }
                >
                  <Sparkles size={14} />
                  Workflow
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      <footer className="pagination-bar">
        <span>
          Showing{" "}
          {visibleDocuments.length} of{" "}
          {filtered.length} documents
        </span>

        <div>
          <button
            disabled={page === 1}
            onClick={() =>
              setPage((current) =>
                Math.max(
                  1,
                  current - 1
                )
              )
            }
          >
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={
              page === totalPages
            }
            onClick={() =>
              setPage((current) =>
                Math.min(
                  totalPages,
                  current + 1
                )
              )
            }
          >
            Next
          </button>
        </div>
      </footer>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete this document?"
        description={
          deleteTarget
            ? `This will remove ${deleteTarget.filename}, its RAG chunks and any workflows generated from it. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete document"
        loading={Boolean(deletingId)}
        onClose={() => {
          if (!deletingId) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={
          handleDeleteDocument
        }
      />

      <ConfirmModal
        open={clearFailedOpen}
        title="Clear all failed documents?"
        description={`This will permanently remove ${
          documents.filter(
            (document) =>
              document.status === "failed"
          ).length
        } failed document records and their related data.`}
        confirmLabel="Clear failed"
        loading={clearingFailed}
        onClose={() => {
          if (!clearingFailed) {
            setClearFailedOpen(false);
          }
        }}
        onConfirm={
          handleClearFailed
        }
      />

      <DocumentDetailsDrawer
        document={selectedDocument}
        open={Boolean(selectedDocument)}
        generating={
          selectedDocument
            ? generatingId === selectedDocument._id
            : false
        }
        onClose={() =>
          setSelectedDocument(null)
        }
        onGenerateWorkflow={
          handleGenerateWorkflow
        }
      />

      {uploadOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={() =>
            !uploading &&
            setUploadOpen(false)
          }
        >
          <section
            className="upload-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Upload PDF"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="upload-modal-heading">
              <div>
                <p className="section-kicker">
                  DOCUMENT INTAKE
                </p>

                <h2>Upload PDF</h2>
              </div>

              <button
                className="modal-close"
                disabled={uploading}
                onClick={() =>
                  setUploadOpen(false)
                }
              >
                <X size={19} />
              </button>
            </div>

            <label className="upload-dropzone">
              <div className="upload-drop-icon">
                <Upload size={27} />
              </div>

              <strong>
                Choose your process document
              </strong>

              <span>
                PDF only • maximum 10 MB
              </span>

              {selectedFile && (
                <div className="selected-file">
                  <FileText size={16} />
                  {selectedFile.name}
                </div>
              )}

              <input
                type="file"
                accept="application/pdf"
                onChange={selectFile}
                hidden
              />
            </label>

            <button
              className="primary-auth-button upload-submit"
              disabled={
                !selectedFile ||
                uploading
              }
              onClick={handleUpload}
            >
              {uploading ? (
                <>
                  <span className="button-spinner" />
                  Extracting & indexing...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Process document
                </>
              )}
            </button>

            <p className="upload-helper">
              Navigator AI will extract text,
              create chunks and generate local
              semantic embeddings.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
