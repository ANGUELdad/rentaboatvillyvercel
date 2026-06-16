"use client";

import { Download, Edit, Mail, Shield, Trash2, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { postJson } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SummerSelect } from "@/components/ui/SummerSelect";
import { Textarea } from "@/components/ui/textarea";
import { HoneypotField } from "@/components/security/HoneypotField";
import { useI18n } from "@/providers/LanguageProvider";

export function GdprRequestForm() {
  const { t } = useI18n();
  const g = t.gdpr;
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState<string>("access");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStatus("loading");
    setErrorMsg("");

    try {
      const result = await postJson("/api/gdpr/request", {
        email,
        requestType,
        message,
        _hp: hp,
      });

      if (result.ok) {
        setStatus("success");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
        setErrorMsg(result.error ?? g.error);
      }
    } catch {
      setStatus("error");
      setErrorMsg(g.error);
    } finally {
      submittingRef.current = false;
    }
  };

  if (status === "success") {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <p className="text-sm text-summer-turquoise">{g.successTitle}</p>
        <p className="body-fit mt-2 text-xs text-ds-text-secondary">{g.successDesc}</p>
        <Button
          type="button"
          className="btn-app-secondary mt-4"
          onClick={() => setStatus("idle")}
        >
          {g.successAgain}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative glass-panel space-y-4 rounded-2xl p-6">
      <HoneypotField value={hp} onChange={setHp} />
      <h3 className="text-sm tracking-[0.15em] text-ds-text uppercase">
        {g.formTitle}
      </h3>
      <div className="space-y-2">
        <Label className="app-label label-fit flex items-center gap-1.5 uppercase">
          <Mail className="size-3.5 text-summer-turquoise" />
          {g.email}
        </Label>
        <Input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="app-input border-0 bg-transparent"
        />
      </div>
      <div className="space-y-2">
        <Label className="app-label label-fit flex items-center gap-1.5 uppercase">
          <Shield className="size-3.5 text-summer-coral" />
          {g.requestType}
        </Label>
        <SummerSelect
          title={g.requestType}
          triggerIcon={Shield}
          value={requestType}
          onValueChange={setRequestType}
          options={[
            { value: "access", label: g.access, icon: Shield },
            { value: "rectification", label: g.rectification, icon: Edit },
            { value: "delete", label: g.delete, icon: Trash2 },
            { value: "restriction", label: g.restriction, icon: Shield },
            { value: "portability", label: g.portability, icon: Download },
            { value: "objection", label: g.objection, icon: XCircle },
            { value: "withdraw_consent", label: g.withdrawConsent, icon: Shield },
          ]}
        />
      </div>
      <div className="space-y-2">
        <Label className="app-label label-fit uppercase">{g.details}</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="app-input min-h-20 border-0 bg-transparent"
          placeholder={g.detailsPlaceholder}
        />
      </div>
      {status === "error" && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}
      <Button
        type="submit"
        disabled={status === "loading"}
        className="btn-app-primary w-full text-[10px] tracking-[0.15em] uppercase"
      >
        {status === "loading" ? g.submitting : g.submit}
      </Button>
    </form>
  );
}
