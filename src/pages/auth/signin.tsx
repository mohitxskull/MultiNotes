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
import { api } from "@/lib/api";

export default function SignInPage() {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmitAsync: async ({ value, signal }) => {
        const res = await api.login({ body: value }, { signal });

        if (res.success) {
          router.push("/notes");
        } else {
          if (res.error) {
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
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Access your notes.</CardDescription>
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
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    type="email"
                    placeholder="Email"
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
            <form.Field name="password">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <Label htmlFor={field.name}>Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    type="password"
                    placeholder="Password"
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
            selector={(state) =>
              [
                state.canSubmit,
                state.isSubmitting,
                state.errorMap.onSubmit?.form,
              ] as const
            }
          >
            {([canSubmit, isSubmitting, formError]) => (
              <CardFooter className="flex flex-col gap-4">
                {formError && (
                  <ul className="text-sm text-destructive">
                    <li>{formError}</li>
                  </ul>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </CardFooter>
            )}
          </form.Subscribe>
        </form>
      </Card>
    </div>
  );
}
