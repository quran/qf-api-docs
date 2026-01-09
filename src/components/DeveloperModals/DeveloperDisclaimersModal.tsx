import React from "react";

import DeveloperModal from "./DeveloperModal";

interface DeveloperDisclaimersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const disclaimerPoints: React.ReactNode[] = [
  "Examine intention and risks; your product shapes hearts and behavior.",
  "Building a Quranic or guidance app is a form of da'wah service, so it requires close alignment with qualified scholars, relying on their guidance, consulting them on content, behavior design, priorities, and potential harms, and citing references throughout.",
  "Respect copyrights and licensing expectations.",
  "Honor scholarly review and keep content aligned with verified sources.",
  "Use the API to keep content accurate as removals, additions, or edits occur.",
  "Focus on solving unique problems; the ummah needs more coverage than current resources provide.",
  "Decide your commercial stance with scholars; if allowed, follow guidelines for both developers and Quran.Foundation collaboration.",
  "Practice ta'awun (Quranic collaboration) with the wider ecosystem.",
];

export default function DeveloperDisclaimersModal({
  isOpen,
  onClose,
}: DeveloperDisclaimersModalProps) {
  return (
    <DeveloperModal
      title="Developer Disclaimers"
      points={disclaimerPoints}
      ctaLabel="Understood"
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
