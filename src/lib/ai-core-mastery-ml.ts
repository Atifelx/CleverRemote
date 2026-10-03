import {
  defineLearningMasteryTopics,
  type LearningMasteryQuestionSeed,
  type LearningPlatform,
  type LearningQuestionDifficulty,
} from './learning-model'

const allPlatforms = ['Turing', 'Andela', 'Toptal'] as const

function question(
  prompt: string,
  correctOption: string,
  distractors: readonly [string, string, string],
  explanation: string,
  difficulty: LearningQuestionDifficulty,
  platforms: readonly LearningPlatform[] = allPlatforms,
): LearningMasteryQuestionSeed {
  return {
    prompt,
    options: [correctOption, ...distractors],
    correctOptionIndex: 0,
    explanation,
    difficulty,
    platforms,
  }
}

export const mlFundamentalsMasteryTopics = defineLearningMasteryTopics(
  'ai-engineering-core',
  'ml-fundamentals',
  [
    {
      id: 'problem-framing-and-generalization',
      title: 'Problem framing and generalization',
      masteryLevel: 'L2',
      frequency: 'core',
      questionTarget: 20,
      questions: [
        question(
          'Which project is best framed as supervised classification?',
          'Route new support tickets to Billing or Technical Support using historical tickets with verified queue labels',
          [
            'Group unlabeled customers by similar product-usage patterns',
            'Estimate each delivery time in minutes from route features',
            'Reduce 500 sensor columns to a smaller representation without a target',
          ],
          'Classification learns a discrete target from labeled examples. Queue labels make ticket routing supervised classification; delivery time is regression, while grouping and representation learning can be unsupervised.',
          'easy',
        ),
        question(
          'A courier wants to predict the number of minutes a delivery will take. Which ML task matches that target?',
          'Supervised regression because the target is a continuous numeric value',
          [
            'Supervised classification because every duration becomes a class automatically',
            'Unsupervised clustering because routes can be grouped by distance',
            'Association-rule mining because minutes and distance occur together',
          ],
          'A duration is a continuous outcome, so labeled historical routes define a regression problem. Bucketing durations could turn it into classification, but that would discard resolution and change the business question.',
          'easy',
        ),
        question(
          'A product team has no segment labels and wants to discover recurring usage patterns before interviewing customers. What is the most defensible first approach?',
          'Use clustering as an exploratory unsupervised method, then validate stability and business meaning with domain evidence',
          [
            'Train a classifier by treating each customer ID as the target label',
            'Fit a regression model whose target is the number of desired segments',
            'Declare each cluster a permanent customer persona as soon as the algorithm converges',
          ],
          'Clustering can propose structure without labels, but its groups reflect the chosen representation and distance. Stability checks and domain validation are needed before treating those groups as useful segments.',
          'medium',
        ),
        question(
          'Before building a supervised model to predict customer renewal, which evidence matters most?',
          'Renewal labels are defined consistently, examples represent future customers, and every feature exists when the prediction is made',
          [
            'The team has selected the most complex algorithm available',
            'Every numeric feature has a larger magnitude than every categorical feature',
            'The training set can be made perfectly accurate before any split is created',
          ],
          'Supervised learning needs a trustworthy target, representative examples, and inference-time features. Model sophistication cannot compensate for labels that measure the wrong outcome or information unavailable in production.',
          'medium',
        ),
        question(
          'A team has training, validation, and test partitions. Which use preserves a credible final estimate?',
          'Fit parameters on training data, choose features and settings on validation data, then evaluate the frozen procedure once on test data',
          [
            'Choose the model on test data, refit it on validation data, and report training performance',
            'Fit each candidate on all three partitions and report the partition with the highest score',
            'Tune on training data until it is perfect and use validation and test data interchangeably',
          ],
          'Training supplies parameter updates, validation supports selection, and test data estimates the performance of a procedure whose choices are already fixed. Mixing those roles makes selection gains look like generalization.',
          'easy',
        ),
        question(
          'An engineer selects a fraud threshold by trying many values on the test set, then reports the best test F1. What is wrong with the claim?',
          'The test labels influenced threshold selection, so the test set became validation data and no longer measures a fixed decision rule',
          [
            'Threshold selection is invalid unless the classifier is retrained after every threshold change',
            'F1 can only be calculated on training data because it requires fitted parameters',
            'A test set may be reused freely whenever model weights remain unchanged',
          ],
          'A threshold is part of the deployed policy even though it is not a model weight. Optimizing it against test outcomes leaks test evidence into selection; choose it on validation data and test the frozen policy once.',
          'hard',
        ),
        question(
          'A medical dataset contains several visits for each patient. How should a train/test split be constructed to estimate performance on new patients?',
          'Keep every visit from a patient in one partition by splitting on patient identity',
          [
            'Randomly split visits so each patient is likely to appear in both partitions',
            'Put each patient\'s earliest visit in training and every later visit in test',
            'Duplicate rare-patient visits into both partitions to stabilize the metrics',
          ],
          'Visits from one patient share history and biological signal, so crossing partitions lets the model benefit from near-related records. A group-aware split tests generalization to genuinely unseen patients.',
          'medium',
        ),
        question(
          'You are evaluating a model that forecasts next month\'s demand from prior months. Which split best simulates deployment?',
          'Train on earlier periods and validate on later periods without allowing future observations into earlier folds',
          [
            'Randomly distribute individual months across training and validation',
            'Train on the newest months and validate only on the oldest months',
            'Sort by demand value and place the highest-demand months in validation',
          ],
          'Forecasting always predicts forward in time. A chronological or forward-chaining split preserves that information boundary, while a random split can let future regimes and derived statistics inform the past.',
          'medium',
        ),
        question(
          'A loan-default model uses days_in_collections even though predictions are made when a loan is approved. What does this feature create?',
          'Target leakage because collection activity occurs only after the prediction-time decision',
          [
            'High bias because the feature has a large numeric range',
            'Class imbalance because only defaulted loans enter collections',
            'Unsupervised learning because collection activity has no coefficient yet',
          ],
          'The feature is a consequence of repayment behavior and does not exist at approval time. It reveals the future outcome rather than providing reproducible predictive signal, so offline scores will be unrealistically high.',
          'easy',
        ),
        question(
          'A standard scaler is fitted on the full dataset before cross-validation. Why is the resulting score optimistic?',
          'Each validation fold influenced the means and standard deviations used to transform its training fold',
          [
            'Scaling always changes a classification target into a regression target',
            'Cross-validation requires every feature to remain in its original unit',
            'Standardization duplicates minority examples across all validation folds',
          ],
          'Learned preprocessing is part of model fitting. It must be fitted inside each fold using only that fold\'s training records; otherwise validation distribution information leaks into the fitted pipeline.',
          'hard',
        ),
        question(
          'A ticket model reaches 98% training accuracy and 71% validation accuracy on comparable data. What is the leading diagnosis?',
          'High variance: the model fits the training sample well but generalizes poorly',
          [
            'High bias: the model cannot fit even the training pattern',
            'Perfect calibration: the training score is close to one',
            'Label balance: the 27-point gap proves both classes are equally common',
          ],
          'Strong training performance with a large validation gap is the classic variance pattern. More representative data, stronger regularization, reduced capacity, or an ensemble may help after ruling out split and pipeline mismatches.',
          'easy',
        ),
        question(
          'A simple model scores 62% on training data and 60% on validation data, well below an acceptable baseline. Which change most directly addresses the likely problem?',
          'Increase useful capacity or improve the feature representation because both scores suggest high bias',
          [
            'Add much stronger regularization to make the model still simpler',
            'Select whichever test-set slice gives the highest reported score',
            'Remove training examples until training accuracy reaches 100%',
          ],
          'Similarly poor training and validation results indicate that the current model or representation cannot capture the pattern. Adding justified capacity or informative features targets bias; stronger constraints would usually worsen it.',
          'medium',
        ),
        question(
          'Why can L2 regularization improve validation loss while making training loss worse?',
          'It discourages fragile large weights, accepting less training fit in exchange for lower variance on unseen data',
          [
            'It lets validation labels directly update the fitted coefficients',
            'It guarantees that every irrelevant feature receives a coefficient of exactly zero',
            'It increases model depth until all training residuals disappear',
          ],
          'Regularization constrains effective complexity, so the optimizer cannot chase every training-specific fluctuation. L2 usually shrinks weights smoothly rather than forcing exact zeros, and its strength should be selected on validation evidence.',
          'medium',
        ),
        question(
          'A logistic model has validation losses 0.51, 0.40, 0.34, and 0.46 at L2 strengths 0, 0.01, 0.1, and 1.0. Which strength should be selected from these candidates?',
          '0.1, because it has the lowest validation loss before final test evaluation',
          [
            '0, because no penalty always preserves the most useful signal',
            '0.01, because the smallest nonzero penalty must generalize best',
            '1.0, because the strongest regularization always prevents overfitting',
          ],
          'The validation results directly compare the candidate hyperparameters, and 0.1 has the best value at 0.34. The stronger value has begun to underfit, showing why regularization is selected rather than maximized.',
          'medium',
        ),
        question(
          'A nearest-neighbor model uses server age from 0 to 10 and request count from 1,000 to 2,000,000. What preprocessing is most important?',
          'Fit a scaling transform on training data and apply that frozen transform to all later records',
          [
            'Convert the class label to a continuous value before measuring distance',
            'Scale each validation record using statistics computed from that record alone',
            'Leave the units unchanged so both features contribute equally to Euclidean distance',
          ],
          'Without scaling, request count dominates distance because of its units rather than its predictive value. Fitting the transform only on training data preserves the evaluation boundary and gives both dimensions a meaningful chance to contribute.',
          'easy',
        ),
        question(
          'Why can encoding Basic, Pro, and Enterprise plans as 1, 2, and 3 harm a model?',
          'It may invent an ordering and equal distances between categories that the business meaning does not support',
          [
            'Numeric features cannot be used by supervised algorithms',
            'The encoding guarantees that Enterprise examples become the positive class',
            'Three categories require exactly three separate target variables',
          ],
          'Many algorithms interpret numeric codes geometrically or ordinally. If the implied order and spacing are false, one-hot encoding or another target-safe representation preserves categories without manufacturing that relationship.',
          'medium',
        ),
        question(
          'A churn feature records whether an account accepted a retention offer made after the churn score was produced. What should the team do?',
          'Remove it and rebuild features from information available at the moment the churn decision is made',
          [
            'Keep it because post-decision behavior is usually the strongest predictor',
            'Use it only for test records so training remains uncontaminated',
            'Replace missing production values with the validation-set average',
          ],
          'Feature availability must be defined against a prediction timestamp. A response to a later intervention cannot be reproduced when scoring and can also encode treatment effects, so it must not enter the predictive feature set.',
          'hard',
        ),
        question(
          'Among 20,000 transactions, 100 are fraud. A model predicts every transaction as legitimate. Which evaluation statement is correct?',
          'Accuracy is 99.5%, but fraud recall is 0%, so accuracy hides total failure on the rare class',
          [
            'Accuracy is 0.5%, and fraud recall is 99.5%',
            'Precision is 100% because the model produces no false fraud alerts',
            'F1 is 99.5% because true negatives dominate the dataset',
          ],
          'The model gets 19,900 of 20,000 records correct, yielding 99.5% accuracy, but finds 0 of 100 frauds. With no predicted positives, positive precision is not evidence of success and positive-class recall is zero.',
          'easy',
        ),
        question(
          'A team oversamples rare failures during training and then treats the raw model scores as production probabilities. What risk should it check?',
          'The changed training prevalence can distort calibration, so probabilities should be assessed or calibrated on representative data',
          [
            'Oversampling makes it impossible to calculate recall on any dataset',
            'Every oversampled classifier must use 0.5 as its production threshold',
            'Duplicating minority records guarantees lower variance without overfitting',
          ],
          'Resampling can improve exposure to minority patterns, but it changes the class distribution seen during fitting and may overfit duplicates. Ranking, calibration, and threshold behavior must be checked on data with realistic prevalence.',
          'hard',
        ),
        question(
          'An engineer proposes a new interaction feature and reports that training accuracy increased by four points. What is the strongest next step?',
          'Fit the feature pipeline on training data, compare the change on validation data, and keep the test set untouched until selection is complete',
          [
            'Accept the feature because any training improvement demonstrates generalization',
            'Inspect test errors repeatedly and rewrite the feature until every one is corrected',
            'Move difficult validation records into training so both scores become comparable',
          ],
          'Feature engineering is a model-selection decision. Validation evidence shows whether the feature carries transferable signal; repeated test feedback would overfit the final estimate even if the feature code itself is deterministic.',
          'hard',
        ),
      ],
    },
  ],
)

