import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useEffect } from "react";

export default function NotesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery({
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

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.deleteNote(id);
      if (res.success) {
        return res.data;
      } else {
        throw new Error(res.error ?? "Failed to delete note");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Note deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const upgradeToProMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await api.upgradeToPro(slug);
      if (res.success) {
        return res.data;
      } else {
        throw new Error(res.error ?? "Failed to upgrade");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      // We might need to invalidate user query as well if plan is part of user session
      toast.success("Upgraded to Pro plan!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await api.logout();
      if (res.success) {
        return res.data;
      } else {
        throw new Error(res.error ?? "Failed to logout");
      }
    },
    onSuccess: () => {
      router.push("/auth/signin");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
    validators: {
      onSubmitAsync: async ({ value }) => {
        const res = await api.createNote(value);

        if (res.success) {
          form.reset();
          queryClient.invalidateQueries({ queryKey: ["notes"] });
          toast.success("Note created successfully!");
        } else {
          if (res.error) {
            toast.error(res.error);
            return { form: res.error };
          }
          if (res.form) {
            return res.form;
          }
        }
      },
    },
  });

  if (isUserLoading || isNotesLoading || !user) {
    return <div>Loading...</div>;
  }

  const tenantSlug = user.email.split("@")[1].split(".")[0];

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome, {user.email}</h1>
        <Button onClick={() => logoutMutation.mutate()} variant="destructive">
          Sign out
        </Button>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a new note</CardTitle>
          </CardHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <CardContent className="flex flex-col gap-4">
              <form.Field name="title">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Title</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="text"
                      placeholder="Title"
                    />
                    {field.state.meta.errors && (
                      <ul className="text-sm text-destructive">
                        {field.state.meta.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </form.Field>
              <form.Field name="content">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Content</Label>
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Content"
                    />
                    {field.state.meta.errors && (
                      <ul className="text-sm text-destructive">
                        {field.state.meta.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </form.Field>
            </CardContent>
            <form.Subscribe
              selector={(
                state,
              ) =>
                [
                  state.canSubmit,
                  state.isSubmitting,
                  state.errorMap.onSubmit?.form,
                ] as const
              }
            >
              {([canSubmit, isSubmitting, formError]) => (
                <CardFooter className="flex flex-col items-start gap-4">
                  {formError && (
                    <ul className="text-sm text-destructive">
                      <li>{formError}</li>
                    </ul>
                  )}
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Note"}
                  </Button>
                </CardFooter>
              )}
            </form.Subscribe>
          </form>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Your Notes</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes && notes.length > 0 ? (
            notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <CardTitle>{note.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{note.content}</p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => deleteNoteMutation.mutate(note.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p>You have no notes yet.</p>
          )}
        </div>
      </div>

      {user.role === "admin" && notes && notes.length >= 3 && (
        <div className="mt-8">
          <Card className="bg-yellow-100 text-yellow-800">
            <CardHeader>
              <CardTitle>Free Plan Limit Reached</CardTitle>
              <CardDescription>
                You have reached the free plan limit of 3 notes.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => upgradeToProMutation.mutate(tenantSlug)}>
                Upgrade to Pro
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}