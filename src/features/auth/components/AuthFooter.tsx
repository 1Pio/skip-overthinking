import { useAuth } from "../auth.context";

export function AuthFooter() {
    const { isAuthenticated, openSignInModal, openSettingsModal } = useAuth();

    return (
        <footer className="auth-footer">
            <button
                className="auth-footer__button"
                onClick={isAuthenticated ? openSettingsModal : openSignInModal}
            >
                <span
                    className="auth-footer__indicator"
                    data-auth={isAuthenticated}
                />
                {isAuthenticated ? "Signed in" : "Local-only"}
            </button>
        </footer>
    );
}
