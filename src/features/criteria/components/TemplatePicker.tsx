import { useMemo, useState } from "react";

import type { CriterionDraftInput } from "../state/criterion.types";
import { criterionTemplateSections, type CriterionTemplate } from "../templates";
import { TemplateConfirmModal } from "./TemplateConfirmModal";

type TemplatePickerProps = {
  onTemplateConfirmed: (input: CriterionDraftInput) => void;
};

export const TemplatePicker = ({ onTemplateConfirmed }: TemplatePickerProps) => {
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const activeTemplate = useMemo<CriterionTemplate | null>(() => {
    if (!activeTemplateId) {
      return null;
    }

    for (const section of criterionTemplateSections) {
      const match = section.templates.find((template) => template.id === activeTemplateId);
      if (match) {
        return match;
      }
    }

    return null;
  }, [activeTemplateId]);

  const handleConfirm = (input: CriterionDraftInput) => {
    onTemplateConfirmed(input);
    setActiveTemplateId(null);
  };

  return (
    <section aria-labelledby="template-picker-heading">
      <h4 id="template-picker-heading">Start from templates</h4>
      <p>
        Pick a template for fast setup. You can confirm and customize before the criterion is
        added.
      </p>

      {criterionTemplateSections.map((section) => (
        <div key={section.id}>
          <h5>{section.heading}</h5>
          <p>{section.description}</p>
          <ul aria-label={`${section.heading} templates`}>
            {section.templates.map((template) => (
              <li key={template.id}>
                <p>
                  <strong>{template.label}</strong>
                </p>
                <p>{template.purpose}</p>
                <button type="button" onClick={() => setActiveTemplateId(template.id)}>
                  Customize then add
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {activeTemplate ? (
        <TemplateConfirmModal
          template={activeTemplate}
          isOpen
          onCancel={() => setActiveTemplateId(null)}
          onConfirm={handleConfirm}
        />
      ) : null}
    </section>
  );
};
