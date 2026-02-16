type CriteriaUndoToastProps = {
  deletedCount: number;
  onUndo: () => void;
  onDismiss: () => void;
};

const deletedMessage = (deletedCount: number): string =>
  deletedCount === 1
    ? "Criterion deleted."
    : `${deletedCount} criteria deleted.`;

export const CriteriaUndoToast = ({
  deletedCount,
  onUndo,
  onDismiss,
}: CriteriaUndoToastProps) => {
  return (
    <section role="status" aria-live="polite" aria-label="Delete undo">
      <p>{deletedMessage(deletedCount)}</p>
      <p>Undo is available until this notice is dismissed.</p>
      <div>
        <button type="button" onClick={onUndo}>
          Undo
        </button>
        <button type="button" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </section>
  );
};
