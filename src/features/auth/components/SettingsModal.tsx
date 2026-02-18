import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut, Trash2, User, X } from "lucide-react";
import { useAuth } from "../auth.context";
import { clearAll } from "../storage";

type SettingsModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { signOut } = useAuthActions();
    const { isAuthenticated } = useAuth();
    const [confirming, setConfirming] = useState<"signout" | "delete" | null>(null);

    if (!isOpen) return null;

    const handleSignOut = async () => {
        if (confirming !== "signout") {
            setConfirming("signout");
            return;
        }
        try {
            clearAll(); // wipe local cache on sign-out
            await signOut();
            onClose();
        } catch {
            // Fallback — close anyway
            onClose();
        }
    };

    const handleDelete = () => {
        if (confirming !== "delete") {
            setConfirming("delete");
            return;
        }
        // Account deletion would require a backend mutation — placeholder for now
        clearAll();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container settings-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal
                aria-label="Settings"
            >
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    <X size={18} />
                </button>

                <div className="settings-modal__header">
                    <h2>Settings</h2>
                </div>

                {isAuthenticated && (
                    <div className="settings-modal__account">
                        <div className="settings-modal__account-icon">
                            <User size={18} />
                        </div>
                        <span className="settings-modal__account-email">
                            Signed in
                        </span>
                    </div>
                )}

                <div className="settings-modal__actions">
                    {isAuthenticated ? (
                        <>
                            <button
                                className="settings-modal__sign-out-btn"
                                onClick={handleSignOut}
                            >
                                <LogOut size={15} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} />
                                {confirming === "signout" ? "Tap again to confirm" : "Sign Out"}
                            </button>
                            <button
                                className="settings-modal__delete-btn"
                                onClick={handleDelete}
                            >
                                <Trash2 size={15} style={{ marginRight: "0.35rem", verticalAlign: "middle" }} />
                                {confirming === "delete" ? "Tap again to confirm deletion" : "Delete Account"}
                            </button>
                        </>
                    ) : (
                        <p style={{ fontSize: "0.88rem", color: "#64748b" }}>
                            You're using local-only mode. Sign in to sync across devices.
                        </p>
                    )}
                </div>

                <p className="settings-modal__future">
                    More options coming soon — style customization, export, and more.
                </p>
            </div>
        </div>
    );
}
