import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard_header";
import { CreateNoteForm } from "@/components/dashboard/create_note_form";
import { InviteUserForm } from "@/components/dashboard/invite_user_form";
import { NotesList } from "@/components/dashboard/notes_list";
import { UpgradeBanner } from "@/components/dashboard/upgrade_banner";

export default function NotesPage() {
  const router = useRouter();

  const { data: user, isLoading: isUserLoading, isError: isUserError } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await api.getMe();
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error ?? "Failed to fetch user");
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (isUserError) {
      router.push("/auth/signin");
    }
  }, [isUserError, router]);

  const { data: notes, isLoading: isNotesLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const response = await api.getNotes();
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error ?? "Failed to fetch notes");
      }
    },
    enabled: !!user,
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: (res) => {
      if (res.success) {
        router.push("/auth/signin");
      } else {
        toast.error(res.error ?? "Failed to logout");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isUserLoading || isNotesLoading || !user || !notes) {
    return <div>Loading...</div>;
  }

  const showUpgradeBanner = user.role === "admin" && user.plan === "free" && notes.length >= 3;

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <DashboardHeader user={user} onSignOut={() => logoutMutation.mutate()} />

      <div className="mb-8">
        <CreateNoteForm />
      </div>

      {user.role === "admin" && (
        <div className="mb-8">
          <InviteUserForm />
        </div>
      )}

      <NotesList notes={notes} />

      {showUpgradeBanner && <UpgradeBanner tenantSlug={user.tenantSlug} />}
    </div>
  );
}
