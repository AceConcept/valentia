import type { ReactNode } from "react";

import { IconRail } from "@/components/IconRail";

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-row bg-background text-foreground">
      <IconRail />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
