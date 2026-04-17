import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share, Plus, X } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

interface Props {
  variant?: "popup" | "button";
}

export function InstallHymnsButton() {
  const { canInstall, installed, promptInstall, isIOS } = useInstallPrompt();
  if (installed || !canInstall) return null;
  return (
    <Button
      onClick={() => promptInstall()}
      variant="outline"
      size="sm"
      className="gap-2"
      title={isIOS ? "Use Share → Add to Home Screen" : "Install Hymns app"}
    >
      <Download className="w-4 h-4" />
      Install App
    </Button>
  );
}

export function InstallHymnsPopup() {
  const { showPopup, promptInstall, dismiss, closePopup, isIOS, installed } =
    useInstallPrompt();

  if (installed) return null;

  return (
    <Dialog open={showPopup} onOpenChange={(o) => !o && closePopup()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Install Hymns App
          </DialogTitle>
          <DialogDescription>
            Get fast offline access to all hymns right from your home screen.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 py-2">
          <img
            src="/hymns-icon-192.png"
            alt="Hymns app icon"
            width={64}
            height={64}
            loading="lazy"
            className="w-16 h-16 rounded-2xl shadow"
          />
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Opens straight to the hymnal</li>
            <li>• Read lyrics offline (low data)</li>
            <li>• Loads fresh content when online</li>
          </ul>
        </div>

        {isIOS ? (
          <div className="rounded-md bg-muted p-3 text-sm space-y-2">
            <p className="font-medium">On iPhone / iPad:</p>
            <p className="flex items-center gap-1">
              1. Tap <Share className="w-4 h-4 inline" /> Share
            </p>
            <p className="flex items-center gap-1">
              2. Choose <Plus className="w-4 h-4 inline" /> "Add to Home Screen"
            </p>
          </div>
        ) : null}

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={dismiss}>
            <X className="w-4 h-4 mr-1" /> Not now
          </Button>
          {!isIOS && (
            <Button onClick={() => promptInstall()}>
              <Download className="w-4 h-4 mr-1" /> Install
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
