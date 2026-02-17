import { Dialog } from "@base-ui/react/dialog";

import type { ContributionRow } from "../state/results.types";

type WhyBreakdownModalProps = {
  open: boolean;
  optionTitle: string | null;
  contributions: ContributionRow[];
  showRawInputs: boolean;
  onOpenChange: (open: boolean) => void;
};

const percent = (value: number): string => `${(value * 100).toFixed(1)}%`;

export const WhyBreakdownModal = ({
  open,
  optionTitle,
  contributions,
  showRawInputs,
  onOpenChange,
}: WhyBreakdownModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => onOpenChange(nextOpen)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="results-why-modal__backdrop" />
        <Dialog.Popup className="results-why-modal" aria-label="Why this option ranks here">
          <header className="results-why-modal__header">
            <Dialog.Title>Why this option ranks here</Dialog.Title>
            <Dialog.Close aria-label="Close why breakdown">X</Dialog.Close>
          </header>

          <Dialog.Description>
            {optionTitle
              ? `${optionTitle} contribution rows use desirability and criterion weight.`
              : "Select an option to inspect weighted contribution rows."}
          </Dialog.Description>

          {contributions.length === 0 ? (
            <p role="status">No contribution rows yet.</p>
          ) : (
            <div className="results-why-modal__table" role="region" aria-label="Contribution breakdown">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Criterion</th>
                    <th scope="col">Desirability</th>
                    {showRawInputs ? <th scope="col">Raw</th> : null}
                    <th scope="col">Weight</th>
                    <th scope="col">Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((row) => (
                    <tr key={row.criterionId} data-missing={row.isMissing}>
                      <th scope="row">{row.criterionTitle}</th>
                      <td>{row.desirability === null ? "--" : row.desirability.toFixed(1)}</td>
                      {showRawInputs ? <td>{row.rawValue === null ? "--" : row.rawValue}</td> : null}
                      <td>{percent(row.normalizedWeight)}</td>
                      <td>{row.wsmContribution.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
