"use client"

import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { SignButton } from "../auth/sign-button"

interface ActionButtonProps {
  isLoggedIn?: boolean
}

export function ActionButton({ isLoggedIn }: ActionButtonProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations("home")

  if (isLoggedIn) {
    return (
      <Button 
        size="lg" 
        onClick={() => router.push(`/${locale}/moe`)}
        className="gap-2 bg-primary hover:bg-primary/85 text-primary-foreground px-8 border border-primary/30 shadow-[0_6px_24px_hsl(var(--primary)/0.2)]"
      >
        <Mail className="w-5 h-5" />
        {t("actions.enterMailbox")}
      </Button>
    )
  }

  return <SignButton size="lg" />
} 
