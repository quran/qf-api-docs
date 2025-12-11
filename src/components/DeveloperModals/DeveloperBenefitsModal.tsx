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
      href="https://quran.com/app-portal"
      target="_blank"
      rel="noopener noreferrer"
    >
      Quran App Portal
    </Link>
    .
  </>,
  "Direct support from QuranFoundation and its broader network.",
  "Reliable, copyrighted, scholarly verified content.",
  "Mission-driven community that prioritizes da'wah impact.",
  "Users can bring their reading history, bookmarks, saved verses, notes, reflections, and streaks into your app.",
  "Full feature set from Quran.com and QuranReflect, plus OAuth and a notification engine.",
  "Funding or in-kind support for high-value projects aligned with QuranFoundation plans.",
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
