import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { notes } from "@/db/schema";

interface NotesListProps {
  notes: (typeof notes.$inferSelect)[];
}

export function NotesList({ notes }: NotesListProps) {
  const queryClient = useQueryClient();

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

  return (
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
                  disabled={deleteNoteMutation.isPending}
                >
                  {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p>You have no notes yet.</p>
        )}
      </div>
    </div>
  );
}
