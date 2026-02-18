import { useEffect, useState } from "react";
import { initBridge, destroyBridge } from "./bridge";
import { ComponentRouter } from "./components/ComponentRouter";
import { DevPreview } from "./DevPreview";
import type { ComponentName, ComponentProps } from "./types";

const IS_DEV_PREVIEW = import.meta.env.VITE_DEV_PREVIEW === "true";

function App() {
  const [component, setComponent] = useState<ComponentName | null>(null);
  const [props, setProps] = useState<ComponentProps | null>(null);

  useEffect(() => {
    if (IS_DEV_PREVIEW) return;

    initBridge((structuredContent: Record<string, unknown>) => {
      const { component: comp, ...rest } = structuredContent;
      if (comp && typeof comp === "string") {
        setComponent(comp as ComponentName);
        setProps(rest as unknown as ComponentProps);
      }
    });

    return () => destroyBridge();
  }, []);

  if (IS_DEV_PREVIEW) {
    return <DevPreview />;
  }

  return (
    <div className="p-2">
      <ComponentRouter component={component} props={props} />
    </div>
  );
}

export default App;