export const mlAlgorithmsMasteryTopics = defineLearningMasteryTopics(
  'ai-engineering-core',
  'ml-algorithms',
  [
    {
      id: 'algorithm-selection-and-behavior',
      title: 'Algorithm selection and behavior',
      masteryLevel: 'L2',
      frequency: 'core',
      questionTarget: 20,
      questions: [
        question(
          'A delivery model is minutes = 8 + 3.5 times distance_km. What does it predict for a 6 km route?',
          '29 minutes',
          [
            '21 minutes',
            '35 minutes',
            '48 minutes',
          ],
          'Substituting 6 gives 8 + 3.5 times 6 = 8 + 21 = 29. The calculation is valid as a model prediction, though using it far outside the observed distance range would require an extrapolation check.',
          'easy',
        ),
        question(
          'In a multiple linear regression, how should a distance coefficient of 3.5 be interpreted?',
          'Within the represented range, one additional kilometer changes the predicted mean by 3.5 minutes when the other represented features are held fixed',
          [
            'Every route that is one kilometer longer must take exactly 3.5 more minutes',
            'Distance explains 3.5% of all variation regardless of the other features',
            'The prediction is correct only when every other feature equals zero',
          ],
          'A linear coefficient describes an adjusted change in the model\'s conditional mean, not a deterministic or automatically causal effect. Its interpretation also depends on the encoded features and the data range used to fit the model.',
          'medium',
        ),
        question(
          'Residuals from a linear delivery-time model form a clear U-shaped pattern against fitted values. What does that most strongly suggest?',
          'The current representation misses a systematic nonlinear relationship',
          [
            'The residuals prove the target should be converted into class labels',
            'The linear model has zero bias because residuals exist on both sides',
            'The only valid repair is to remove every route with a large residual',
          ],
          'A structured curve in residuals means errors are not random around the fitted mean. A justified transform, interaction, spline, or nonlinear model should be compared on validation data rather than deleting inconvenient observations.',
          'medium',
        ),
        question(
          'A logistic regression produces a linear score of 0 for a ticket. What probability does the sigmoid assign?',
          '0.5',
          [
            '0',
            '1',
            'The probability cannot be computed without choosing a threshold',
          ],
          'The sigmoid is 1 / (1 + exp(-score)), so a score of 0 gives 1 / 2 = 0.5. The action threshold is a separate policy choice and does not affect this probability calculation.',
          'easy',
        ),
        question(
          'A logistic model estimates churn probability as 0.62. Does the algorithm require classifying the customer as positive?',
          'No; the action depends on a separately selected threshold tied to costs and capacity',
          [
            'Yes; logistic regression fixes the positive threshold at 0.5',
            'Yes; any probability above the observed churn prevalence must be positive',
            'No; logistic regression outputs labels but never probabilities',
          ],
          'Logistic regression estimates a score or probability. A threshold turns that estimate into an action and should be selected on validation data using operational consequences, then evaluated as part of the frozen policy.',
          'easy',
        ),
        question(
          'A logistic baseline misses a boundary that depends on account age and transaction amount together. Which change preserves the model family while addressing that limitation?',
          'Add a justified interaction feature and validate whether it improves unseen performance',
          [
            'Increase the classification threshold until the boundary becomes nonlinear',
            'Duplicate the target column so the optimizer sees the label twice',
            'Replace log loss with k-means distance while keeping the same coefficients',
          ],
          'Logistic regression is linear in its represented features, but an interaction can expose a nonlinear relationship in the original variables. The feature remains a selection choice and therefore needs validation evidence.',
          'medium',
        ),
        question(
          'Why is a decision tree often a useful nonlinear baseline for tabular data?',
          'Its threshold splits naturally represent interactions and piecewise behavior with little need for feature scaling',
          [
            'It always estimates smoother probabilities than logistic regression',
            'It extrapolates continuous trends beyond every observed target value',
            'Its predictions cannot change when one training record changes',
          ],
          'Trees partition feature space into conditional regions, capturing nonlinear effects and interactions directly. Their flexibility is useful, but individual trees can be unstable and their leaf probabilities can be coarse.',
          'easy',
        ),
        question(
          'A decision tree reaches 100% training accuracy after growing many leaves, but validation accuracy falls. What is the best first response?',
          'Constrain depth or leaf size, or prune the tree, and select the setting with validation data',
          [
            'Grow more single-record leaves because lower training error guarantees lower test error',
            'Standardize every feature because tree depth is caused by unequal units',
            'Choose the deepest tree using the final test set',
          ],
          'Late splits often isolate noise in tiny samples, creating high variance. Depth, minimum leaf size, and pruning trade some training fit for stability and must be chosen before final test evaluation.',
          'medium',
        ),
        question(
          'A classification tree leaf contains 18 positive and 2 negative training examples. What score can the leaf naturally emit before thresholding?',
          'A positive-class fraction of 18 / 20 = 0.90',
          [
            'A guaranteed calibrated probability of 1.00',
            'A negative-class fraction of 18 / 2 = 9.00',
            'A fixed score of 0.50 because every leaf is binary',
          ],
          'A common tree score is the observed positive fraction among training examples in the leaf, here 0.90. It is an estimate rather than a calibration guarantee, especially when leaves contain few records.',
          'medium',
        ),
        question(
          'Which description correctly distinguishes a random forest from one decision tree?',
          'It averages trees fitted with bootstrap sampling and random feature subsets to reduce variance',
          [
            'It adds trees sequentially only to correct the previous ensemble\'s residuals',
            'It fits one tree and converts every split threshold into a linear coefficient',
            'It replaces labeled targets with distances to unsupervised centroids',
          ],
          'Random forests use bagging and feature randomness to build varied trees, then average their outputs. Sequential residual correction describes gradient boosting, not a forest.',
          'easy',
        ),
        question(
          'Five trees estimate failure probabilities of 0.20, 0.35, 0.25, 0.60, and 0.40. What is their random-forest average?',
          '0.36',
          [
            '0.25',
            '0.40',
            '1.80',
          ],
          'The estimates sum to 1.80, and dividing by five gives 0.36. Averaging makes the forest less dependent on an unusual individual estimate such as 0.60.',
          'easy',
        ),
        question(
          'Why does a random forest consider only a random subset of features at each split?',
          'It reduces correlation among trees so averaging can remove more variance',
          [
            'It guarantees that every tree has exactly the same structure',
            'It converts all numeric features into equally spaced categories',
            'It lets the forest learn from test features without seeing test labels',
          ],
          'If one strong feature controls every split, bootstrapped trees can remain very similar. Feature randomness creates diversity; averaging less-correlated errors is more effective, though too much randomness can raise bias.',
          'hard',
        ),
        question(
          'How does gradient boosting build an ensemble of shallow trees?',
          'It adds trees sequentially so each scaled learner addresses the current loss gradient or residual-like errors',
          [
            'It fits every tree independently and selects only the tree with the lowest training loss',
            'It assigns unlabeled examples to the closest tree centroid',
            'It averages duplicate copies of one fully grown tree without changing the data',
          ],
          'Boosting is additive and sequential: later learners focus on mistakes of the current ensemble. This differs from the largely independent trees averaged by bagging methods such as random forests.',
          'easy',
        ),
        question(
          'A boosted regressor currently predicts 50. A new tree proposes a correction of 15 and the learning rate is 0.1. What is the updated prediction?',
          '51.5',
          [
            '50.15',
            '55.0',
            '65.0',
          ],
          'The scaled contribution is 0.1 times 15 = 1.5, which is added to the current prediction: 50 + 1.5 = 51.5. Shrinkage allows many controlled corrections rather than one aggressive jump.',
          'easy',
        ),
        question(
          'Training loss for a boosted-tree model keeps falling after validation loss begins rising. Which selection rule is most defensible?',
          'Stop at the boosting round with the best validation loss, then evaluate that frozen choice on test data',
          [
            'Continue until training loss reaches zero because every additional tree improves generalization',
            'Choose the round with the best test loss and report that same test result',
            'Increase tree depth after every round so training and validation losses must converge',
          ],
          'The diverging curves indicate that additional rounds are fitting training-specific detail. Early stopping uses validation evidence to select ensemble size while preserving test data for final evaluation.',
          'medium',
        ),
        question(
          'What are the two repeating assignment steps in standard k-means?',
          'Assign each point to its nearest centroid, then replace each centroid with the mean of its assigned points',
          [
            'Fit a class probability, then lower its decision threshold',
            'Bootstrap labeled records, then average their decision trees',
            'Sort points by target value, then split each target range equally',
          ],
          'K-means alternates nearest-centroid assignment with centroid recomputation until its objective stabilizes. It minimizes within-cluster squared distance and does not use target labels.',
          'easy',
        ),
        question(
          'A k-means customer segmentation uses annual spend in dollars and support calls from 0 to 20. Why should scaling be considered?',
          'Raw dollar differences may dominate distance, making clusters reflect units rather than meaningful joint behavior',
          [
            'K-means requires every feature to have an integer value',
            'Scaling supplies the missing supervised target for each cluster',
            'Centroids cannot be computed when columns use different names',
          ],
          'K-means is distance-based, so feature scale directly affects its objective. Standardization or a domain-informed transform should be fitted consistently, while remembering that scaling defines what similarity means.',
          'medium',
        ),
        question(
          'K-means returns stable compact groups, but domain experts cannot connect them to any decision or later outcome. What is the right conclusion?',
          'The optimization may be valid, but business usefulness has not been established',
          [
            'Stable clusters are automatically true customer personas',
            'The absence of labels proves that no validation is possible',
            'Every compact cluster should be converted directly into a production class',
          ],
          'Internal fit and stability only show agreement with the chosen geometry. Unsupervised groups become useful when they are coherent to experts or support a separate outcome, experiment, or action.',
          'hard',
        ),
        question(
          'A five-neighbor incident classifier finds labels Network, Network, Database, Network, and Database. What is its unweighted prediction and vote share?',
          'Network with a vote share of 3 / 5 = 0.60',
          [
            'Database with a vote share of 2 / 5 = 0.40',
            'Network with a guaranteed probability of 1.00',
            'No prediction because the five labels are not unanimous',
          ],
          'Network has three of the five votes, so majority voting predicts Network with a local share of 0.60. That share is not automatically a calibrated probability, and k should be chosen using validation data.',
          'easy',
        ),
        question(
          'A k-nearest-neighbors classifier degrades after hundreds of irrelevant dimensions are added. What is the strongest explanation and response?',
          'Distances became less informative; select or learn a better scaled representation and retune k on validation data',
          [
            'Nearest neighbors requires every available column, so the labels must be wrong',
            'The model has become linear, so increasing the classification threshold will restore locality',
            'Distance quality is unaffected by irrelevant dimensions; only the test-set size matters',
          ],
          'In high dimensions, irrelevant coordinates add noise and distances often become less discriminative. Feature selection, dimensionality reduction, or a learned representation can restore useful neighborhoods, with k controlling the local bias-variance tradeoff.',
          'hard',
        ),
      ],
    },
  ],
)

