import { GripVertical } from "lucide-react";
import * as Resizable from "react-resizable-panels";
import { cn } from "@/lib/utils";

// Try to find the components in the namespace, including common aliases
const getComponent = (name: string, fallback: string) => {
  const mod = Resizable as any;
  return mod[name] || mod[fallback] || mod.default?.[name] || mod.default?.[fallback];
};

const Group = getComponent("PanelGroup", "Group");
const Panel = getComponent("Panel", "Panel");
const Separator = getComponent("PanelResizeHandle", "Separator");

const ResizablePanelGroup = ({ className, ...props }: any) => {
  if (!Group) return <div className={cn("flex h-full w-full", className)} {...props} />;
  return (
    <Group
      className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
      {...props}
    />
  );
};

const ResizablePanel = Panel || (({ children }: any) => <div className="flex-1 overflow-hidden">{children}</div>);

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: any) => {
  if (!Separator) return <div className={cn("w-px bg-border", className)} />;
  return (
    <Separator
      className={cn(
        "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </Separator>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
