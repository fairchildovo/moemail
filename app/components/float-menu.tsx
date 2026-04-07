"use client"

import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function FloatMenu() {
  const t = useTranslations("common")
  const pathname = usePathname()
  const emailAddress = "Tian@tianzora.uno"
  const contactLabel = `${t("contactMe")} ${emailAddress}`

  const copyEmailToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(emailAddress)
        return
      }
    } catch {}

    try {
      const textarea = document.createElement("textarea")
      textarea.value = emailAddress
      textarea.setAttribute("readonly", "")
      textarea.style.position = "absolute"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
    } catch {}
  }
  
  // 在分享页面隐藏悬浮框
  if (pathname.includes("/shared/")) {
    return null
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              asChild
              variant="outline"
              size="icon"
              className="bg-card/95 backdrop-blur rounded-full shadow-lg group relative border-primary/20"
            >
              <a
                href={`mailto:${emailAddress}`}
                aria-label={contactLabel}
                onClick={() => {
                  void copyEmailToClipboard()
                }}
              >
                <Mail 
                  className="w-4 h-4 transition-all duration-300 text-primary group-hover:scale-110"
                />
                <span className="sr-only">{contactLabel}</span>
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p>{contactLabel}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
} 
