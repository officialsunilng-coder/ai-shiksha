export type LessonGuide = {
  deepDive: string
  workedExample: string
  practice: string
}

export const lessonGuides: Record<string, LessonGuide> = {
  'ai-foundations-1': {
    deepDive: `To decide whether a tool uses AI, ask three questions. First, what input does it receive: text, images, sound, sensor readings, or past choices? Second, does it only follow fixed instructions, or does it use a model that learned patterns from examples? Third, what output does it produce: a category, prediction, recommendation, generated response, or action?

AI is an umbrella term. Machine learning is one way to build AI. Generative AI is a type of machine learning that creates new text, images, audio, or code. A calculator follows exact mathematical rules; a spam filter normally uses learned patterns; a navigation app combines maps, rules, live measurements, and prediction. Many real products are mixed systems rather than “all AI” or “no AI.”

AI has no human understanding, feelings, intentions, or common sense. It represents patterns as numbers and calculations. Its result depends on its task, training examples, current input, settings, and testing. A useful description therefore names the task and evidence instead of saying that a machine is simply “smart.”`,
    workedExample: `Consider predictive typing on a phone. The input is the letters already typed and sometimes previous words. The model estimates which word or character is likely to come next. The output is a ranked list of suggestions. The learner remains in control and may accept or reject each suggestion.

Now compare it with an alarm clock set for 7:00 a.m. The clock checks the current time against a fixed value and rings when they match. It does not need to learn from examples. A “smart alarm” that studies sleep and movement patterns may add AI, but the ordinary time rule is still automation.

The important conclusion is that visible complexity does not prove AI. Evidence comes from how the system processes input.`,
    practice: `1. Choose six familiar tools, including a calculator, camera, search feature, game opponent, timer, and voice assistant.
2. For each tool, write its input, processing method, output, and whether it uses rules, AI, or both.
3. Choose one AI example and identify one mistake it might make.
4. Write one sentence explaining how a person should check or control its output.
5. Explain your classification to another learner without using the word “smart.”`,
  },
  'ai-foundations-2': {
    deepDive: `An algorithm must be finite, ordered, and unambiguous. “Make the room comfortable” is a goal, not an algorithm. “Read the temperature; if it is above 28°C, turn on the fan; otherwise leave it off” is a simple algorithm. Inputs enter the procedure, steps transform them, and outputs show the result.

Rule-based programs are valuable when experts can state the logic clearly and the environment is stable. Rules are easy to inspect, test, and explain. Their weakness appears when there are hundreds of exceptions or when inputs such as handwriting, speech, and photographs vary too much for simple conditions.

Machine learning does not remove algorithms. Training, evaluation, and prediction are all algorithms. The difference is that some decision parameters are learned from examples instead of being fully written by a programmer. A responsible team first asks whether a transparent rule is sufficient before choosing the cost and uncertainty of a learned model.`,
    workedExample: `A school library wants to route returned books. A rule system could say:
1. If the spine label begins with F, send the book to Fiction.
2. If it begins with B, send it to Biography.
3. Otherwise, send it to General Collection.

This works because the label system is deliberate and stable. An image model that guesses the shelf from a cover photo would be slower, harder to explain, and less reliable.

For sorting handwritten request notes, however, fixed rules may fail because writers use many phrases. A classifier trained on carefully labelled examples might be useful. The team should still compare it with a keyword baseline and keep human review for uncertain notes.`,
    practice: `1. Write pseudocode for deciding whether a learner should review, practise, or advance based on a quiz score.
2. Test scores of 0, 69, 70, 89, 90, and 100. These boundary values often reveal unclear rules.
3. Add a rule for a missing score without pretending that missing means zero.
4. Describe one situation where these rules would become too complicated.
5. State what labelled examples a machine-learning version would need and what evidence would justify replacing the rules.`,
  },
  'ai-foundations-3': {
    deepDive: `Supervised learning begins with examples that contain features and a target label. During training, the model predicts a target, a loss function measures the difference from the known answer, and an optimization algorithm adjusts model parameters. Repeating this process across many examples can reduce error.

A model must learn a general pattern rather than memorize the training records. Memorization can produce excellent training results and poor results on new examples; this is called overfitting. Underfitting occurs when the model or features are too simple to capture the useful pattern.

Data quality matters at every stage. Incorrect labels teach incorrect relationships. Unrepresentative examples create blind spots. A feature that accidentally reveals the answer can create leakage. Evaluation therefore uses separate examples and reports failures, not only successes. A prediction is an estimate with uncertainty, not a guaranteed fact.`,
    workedExample: `Imagine 60 fruit records with color, mass, surface texture, and the label apple or orange. Use 40 records for training, 10 for validation, and 10 for final testing.

The model may learn that orange color and dimpled texture often indicate an orange. But color alone is insufficient because lighting changes and some apples are orange-red. Validation may show that texture improves the model. The final test set then estimates performance on unseen fruit.

If every orange photo was taken on a white table and every apple photo on a brown table, the model might learn table color instead of fruit. It could score highly in the classroom and fail elsewhere. That is a data-design failure, not machine intelligence.`,
    practice: `1. Make twelve fictional animal records using size, covering, movement, and a category label.
2. Separate eight training examples and four test examples before inventing any rules.
3. Ask a partner to infer a pattern from training examples only.
4. Test the pattern on the held-back records and record every error.
5. Decide whether each error suggests a poor label, missing feature, unusual example, or weak rule. Propose one improvement without changing the test answers.`,
  },
  'ai-foundations-4': {
    deepDive: `People and AI contribute different capabilities. Computers can repeat calculations consistently, search large structured collections, and detect statistical regularities. People can understand goals, relationships, culture, values, consequences, and lived experience. People can also question whether a task should be automated at all.

A human-in-the-loop system assigns meaningful authority to people. Human review is not a decorative approval button. Reviewers need enough information, time, training, and power to reject the model’s suggestion. The system should record uncertainty and provide a path to correct mistakes.

Accountability remains with the people and organizations that select, configure, and use technology. Saying “the computer decided” does not remove responsibility. Higher-impact decisions require stronger evidence, qualified expertise, appeal mechanisms, and sometimes a decision not to use AI.`,
    workedExample: `A study planner suggests that a learner revise fractions. The model can summarize recent quiz errors and propose exercises. The learner and teacher know whether illness, language difficulty, missing lessons, or inaccessible materials affected the score.

A good process shows the evidence used, lets the learner correct missing information, allows the teacher to change the plan, and records that the suggestion is advisory. A bad process automatically labels the learner as weak and blocks access to new work.

The same prediction can therefore be helpful or harmful depending on the surrounding human process.`,
    practice: `1. Choose an AI-assisted decision in education, health, transport, or farming.
2. List what the system can calculate and what requires human context or values.
3. Name the person responsible for the final decision.
4. Design a correction or appeal path for someone affected by an error.
5. Write a “stop using the system” condition, such as repeated unsafe mistakes or performance below an agreed threshold.`,
  },
  'data-patterns-1': {
    deepDive: `A dataset is organized evidence. Each row normally represents one observation or example. Each column represents a variable such as temperature, category, or measurement. Numerical data may be continuous, such as height, or discrete, such as number of books. Categorical data uses labels such as material type. Text, images, and audio are also data but require suitable representations before most models can process them.

Features should be relevant, measurable, and available when the model is used. A target is the outcome to predict. Identifiers such as a student number usually do not describe the underlying problem and can create privacy or memorization risks.

Before collection, define the purpose, owner, source, format, units, allowed use, storage period, and quality checks. Data minimization means collecting only what is necessary. Consent must be informed and appropriate, especially for children. Anonymous-looking records may still identify someone when several details are combined.`,
    workedExample: `For a seed-sprouting project, one row represents one planted seed. Safe features could include seed type, water amount in millilitres, hours of light, planting depth, and soil type. The target could be whether the seed sprouted within seven days.

The table must record units consistently. A water value of 20 is meaningless unless it says millilitres. “A lot of light” is difficult to compare, so the team should define a measurable scale.

The learner’s name, home address, and photograph add no value to this question and should not be collected.`,
    practice: `1. Write a precise question that a small dataset could help answer.
2. Design a table with one record identifier, four useful features, and one target.
3. Add units and allowed values for every column.
4. Create six fictional records, including one missing value and one impossible value.
5. Mark the quality problems, decide how to handle them, and explain why no personal information is required.`,
  },
  'data-patterns-2': {
    deepDive: `Exploratory data analysis helps learners understand a dataset before modelling. Begin with the number of records, data types, missing values, duplicates, category counts, minimum and maximum values, and a typical value such as median or mean. The median is often more stable when outliers are present.

Choose a chart that matches the question. Bar charts compare category counts. Histograms show the distribution of one numerical variable. Line charts show ordered change over time. Scatter plots compare two numerical variables. Every chart needs a meaningful title, labelled axes, units, and an honest scale.

An outlier may be a recording mistake or a real rare event; do not delete it automatically. Correlation measures association, not cause. To argue that one factor causes another, researchers need a defensible design, control of alternative explanations, and domain evidence.`,
    workedExample: `Suppose five study sessions lasted 20, 25, 25, 30, and 120 minutes. The mean is 44 minutes, but the median is 25 minutes. The 120-minute session strongly changes the mean.

Investigation shows that the timer was left running during lunch. Correcting the recording is justified because there is evidence of measurement error. If the learner truly studied for 120 minutes, deleting it merely because it is unusual would hide real information.

A line chart can show session duration by date, while a histogram can show how often durations fall into ranges. The chart choice depends on the question.`,
    practice: `1. Create ten fictional daily temperature values.
2. Calculate count, minimum, maximum, mean, and median.
3. Add one unusually high value and compare how mean and median change.
4. Draw or describe the correct chart for change over time.
5. Write one possible explanation for the outlier and one test that could distinguish an error from a real event.`,
  },
  'data-patterns-3': {
    deepDive: `The training set is used to estimate model parameters. The validation set supports choices such as features, thresholds, or model settings. The test set is reserved for a final, honest estimate after development choices are complete. A common starting split is 70/15/15 or 80/10/10, but the correct design depends on dataset size and structure.

Random splitting is not always safe. Photos of the same object, messages from the same writer, or repeated readings from the same device are related. If related records appear in both training and test sets, the score may measure recognition of the source rather than generalization. Grouped splitting keeps related examples together. Time-based splitting trains on earlier data and tests on later data.

Data leakage includes any information unavailable at real prediction time. Preprocessing calculations must also be fitted on training data only. Test results should be reported once and preserved with the exact model version.`,
    workedExample: `A project has 200 leaf photographs from 20 plants, with ten photos per plant. A random photo split could place nine photos of a plant in training and one almost identical photo in testing. The test result would be too optimistic.

Instead, assign whole plants to splits: perhaps 14 plants for training, three for validation, and three for testing. Now the model must handle plants it has never seen.

If the team repeatedly changes the model after viewing the test errors, those test examples have become part of development. A new held-back test is needed.`,
    practice: `1. Design a split for 120 records collected from 12 sensors.
2. Explain why records from one sensor may be related.
3. Assign whole sensors to training, validation, and test groups.
4. List every decision allowed before the final test.
5. Write a rule that prevents the team from tuning the model to test answers.`,
  },
  'data-patterns-4': {
    deepDive: `Bias can enter through problem framing, sampling, measurement, labelling, feature selection, modelling, evaluation, and deployment. Representation bias occurs when important groups or conditions are missing. Measurement bias occurs when a tool measures some conditions less accurately. Label bias occurs when target labels contain inconsistent or unfair judgments.

Overall accuracy combines all examples and may hide severe gaps. Teams should report results by relevant conditions such as language, device, lighting, location, or age band when doing so is appropriate and privacy-preserving. Small groups create uncertain estimates, so sample counts matter alongside percentages.

Improvement may require better collection, clearer labels, different features, narrower intended use, calibrated uncertainty, human review, or stopping the project. Fairness is not achieved by deleting protected information while leaving strong proxies. It requires studying who may benefit or be harmed throughout the system lifecycle.`,
    workedExample: `An image classifier is 90% accurate overall. It is 96% accurate in daylight and 52% accurate in dim rooms. If most test images were taken in daylight, the overall score hides an important safety problem.

The team should collect representative low-light examples, inspect whether the camera itself produces poor images, and define an uncertainty response such as “Lighting is insufficient; please retake the photo.” Until results improve, the intended use should exclude dim conditions.

Publishing only the 90% figure would be misleading even though it is mathematically correct.`,
    practice: `1. Create a test-results table with at least three relevant conditions and sample counts.
2. Calculate accuracy for each condition and overall accuracy.
3. Identify the largest performance gap.
4. Propose one data improvement, one interface safeguard, and one limitation statement.
5. Decide what result would be required before the system could be used in that condition.`,
  },
  'machine-learning-1': {
    deepDive: `Supervised learning estimates a relationship between input features and labelled targets. Classification predicts discrete categories; regression predicts numbers. Multi-class classification chooses among more than two categories. Multi-label classification can assign several labels to one example.

Problem framing determines the target. “Help students” is not a prediction task. “Predict which prerequisite topic should be reviewed from the last three quiz results” is more precise, but the team must still ask whether prediction is appropriate and what errors cost.

Features must exist at prediction time and should have a plausible connection to the target. The baseline may be a simple rule, majority class, or average value. A learned model should demonstrate useful improvement on unseen data and remain understandable enough for its consequences.`,
    workedExample: `A transport project predicts journey duration in minutes. Inputs may include route distance, departure time, day type, and weather category. The numerical target makes this regression.

Changing the target to “short, medium, or long journey” turns it into classification. The categories need exact boundaries, such as short under 20 minutes and long above 45 minutes.

Neither version should use information recorded after arrival, because that would not be available when making the prediction. The team should compare the model with a baseline such as the median duration for that route.`,
    practice: `1. Write one classification and one regression problem about the same topic.
2. Define the exact target and when the prediction occurs.
3. List five possible features, then remove any unavailable at prediction time.
4. Define a simple baseline.
5. Describe one false prediction, who would be affected, and how the application should communicate uncertainty.`,
  },
  'machine-learning-2': {
    deepDive: `Unsupervised learning examines data without target answers. Clustering groups examples according to a similarity rule. Dimensionality reduction represents many features using fewer dimensions. Anomaly detection identifies examples that differ strongly from typical patterns.

Distance depends on scale. If one feature ranges from 0 to 1 and another from 0 to 10,000, the larger numerical range may dominate unless features are normalized. Categorical features require suitable encoding. The number of clusters may be chosen using mathematical evidence and domain usefulness, but there is rarely one unquestionably correct answer.

Clusters describe the selected measurements, not the whole identity of a person or object. Human interpretation can introduce stereotypes. Use neutral descriptions such as “records with high reading time and low video time,” not unsupported labels such as “serious learners.”`,
    workedExample: `Suppose books are described by page count and reading level. A clustering method finds three groups. One contains short books at early reading levels, another contains medium-length books across several levels, and a third contains long advanced books.

This may help organize browsing, but it does not prove that every reader belongs in one group. Changing the features to genre and publication year would create different clusters.

Before using the groups, inspect representative books, outliers, feature scales, and whether the grouping supports a real library need.`,
    practice: `1. Choose eight objects and record three non-personal features.
2. Group them manually using two features and explain your similarity rule.
3. Group the same objects using a different feature set.
4. Compare which objects moved and why.
5. Give each cluster a factual description and list one conclusion that the data does not support.`,
  },
  'machine-learning-3': {
    deepDive: `A neural network transforms numerical inputs through layers. Each connection has a weight. A unit multiplies inputs by weights, adds a bias, and applies an activation function. The output of one layer becomes the input of the next. Training adjusts weights to reduce a loss value.

For images, early representations may respond to edges or textures and later representations may combine them. For language, representations capture statistical relationships between tokens and context. These descriptions are simplified: internal features are distributed across many numbers and are not guaranteed to match human concepts.

Depth and parameter count increase capacity but also increase memory, computation, energy use, and risk of overfitting. Architecture, data, objective, and evaluation matter more than size alone. A smaller model can be preferable when it meets the task with lower cost and better offline privacy.`,
    workedExample: `A tiny network receives two inputs: hours practised and number of completed exercises. With weights 0.6 and 0.4, inputs of 3 and 5 produce a weighted sum of 3.8 before bias and activation.

During training, suppose the target says the learner is ready but the network predicts a low score. The loss records the error. Backpropagation calculates how each weight contributed, and an optimizer makes a small adjustment.

One adjustment does not “teach the concept.” Learning emerges from many examples and updates, followed by evaluation on separate data.`,
    practice: `1. Calculate 0.5 × 4 + 0.2 × 5 + 0.1.
2. Change the first weight to 0.8 and explain how the result changes.
3. Draw a network with three inputs, four hidden units, and two outputs.
4. Label where weights, biases, activation, loss, and optimization appear.
5. Explain two reasons a larger network may be worse for an offline school application.`,
  },
  'machine-learning-4': {
    deepDive: `A confusion matrix separates correct and incorrect outcomes. True positives and true negatives are correct. False positives are false alarms. False negatives are missed positives. Accuracy equals all correct predictions divided by all predictions. Precision equals true positives divided by all predicted positives. Recall equals true positives divided by all actual positives.

Class imbalance can make accuracy deceptive. If only one in 100 items is defective, a model that always predicts “not defective” reaches 99% accuracy but finds nothing useful. Precision and recall expose different weaknesses. F1 combines precision and recall when both matter.

Thresholds trade false positives against false negatives. The correct threshold depends on consequences and human review. Metrics need confidence intervals or repeated evaluation when samples are small. Evaluation should also measure latency, memory, usability, robustness, and subgroup performance.`,
    workedExample: `A recycling classifier evaluates 100 objects. It correctly finds 36 recyclable objects, misses four, falsely labels ten non-recyclable objects as recyclable, and correctly rejects 50.

Accuracy = (36 + 50) / 100 = 86%.
Precision = 36 / (36 + 10) ≈ 78%.
Recall = 36 / (36 + 4) = 90%.

The high recall means it finds most recyclable objects, but lower precision means the recycling stream receives contamination. Whether this is acceptable depends on the sorting process and cost of each error.`,
    practice: `1. Draw a confusion matrix using TP=18, FP=2, FN=6, and TN=24.
2. Calculate accuracy, precision, and recall.
3. Explain which error is more important for the chosen application.
4. Predict how lowering the positive threshold might affect precision and recall.
5. Write a report sentence that includes the sample size and does not exaggerate the result.`,
  },
  'coding-ai-1': {
    deepDive: `Variables bind meaningful names to values. Choose names such as quiz_score rather than q. Values have types: integers, decimal numbers, strings, and booleans behave differently. Conditions compare values and select a branch. Operators include ==, !=, <, <=, >, >=, and logical combinations such as and, or, and not.

Order matters in an if/elif/else chain because the first matching branch runs. Boundaries must be defined exactly. If mastery begins at 70, then 70 belongs in the mastered branch. Input validation should reject impossible values rather than forcing them into a category.

Functions organize a program around responsibilities. Parameters are inputs; return values are outputs. A function should have a clear contract, avoid hidden dependencies, and be tested with typical, boundary, and invalid cases.`,
    workedExample: `A feedback function can be designed as:

def feedback(score):
    if score < 0 or score > 100:
        return "Invalid score"
    if score >= 90:
        return "Excellent mastery"
    if score >= 70:
        return "Mastered; practise one challenge"
    return "Review the lesson and retry"

The 90 check must come before the 70 check. If score >= 70 came first, a score of 95 would never reach the excellent branch.`,
    practice: `1. Trace the function for -1, 0, 69, 70, 89, 90, and 101.
2. Add a parameter named attempts and return supportive feedback after repeated attempts.
3. Keep the message respectful; do not label the learner.
4. Write three assertions that verify boundary behaviour.
5. Explain the function’s input, output, invalid-input rule, and one way it could be reused.`,
  },
  'coding-ai-2': {
    deepDive: `Lists store ordered values. Dictionaries or records connect field names to values. A table can be represented as a list of records. Loops process each item consistently, while accumulators store running totals, counts, minima, or maxima.

Always separate valid, missing, and invalid data. Dividing a total by the full list length is wrong if some values were skipped. Modifying a list while iterating over it can skip records unexpectedly; create a cleaned list instead.

Nested loops are useful but can become slow as data grows. A loop should have a clear invariant: after processing each item, what does the accumulator mean? Printing intermediate values and using small hand-calculated examples are powerful debugging methods.`,
    workedExample: `Given scores = [80, None, 60, 100], compute the mean of valid values:

total = 0
count = 0
for score in scores:
    if score is not None and 0 <= score <= 100:
        total += score
        count += 1
average = total / count if count else None

The result is 80, because three valid scores total 240. Dividing by four would incorrectly treat the missing value as a real observation.`,
    practice: `1. Create six fictional weather records with day, temperature, and condition.
2. Include one missing and one impossible temperature.
3. Loop through the records, collect valid temperatures, and count each condition.
4. Calculate minimum, maximum, and mean using only valid values.
5. Print a quality report showing how many records were accepted and rejected, then verify the result by hand.`,
  },
  'coding-ai-3': {
    deepDive: `A rule-based classifier maps features to categories using explicit conditions. Start with category definitions and priority rules. When several rules match, the program needs a conflict policy. When none match, it needs an “unknown” or human-review outcome instead of a confident guess.

Build a test table before changing rules. Each row should contain the input, expected category, predicted category, pass/fail result, and notes. Separate development examples from a small final test set so repeated tuning does not hide weaknesses.

A baseline establishes minimum acceptable performance and reveals whether machine learning adds value. Compare accuracy, error types, speed, explanation, maintenance cost, and data requirements. Complexity is justified only by measured benefit.`,
    workedExample: `A message sorter uses the categories homework, event, transport, and unknown. Rules search for phrases:
- “due,” “worksheet,” or “submit” adds homework evidence.
- a date plus “meeting” or “celebration” adds event evidence.
- “bus,” “route,” or “pickup” adds transport evidence.

The message “Submit the bus survey by Friday” matches homework and transport. A priority rule alone may be wrong, so the system can return both scores and request review when the top scores are close.`,
    practice: `1. Define three categories with inclusion and exclusion rules.
2. Write at least two evidence rules for each category.
3. Create twelve original test messages, including ambiguous, blank, and misspelled examples.
4. Record a confusion matrix and list the three most important errors.
5. Revise one rule, rerun the same test, and report whether the change truly improved the baseline.`,
  },
  'coding-ai-4': {
    deepDive: `A reliable application separates the user interface, validation, data preparation, inference, explanation, persistence, and error reporting. Each boundary has a contract. Validation confirms type, range, size, and required fields before expensive work begins.

Failures must be explicit. A missing model is not an empty answer. A corrupt file is not “no results.” User messages should explain the safe next action without exposing internal prompts, memory addresses, or private paths. Technical details belong in protected logs.

Reproducibility requires exact versions, checksums, settings, and test data. Documentation includes intended users, supported devices, installation, model and data sources, limitations, evaluation, licenses, privacy behaviour, and recovery steps. A prototype becomes trustworthy through evidence, not appearance.`,
    workedExample: `An offline image classifier can use this pipeline:
1. Select file.
2. Validate extension, size, and readable image data.
3. Resize and normalize using documented settings.
4. Run the pinned model.
5. Check confidence and apply an uncertainty threshold.
6. Show category, confidence, limitations, and review advice.
7. Save only learner-approved progress.

If step 3 changes between testing and production, evaluation results may no longer apply. Pipeline versions must therefore be controlled together.`,
    practice: `1. Draw a seven-stage pipeline for one project.
2. For every stage, write its input, output, and one failure.
3. Create friendly messages for missing model, invalid input, insufficient storage, and cancelled generation.
4. Write five reproducibility facts another learner would need.
5. Test a restart and confirm that saved progress returns without storing the learner’s private prompt history.`,
  },
  'generative-responsible-1': {
    deepDive: `A language model converts text into tokens and represents them as vectors of numbers. Transformer layers use attention to calculate which earlier tokens are relevant to the current position. The model produces a probability distribution for the next token. A decoding strategy selects one token, appends it, and repeats.

Temperature changes randomness; lower values usually produce more predictable text. Context includes current instructions, conversation history, and retrieved material that fits within the context window. The model does not automatically search the internet, inspect private files, or remember facts outside the supplied context.

Training teaches statistical language patterns, not a verified database of truth. Generation can combine patterns into useful explanations, but it can also invent sources, arithmetic, and details. Models may expose biases present in data. Retrieval, tools, guardrails, and human verification improve a system but do not make it infallible.`,
    workedExample: `Given “Water freezes at,” the next token “0” may receive high probability in a Celsius context. After “0,” the model may predict “degrees,” then “Celsius.” Each step depends on all available context.

If the prompt instead asks about Fahrenheit, a different continuation is expected. If the conversation contains conflicting instructions, output may change again.

The model’s fluent sentence does not show whether it calculated, recalled a common pattern, or guessed. Verification must examine the claim itself.`,
    practice: `1. Complete three sentence beginnings with several plausible next words.
2. Observe that probability allows more than one reasonable continuation.
3. Write a prompt with a clear role, grade level, task, constraints, and supplied facts.
4. Identify which facts in the resulting answer require checking.
5. Explain context window, temperature, token, and next-token prediction in your own words without saying the model “knows everything.”`,
  },
  'generative-responsible-2': {
    deepDive: `A strong prompt includes the goal, audience, relevant context, desired output, constraints, and a verification request. Delimit supplied material clearly so instructions are not confused with evidence. Ask the model to state uncertainty and avoid inventing missing facts.

Examples can demonstrate format, but poor examples can also lock in errors. Break complex tasks into stages: clarify the problem, create a plan, produce one section, review against criteria, and revise. This supports learning and makes mistakes easier to locate.

Prompting cannot grant capabilities the model lacks. Repeating “be accurate” does not create evidence. Never include passwords, identity documents, private student records, or confidential material. Treat generated output as a draft or coaching aid and retain responsibility for the final work.`,
    workedExample: `Weak prompt: “Explain plants.”

Improved prompt: “Teach photosynthesis to a grade 6 learner. Use the verified facts below, explain inputs and outputs in five numbered steps, include one everyday analogy, avoid advanced chemistry, and end with two questions without answering them.”

The improved prompt specifies audience, scope, evidence, format, and learning check. After receiving the answer, verify the chemical inputs and outputs, test whether the analogy misleads, and request a correction if needed.`,
    practice: `1. Choose a vague homework request and identify what is missing.
2. Rewrite it with goal, audience, context, format, constraints, and verification.
3. Ask for a hint or parallel example instead of the final submitted answer.
4. Review the output against a five-item checklist.
5. Write one focused follow-up that corrects a specific weakness rather than restarting the entire conversation.`,
  },
  'generative-responsible-3': {
    deepDive: `A hallucination is generated content that lacks support or is false. Warning signs include precise numbers without evidence, quotations that cannot be located, citations with impossible details, sudden contradictions, and confident claims outside the provided context.

Verification starts by separating the answer into checkable claims. Recalculate numerical claims. Compare definitions with course material. Inspect original data. Run a small experiment where possible. Consult primary or authoritative sources and compare independent evidence. Record what was verified, contradicted, or remains uncertain.

The verification effort should match risk. Creative brainstorming tolerates uncertainty; safety, health, legal, financial, identity, and high-impact educational decisions require qualified adults and authoritative evidence. A model should never be used to fabricate citations or conceal uncertainty.`,
    workedExample: `An answer claims: “A solar panel always produces 300 watts for eight hours, so it creates 2,400 kilowatt-hours per day.”

Break the claim apart. First, 300 watts × 8 hours = 2,400 watt-hours, which equals 2.4 kilowatt-hours, not 2,400. Second, output is not always constant because sunlight, angle, shade, temperature, and panel rating matter.

The sentence is fluent but contains both a unit error and an unrealistic assumption. Recalculation and domain context reveal the problem.`,
    practice: `1. Take a short AI answer and underline every factual or numerical claim.
2. Label each claim verified, contradicted, or not yet checked.
3. Verify one claim by calculation and one using an authoritative reference.
4. Rewrite the answer so evidence and uncertainty are explicit.
5. State when a teacher, technician, doctor, lawyer, or other qualified expert would be required.`,
  },
  'generative-responsible-4': {
    deepDive: `Responsible AI begins before modelling. Identify stakeholders, benefits, possible harms, and people who might be excluded. Define intended and prohibited uses. Collect minimum necessary data with appropriate permission, secure storage, limited access, retention rules, and a deletion process.

Fairness requires evaluating relevant groups and conditions while protecting privacy. Safety includes misuse, overreliance, harmful output, failure recovery, and human oversight. Transparency means explaining the system’s purpose, evidence, limits, and how to challenge a result.

Ownership and licensing apply to datasets, code, models, text, images, and audio. Record creator, source, version, licence, required attribution, modification rights, and redistribution rights. Publicly accessible does not mean public domain. Students should create original content or use material with clear permission.`,
    workedExample: `A school wants an AI tool to summarize anonymous feedback. A responsible plan avoids collecting names, removes accidental identifiers, restricts raw responses to authorized staff, defines when records are deleted, and tests whether summaries omit minority concerns.

The tool may support theme discovery but must not identify or punish individual students. Users need a way to report misleading summaries. The team records the model licence and every external resource used.

Privacy, fairness, safety, and ownership are connected design requirements, not final-page disclaimers.`,
    practice: `1. Create a stakeholder map for a proposed AI tool.
2. Write intended use, prohibited use, and human-review requirements.
3. Build a data lifecycle from collection through deletion.
4. Complete a source register for five project assets.
5. Identify three harms, estimate likelihood and impact, and choose mitigation or a reason not to deploy.`,
  },
  'project-studio-1': {
    deepDive: `Problem discovery starts with observation and respectful inquiry. Describe the current process, affected people, frequency, consequences, and existing workarounds. Separate evidence from assumptions. Do not begin with “we need AI”; begin with a need that can be tested.

A strong problem statement names the user, need, context, desired outcome, measurement, and constraints. Scope should be small enough for available time and data. Constraints include offline operation, device memory, accessibility, safety, privacy, language, and teacher supervision.

Compare at least three solutions: process change, ordinary software or rules, and AI-assisted software. Score them for usefulness, reliability, explanation, data need, cost, risk, and maintenance. Choose AI only when learning patterns or generating language adds measured value.`,
    workedExample: `Observation: learners often miss prerequisite topics before a quiz. Possible solutions include a printed checklist, a rule-based planner using lesson completion, or a model that analyses free-text mistakes.

The checklist is easiest and safest. The rule planner may provide useful personalization with transparent logic. The language model may explain errors but needs more computing and careful verification.

A realistic first project could use rules for topic selection and the local model only for optional explanations. This hybrid design solves the need without making AI responsible for the entire decision.`,
    practice: `1. Collect five observations without recording sensitive personal details.
2. Convert one observation into a measurable problem statement.
3. List users, non-users affected, constraints, and out-of-scope goals.
4. Compare non-technical, rule-based, and AI-assisted solutions in a decision table.
5. Write a go/no-go decision and the evidence that could change it.`,
  },
  'project-studio-2': {
    deepDive: `A data plan defines every field, source, collection method, unit, allowed value, consent requirement, storage location, access rule, quality check, and deletion date. A data card documents why the dataset exists, what it contains, known gaps, appropriate uses, and prohibited uses.

A prototype tests the riskiest assumption with the smallest responsible build. Begin with a baseline. Use fictional or approved data. Separate interface sketches, logic, data, and evaluation so each can change independently.

An engineering log records date, question, version, change, evidence, result, problem, and next step. Version model files and datasets with checksums when possible. A failed experiment is useful evidence when its conditions and outcome are recorded honestly.`,
    workedExample: `A plant advisor’s riskiest assumption may be that simple soil-moisture categories produce useful advice. The first prototype can use ten fictional records and transparent rules instead of collecting hundreds of photographs.

The team defines “dry,” “moist,” and “wet,” tests whether learners can apply those labels consistently, and records disagreements. If the labels are unreliable, building a model would only automate confusion.

The prototype therefore answers a learning question before investing in a larger system.`,
    practice: `1. Create a data dictionary with field name, type, unit, example, allowed range, and purpose.
2. Write a data card covering source, consent, representation, quality, storage, and deletion.
3. Identify the riskiest assumption and design a one-session prototype to test it.
4. Define a transparent baseline and acceptance criterion.
5. Record the plan as the first engineering-log entry with version and date.`,
  },
  'project-studio-3': {
    deepDive: `Testing covers functionality, data quality, model behaviour, usability, accessibility, privacy, safety, performance, offline startup, restart, storage, cancellation, and recovery. Each test states setup, input, expected result, actual result, evidence, and status: PASS, FAIL, or NOT RUN.

Debugging moves from symptom to root cause. Reproduce the failure, reduce it to the smallest case, inspect the relevant stage, form one hypothesis, change one factor, and rerun the same test. Do not hide failures with a default answer that looks successful.

Model error analysis groups false results by meaningful causes such as ambiguous labels, missing features, unrepresented conditions, poor preprocessing, or unrealistic requirements. Prioritize by learner harm and frequency. Improvements require comparison on unchanged evaluation data.`,
    workedExample: `An offline tutor returns an empty message after model loading. A poor fix displays “Success” with no text. A proper investigation checks whether the model file exists, load status, prompt length, generation event stream, sanitation, and final answer.

The application should display a child-friendly failure while protected logs preserve the technical cause. A regression test should cover first launch, repeated questions, cancellation, restart, and a missing model.

The fix is complete only when the original failure and nearby behaviours are verified.`,
    practice: `1. Write twelve tests covering normal, boundary, invalid, offline, low-storage, restart, and recovery cases.
2. Run or simulate each test and record PASS, FAIL, or NOT RUN.
3. Choose one failure and create a minimal reproduction.
4. List three possible causes, test one at a time, and record evidence.
5. Rerun the complete affected test group after the change.`,
  },
  'project-studio-4': {
    deepDive: `A project presentation should connect need, design, evidence, and limitations. Demonstrate a normal case and a known difficult case. Explain why the chosen solution is preferable to the baseline. Never claim universal accuracy from a small classroom test.

Release documentation includes setup, supported devices, offline requirements, architecture, data card, model card, source and licence register, test report, privacy behaviour, safety guidance, known issues, and recovery instructions. A version number identifies exactly what was evaluated.

Maintenance defines ownership, feedback channels, review schedule, monitoring signals, update procedure, rollback, and end-of-life. Data and environments change, so old evaluation may no longer represent current use. A safe team pauses the system when serious failures exceed agreed limits.`,
    workedExample: `A strong demonstration says: “On our 40 held-back fictional messages, version 1.2 classified 34 correctly. Most errors involved messages containing both transport and homework terms. The tool is for organization only and must not make disciplinary decisions.”

This statement gives sample size, version, measured result, error pattern, and limit. “Our AI understands all school messages” would be unsupported.

The maintenance plan assigns a teacher to review reported errors monthly and restore version 1.1 if version 1.2 fails the acceptance tests.`,
    practice: `1. Create a seven-slide outline: need, users, alternatives, design, evidence, limitations, and next steps.
2. Prepare one normal and one failure demonstration.
3. Write a release checklist and mark missing evidence.
4. Create a maintenance table with owner, schedule, trigger, action, and rollback.
5. Draft three honest claims supported by results and three claims you must not make.`,
  },
}
