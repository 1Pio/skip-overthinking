import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { ChevronDown, ChevronUp, Github, Mail, X, ArrowLeft } from "lucide-react";

type SignInModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
    const { signIn } = useAuthActions();
    const [learnMoreOpen, setLearnMoreOpen] = useState(false);
    const [signingIn, setSigningIn] = useState<string | null>(null);
    const [emailInput, setEmailInput] = useState<string>("");
    const [showEmailForm, setShowEmailForm] = useState<boolean>(false);
    const [emailSent, setEmailSent] = useState<boolean>(false);

    useEffect(() => {
        if (!isOpen) {
            setShowEmailForm(false);
            setEmailInput("");
            setEmailSent(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleProvider = async (provider: string) => {
        setSigningIn(provider);
        try {
            await signIn(provider);
            onClose();
        } catch {
        } finally {
            setSigningIn(null);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailInput) return;
        setSigningIn("resend");
        try {
            await signIn("resend", { email: emailInput });
            setEmailSent(true);
        } catch {
        } finally {
            setSigningIn(null);
        }
    };

    const handleEmailInputKeydown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setShowEmailForm(false);
            setEmailInput("");
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container sign-in-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal
                aria-label="Sign in"
            >
                <button className="modal-close" onClick={onClose} aria-label="Close">
                    <X size={18} />
                </button>

                <div className="sign-in-modal__header">
                    <h2>Sign In</h2>
                    <p>
                        Sign in to save your decisions across devices and access them from
                        anywhere. 100% optional.
                    </p>
                </div>

                {showEmailForm ? (
                    <div className="sign-in-modal__email-form">
                        <form onSubmit={handleEmailSubmit}>
                            <div className="sign-in-modal__email-input-container">
                                <button
                                    type="button"
                                    className="sign-in-modal__back-btn"
                                    onClick={() => {
                                        setShowEmailForm(false);
                                        setEmailInput("");
                                        setEmailSent(false);
                                    }}
                                    aria-label="Back"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <input
                                    type="email"
                                    className="sign-in-modal__email-input"
                                    placeholder="Enter your email"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    onKeyDown={handleEmailInputKeydown}
                                    autoFocus
                                    required
                                    disabled={emailSent}
                                />
                            </div>
                            {emailSent && (
                                <p className="sign-in-modal__email-sent-message">
                                    Email sent! Check your inbox for the magic link.
                                </p>
                            )}
                            <button
                                type="submit"
                                className="sign-in-modal__submit-btn"
                                disabled={!!signingIn || emailSent}
                            >
                                {signingIn === "resend" ? "Sending…" : "Send magic link"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="sign-in-modal__providers">
                        <button
                            className="sign-in-modal__provider-btn"
                            onClick={() => setShowEmailForm(true)}
                            disabled={!!signingIn}
                        >
                            <Mail size={18} />
                            Continue with Email
                        </button>

                        <button
                            className="sign-in-modal__provider-btn"
                            onClick={() => handleProvider("google")}
                            disabled={!!signingIn}
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {signingIn === "google" ? "Connecting…" : "Continue with Google"}
                        </button>

                        <button
                            className="sign-in-modal__provider-btn"
                            onClick={() => handleProvider("github")}
                            disabled={!!signingIn}
                        >
                            <Github size={18} />
                            {signingIn === "github" ? "Connecting…" : "Continue with GitHub"}
                        </button>
                    </div>
                )}

                <button
                    className="sign-in-modal__learn-more-toggle"
                    onClick={() => setLearnMoreOpen((v) => !v)}
                >
                    Learn more
                    {learnMoreOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {learnMoreOpen && (
                    <p className="sign-in-modal__learn-more-text">
                        Decisions are stored in your account. Local-only decisions are not
                        uploaded. Sign out to clear local cache.
                    </p>
                )}
            </div>
        </div>
    );
}
