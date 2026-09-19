"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Archive,
  ArchiveRestore,
  ExternalLink,
  Search,
  RefreshCw,
  Wrench,
  Bot,
  Rocket,
  Zap,
  CheckCircle2,
  Megaphone,
  Gift,
  Bell,
  Flame,
  Star,
  ShieldCheck,
  Check,
  X,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AppUpdate, AppUpdateCategory, AppUpdateStatus } from "@/features/whats-new/types/whats-new.types";
import { dispatchInteractionSound } from "@/lib/sound-engine";

const ICON_OPTIONS = [
  "Sparkles",
  "Wrench",
  "Bot",
  "Rocket",
  "Zap",
  "CheckCircle2",
  "Megaphone",
  "Gift",
  "Bell",
  "Flame",
  "Star",
  "ShieldCheck",
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Wrench,
  Bot,
  Rocket,
  Zap,
  CheckCircle2,
  Megaphone,
  Gift,
  Bell,
  Flame,
  Star,
  ShieldCheck,
};

export default function AdminWhatsNewPage() {
  const [updates, setUpdates] = useState<AppUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<AppUpdate | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Feature" as AppUpdateCategory,
    status: "Live" as AppUpdateStatus,
    icon_name: "Sparkles",
    image_url: "",
    link_url: "",
    link_label: "",
    is_published: true,
    is_archived: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAdminUpdates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/whats-new");
      if (res.ok) {
        const data = await res.json();
        setUpdates(data.updates || []);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to load updates");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminUpdates();
  }, [fetchAdminUpdates]);

  const openCreateDialog = () => {
    dispatchInteractionSound("ui.open");
    setFormData({
      title: "",
      description: "",
      category: "Feature",
      status: "Live",
      icon_name: "Sparkles",
      image_url: "",
      link_url: "",
      link_label: "",
      is_published: true,
      is_archived: false,
    });
    setErrorMessage("");
    setIsCreateOpen(true);
  };

  const openEditDialog = (update: AppUpdate) => {
    dispatchInteractionSound("ui.open");
    setSelectedUpdate(update);
    setFormData({
      title: update.title,
      description: update.description,
      category: update.category,
      status: update.status,
      icon_name: update.icon_name || "Sparkles",
      image_url: update.image_url || "",
      link_url: update.link_url || "",
      link_label: update.link_label || "",
      is_published: update.is_published,
      is_archived: update.is_archived,
    });
    setErrorMessage("");
    setIsEditOpen(true);
  };

  const openDeleteDialog = (update: AppUpdate) => {
    dispatchInteractionSound("feedback.warning");
    setSelectedUpdate(update);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMessage("Title and description are required.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/whats-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        dispatchInteractionSound("ui.select");
        setIsCreateOpen(false);
        fetchAdminUpdates();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to create update post.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save post.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUpdate) return;

    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMessage("Title and description are required.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/admin/whats-new", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedUpdate.id,
          ...formData,
        }),
      });

      if (res.ok) {
        dispatchInteractionSound("ui.select");
        setIsEditOpen(false);
        fetchAdminUpdates();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to update post.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update post.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUpdate) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/whats-new?id=${selectedUpdate.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        dispatchInteractionSound("ui.close");
        setIsDeleteOpen(false);
        fetchAdminUpdates();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to delete update post.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete post.");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublished = async (update: AppUpdate) => {
    dispatchInteractionSound("ui.click");
    try {
      const res = await fetch("/api/admin/whats-new", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: update.id,
          is_published: !update.is_published,
        }),
      });
      if (res.ok) {
        fetchAdminUpdates();
      }
    } catch (err) {
      console.error("Failed to toggle publish status:", err);
    }
  };

  const toggleArchived = async (update: AppUpdate) => {
    dispatchInteractionSound("ui.click");
    try {
      const res = await fetch("/api/admin/whats-new", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: update.id,
          is_archived: !update.is_archived,
        }),
      });
      if (res.ok) {
        fetchAdminUpdates();
      }
    } catch (err) {
      console.error("Failed to toggle archive status:", err);
    }
  };

  const filteredUpdates = updates.filter((u) => {
    const matchesSearch =
      u.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || u.category === filterCategory;
    const matchesStatus = filterStatus === "all" || u.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              What&apos;s New & Product Updates
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage release notes, feature announcements, and status updates for JEE Pro users.
          </p>
        </div>

        <Button
          onClick={openCreateDialog}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Create Update Post
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 p-4 rounded-xl border border-border/50 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search updates by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-background border border-border/60 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Categories</option>
            <option value="Feature">Feature</option>
            <option value="Improvement">Improvement</option>
            <option value="Fix">Fix</option>
            <option value="Announcement">Announcement</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-background border border-border/60 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="Live">Live</option>
            <option value="In Progress">In Progress</option>
            <option value="Coming Soon">Coming Soon</option>
          </select>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchAdminUpdates}
            title="Refresh feed"
            className="h-9 w-9"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Updates Table / Feed Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
          <p className="text-sm">Loading product updates...</p>
        </div>
      ) : filteredUpdates.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border/60 rounded-2xl p-8 space-y-3">
          <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-base font-medium">No product updates found</p>
          <p className="text-xs text-muted-foreground">
            Create your first update post to inform users about features and fixes.
          </p>
          <Button
            onClick={openCreateDialog}
            variant="outline"
            className="mt-2 text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Create Post
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUpdates.map((update) => {
            const IconComp = ICON_MAP[update.icon_name || "Sparkles"] || Sparkles;
            return (
              <div
                key={update.id}
                className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl border transition-all ${
                  update.is_archived
                    ? "bg-muted/30 border-border/40 opacity-70"
                    : update.is_published
                    ? "bg-card/70 border-border/60 hover:border-amber-500/40"
                    : "bg-amber-500/5 border-amber-500/20"
                }`}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="p-3 rounded-xl bg-background border border-border/60 shrink-0 text-amber-500">
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-base text-foreground leading-snug">
                        {update.title}
                      </h3>

                      {update.is_published ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
                          Draft
                        </Badge>
                      )}

                      {update.is_archived && (
                        <Badge variant="secondary" className="text-[10px]">
                          Archived
                        </Badge>
                      )}

                      <Badge variant="secondary" className="text-[10px]">
                        {update.category}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          update.status === "Live"
                            ? "text-emerald-500 border-emerald-500/30"
                            : update.status === "In Progress"
                            ? "text-amber-500 border-amber-500/30"
                            : "text-purple-500 border-purple-500/30"
                        }`}
                      >
                        {update.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {update.description}
                    </p>

                    {update.link_url && (
                      <p className="text-xs text-amber-500/90 flex items-center gap-1 font-mono pt-1">
                        <ExternalLink className="w-3 h-3" />
                        {update.link_label || "Link"}: {update.link_url}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePublished(update)}
                    title={update.is_published ? "Unpublish" : "Publish"}
                    className="text-xs gap-1.5 h-8"
                  >
                    {update.is_published ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                        Publish
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleArchived(update)}
                    title={update.is_archived ? "Restore from Archive" : "Archive"}
                    className="text-xs gap-1.5 h-8"
                  >
                    {update.is_archived ? (
                      <>
                        <ArchiveRestore className="w-3.5 h-3.5 text-blue-400" />
                        Restore
                      </>
                    ) : (
                      <>
                        <Archive className="w-3.5 h-3.5 text-muted-foreground" />
                        Archive
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(update)}
                    className="text-xs gap-1.5 h-8"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(update)}
                    className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-8 px-2.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Product Update</DialogTitle>
            <DialogDescription>
              Add a new announcement, feature release, or status update to the user channel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            {errorMessage && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Title *</label>
              <Input
                placeholder="e.g. Interactive Notes & Formula Sheet Engine"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as AppUpdateCategory })
                  }
                  className="w-full p-2 text-xs rounded-lg bg-background border border-border"
                >
                  <option value="Feature">Feature</option>
                  <option value="Improvement">Improvement</option>
                  <option value="Fix">Fix</option>
                  <option value="Announcement">Announcement</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as AppUpdateStatus })
                  }
                  className="w-full p-2 text-xs rounded-lg bg-background border border-border"
                >
                  <option value="Live">Live</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Description *</label>
              <textarea
                placeholder="Write a clear summary of what's new or what is being built..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full p-2.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Icon</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {ICON_OPTIONS.map((iconName) => {
                  const IconComponent = ICON_MAP[iconName];
                  const isSelected = formData.icon_name === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon_name: iconName })}
                      className={`p-2 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500 text-amber-500"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      }`}
                      title={iconName}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Link URL (Optional)</label>
                <Input
                  placeholder="e.g. /dashboard/study"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Link Button Label (Optional)</label>
                <Input
                  placeholder="e.g. Open Study Workspace"
                  value={formData.link_label}
                  onChange={(e) => setFormData({ ...formData, link_label: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Image URL (Optional)</label>
              <Input
                placeholder="e.g. https://domain.com/screenshot.png"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded border-border text-amber-500 focus:ring-amber-500"
                />
                Publish Immediately
              </label>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                disabled={isSaving}
              >
                {isSaving ? "Publishing..." : "Create Update Post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Product Update</DialogTitle>
            <DialogDescription>Modify post details or update progress status.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            {errorMessage && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg">
                {errorMessage}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Title *</label>
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as AppUpdateCategory })
                  }
                  className="w-full p-2 text-xs rounded-lg bg-background border border-border"
                >
                  <option value="Feature">Feature</option>
                  <option value="Improvement">Improvement</option>
                  <option value="Fix">Fix</option>
                  <option value="Announcement">Announcement</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as AppUpdateStatus })
                  }
                  className="w-full p-2 text-xs rounded-lg bg-background border border-border"
                >
                  <option value="Live">Live</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Coming Soon">Coming Soon</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Description *</label>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full p-2.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Icon</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {ICON_OPTIONS.map((iconName) => {
                  const IconComponent = ICON_MAP[iconName];
                  const isSelected = formData.icon_name === iconName;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon_name: iconName })}
                      className={`p-2 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500 text-amber-500"
                          : "bg-background border-border text-muted-foreground hover:text-foreground"
                      }`}
                      title={iconName}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Link URL</label>
                <Input
                  placeholder="e.g. /dashboard/study"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Link Label</label>
                <Input
                  placeholder="e.g. Open Study Workspace"
                  value={formData.link_label}
                  onChange={(e) => setFormData({ ...formData, link_label: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Image URL</label>
              <Input
                placeholder="https://..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded border-border text-amber-500 focus:ring-amber-500"
                />
                Published
              </label>

              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_archived}
                  onChange={(e) => setFormData({ ...formData, is_archived: e.target.checked })}
                  className="rounded border-border text-amber-500 focus:ring-amber-500"
                />
                Archived
              </label>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-500">Delete Update Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedUpdate?.title}&quot;? This operation cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSubmit}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold"
              disabled={isSaving}
            >
              {isSaving ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
