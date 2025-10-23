"use client";

import { Modal } from "@mantine/core";

export default function QuickPreviewModal({ opened, onClose, ingredients = [], steps = [] }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      overlayProps={{ opacity: 0.35, blur: 2 }}
    >
      <div className=" cursor-pointer space-y-6 text-[var(--color-text)] dark:text-[var(--color-text)]">
        <h3>Quick Preview</h3>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">Ingredients</h3>
          <ul className="mt-3 list-disc pl-5 space-y-3 text-sm sm:text-base">
            {ingredients.length > 0 ? (
              ingredients.map((ingredient, index) => <li key={index}>{ingredient}</li>)
            ) : (
              <li>No ingredients provided.</li>
            )}
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide opacity-70">Steps</h3>
          <ol className="mt-3 list-decimal pl-5 space-y-3 text-sm leading-relaxed">
            {steps.length > 0
              ? steps.map((step, index) => <li key={index}>{step}</li>)
              : <li>No steps provided.</li>}
          </ol>
        </section>
      </div>
    </Modal>
  );
}
