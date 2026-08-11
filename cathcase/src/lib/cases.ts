import type { CathCase } from "./types";

export const cases: CathCase[] = [
  {
    slug: "lad-om1-bifurcation",
    title: "LAD + OM1 Bifurcation PCI",
    subtitle: "Provisional vs two-stent strategy in double-vessel CAD",
    topic: "bifurcation",
    difficulty: "intermediate",
    estimatedMinutes: 12,
    vignette:
      "58-year-old man with unstable angina. Coronary angiography reveals 90% stenosis in the mid-LAD with a large OM1 branch (~2.5 mm, 90% ostial lesion) arising from the diseased segment. LCx has a separate 90% mid-vessel lesion.",
    presentation: [
      "58M, smoker, unstable angina × 3 days",
      "Troponin mildly elevated",
      "Echo: EF 55%, no RWMA",
      "Plan: PCI of LAD/OM1 bifurcation today; LCx staged",
    ],
    learningObjectives: [
      "Classify bifurcation lesions using Medina criteria",
      "Apply provisional stenting algorithm for LAD–OM1",
      "Decide when a second stent is needed for the side branch",
      "Recognize when multivessel PCI should be staged",
    ],
    steps: [
      {
        id: "s1",
        prompt: "How do you classify this LAD–OM1 lesion?",
        context:
          "The LAD has disease proximal to and at the OM1 takeoff. OM1 is large (2.5 mm) with ostial 90% stenosis.",
        image: "/images/bifurcation/medina-classification.png",
        references: [
          {
            source: "Interventional Cardiology 8e",
            chapter: "Ch 23 Bifurcations",
            page: "p506",
            image: "/images/bifurcation/medina-classification.png",
            caption: "Medina bifurcation classification",
          },
        ],
        options: [
          {
            id: "a",
            label: "Medina 1-1-1 (true bifurcation)",
            isCorrect: true,
            feedback:
              "Correct. Disease involves the proximal main branch (LAD before OM1), the ostium of OM1, and the distal LAD beyond the bifurcation. This is a true bifurcation — but provisional stenting remains the default first strategy.",
            nextStepId: "s2",
          },
          {
            id: "b",
            label: "Medina 0-1-1 (side branch only)",
            isCorrect: false,
            feedback:
              "Not quite. The LAD has significant disease proximal to OM1 (the first digit = 1). Review Medina: each digit = proximal main / ostium of side branch / distal main.",
          },
          {
            id: "c",
            label: "Medina 1-0-1 (no side branch ostial disease)",
            isCorrect: false,
            feedback:
              "OM1 has 90% ostial stenosis, so the middle digit is 1, not 0.",
          },
        ],
      },
      {
        id: "s2",
        prompt: "What is your initial PCI strategy for the LAD–OM1 bifurcation?",
        context:
          "OM1 is large and supplies a significant territory. LCx lesion will be staged.",
        image: "/images/bifurcation/provisional-algorithm.png",
        references: [
          {
            source: "Interventional Cardiology 8e",
            chapter: "Ch 23",
            page: "p509",
            image: "/images/bifurcation/provisional-algorithm.png",
            caption: "Provisional stenting algorithm",
          },
        ],
        options: [
          {
            id: "a",
            label: "Provisional stenting: wire both branches, stent LAD, POT, assess OM1",
            isCorrect: true,
            feedback:
              "Correct. Even for true bifurcations, provisional stenting is the default. Wire both LAD and OM1, deploy DES in LAD across the bifurcation (jailing OM1 wire), perform proximal optimization (POT), then assess OM1 result.",
            nextStepId: "s3",
          },
          {
            id: "b",
            label: "Elective DK crush two-stent technique upfront",
            isCorrect: false,
            feedback:
              "Two-stent strategies upfront are reserved for when provisional fails or in select LMCA bifurcations. Starting with crush adds complexity without proven benefit over provisional in most LAD–OM1 cases.",
          },
          {
            id: "c",
            label: "Stent OM1 first, then cross into LAD",
            isCorrect: false,
            feedback:
              "Side-branch-first is occasionally used in specific anatomies, but the standard approach is main-branch (LAD) provisional stenting with the side branch wired.",
          },
        ],
      },
      {
        id: "s3",
        prompt:
          "After provisional LAD stenting and POT, OM1 has 70% residual ostial stenosis with TIMI 3 flow. Next step?",
        context:
          "You rewired OM1 through the distal cell. Angiographically the ostium looks 70% narrowed but flow is good.",
        options: [
          {
            id: "a",
            label: "Consider FFR/iFR of OM1 before deciding on a second stent",
            isCorrect: true,
            feedback:
              "Correct. Angiographic >50–70% ostial narrowing after jailing does not always mean hemodynamic significance. FFR/iFR helps avoid unnecessary second stent. Only ~27% of angiographically narrowed jailed SBs have FFR <0.75 (Koo et al).",
            nextStepId: "s4",
          },
          {
            id: "b",
            label: "Immediately deploy a second stent (TAP or culotte)",
            isCorrect: false,
            feedback:
              "Don't stent based on angiography alone after provisional. Many jailed side branches with mild-moderate ostial narrowing are functionally insignificant.",
          },
          {
            id: "c",
            label: "Leave as-is without any further assessment",
            isCorrect: false,
            feedback:
              "70% ostial narrowing in a large OM1 warrants functional assessment. A large side branch with significant territory should not be ignored, but FFR guides the decision.",
          },
        ],
      },
      {
        id: "s4",
        prompt: "FFR of OM1 is 0.72. What technique for the second stent?",
        context:
          "FFR confirms hemodynamic significance. You decide to stent OM1.",
        image: "/images/bifurcation/crush-culotte.png",
        references: [
          {
            source: "Interventional Cardiology 8e",
            chapter: "Ch 23",
            page: "p513",
            image: "/images/bifurcation/crush-culotte.png",
            caption: "Crush vs culotte techniques",
          },
        ],
        options: [
          {
            id: "a",
            label: "TAP (T and small protrusion) or culotte — either acceptable",
            isCorrect: true,
            feedback:
              "Correct. For LAD–OM1, TAP and culotte are both reasonable two-stent techniques after provisional failure. TAP is simpler; culotte may be preferred when both branches are similar size. Finish with FKBI (final kissing balloon inflation).",
            nextStepId: "s5",
          },
          {
            id: "b",
            label: "DK crush is mandatory for all two-stent bifurcations",
            isCorrect: false,
            feedback:
              "DK crush has specific indications (often LMCA bifurcations). For LAD–OM1, TAP or culotte are standard — DK crush is not mandatory.",
          },
          {
            id: "c",
            label: "Balloon angioplasty OM1 without stent despite FFR 0.72",
            isCorrect: false,
            feedback:
              "FFR 0.72 is hemodynamically significant. POBA alone in a large side branch with functional ischemia is inadequate — stent the SB.",
          },
        ],
      },
      {
        id: "s5",
        prompt: "What about the 90% LCx lesion?",
        context: "LAD/OM1 PCI completed successfully. Patient is stable.",
        image: "/images/bifurcation/multivessel-strategy.png",
        references: [
          {
            source: "Interventional Cardiology 8e",
            chapter: "Ch 19 Multivessel",
            page: "p417–421",
            image: "/images/bifurcation/multivessel-strategy.png",
            caption: "Multivessel PCI strategy",
          },
        ],
        options: [
          {
            id: "a",
            label: "Stage LCx PCI — do not treat both vessels in same session unless NSTE-ACS mandates",
            isCorrect: true,
            feedback:
              "Correct. In stable/unstable angina with multivessel disease, staging is preferred. Complete LAD/OM1 today; plan LCx for a second session after assessing symptoms and viability. Heart Team discussion if SYNTAX score is high.",
          },
          {
            id: "b",
            label: "Treat LCx in the same session — complete revascularization always",
            isCorrect: false,
            feedback:
              "Same-session multivessel PCI increases contrast load, procedure time, and risk. Staging is standard unless ongoing ischemia mandates complete revascularization.",
          },
          {
            id: "c",
            label: "Refer directly for CABG without attempting PCI",
            isCorrect: false,
            feedback:
              "CABG is not automatic. PCI of both vessels is feasible. Staged PCI is appropriate unless anatomy/syntax favors surgery.",
          },
        ],
      },
    ],
    keyTakeaways: [
      "Medina 1-1-1 = true bifurcation, but provisional stenting is still first-line",
      "Wire both branches → stent main → POT → assess side branch",
      "Angiographic SB narrowing after jailing ≠ always need second stent — use FFR",
      "TAP/culotte for two-stent bailout; FKBI always",
      "Stage multivessel PCI in stable presentations",
    ],
    keyReferences: [
      {
        source: "Interventional Cardiology 8e",
        chapter: "Ch 23 Bifurcations",
        page: "p504–521",
      },
      { source: "Kern's 7e", chapter: "Ch 6 PCI", page: "p384–406" },
      { source: "Topol 5e", chapter: "Ch 63 PCI", page: "p782–788" },
    ],
  },
  {
    slug: "chb-inferior-stemi",
    title: "Complete Heart Block in Inferior STEMI",
    subtitle: "Temporary pacing and permanent pacemaker decisions",
    topic: "bradyarrhythmia",
    difficulty: "intermediate",
    estimatedMinutes: 10,
    vignette:
      "62-year-old woman presents with inferior STEMI. After reperfusion with primary PCI to RCA, she develops complete (3rd degree) AV block with ventricular rate 35 bpm, blood pressure 85/50 mmHg, and altered sensorium.",
    presentation: [
      "62F, inferior STEMI → primary PCI to RCA",
      "Post-PCI: complete AV block, HR 35, BP 85/50",
      "QRS wide (~120 ms), no AV dissociation on monitor",
      "Altered sensorium, cool extremities",
    ],
    learningObjectives: [
      "Recognize complete AV block complicating inferior MI",
      "Indicate temporary transvenous pacing urgently",
      "Predict likelihood of recovery vs need for permanent pacemaker",
      "Apply ESC/AHA pacing guidelines post-STEMI",
    ],
    steps: [
      {
        id: "s1",
        prompt: "What is your immediate management?",
        context:
          "Patient is hemodynamically compromised with complete AV block after inferior STEMI PCI.",
        image: "/images/chb/topol-presentation.png",
        references: [
          {
            source: "Topol 5e",
            chapter: "Ch 22 Conduction",
            page: "p286",
            image: "/images/chb/topol-presentation.png",
            caption: "3rd degree AV block presentation",
          },
        ],
        options: [
          {
            id: "a",
            label:
              "Urgent transvenous temporary pacing + atropine while preparing",
            isCorrect: true,
            feedback:
              "Correct. Hemodynamically unstable complete AV block requires immediate temporary transvenous pacing. Atropine 0.5–1 mg IV may help transiently but is not definitive. Transcutaneous pacing as bridge if TV pacing delayed.",
            nextStepId: "s2",
          },
          {
            id: "b",
            label: "Observe — AV block often resolves within 24h in inferior MI",
            isCorrect: false,
            feedback:
              "While inferior MI AV block often resolves, this patient is hypotensive and altered. You cannot observe hemodynamic compromise — pace now.",
          },
          {
            id: "c",
            label: "Permanent pacemaker implantation immediately in cath lab",
            isCorrect: false,
            feedback:
              "PPM is not implanted emergently in acute MI. Temp pacing first, then reassess. Many inferior MI AV blocks resolve within 5–7 days.",
          },
        ],
      },
      {
        id: "s2",
        prompt:
          "Temp pacing established, BP improved. What is the expected course of AV block in inferior STEMI?",
        image: "/images/chb/stemi-avb-table.png",
        references: [
          {
            source: "Braunwald 12e",
            chapter: "Ch 35 STEMI",
            page: "p879",
            image: "/images/chb/stemi-avb-table.png",
            caption: "AV block in STEMI — incidence and recovery",
          },
        ],
        options: [
          {
            id: "a",
            label:
              "Often transient — monitor 5–7 days; many recover as edema resolves",
            isCorrect: true,
            feedback:
              "Correct. Inferior MI AV block is usually due to RCA-supplied AV node ischemia and is often reversible. Resolution rates are high if the artery is reperfused. Monitor with temp wire in place for 3–7 days.",
            nextStepId: "s3",
          },
          {
            id: "b",
            label: "Always permanent pacemaker — never recovers",
            isCorrect: false,
            feedback:
              "This is incorrect for inferior MI. Anterior MI with infranodal block has worse prognosis; inferior MI nodal block often recovers.",
          },
          {
            id: "c",
            label: "Remove temp wire after 2 hours if stable",
            isCorrect: false,
            feedback:
              "2 hours is far too early. AV block can recur. Standard is to keep temp pacing available for several days with gradual weaning trials.",
          },
        ],
      },
      {
        id: "s3",
        prompt:
          "Day 5: AV block persists (complete, HR 38 on backup pacing). Indication for permanent pacemaker?",
        image: "/images/chb/pacing-indications.png",
        references: [
          {
            source: "Kern's 7e",
            chapter: "Ch 7 EP Lab",
            page: "p456–457",
            image: "/images/chb/pacing-indications.png",
            caption: "Pacemaker indications",
          },
        ],
        options: [
          {
            id: "a",
            label:
              "Yes — persistent symptomatic AV block post-MI beyond 5 days warrants PPM",
            isCorrect: true,
            feedback:
              "Correct. Per guidelines, persistent 2nd degree type II or 3rd degree AV block after STEMI that does not resolve within 5–7 days is a Class I indication for permanent pacing.",
            nextStepId: "s4",
          },
          {
            id: "b",
            label: "No — wait at least 30 days before any PPM consideration",
            isCorrect: false,
            feedback:
              "30 days is too long. Guidelines recommend reassessment at 5–7 days. Persistent complete AV block at day 5 with symptoms = pace.",
          },
          {
            id: "c",
            label: "No — start theophylline and discharge without pacing",
            isCorrect: false,
            feedback:
              "Theophylline is not standard management for persistent complete AV block. This patient needs a permanent pacemaker.",
          },
        ],
      },
      {
        id: "s4",
        prompt: "What type of permanent pacemaker?",
        context: "Patient has normal LV function (EF 50% post-MI).",
        image: "/images/chb/management-algorithm.png",
        references: [
          {
            source: "Braunwald 12e",
            chapter: "Ch 50 Bradyarrhythmias",
            page: "p1454",
            image: "/images/chb/management-algorithm.png",
            caption: "Bradyarrhythmia management algorithm",
          },
        ],
        options: [
          {
            id: "a",
            label: "Dual-chamber pacemaker (DDD) — maintains AV synchrony",
            isCorrect: true,
            feedback:
              "Correct. DDD pacing is preferred in AV block with normal ventricular function to maintain AV synchrony and avoid pacemaker syndrome. Single-chamber VVI is acceptable if frail or limited life expectancy.",
          },
          {
            id: "b",
            label: "Single-chamber VVI only — no dual-chamber ever needed post-MI",
            isCorrect: false,
            feedback:
              "VVI is an option but DDD is preferred in patients with normal LV function who will benefit from AV synchrony long-term.",
          },
          {
            id: "c",
            label: "CRT-D (biventricular ICD) as first-line",
            isCorrect: false,
            feedback:
              "CRT-D is for heart failure with EF ≤35% and LBBB. This patient has EF 50% — standard DDD pacemaker is appropriate.",
          },
        ],
      },
    ],
    keyTakeaways: [
      "Unstable complete AV block → urgent temp pacing, don't wait",
      "Inferior MI AV block is often transient (RCA → AV node ischemia)",
      "Reassess at 5–7 days — persistent block = Class I PPM indication",
      "DDD preferred when LV function is preserved",
    ],
    keyReferences: [
      {
        source: "Braunwald 12e",
        chapter: "Ch 50 Bradyarrhythmias",
        page: "p1444–1458",
      },
      { source: "Topol 5e", chapter: "Ch 22", page: "p280–289" },
      { source: "Kern's 7e", chapter: "Ch 7 EP Lab", page: "p456–457" },
    ],
  },
  {
    slug: "jailed-sb-ffr",
    title: "Jailed Side Branch — FFR Decision",
    subtitle: "When angiography lies after provisional stenting",
    topic: "ffr",
    difficulty: "beginner",
    estimatedMinutes: 8,
    vignette:
      "During provisional PCI of a Medina 1-0-1 LAD–D1 bifurcation, you deployed a DES across the LAD jailing the D1 wire. After POT and D1 rewire, angiography shows 65% ostial D1 stenosis with TIMI 3 flow. D1 is 2.0 mm, supplies a moderate territory.",
    presentation: [
      "55M, stable angina, positive stress test LAD territory",
      "Medina 1-0-1 LAD–D1 bifurcation",
      "Provisional LAD stent deployed, D1 rewired",
      "Residual 65% ostial D1 stenosis, TIMI 3 flow",
    ],
    learningObjectives: [
      "Understand the jailed side branch phenomenon",
      "Know when FFR is indicated after provisional stenting",
      "Interpret FFR thresholds for side branch intervention",
      "Avoid unnecessary two-stent bifurcation procedures",
    ],
    steps: [
      {
        id: "s1",
        prompt: "Why does the side branch look narrowed after provisional stenting?",
        image: "/images/ffr/jailed-sb-ffr.png",
        references: [
          {
            source: "Interventional Cardiology 8e",
            chapter: "Ch 5 FFR",
            page: "p142",
            image: "/images/ffr/jailed-sb-ffr.png",
            caption: "Jailed side branch physiology",
          },
        ],
        options: [
          {
            id: "a",
            label:
              "Carina shift + ostial distortion from main branch stent — not always true stenosis",
            isCorrect: true,
            feedback:
              "Correct. Provisional stenting displaces the carina and creates ostial 'pinching' of the side branch. This angiographic appearance overestimates true functional stenosis in many cases.",
            nextStepId: "s2",
          },
          {
            id: "b",
            label: "The side branch is always truly occluded and needs stenting",
            isCorrect: false,
            feedback:
              "This is the most common mistake. Most jailed side branches with TIMI 3 flow do NOT need a second stent.",
          },
          {
            id: "c",
            label: "It is an artifact of contrast timing only",
            isCorrect: false,
            feedback:
              "While contrast timing affects angiography, the narrowing here is structural (carina shift from stent), not just a filming artifact.",
          },
        ],
      },
      {
        id: "s2",
        prompt: "Should you proceed directly to a second stent for D1?",
        options: [
          {
            id: "a",
            label: "No — assess with FFR/iFR first",
            isCorrect: true,
            feedback:
              "Correct. Functional assessment is essential. Koo et al showed only ~27% of jailed SBs with >75% angiographic stenosis had FFR <0.75. Stenting all angiographic lesions would overtreat ~3 in 4 patients.",
            nextStepId: "s3",
          },
          {
            id: "b",
            label: "Yes — any >50% ostial SB stenosis after jailing needs stent",
            isCorrect: false,
            feedback:
              "The 50% threshold is angiographic and outdated for post-jailing assessment. FFR is the standard of care.",
          },
          {
            id: "c",
            label: "Yes — TIMI flow doesn't matter, stent based on anatomy",
            isCorrect: false,
            feedback:
              "TIMI 3 flow with moderate angiographic stenosis is exactly the scenario where FFR prevents unnecessary stenting.",
          },
        ],
      },
      {
        id: "s3",
        prompt: "FFR of D1 = 0.88. Your decision?",
        image: "/images/ffr/ffr-algorithm.png",
        references: [
          {
            source: "Interventional Cardiology 8e",
            chapter: "Ch 5",
            page: "p142–146",
            image: "/images/ffr/ffr-algorithm.png",
            caption: "FFR-guided side branch management",
          },
        ],
        options: [
          {
            id: "a",
            label: "No side branch stent — FFR >0.80 is not significant",
            isCorrect: true,
            feedback:
              "Correct. FFR 0.88 confirms no hemodynamic significance. Leave D1 unstented. This is the most common outcome after provisional stenting and is associated with excellent outcomes.",
          },
          {
            id: "b",
            label: "Stent D1 anyway — angiography shows 65%",
            isCorrect: false,
            feedback:
              "Ignoring FFR and stenting based on angiography leads to unnecessary two-stent procedures, longer procedures, and more complications without benefit.",
          },
          {
            id: "c",
            label: "Repeat FFR after 6 months",
            isCorrect: false,
            feedback:
              "FFR 0.88 is clearly non-significant. No need to defer — the decision is made now.",
          },
        ],
      },
      {
        id: "s4",
        prompt:
          "If FFR had been 0.68 instead, what would be the best two-stent approach for LAD–D1?",
        options: [
          {
            id: "a",
            label: "TAP or culotte with final kissing balloon inflation (FKBI)",
            isCorrect: true,
            feedback:
              "Correct. FFR <0.80 in a significant side branch warrants stenting. TAP is the simplest bailout; culotte if branches are similar caliber. Always finish with FKBI to optimize ostial results.",
          },
          {
            id: "b",
            label: "POBA the side branch only — no stent needed even with FFR 0.68",
            isCorrect: false,
            feedback:
              "FFR 0.68 is clearly positive. POBA alone has high restenosis rates — stent the side branch.",
          },
          {
            id: "c",
            label: "Crush the side branch stent without rewiring main branch",
            isCorrect: false,
            feedback:
              "Any two-stent technique requires proper rewiring and FKBI. Crushing without technique leads to poor outcomes.",
          },
        ],
      },
    ],
    keyTakeaways: [
      "Jailed SB narrowing is often angiographic, not functional",
      "FFR/iFR before any second stent — standard of care",
      "FFR >0.80 → leave SB alone (most common outcome)",
      "FFR ≤0.80 → TAP/culotte + FKBI",
    ],
    keyReferences: [
      {
        source: "Interventional Cardiology 8e",
        chapter: "Ch 5 FFR",
        page: "p142–146",
      },
      { source: "Koo et al", chapter: "JACC 2012", page: "Jailed SB FFR study" },
    ],
  },
];

export function getCase(slug: string): CathCase | undefined {
  return cases.find((c) => c.slug === slug);
}
