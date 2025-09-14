import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

export function CreateNoteForm() {
  const queryClient = useQueryClient();

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

  return (
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
  );
}
