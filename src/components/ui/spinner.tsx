import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <div className="flex items-center justify-center">
      <Loader2Icon data-slot="spinner" role="status" aria-label="Loading" className={cn("size-20  animate-spin", className)} {...props} />
    </div>
  )
}

export { Spinner }
