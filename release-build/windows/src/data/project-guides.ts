export type ProjectGuide = {
  essentialQuestion: string
  studentBrief: string
  workedExample: string
  safety: string[]
  deliverables: string[]
  milestones: Array<{ tasks: string[]; qualityChecks: string[] }>
}

export const projectGuides: Record<string, ProjectGuide> = {
  'smart-sorter': {
    essentialQuestion: 'How can transparent rules sort everyday classroom objects, and how do we prove where those rules work or fail?',
    studentBrief: 'You are designing a sorter that another learner can understand, test, and improve. Your goal is not to make the most complicated system. Your goal is to define useful categories, observe safe features, write clear rules, test them honestly, and explain uncertain cases. This project teaches the complete AI workflow through a rule-based baseline before introducing machine learning.',
    workedExample: 'For a paper cup, features might be material=paper, food residue=yes, reusable=no. A rule could send clean paper to recyclable but send food-contaminated paper to other waste. The important work is defining “clean enough,” resolving conflicting rules, and recording evidence. If two learners apply the same rule differently, the definition needs improvement.',
    safety: ['Handle only clean, safe objects or use picture cards.', 'Do not include names, labels, or belongings that identify another learner.', 'Ask an adult before handling sharp, broken, chemical, medical, or food-waste items.', 'Use “uncertain - ask a person” when the rules do not have enough evidence.'],
    deliverables: ['One-page problem statement and category guide', 'Feature table with at least 15 examples', 'Readable rule sheet or flowchart', 'Test report with normal, boundary, conflict, and unknown cases', 'Before-and-after comparison plus a two-minute demonstration'],
    milestones: [
      {
        tasks: ['Observe the current sorting process.', 'Choose two to four categories that have a real classroom purpose.', 'Write inclusion, exclusion, and uncertain-case definitions.', 'Define success using a measurable test result.'],
        qualityChecks: ['A new learner can apply each category definition.', 'The goal does not claim to identify every possible object.', 'The project states who reviews uncertain outcomes.'],
      },
      {
        tasks: ['Choose features visible without damaging an object.', 'Define allowed values for material, flexibility, cleanliness, and reuse.', 'Record at least 15 examples, including difficult items.', 'Mark missing or uncertain features explicitly.'],
        qualityChecks: ['Every feature supports a rule.', 'Units and category values are consistent.', 'No personal or unsafe information is collected.'],
      },
      {
        tasks: ['Write rules in priority order.', 'Add a conflict rule and an unknown outcome.', 'Predict every example before checking the expected category.', 'Calculate the percentage correct and list each error.'],
        qualityChecks: ['Rules are understandable without hidden knowledge.', 'The same input produces the same result.', 'Test results are recorded rather than remembered.'],
      },
      {
        tasks: ['Group errors by unclear feature, conflicting rule, missing category, or unusual object.', 'Revise only one major rule.', 'Rerun the unchanged test set.', 'Compare accuracy and error types before and after.'],
        qualityChecks: ['The revision fixes evidence rather than one memorized item.', 'No previously correct category is silently broken.', 'Remaining limitations are listed.'],
      },
      {
        tasks: ['Prepare a live normal case, difficult case, and unknown case.', 'Explain input, rules, output, evidence, and limitations.', 'Compare the sorter with a possible machine-learning version.', 'Collect one question and one improvement suggestion.'],
        qualityChecks: ['Claims match the recorded tests.', 'Human review is visible in the demonstration.', 'The learner can explain why rules were the right baseline.'],
      },
    ],
  },
  'study-planner': {
    essentialQuestion: 'How can a private offline planner recommend useful study actions while leaving goals and final choices with the learner?',
    studentBrief: 'Design a planner for fictional learners with different available time, prerequisite gaps, deadlines, and accessibility needs. The planner must explain every recommendation. It must not rank a learner’s worth, collect unnecessary personal details, or pretend to know motivation. Start with transparent logic and test whether the schedule is realistic.',
    workedExample: 'A learner has 30 minutes, scored 55% on fractions, has not completed ratio prerequisites, and has a science deadline tomorrow. A defensible plan might allocate 10 minutes to the science deadline, 15 minutes to a fraction prerequisite activity, and five minutes to reflection. The explanation should state the evidence and allow the learner to change the plan.',
    safety: ['Use fictional profiles during development.', 'Do not collect health, family, identity, password, or disciplinary information.', 'Recommendations must remain optional and editable.', 'Include breaks and avoid schedules that encourage unhealthy study time.'],
    deliverables: ['Three detailed fictional learner profiles', 'Decision table and flowchart', 'Four-screen paper or digital prototype', 'Eight or more scenario tests', 'Privacy statement, limitations, and revised planner'],
    milestones: [
      {
        tasks: ['Create three contrasting fictional profiles.', 'List goals, available time, completed prerequisites, deadlines, and learner-controlled preferences.', 'Separate necessary from unnecessary data.', 'Write three interview questions focused on needs rather than identity.'],
        qualityChecks: ['Profiles differ meaningfully.', 'Every field has a stated planning purpose.', 'Private attributes are absent.'],
      },
      {
        tasks: ['Define priority scores for deadlines, prerequisites, low mastery, and learner choice.', 'Set maximum session and break rules.', 'Handle missing data and equal priorities.', 'Create an explanation template for each recommendation.'],
        qualityChecks: ['Boundary values are unambiguous.', 'The planner cannot schedule more time than available.', 'A learner can override the result.'],
      },
      {
        tasks: ['Build input, proposed plan, explanation, and progress views.', 'Show why each item appears.', 'Add edit, accept, and skip actions.', 'Preserve data locally and provide a reset option.'],
        qualityChecks: ['A first-time user can complete the flow.', 'The interface does not shame low scores.', 'The plan remains useful without internet.'],
      },
      {
        tasks: ['Test short and long time windows, no deadline, several deadlines, missing score, low prerequisite mastery, and accessibility needs.', 'Record expected and actual plans.', 'Ask another learner to explain the recommendation.', 'Identify unfair or unrealistic cases.'],
        qualityChecks: ['At least eight scenarios are documented.', 'Explanations match the decision logic.', 'The test includes failure and boundary cases.'],
      },
      {
        tasks: ['Prioritize the most harmful or frequent problem.', 'Revise one rule or screen.', 'Rerun the same scenarios.', 'Write intended use, prohibited use, privacy, and limitation statements.'],
        qualityChecks: ['Evidence shows whether the revision helped.', 'No claim is made about intelligence, effort, or future success.', 'The final demo includes an override.'],
      },
    ],
  },
  'message-classifier': {
    essentialQuestion: 'Can a transparent classifier organize fictional school messages accurately enough to save time without making high-impact decisions?',
    studentBrief: 'Create an original, privacy-safe dataset and a reproducible baseline classifier. You will learn how label definitions, balanced examples, confusion matrices, and error analysis influence results. The classifier is for organization only; it must not judge behaviour, urgency involving safety, or disciplinary action.',
    workedExample: 'The message “Bus route 3 leaves early after the sports event” contains both transport and event evidence. A single keyword rule may fail. The label guide could permit multiple labels or define a primary purpose. Whatever choice is made must be documented and applied consistently by more than one reviewer.',
    safety: ['Write fictional messages; do not copy real student or family communications.', 'Exclude names, phone numbers, addresses, account details, and emergency content.', 'Do not use the classifier for discipline, safeguarding, or attendance decisions.', 'Keep an unknown or human-review outcome.'],
    deliverables: ['Label guide with inclusion, exclusion, and ambiguous examples', 'At least 60 original balanced fictional messages', 'Dataset card and split record', 'Rule baseline with confusion matrix, accuracy, precision, and recall', 'Error analysis, improved version, and model card'],
    milestones: [
      {
        tasks: ['Choose three to five useful categories.', 'Define each category using positive and negative examples.', 'Decide how multi-topic messages are handled.', 'Ask a second reviewer to label ten shared examples.'],
        qualityChecks: ['Labels are mutually understandable.', 'Reviewer disagreements are recorded and resolved.', 'The categories support organization rather than judgment.'],
      },
      {
        tasks: ['Write at least 60 original messages.', 'Balance category counts.', 'Include short, long, misspelled, and ambiguous examples.', 'Split records before building rules and document the dataset.'],
        qualityChecks: ['No real private message is present.', 'Duplicates and near-duplicates are removed.', 'Test examples remain hidden during rule development.'],
      },
      {
        tasks: ['Build keyword or weighted evidence rules.', 'Return unknown when evidence is weak.', 'Run the held-back test once.', 'Calculate a confusion matrix and per-category metrics.'],
        qualityChecks: ['Code and settings are versioned.', 'Metrics are calculated from recorded counts.', 'The system does not invent a category for blank input.'],
      },
      {
        tasks: ['Read every false positive and false negative.', 'Group errors into ambiguity, missing wording, label inconsistency, or conflicting evidence.', 'Change one feature or rule.', 'Rerun the unchanged test and compare.'],
        qualityChecks: ['The improvement is measured on the same records.', 'Trade-offs between categories are reported.', 'Examples are not added to rules by memorizing exact sentences.'],
      },
      {
        tasks: ['Write intended users and uses.', 'List prohibited decisions.', 'Report dataset size, split, metrics, error patterns, and unknown handling.', 'Demonstrate one correct, incorrect, and ambiguous case.'],
        qualityChecks: ['The model card allows another learner to reproduce the test.', 'Limitations are prominent.', 'Human review remains available.'],
      },
    ],
  },
  'plant-advisor': {
    essentialQuestion: 'How can local observations support cautious plant-care suggestions without pretending to diagnose every condition?',
    studentBrief: 'Build an offline advisor that uses measurable plant and environment observations. Keep the goal narrow: suggest a safe next inspection or care action, not a guaranteed diagnosis. Begin with expert-reviewed rules and add a learned model only if suitable data and evaluation justify it.',
    workedExample: 'If soil is dry, recent watering is more than three days ago, and the plant normally prefers moist soil, the advisor may suggest checking whether watering is appropriate. It should not automatically say “water now” because plant type, drainage, temperature, and disease may matter. The interface should explain the observations behind the suggestion.',
    safety: ['Do not advise tasting or touching unknown plants.', 'Use adult supervision for fertilizers, pesticides, tools, or potentially toxic plants.', 'Do not claim to diagnose disease or replace local horticultural expertise.', 'Record uncertainty and recommend observation when evidence is incomplete.'],
    deliverables: ['Approved narrow problem and safety boundary', 'Data dictionary and at least 40 safe observations or a documented simulation', 'Transparent baseline and optional model comparison', 'Condition-based evaluation and uncertainty messages', 'Data card, model card, source register, and maintenance plan'],
    milestones: [
      {
        tasks: ['Choose one plant type or narrow care decision.', 'Interview or consult an approved knowledgeable source.', 'Define users, safe suggestions, prohibited advice, and success.', 'Compare a simple reference guide with an AI-assisted option.'],
        qualityChecks: ['The goal is observable and testable.', 'Safety boundaries are explicit.', 'AI provides a justified benefit.'],
      },
      {
        tasks: ['Define plant type, soil state, light, temperature, recent watering, observation, and target action.', 'Specify units and category definitions.', 'Plan repeated measurements and missing values.', 'Document source, permission, storage, and deletion.'],
        qualityChecks: ['Measurements can be repeated by another learner.', 'Targets are reviewed for consistency.', 'No personal information is collected.'],
      },
      {
        tasks: ['Implement a rule baseline.', 'Add validation and unknown handling.', 'Build an interface that shows evidence.', 'Train a model only if enough approved examples exist and compare it with the baseline.'],
        qualityChecks: ['The baseline works entirely offline.', 'Invalid and missing values produce clear messages.', 'A model is not added merely to make the project sound advanced.'],
      },
      {
        tasks: ['Test plant types, light levels, soil categories, missing data, and unusual combinations.', 'Report performance by condition.', 'Inspect false advice and uncertainty behaviour.', 'Measure speed, memory, restart, and offline persistence.'],
        qualityChecks: ['Test data is separate from development data.', 'Potentially harmful advice is counted explicitly.', 'Results include sample counts and limitations.'],
      },
      {
        tasks: ['Prepare setup and safe-use instructions.', 'Complete data and model cards.', 'List sources and licences.', 'Assign feedback, review, update, rollback, and retirement responsibilities.'],
        qualityChecks: ['A teacher can reproduce the demonstration.', 'Claims are no stronger than evidence.', 'The system can be paused when unsafe behaviour appears.'],
      },
    ],
  },
  'community-capstone': {
    essentialQuestion: 'How can a community team use evidence, responsible design, and appropriate technology to improve a real local need?',
    studentBrief: 'This capstone combines discovery, planning, engineering, evaluation, responsible AI, and communication. Work with adult supervision and approved stakeholders. The result may be an AI tool, a hybrid system, or a well-supported decision that AI is not appropriate. Community benefit and evidence matter more than technical complexity.',
    workedExample: 'A team notices that public learning resources are difficult to locate. It compares a printed directory, searchable offline database, and language-model assistant. Interviews show that reliable categories and local-language labels matter more than free-form generation. The team chooses an offline searchable directory with optional AI query suggestions and human-reviewed content.',
    safety: ['Obtain adult and organizational approval before interviews or data collection.', 'Do not collect sensitive personal information unless an approved process clearly requires it.', 'Avoid medical, legal, biometric, surveillance, disciplinary, and other high-impact automation.', 'Provide consent, withdrawal, correction, human review, and project-stopping procedures.'],
    deliverables: ['Stakeholder-approved problem and alternatives report', 'Architecture, data plan, risk register, licence inventory, milestones, and acceptance criteria', 'Baseline, prototype, improved version, and engineering log', 'Functional, model, usability, fairness, safety, offline, and recovery test report', 'Final product, documentation set, community demonstration, feedback, and reflection'],
    milestones: [
      {
        tasks: ['Observe the existing process.', 'Conduct supervised stakeholder conversations.', 'Separate evidence from assumptions.', 'Compare process, non-AI software, rule-based, and learned-model options.', 'Complete a risk and approval screen.'],
        qualityChecks: ['The need is supported by more than one source.', 'Scope fits the available time and devices.', 'Affected people can disagree or withdraw.'],
      },
      {
        tasks: ['Draw the architecture and data flow.', 'Create data, privacy, security, safety, accessibility, and licence plans.', 'Define milestones and measurable acceptance criteria.', 'Assign owners and review dates.', 'Plan rollback and deletion.'],
        qualityChecks: ['Every collected field has a purpose.', 'High-risk features are removed or approved.', 'The plan identifies conditions that stop the project.'],
      },
      {
        tasks: ['Build a transparent baseline.', 'Test the riskiest assumption with a prototype.', 'Develop in versioned milestones.', 'Validate inputs and expose errors clearly.', 'Record decisions, failures, settings, and checksums.'],
        qualityChecks: ['Each milestone produces runnable evidence.', 'The project works offline where required.', 'Complexity is added only after measured baseline results.'],
      },
      {
        tasks: ['Create a traceable test plan.', 'Evaluate accuracy and error types where a model is used.', 'Test usability and accessibility with approved participants.', 'Test privacy, misuse, restart, storage, cancellation, and recovery.', 'Report PASS, FAIL, and NOT RUN honestly.'],
        qualityChecks: ['Metrics match real consequences.', 'Relevant conditions are tested separately.', 'Serious failures have mitigation or block release.'],
      },
      {
        tasks: ['Demonstrate normal and difficult cases.', 'Present evidence, failures, improvements, and limits.', 'Collect structured stakeholder feedback.', 'Deliver setup, source, licence, data, model, test, and maintenance documents.', 'Write individual and team reflections.'],
        qualityChecks: ['Community claims are approved and evidence-based.', 'Maintenance has an owner and schedule.', 'Feedback results in documented next actions.'],
      },
    ],
  },
}
