"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PublishSimulation({
  canPublish,
  published,
  onPublish
}: {
  canPublish: boolean;
  published: boolean;
  onPublish: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Publish simulation</CardTitle>
          <Badge variant={published ? "success" : "outline"}>{published ? "Completed" : "Ready"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          The publish action records a local audit event only. No real osapiens API is called.
        </p>
        <Button disabled={!canPublish || published} onClick={onPublish}>
          <Send className="h-4 w-4" aria-hidden="true" />
          Simulate publish
        </Button>
      </CardContent>
    </Card>
  );
}
