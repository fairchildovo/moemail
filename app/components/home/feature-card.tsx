interface FeatureCardProps { 
  icon: React.ReactNode
  title: string
  description: string 
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-4 rounded border-2 border-primary/20 hover:border-primary/40 transition-colors bg-card/70 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 text-primary p-2">
          {icon}
        </div>
        <div className="text-left">
          <h3 className="font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
} 
