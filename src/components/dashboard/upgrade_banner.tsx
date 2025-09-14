import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";

interface UpgradeBannerProps {
  tenantSlug: string;
}

export function UpgradeBanner({ tenantSlug }: UpgradeBannerProps) {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Upgraded to Pro plan!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="mt-8">
      <Card className="bg-yellow-100 text-yellow-800">
        <CardHeader>
          <CardTitle>Free Plan Limit Reached</CardTitle>
          <CardDescription>
            You have reached the free plan limit of 3 notes.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={() => upgradeToProMutation.mutate(tenantSlug)}
            disabled={upgradeToProMutation.isPending}
          >
            {upgradeToProMutation.isPending ? "Upgrading..." : "Upgrade to Pro"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
