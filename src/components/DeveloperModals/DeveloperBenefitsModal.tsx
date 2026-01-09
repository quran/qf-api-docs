import React from "react";
import Link from "@docusaurus/Link";

import DeveloperModal from "./DeveloperModal";

interface DeveloperBenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const benefitPoints: React.ReactNode[] = [
  "Comprehensive APIs, backend, and managed data so you can focus on solving unique problems.",
  <>
    Opportunity to be featured on Quran.com via {" "}
    <Link
      href="https://quran.com/apps-portal"
      target="_blank"
      rel="noopener noreferrer"
    >
      Quran App Portal
    </Link>
    .
  </>,
  "Direct support from Quran.Foundation and its broader network.",
  "Reliable, scholarly verified Quranic content, with properly licensed translations, tafsir, and supplementary materials.",
  "Mission-driven community that prioritizes da'wah impact.",
  "Users can bring their reading history, bookmarks, saved verses, notes, reflections, and reading streaks into your app.",
  "Full feature set from Quran.com and QuranReflect, plus OAuth and a notification engine.",
  "Funding or in-kind support for high-value projects aligned with Quran.Foundation plans.",
];

export default function DeveloperBenefitsModal({
  isOpen,
  onClose,
}: DeveloperBenefitsModalProps) {
  return (
    <DeveloperModal
      title="Developer Benefits"
      points={benefitPoints}
      ctaLabel="Got it"
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
