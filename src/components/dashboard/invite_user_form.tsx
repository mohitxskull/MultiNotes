import { useForm } from "@tanstack/react-form";
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
import { api } from "@/lib/api";

export function InviteUserForm() {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmitAsync: async ({ value }) => {
        const res = await api.inviteUser(value.email);

        if (res.success) {
          form.reset();
          toast.success("User invited successfully!");
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
        <CardTitle>Invite a new user</CardTitle>
      </CardHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <CardContent className="flex flex-col gap-4">
          <form.Field name="email">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="email"
                  placeholder="user@example.com"
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
                {isSubmitting ? "Inviting..." : "Invite User"}
              </Button>
            </CardFooter>
          )}
        </form.Subscribe>
      </form>
    </Card>
  );
}
