"use client";

import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/useIsMobile";
import { playFeedback } from "@/lib/feedback";
import { Z } from "@/lib/z-index";
import { cn } from "@/lib/utils";

export interface SummerSelectOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface SummerSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SummerSelectOption[];
  placeholder?: string;
  required?: boolean;
  title?: string;
  triggerIcon?: LucideIcon;
  className?: string;
}

function OptionList({
  value,
  options,
  onPick,
}: {
  value: string;
  options: SummerSelectOption[];
  onPick: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5" role="group">
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            data-sfx-skip
            onClick={() => onPick(opt.value)}
            className={cn(
              "flex w-full min-h-[48px] items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
              active
                ? "border-brand-green/40 bg-brand-green/10"
                : "border-white/8 bg-white/5 hover:bg-white/8 active:bg-white/10",
            )}
          >
            {Icon && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green">
                <Icon className="size-4" />
              </span>
            )}
            <span className="flex-1 text-sm font-medium text-white">{opt.label}</span>
            {active && <Check className="size-4 shrink-0 text-brand-green" />}
          </button>
        );
      })}
    </div>
  );
}

export function SummerSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  required,
  title,
  triggerIcon: TriggerIcon,
  className,
}: SummerSelectProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);
  const SelectedIcon = selected?.icon;
  const menuId = `summer-select-${title ?? placeholder}`;

  const updateMenuPos = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 200),
    });
  };

  const toggle = () => {
    if (!open) {
      updateMenuPos();
      playFeedback("open", "light");
    } else {
      playFeedback("dismiss", "light");
    }
    setOpen((v) => !v);
  };

  const pick = (v: string) => {
    if (v !== value) playFeedback("select", "light");
    onValueChange(v);
    setOpen(false);
  };

  useEffect(() => {
    if (isMobile) setOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile || !open) return;
    updateMenuPos();
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      const menu = document.getElementById(menuId);
      if (menu?.contains(target)) return;
      playFeedback("dismiss", "light");
      setOpen(false);
    };
    const onLayout = () => updateMenuPos();
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [isMobile, open, menuId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playFeedback("dismiss", "light");
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const triggerButton = (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => {
        if (isMobile) {
          playFeedback("open", "light");
          setOpen(true);
        } else {
          toggle();
        }
      }}
      data-sfx-skip
      className={cn(
        "app-input flex h-12 w-full min-h-[48px] items-center justify-between gap-2 px-3.5 text-left text-sm text-ds-text transition-colors hover:bg-ds-surface-hover/60 active:bg-ds-surface-hover",
        className,
      )}
      style={{ WebkitTapHighlightColor: "transparent", touchAction: "manipulation" }}
      aria-haspopup="listbox"
      aria-expanded={open}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2.5">
        {(SelectedIcon || TriggerIcon) && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green">
            {SelectedIcon ? (
              <SelectedIcon className="size-4" />
            ) : TriggerIcon ? (
              <TriggerIcon className="size-4" />
            ) : null}
          </span>
        )}
        <span className={cn("truncate", !selected && "text-ds-text-muted")}>
          {selected?.label ?? placeholder}
        </span>
      </span>
      <ChevronDown
        className={cn(
          "size-4 shrink-0 text-ds-text-muted transition-transform duration-150",
          open && !isMobile && "rotate-180",
        )}
      />
    </button>
  );

  return (
    <>
      {triggerButton}

      {isMobile ? (
        <Sheet
          open={open}
          onOpenChange={(next) => {
            if (!next && open) playFeedback("dismiss", "light");
            setOpen(next);
          }}
        >
          <SheetContent
            side="bottom"
            className="max-h-[85vh] rounded-t-2xl border-t border-white/10 bg-ocean-900 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            style={{ zIndex: Z.sheet }}
          >
            {title && (
              <SheetHeader className="mb-3 p-0">
                <SheetTitle className="text-sm font-medium text-white">
                  {title}
                </SheetTitle>
              </SheetHeader>
            )}
            <OptionList value={value} options={options} onPick={pick} />
          </SheetContent>
        </Sheet>
      ) : (
        open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id={menuId}
            role="listbox"
            className="fixed max-h-[min(60vh,320px)] overflow-y-auto rounded-2xl border border-white/10 bg-ocean-900 p-2 shadow-xl"
            style={{
              zIndex: Z.dropdown,
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
            }}
          >
            <OptionList value={value} options={options} onPick={pick} />
          </div>,
          document.body,
        )
      )}

      {required && !value && (
        <input tabIndex={-1} required value="" readOnly className="sr-only" />
      )}
    </>
  );
}

/** Desktop-only radix select — kept for admin pages if needed */
export function SummerSelectRadix(props: SummerSelectProps) {
  const {
    value,
    onValueChange,
    options,
    placeholder,
    required,
    triggerIcon: TriggerIcon,
    className,
  } = props;
  const selected = options.find((o) => o.value === value);
  const SelectedIcon = selected?.icon;

  return (
    <SummerSelect
      value={value}
      onValueChange={onValueChange}
      options={options}
      placeholder={placeholder}
      required={required}
      triggerIcon={TriggerIcon}
      className={className}
    />
  );
}