export const mlEvaluationMasteryTopics = defineLearningMasteryTopics(
  'ai-engineering-core',
  'ml-evaluation',
  [
    {
      id: 'classification-metrics-and-thresholds',
      title: 'Classification metrics and thresholds',
      masteryLevel: 'L2',
      frequency: 'core',
      questionTarget: 15,
      questions: [
        question(
          'A fraud test set has 40 actual frauds. The model flags 30 of them and also flags 70 legitimate transactions. Which confusion-matrix counts are correct?',
          'TP = 30, FN = 10, FP = 70',
          [
            'TP = 40, FN = 30, FP = 70',
            'TP = 30, FN = 70, FP = 10',
            'TP = 70, FN = 10, FP = 30',
          ],
          'The 30 detected frauds are true positives, the remaining 10 frauds are false negatives, and the 70 legitimate alerts are false positives. Naming the positive class first prevents the common cell-label swap.',
          'easy',
        ),
        question(
          'In a 1,000-transaction test set, TP = 30, FN = 10, FP = 70, and TN = 890. What is accuracy?',
          '92%, because (30 + 890) / 1,000 = 0.92',
          [
            '75%, because 30 / (30 + 10) = 0.75',
            '30%, because 30 / (30 + 70) = 0.30',
            '89%, because 890 / 1,000 = 0.89',
          ],
          'Accuracy counts both correct positives and correct negatives, giving 920 correct decisions out of 1,000. It should still be paired with class-specific metrics because true negatives can dominate rare-event data.',
          'easy',
        ),
        question(
          'For TP = 30 and FP = 70, what is fraud-alert precision?',
          '30%, because precision is 30 / (30 + 70)',
          [
            '75%, because precision is 30 / (30 + 10)',
            '70%, because precision is 70 / (30 + 70)',
            '3%, because precision is 30 / 1,000',
          ],
          'Precision asks what fraction of predicted positives are truly positive. Thirty of the 100 alerts are fraud, so reviewers can expect 30% of this threshold\'s alerts to be correct.',
          'easy',
        ),
        question(
          'For TP = 30 and FN = 10, what is fraud recall?',
          '75%, because recall is 30 / (30 + 10)',
          [
            '30%, because recall is 30 / (30 + 70)',
            '70%, because recall is 70 / (30 + 70)',
            '97%, because recall is (30 + 890) / 950',
          ],
          'Recall measures coverage of actual positives. The model catches 30 of 40 frauds, giving 75%, while the ten false negatives are the fraud cases it misses.',
          'easy',
        ),
        question(
          'A safety model flags 120 events, 90 of which are real incidents, while the dataset contains 150 real incidents. What are precision and recall?',
          'Precision is 75% and recall is 60%',
          [
            'Precision is 60% and recall is 75%',
            'Precision is 90% and recall is 80%',
            'Precision is 50% and recall is 120%',
          ],
          'Precision is 90 / 120 = 75%, while recall is 90 / 150 = 60%. Keeping the denominators distinct connects false-alert workload to precision and missed-incident coverage to recall.',
          'medium',
        ),
        question(
          'A classifier has precision 0.75 and recall 0.60. What is its F1 score to three decimal places?',
          '0.667',
          [
            '0.675',
            '0.450',
            '0.900',
          ],
          'F1 is 2 times 0.75 times 0.60 divided by 1.35, which is approximately 0.667. The arithmetic mean, 0.675, is close but incorrect because F1 uses the harmonic mean.',
          'medium',
        ),
        question(
          'What usually happens when a binary classifier\'s positive threshold is lowered?',
          'More cases are predicted positive, usually increasing recall while reducing precision or increasing false positives',
          [
            'Both precision and recall must increase because the model has more positive predictions',
            'The ROC AUC must decrease because one threshold moved',
            'The fitted feature coefficients are automatically retrained',
          ],
          'A lower threshold admits additional cases, recovering some positives but usually adding negatives too. The exact tradeoff must be measured; moving a threshold changes decisions, not the underlying ranking or fitted parameters.',
          'medium',
        ),
        question(
          'A rare-event model finds 80 of 100 positives and falsely flags 198 of 9,900 negatives. Which ROC point does this threshold produce?',
          'True-positive rate 80% and false-positive rate 2%',
          [
            'True-positive rate 2% and false-positive rate 80%',
            'True-positive rate 28.8% and false-positive rate 72%',
            'True-positive rate 98% and false-positive rate 20%',
          ],
          'The true-positive rate is 80 / 100 = 80%, and the false-positive rate is 198 / 9,900 = 2%. The corresponding precision is only 80 / 278, about 28.8%, which reveals the alert burden.',
          'medium',
        ),
        question(
          'Why can ROC AUC look strong for a fraud model whose alerts are mostly false?',
          'With many negatives, a large false-alert count can still be a small false-positive rate, so the PR curve and threshold counts are more revealing',
          [
            'ROC AUC measures calibration only and ignores the ranking of examples',
            'ROC curves cannot be computed unless positive and negative classes are equal in size',
            'A strong ROC AUC proves the default 0.5 threshold is operationally optimal',
          ],
          'ROC uses the false-positive rate, whose denominator can be enormous in rare-event settings. Precision compares true alerts with all alerts directly, so PR behavior and concrete counts better expose workload under low prevalence.',
          'hard',
        ),
        question(
          'What is the no-skill precision baseline on a representative dataset where 2% of examples are positive?',
          '2%, because random ranking retrieves positives at approximately their prevalence',
          [
            '50%, because a binary classifier has two classes',
            '98%, because most examples are negative',
            '0%, because a random model cannot produce positive scores',
          ],
          'For random ranking, the expected fraction of positives among retrieved examples equals prevalence, here 2%. This is why PR baselines move with class balance and comparisons need representative evaluation data.',
          'medium',
        ),
        question(
          'Two hundred cases receive scores near 0.80, but only 120 become positive. What does this show?',
          'The observed rate is 60%, so the model is overconfident in this score range',
          [
            'The observed rate is 80%, so the scores are perfectly calibrated',
            'The observed rate is 40%, so the model is underconfident',
            'Calibration cannot be assessed unless classification accuracy is 100%',
          ],
          'The bin\'s observed frequency is 120 / 200 = 0.60, below the predicted level near 0.80. Calibration asks whether numeric probabilities match frequencies, not merely whether rankings or hard labels are correct.',
          'easy',
        ),
        question(
          'Can post-hoc calibration improve probability quality without improving ROC AUC?',
          'Yes; a monotonic mapping can correct probability values while preserving the ranking that ROC AUC measures',
          [
            'No; every calibration improvement must reverse at least one pair in the ranking',
            'No; ROC AUC and calibration are two names for the same property',
            'Yes; calibration works by changing the true labels in the test set',
          ],
          'Ranking and probability accuracy are distinct. Platt scaling or isotonic calibration fitted on separate data can move overconfident scores toward observed frequencies while leaving case order, and thus ROC AUC, largely unchanged.',
          'hard',
        ),
        question(
          'Threshold A has FP = 120 and FN = 20; threshold B has FP = 260 and FN = 10. A false positive costs $10 and a false negative costs $500. Which has lower error cost?',
          'Threshold B at $7,600, compared with threshold A at $11,200',
          [
            'Threshold A at $6,200, compared with threshold B at $7,600',
            'Threshold A at $11,200, compared with threshold B at $13,000',
            'Both cost $12,000 because each trades false positives for false negatives',
          ],
          'Threshold A costs 120 times $10 plus 20 times $500 = $11,200. Threshold B costs 260 times $10 plus 10 times $500 = $7,600, so accepting more reviews is worthwhile under these stated costs.',
          'hard',
        ),
        question(
          'A review team can process at most 100 alerts per day. Which validation rule best chooses a threshold?',
          'Among thresholds producing at most 100 representative daily alerts, choose the one with the best relevant benefit or recall, then test the frozen rule',
          [
            'Choose the threshold with maximum recall even if it creates 10,000 daily alerts',
            'Always use 0.5 because operational capacity should not affect model evaluation',
            'Choose the threshold with the fewest alerts even when it detects no valuable cases',
          ],
          'Capacity is part of the decision system, not an afterthought. Candidate thresholds should be compared under realistic prevalence and constrained workload, with final evidence collected after the policy is fixed.',
          'hard',
        ),
        question(
          'Two classifiers have the same 95% accuracy, but one misses many safety incidents and the other creates more manual reviews. What should an interview answer recommend?',
          'Compare their confusion matrices at declared thresholds and map false negatives and false positives to business consequences',
          [
            'Treat the models as equivalent because equal accuracy implies equal operational behavior',
            'Choose the model with more true negatives without checking class prevalence',
            'Average the two accuracy values to produce a more reliable metric',
          ],
          'Accuracy compresses error direction into one number. Confusion matrices, positive-class definitions, thresholds, subgroup checks, and error costs expose whether missed incidents or review burden make one policy preferable.',
          'medium',
        ),
      ],
    },
    {
      id: 'validation-and-regression-metrics',
      title: 'Validation and regression metrics',
      masteryLevel: 'L2',
      frequency: 'frequent',
      questionTarget: 10,
      questions: [
        question(
          'What does five-fold cross-validation do on a development dataset?',
          'It fits five times, each time validating on one fold and training on the other four, then aggregates the held-out results',
          [
            'It fits once on all data and reports the same training score five times',
            'It creates five independent test sets that can each guide hyperparameter tuning',
            'It guarantees deployment performance by multiplying the dataset size by five',
          ],
          'Each example serves as validation once and training data in the other rounds, giving an average and variation across splits. Cross-validation does not create independent data, and a final test set is still needed after selection.',
          'easy',
        ),
        question(
          'Where should imputation, scaling, and feature selection be fitted during cross-validation?',
          'Inside each fold using only that round\'s training portion, then applied to its held-out fold',
          [
            'Once on the entire development dataset before folds are created',
            'Separately on each held-out record using that record\'s own statistics',
            'Only after all fold scores and the final test score have been reported',
          ],
          'Every learned transformation belongs to the fitted pipeline. Fitting it globally lets held-out fold information affect training, producing optimistic evidence even when target labels were never explicit inputs.',
          'medium',
        ),
        question(
          'A dataset contains many events from each customer. Which cross-validation design estimates performance on unseen customers?',
          'Grouped folds that keep all events from one customer in the same fold',
          [
            'Random event-level folds that place every customer in every split',
            'One fold per feature so each column is validated separately',
            'Stratification by event timestamp while ignoring customer identity',
          ],
          'Related events can share customer-specific patterns, so event-level splitting leaks identity and history across folds. Grouped folds make the held-out unit match the intended new-customer deployment claim.',
          'medium',
        ),
        question(
          'Which cross-validation scheme is appropriate for forecasting future weekly demand?',
          'Forward-chaining folds that train on earlier weeks and validate on later weeks',
          [
            'Random folds that allow December observations to train a model validated on January',
            'Reverse-time folds that always train on future weeks and validate on past weeks',
            'Leave-one-feature-out folds that ignore ordering of examples',
          ],
          'A forecasting evaluation must reproduce the direction of information flow. Forward-chaining preserves chronology and can reveal drift, while random folds allow future patterns to leak into an easier past prediction task.',
          'medium',
        ),
        question(
          'Five cross-validation F1 scores are 0.71, 0.74, 0.69, 0.73, and 0.72. What is their mean, and what else should be reported?',
          'The mean is 0.718, and the fold variation should accompany it',
          [
            'The mean is 0.700, and only the best fold should be reported',
            'The mean is 0.740, and variation is irrelevant after averaging',
            'The mean is 0.718, which removes the need for a final test set',
          ],
          'The scores sum to 3.59, so their mean is 3.59 / 5 = 0.718. The 0.69 to 0.74 spread shows sensitivity to the split and helps judge whether a small model difference is credible.',
          'medium',
        ),
        question(
          'Actual regression targets are 3, 5, and 10, while predictions are 2, 7, and 9. What is MAE?',
          '4 / 3, or approximately 1.33',
          [
            '2.00',
            '1.00',
            '6 / 3, or 2.00',
          ],
          'The absolute errors are 1, 2, and 1. Their sum is 4, and dividing by three gives MAE about 1.33 in the target\'s original units.',
          'easy',
        ),
        question(
          'Using actual values 3, 5, and 10 with predictions 2, 7, and 9, what is MSE?',
          '2.00, because (1 squared + 2 squared + 1 squared) / 3 = 2',
          [
            '1.33, because (1 + 2 + 1) / 3 = 1.33',
            '1.41, because the square root of 2 is about 1.41',
            '6.00, because squared errors should be summed but never averaged',
          ],
          'The squared errors are 1, 4, and 1, totaling 6; dividing by three yields MSE 2. Squaring makes larger misses contribute disproportionately and gives the metric squared target units.',
          'easy',
        ),
        question(
          'A model has MSE of 9 square minutes. What is RMSE, and why is it often easier to communicate?',
          'RMSE is 3 minutes, returning the error summary to the target\'s units',
          [
            'RMSE is 81 minutes because MSE must be squared again',
            'RMSE is 9 minutes because taking a root never changes units',
            'RMSE is 4.5 minutes because root means divide by two',
          ],
          'RMSE is the square root of MSE, so sqrt(9) = 3. It retains MSE\'s stronger sensitivity to large errors while expressing the result in the same units as the target.',
          'easy',
        ),
        question(
          'What does a negative R-squared on an untouched test set mean?',
          'The model\'s squared-error predictions are worse than predicting the test targets with the training-baseline mean used by the evaluation convention',
          [
            'The model explains a negative number of physical target units',
            'The model has perfect predictions but its coefficients use negative signs',
            'R-squared cannot be negative, so the test labels must be corrupted',
          ],
          'R-squared compares residual squared error with a mean-prediction baseline. It can fall below zero when the fitted model generalizes worse than that simple baseline; it is not a bounded accuracy percentage.',
          'hard',
        ),
        question(
          'Delivery-time errors occasionally contain very large misses, and the business wants those misses to receive extra penalty. Which metric choice best matches that goal?',
          'Use MSE or RMSE alongside error slices because squaring gives large residuals disproportionate weight',
          [
            'Use MAE only because absolute errors penalize extreme misses more strongly than squared errors',
            'Use classification accuracy because it preserves the exact size of every regression error',
            'Use R-squared alone because it states the operational cost of each late delivery',
          ],
          'MSE and RMSE emphasize large residuals through squaring, while MAE weights each unit of error linearly and is more robust. Metric choice should reflect the cost curve, and slices still reveal where severe misses occur.',
          'medium',
        ),
      ],
    },
  ],
)