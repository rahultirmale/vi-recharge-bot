import type { ComponentName, ComponentProps } from "../types";
import { PlanPickerCard } from "./PlanPickerCard";
import { ConfirmRechargeCard } from "./ConfirmRechargeCard";
import { RechargeStatusCard } from "./RechargeStatusCard";
import { ReceiptCard } from "./ReceiptCard";

const COMPONENT_MAP: Record<ComponentName, React.FC<any>> = {
  PlanPickerCard,
  ConfirmRechargeCard,
  RechargeStatusCard,
  ReceiptCard,
};

interface Props {
  component: ComponentName | null;
  props: ComponentProps | null;
}

function ViLogo() {
  return (
    <svg width="48" height="24" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="32" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="36" fill="var(--vi-red)">V</text>
      <text x="26" y="32" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="36" fill="var(--vi-red)">i</text>
      <circle cx="35" cy="8" r="4" fill="var(--vi-yellow)" />
    </svg>
  );
}

export function ComponentRouter({ component, props }: Props) {
  if (!component || !props) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
        <ViLogo />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Waiting for recharge instructions...
        </p>
      </div>
    );
  }

  const Component = COMPONENT_MAP[component];
  if (!Component) {
    return (
      <div className="p-4 text-sm text-[var(--color-text-danger)]">
        Unknown component: {component}
      </div>
    );
  }

  return <Component {...props} />;
}
