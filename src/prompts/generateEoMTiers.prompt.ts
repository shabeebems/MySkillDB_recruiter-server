/**
 * Prompt template for generating difficulty tier adjustments for EoM profile
 * Creates relaxed criteria for Easy and Medium tiers based on Hard tier profile
 */
export const buildEoMTiersPrompt = (
  jobTitle: string | undefined,
  profileData: any
): string => {
  return `Based on the following Employee of the Month profile for a ${
    jobTitle || "role"
  }, generate relaxed criteria for Easy and Medium tiers:

**Original EoM Profile (Hard Tier):**
Skills: ${JSON.stringify(
    profileData.skills?.map((s: any) => ({
      name: s.name,
      level: s.proficiencyLevel,
    }))
  )}
Behavioral: ${JSON.stringify(
    profileData.behavioral?.map((b: any) => ({
      trait: b.trait,
      importance: b.importance,
    }))
  )}
Deliverables: ${JSON.stringify(
    profileData.deliverables?.map((d: any) => ({
      goal: d.goal,
      difficulty: d.difficulty,
    }))
  )}

Generate adjusted criteria for:
1. **Easy Tier (60% threshold):** Suitable for candidates with potential who may need development
2. **Medium Tier (75% threshold):** Suitable for solid performers ready for the role

Return ONLY valid JSON in this format:
{
  "easy": {
    "skillAdjustments": [
      { "skillName": "string", "originalLevel": number, "adjustedLevel": number }
    ],
    "behavioralAdjustments": [
      { "trait": "string", "originalImportance": "string", "adjustedImportance": "string" }
    ],
    "deliverableAdjustments": [
      { "goal": "string", "relaxedTarget": "string" }
    ]
  },
  "medium": {
    "skillAdjustments": [
      { "skillName": "string", "originalLevel": number, "adjustedLevel": number }
    ],
    "behavioralAdjustments": [
      { "trait": "string", "originalImportance": "string", "adjustedImportance": "string" }
    ],
    "deliverableAdjustments": [
      { "goal": "string", "relaxedTarget": "string" }
    ]
  }
}

Guidelines:
- Easy tier: Reduce skill levels by 1-2, downgrade importance levels, relax deliverable targets by 40%
- Medium tier: Reduce skill levels by 1, slightly downgrade importance levels, relax deliverable targets by 20%
- Focus on the most impactful adjustments

Return ONLY the JSON object.`;
};

