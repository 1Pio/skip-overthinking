import type { DraftCriterion } from "../state/criterion.types";
import { CriteriaRow } from "./CriteriaRow";

type CriteriaListViewMode = "compact" | "rich";

type CriteriaListProps = {
  criteria: DraftCriterion[];
  viewMode: CriteriaListViewMode;
  isSelecting: boolean;
  selectedCriterionIds: string[];
  onToggleSelected: (criterionId: string) => void;
  onEdit: (criterionId: string) => void;
  onDelete: (criterionId: string) => void;
  onMove: (criterionId: string, direction: "up" | "down") => void;
};

export const CriteriaList = ({
  criteria,
  viewMode,
  isSelecting,
  selectedCriterionIds,
  onToggleSelected,
  onEdit,
  onDelete,
  onMove,
}: CriteriaListProps) => {
  return (
    <ol>
      {criteria.map((criterion, index) => (
        <CriteriaRow
          key={criterion.id}
          criterion={criterion}
          index={index}
          total={criteria.length}
          viewMode={viewMode}
          isSelecting={isSelecting}
          isSelected={selectedCriterionIds.includes(criterion.id)}
          onToggleSelected={onToggleSelected}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
        />
      ))}
    </ol>
  );
};
