import type { AiLessonDetails } from './ai-core-lesson-types'

export const aiMlLessonDetails = {
  'Supervised learning': {
    explanation: [
      'Supervised learning fits a function from input features to a known target by minimizing a loss over labeled examples. Regression predicts a continuous target, classification predicts a category or category probability, and the fitted parameters capture patterns that the chosen model family can represent.',
      'The approach assumes labels are meaningful, examples represent the deployment population, and the features will be available when predictions are made. Use it when historical outcomes can teach a repeatable mapping; its main tradeoffs are label cost, sensitivity to distribution shift, and the risk of learning correlations that do not remain useful or causal.',
    ],
    whyItMatters: 'Recognizing a supervised problem clarifies what labels, loss function, split strategy, and evaluation evidence are required. It also prevents teams from treating prediction as magic when the available examples do not represent the decisions the model must make.',
    useCases: [
      'Predicting delivery time from route, distance, traffic, and package features',
      'Classifying support tickets into routing queues from previously resolved tickets',
      'Estimating whether a customer will renew from product and account activity',
    ],
    workedExample: {
      scenario: 'A support organization wants to route new tickets to Billing or Technical Support using 8,000 tickets with verified final queue labels.',
      steps: [
        'Represent each ticket with text-derived and product-area features, and use the verified queue as the target label.',
        'Fit a classifier on 6,000 training tickets by minimizing classification loss without using the held-out examples.',
        'Choose model settings on 1,000 validation tickets, then evaluate the selected model once on 1,000 test tickets.',
        'Observe 910 correct test predictions and review the 90 errors by queue, product, and customer segment before deployment.',
      ],
      result: 'The selected classifier has 91% test accuracy on representative unseen tickets, with an explicit error set available for operational review rather than an unsupported claim of general intelligence.',
    },
    interview: {
      prompt: 'What makes a problem suitable for supervised learning, and what would make the resulting test score misleading?',
      answer: 'The problem needs a target that can be defined consistently, representative labeled examples, and features available at prediction time. A test score becomes misleading when labels encode the wrong objective, the split leaks related examples or future information, or deployment data differs materially from the sampled test population.',
    },
  },
  'Train, validation, and test': {
    explanation: [
      'The training set is used to fit model parameters, the validation set is used to choose model families, hyperparameters, features, and often an operating threshold, and the test set estimates performance after those choices are fixed. Keeping these roles separate prevents selection decisions from being credited as evidence of generalization.',
      'The split assumes each partition represents the intended deployment setting and that related records cannot cross boundaries. Random splits work for independent and identically distributed records, while grouped or time-ordered data need group-aware or chronological splits; reserving data reduces training volume, but repeated test inspection creates a larger and less visible optimism cost.',
    ],
    whyItMatters: 'A clean separation between fitting, selection, and final evaluation makes performance claims auditable. Without it, teams can overfit through decisions made outside the optimizer and report a test result that is effectively another validation result.',
    useCases: [
      'Holding out future months when validating a demand forecast',
      'Keeping all records from one patient in a single medical-data partition',
      'Selecting a fraud alert threshold on validation data before final test evaluation',
    ],
    workedExample: {
      scenario: 'A churn project has 10,000 customer records and must compare three model configurations without contaminating its final estimate.',
      steps: [
        'Split customers, not individual events, into 7,000 training, 1,500 validation, and 1,500 test records.',
        'Fit all three configurations only on the training records and compare their validation log loss.',
        'Select the best configuration and choose a 0.37 intervention threshold on validation data based on retention capacity.',
        'Freeze the model and threshold, then run them once on the test set and record 0.31 log loss, 72% recall, and 48% precision.',
      ],
      result: 'The final metrics describe one preselected model and threshold on untouched customers, while the validation history remains selection evidence rather than being mixed into the headline result.',
    },
    interview: {
      prompt: 'Why is choosing a classification threshold on the test set a form of test leakage even when no model weights are retrained?',
      answer: 'Threshold selection is still a choice optimized against observed outcomes. Once test labels influence that choice, the reported test metric benefits from the test sample and no longer estimates a fully fixed decision rule. Choose the threshold on validation data, freeze it, and evaluate that complete rule on test data.',
    },
  },
  'Bias and variance': {
    explanation: [
      'Bias is systematic error caused by a model or representation that is too restrictive for the underlying pattern, while variance is sensitivity to the particular training sample. High bias usually produces poor training and validation performance; high variance often produces strong training performance but a much worse validation result.',
      'The diagnosis assumes train and validation data are comparable and the labels are reliable enough for their gap to be meaningful. Increase useful capacity or improve features for high bias, and add data, regularization, ensembling, or simpler structure for high variance; reducing one can increase the other, so changes should be judged on unseen data rather than training fit alone.',
    ],
    whyItMatters: 'Bias and variance turn vague model disappointment into different corrective actions. Adding a larger model to a variance problem or stronger regularization to a bias problem can make the original failure worse.',
    useCases: [
      'Diagnosing a linear demand model that misses a clear seasonal curve in both train and validation data',
      'Recognizing that an unrestricted decision tree memorizes a small underwriting dataset',
      'Choosing an ensemble to stabilize predictions from noisy tabular samples',
    ],
    workedExample: {
      scenario: 'A ticket classifier scores 98% accuracy on training data and 71% on validation data, while a simpler baseline scores 79% and 77%.',
      steps: [
        'Verify that the two sets use the same label definition and that no distribution or preprocessing mismatch explains the gap.',
        'Interpret the 27-point gap as evidence of high variance rather than high bias because the model fits training data extremely well.',
        'Increase regularization and reduce model depth, then refit without consulting the test set.',
        'Measure 86% training and 80% validation accuracy after the change, then compare the final selected model on untouched test data.',
      ],
      result: 'The smaller 6-point gap and improved validation accuracy indicate a better generalization tradeoff, even though training accuracy fell by 12 points.',
    },
    interview: {
      prompt: 'How would you distinguish high bias from high variance using learning results?',
      answer: 'I would compare training performance with a relevant baseline and then compare training with validation performance. Poor results on both suggest the model cannot express or learn the pattern, which is high bias. Strong training results with substantially weaker validation results suggest sensitivity to the training sample, which is high variance.',
    },
  },
  'Feature representation': {
    explanation: [
      'Feature representation converts raw observations into values a model can use while preserving useful distinctions. Scaling changes the geometry seen by distance-based and gradient-based methods, categorical encoding controls how categories relate, and learned embeddings can place semantically related text or items near one another.',
      'A useful representation assumes its transformations can be reproduced from information available at inference time and that encoded relationships match the model. Hand-designed features can add domain signal and interpretability but also inject brittle assumptions, while learned representations can capture richer structure at the cost of data, compute, and easier-to-miss failure modes.',
    ],
    whyItMatters: 'Models can only learn patterns exposed by their inputs. A modest algorithm with a faithful representation often outperforms a sophisticated algorithm fed inconsistent scales, unstable identifiers, or features that erase the structure of the problem.',
    useCases: [
      'Standardizing income and age before nearest-neighbor classification',
      'Encoding product categories without pretending their numeric identifiers are ordered',
      'Representing support-ticket text with embeddings for semantic routing',
    ],
    workedExample: {
      scenario: 'A nearest-neighbor incident classifier uses server age from 0 to 10 years and monthly request count from 1,000 to 2,000,000.',
      steps: [
        'Fit a standardization transform on training data only, recording the mean and standard deviation for each numeric feature.',
        'Transform training and validation records with those stored values so request count does not dominate Euclidean distance solely because of units.',
        'Fit the classifier on transformed training features and select the neighbor count using validation performance.',
        'Compare validation accuracy before and after scaling: 62% rises to 78% with the same model and labels.',
      ],
      result: 'Scaling changes the distance calculation so both features can influence local similarity, improving validation accuracy by 16 percentage points without changing the classifier family.',
    },
    interview: {
      prompt: 'Why can assigning category IDs such as Basic=1, Pro=2, and Enterprise=3 be harmful?',
      answer: 'Many models interpret those numbers as ordered and separated by meaningful distances, implying that Pro is halfway between Basic and Enterprise. If that structure is not real, the representation creates false signal. One-hot encoding, target-safe encodings, or learned embeddings may represent the categories more faithfully.',
    },
  },
  'Data leakage': {
    explanation: [
      'Data leakage occurs when model development uses information that would not be available for the real prediction being simulated. Target leakage places an outcome or its consequence in the features, while split leakage lets related records, future statistics, or preprocessing knowledge flow across training and evaluation boundaries.',
      'Leakage analysis assumes a clearly defined prediction time and unit of independence. Prevent it by constructing features as of that time, splitting groups or chronology before fitting transforms, and reviewing suspiciously predictive fields; stricter pipelines can reduce apparent performance and convenience, but that loss reveals how the system will actually behave.',
    ],
    whyItMatters: 'Leakage produces confident metrics for a model that cannot reproduce its development conditions in production. It is one of the fastest ways to fund, deploy, and trust a system whose measured advantage disappears at launch.',
    useCases: [
      'Removing final refund status from features used to predict refund requests',
      'Keeping images from the same patient out of both training and test sets',
      'Fitting normalization and vocabulary transforms only on training data',
    ],
    workedExample: {
      scenario: 'A loan-default model reports 99% validation accuracy and includes a field named days_in_collections, although approval predictions occur before repayment begins.',
      steps: [
        'Draw the prediction timeline and confirm that days_in_collections is created only after a borrower has already missed payments.',
        'Remove the leaked field and any downstream fields that encode collection activity.',
        'Split applications chronologically, fit preprocessing on the training period, and refit the model.',
        'Observe validation accuracy fall from 99% to 76%, then evaluate whether 76% provides value under realistic approval conditions.',
      ],
      result: 'The lower score is credible because every feature now exists at approval time; the original 99% measured knowledge of the outcome rather than useful prediction.',
    },
    interview: {
      prompt: 'Can preprocessing cause leakage even when the target column is never included as a feature?',
      answer: 'Yes. Computing means, category vocabularies, feature selection, or imputations from the full dataset allows validation or test distributions to influence training. Split first, fit every learned transform on training data, and apply the frozen transform to later partitions.',
    },
  },
  Regularization: {
    explanation: [
      'Regularization discourages a model from using all available capacity to fit training examples. L2 penalties shrink weights smoothly, L1 penalties can drive some weights to zero, tree constraints limit partition complexity, and early stopping halts optimization when validation improvement ends.',
      'It assumes simpler or more stable solutions are more likely to generalize than equally fitting complex solutions. Regularization is valuable when variance is high or data are limited, but excessive strength causes underfitting; the regularization setting is a hyperparameter selected with validation evidence, not a substitute for representative data.',
    ],
    whyItMatters: 'Regularization controls the gap between memorizing development data and learning durable structure. It also affects sparsity, interpretability, robustness, and the amount of data a model needs to support its effective complexity.',
    useCases: [
      'Applying L2 weight decay to a logistic regression with many correlated features',
      'Limiting tree depth and minimum leaf size on a small tabular dataset',
      'Stopping neural-network training when validation loss rises for several epochs',
    ],
    workedExample: {
      scenario: 'A logistic churn model with 500 features has training log loss 0.18 and validation log loss 0.51, suggesting unstable large coefficients.',
      steps: [
        'Define candidate L2 strengths of 0, 0.01, 0.1, and 1.0 while keeping the split and feature pipeline fixed.',
        'Fit one model per strength on training data and compare validation log loss rather than training loss.',
        'Select strength 0.1, which gives training loss 0.27 and the lowest validation loss of 0.34.',
        'Refit according to the established training protocol and evaluate the chosen configuration once on test data.',
      ],
      code: {
        language: 'Text',
        code: `strength   train loss   validation loss
0.00       0.18         0.51
0.01       0.21         0.40
0.10       0.27         0.34
1.00       0.43         0.46`,
      },
      result: 'Moderate regularization accepts a 0.09 increase in training loss to reduce validation loss by 0.17, while the strongest setting underfits both sets.',
    },
    interview: {
      prompt: 'Why does regularization sometimes improve validation performance while making training performance worse?',
      answer: 'The penalty prevents the optimizer from using fragile parameter values that fit training-specific noise. That constraint raises training error but can reduce variance enough to lower error on unseen examples. If the penalty becomes too strong, bias dominates and both training and validation performance degrade.',
    },
  },
  'Class imbalance': {
    explanation: [
      'Class imbalance means one target class is much rarer than another, so aggregate accuracy can be dominated by the majority class. The learning algorithm may see too little minority evidence, and the default probability threshold may produce few positive predictions even when ranking quality is useful.',
      'Handling imbalance assumes the rare label is reliable and the evaluation sample reflects the operating prevalence. Use class weighting, careful resampling, suitable losses, and threshold selection based on precision, recall, cost, or capacity; resampling can improve learning but distort probability calibration unless predictions are corrected or calibrated on representative data.',
    ],
    whyItMatters: 'Rare events such as fraud, equipment failure, and severe safety incidents often carry the highest cost. A model can post excellent accuracy while failing almost every case the system was built to find.',
    useCases: [
      'Detecting fraudulent payments when only 0.5% of transactions are fraudulent',
      'Identifying a rare manufacturing defect from inspection measurements',
      'Prioritizing uncommon urgent support incidents without overwhelming responders',
    ],
    workedExample: {
      scenario: 'In 20,000 transactions, 100 are fraud. A classifier predicts every transaction as legitimate.',
      steps: [
        'Calculate accuracy as 19,900 divided by 20,000, or 99.5%, and note that fraud recall is 0 divided by 100, or 0%.',
        'Train with class-weighted loss so errors on the rare fraud examples contribute more strongly during fitting.',
        'Choose a validation threshold that reaches at least 80% recall while keeping investigation volume within 300 alerts.',
        'Evaluate the frozen threshold on representative test data using precision, recall, alert count, and expected loss.',
      ],
      result: 'A test result of 82 true fraud alerts among 260 total alerts gives 82% recall and 31.5% precision, replacing meaningless 99.5% accuracy with operationally relevant evidence.',
    },
    interview: {
      prompt: 'Should an imbalanced classification problem always be solved by oversampling the minority class?',
      answer: 'No. Oversampling can expose more minority examples during fitting, but it can overfit duplicates and alter the class distribution seen by the learner. I would first define error costs and metrics, establish a baseline, then compare weighting or resampling while selecting thresholds and checking calibration on data with realistic prevalence.',
    },
  },
  'Linear regression': {
    explanation: [
      'Linear regression predicts a continuous value as an intercept plus a weighted sum of features, commonly fitting coefficients by minimizing squared residuals. Each coefficient describes the expected target change for a one-unit feature change while the other represented features remain fixed.',
      'The model assumes the conditional mean is approximately linear in the representation and that deployment relationships resemble training relationships; classical confidence intervals add assumptions about residual structure. Use it as an interpretable baseline or when effects are plausibly additive, but outliers, extrapolation, multicollinearity, and nonlinear interactions can make coefficients or predictions unstable.',
    ],
    whyItMatters: 'Linear regression provides a fast, explainable benchmark for continuous prediction. Its residuals and coefficients often reveal data problems or missing structure even when a more flexible model will ultimately be deployed.',
    useCases: [
      'Estimating delivery duration from distance and stop count',
      'Forecasting energy usage over a stable operating range',
      'Quantifying an adjusted relationship between campaign spend and sales',
    ],
    workedExample: {
      scenario: 'A courier estimates delivery minutes from route distance using the fitted model minutes = 8 + 3.5 times distance_km.',
      steps: [
        'Fit the intercept and slope on historical routes by minimizing the sum of squared differences between actual and predicted minutes.',
        'For a 6 km route, calculate 8 + 3.5 times 6 to obtain a 29-minute prediction.',
        'Inspect validation residuals by distance and find that errors remain centered near zero for routes from 1 to 12 km.',
        'Avoid extrapolating the same line to a 60 km route because that distance is outside the observed operating range.',
      ],
      result: 'The model predicts 29 minutes for the 6 km route, and the residual check supports use within the represented range without claiming that the linear relationship holds indefinitely.',
    },
    interview: {
      prompt: 'What would a curved pattern in residuals versus fitted values tell you about a linear regression?',
      answer: 'It suggests the representation does not capture a systematic nonlinear relationship, so the linear conditional-mean assumption is inadequate. I would consider a justified transform, polynomial or spline feature, interaction, or a nonlinear model, then compare the alternatives on validation data.',
    },
  },
  'Logistic regression': {
    explanation: [
      'Logistic regression computes a linear score from features and maps it through the sigmoid function to a value between zero and one. Fitting minimizes log loss, so the model learns conditional class probabilities under its specification; a separate threshold converts those probabilities into decisions.',
      'It assumes the log odds are approximately linear in the represented features and observations are appropriately sampled. Use it for interpretable classification baselines and well-behaved probability estimates, but interactions and nonlinear boundaries require explicit features, and correlated inputs can destabilize individual coefficient interpretations.',
    ],
    whyItMatters: 'Logistic regression cleanly separates probability estimation from operational action. That makes it useful when teams need explainable effects, calibrated risk scores, and thresholds that can change as costs or capacity change without refitting the model.',
    useCases: [
      'Estimating customer churn probability for retention prioritization',
      'Building an interpretable credit-risk baseline with regulated features',
      'Predicting whether an incoming ticket needs escalation',
    ],
    workedExample: {
      scenario: 'A fitted escalation model produces a linear score of 1.2 for a new support ticket.',
      steps: [
        'Apply the sigmoid function to obtain 1 divided by 1 plus exp(-1.2), which is approximately 0.77.',
        'Keep 0.77 as the model output and compare candidate action thresholds on validation data.',
        'Select 0.65 because it satisfies the escalation team capacity while reaching the required recall.',
        'Classify the ticket for escalation because 0.77 exceeds 0.65, then evaluate the fixed rule on test data.',
      ],
      code: {
        language: 'Text',
        code: `probability = 1 / (1 + exp(-1.2)) = 0.77
decision = escalate because 0.77 >= 0.65`,
      },
      result: 'The model estimates a 77% escalation probability, while a separately selected 65% operating threshold turns that estimate into an escalation action.',
    },
    interview: {
      prompt: 'Does logistic regression inherently classify every example above 0.5 as positive?',
      answer: 'No. It fits scores or probabilities using log loss; 0.5 is only a conventional decision threshold. The threshold should be selected separately on validation data according to error costs, constraints, and desired precision or recall, then evaluated as part of the frozen decision rule.',
    },
  },
  'Decision trees': {
    explanation: [
      'A decision tree recursively partitions feature space using splits that reduce target impurity or prediction error. A prediction follows one path from the root to a leaf, where the leaf stores a class distribution or continuous estimate based on training examples that reached it.',
      'Trees assume useful decisions can be expressed through axis-aligned partitions of the supplied features. They handle nonlinearities, interactions, and mixed feature scales with little preprocessing, but deep trees have high variance, split small data fragments aggressively, and can change substantially after small data changes.',
    ],
    whyItMatters: 'Decision trees make conditional behavior visible as rules and form the foundation of random forests and gradient boosting. Understanding their instability explains both the need for depth controls and the power of tree ensembles.',
    useCases: [
      'Creating readable eligibility rules from tabular account features',
      'Modeling interactions between transaction amount and account age',
      'Establishing a nonlinear baseline that needs minimal feature scaling',
    ],
    workedExample: {
      scenario: 'A small tree routes support tickets using severity and customer tier.',
      steps: [
        'At the root, split on severity >= 4 because it produces the largest impurity reduction in training data.',
        'For lower-severity tickets, split on enterprise status; 18 of 20 enterprise examples require priority handling.',
        'Stop growth at depth two because deeper candidates improve training accuracy from 91% to 99% but lower validation accuracy from 88% to 80%.',
        'Store the positive fraction in each leaf so the tree can output a score before any action threshold is applied.',
      ],
      result: 'The depth-two tree retains 88% validation accuracy and readable rules, while rejecting extra branches that mostly memorize rare training combinations.',
    },
    interview: {
      prompt: 'Why can an unrestricted decision tree overfit even though every split locally improves its training objective?',
      answer: 'Later splits operate on smaller samples and can isolate noise or accidental category combinations. Each split reduces training error by construction, but the resulting leaves may estimate outcomes from too few examples to generalize. Depth, leaf-size, pruning, or ensemble controls trade some fit for stability.',
    },
  },
  'Random forests': {
    explanation: [
      'A random forest fits many decision trees on bootstrap samples and considers a random subset of features at each split. Averaging regression outputs or classification probabilities reduces the variance of individual trees when their errors are not perfectly correlated.',
      'The method assumes repeated samples and randomized features create enough diversity for averaging to stabilize predictions. It is a strong low-maintenance choice for nonlinear tabular data, but large forests cost memory and inference time, lose the readability of one tree, and usually do not extrapolate continuous trends beyond observed targets.',
    ],
    whyItMatters: 'Random forests turn unstable trees into robust predictors without demanding extensive scaling or delicate optimization. They are valuable baselines for determining whether more complex tabular methods provide enough gain to justify additional tuning.',
    useCases: [
      'Predicting equipment failure from mixed sensor and maintenance features',
      'Ranking customer renewal risk with nonlinear feature interactions',
      'Building a robust tabular baseline before tuning boosted trees',
    ],
    workedExample: {
      scenario: 'Five shallow trees estimate failure probability for one machine as 0.20, 0.35, 0.25, 0.60, and 0.40.',
      steps: [
        'Fit each tree on a bootstrap sample and expose a random feature subset at every candidate split.',
        'Collect each fitted tree probability for the machine rather than choosing the single best-looking tree.',
        'Average the five values to obtain 1.80 divided by 5, or 0.36.',
        'Apply a threshold selected on validation data if the application requires a maintenance decision.',
      ],
      result: 'The forest produces a 0.36 failure score by averaging varied trees, reducing dependence on any one tree such as the unusually high 0.60 estimate.',
    },
    interview: {
      prompt: 'How do random forests reduce variance, and why is feature randomness useful?',
      answer: 'Averaging many noisy estimators reduces variance when their errors differ. Bootstrap samples vary the observations, while random feature subsets prevent the same dominant feature from producing nearly identical trees. Lower correlation makes averaging more effective, though excessive randomness can increase bias.',
    },
  },
  'Gradient boosting': {
    explanation: [
      'Gradient boosting builds an additive model sequentially, with each new weak learner fitted to the current loss gradient or residual-like errors. A learning rate scales each contribution, so many shallow trees can progressively correct patterns the earlier ensemble missed.',
      'Boosting assumes the chosen weak learners and loss can capture useful remaining structure. It often excels on structured tabular data, but sequential fitting is less parallel than bagging and aggressive depth, learning rates, or rounds can overfit; missing-value behavior, categorical handling, and probability calibration also depend on the implementation.',
    ],
    whyItMatters: 'Gradient boosting is a common performance standard for tabular prediction. Understanding its sequential correction mechanism makes tuning choices such as depth, learning rate, and early stopping defensible rather than ritual.',
    useCases: [
      'Predicting default risk from structured application and account data',
      'Estimating delivery delay from route, warehouse, weather, and calendar features',
      'Ranking leads when nonlinear interactions matter more than simple coefficient interpretation',
    ],
    workedExample: {
      scenario: 'A regression ensemble initially predicts 50 minutes for every delivery, but one training route actually takes 70 minutes.',
      steps: [
        'Compute the route residual as actual 70 minus current prediction 50, giving a positive error of 20 minutes.',
        'Fit a shallow tree that predicts part of this residual for routes with similar congestion and distance.',
        'With learning rate 0.1 and a leaf correction of 15, update the route prediction from 50 to 51.5 minutes.',
        'Repeat across rounds and stop at the round with the lowest validation loss rather than the lowest training loss.',
      ],
      result: 'Each tree makes a controlled correction to the existing ensemble, and early stopping selects the number of rounds before continued training begins fitting validation-irrelevant detail.',
    },
    interview: {
      prompt: 'How does gradient boosting differ from a random forest?',
      answer: 'A random forest fits randomized trees largely independently and averages them to reduce variance. Gradient boosting fits learners sequentially so each addresses current errors and adds a scaled correction. Boosting often lowers bias more aggressively but is more sensitive to tuning and sequential overfitting.',
    },
  },
  Clustering: {
    explanation: [
      'Clustering groups unlabeled examples according to a chosen representation and similarity objective. K-means minimizes squared distance to cluster centroids and therefore favors compact, roughly spherical groups, while density or hierarchical methods encode different ideas of what a group should be.',
      'A cluster is not automatically a real customer type or causal category; usefulness assumes the features and distance reflect domain similarity. Clustering can support exploration, segmentation, and anomaly discovery, but results depend strongly on scaling, algorithm, and cluster count, and must be validated for stability and downstream meaning.',
    ],
    whyItMatters: 'Clustering can reveal structure when labels do not exist, but it can also manufacture persuasive-looking segments from arbitrary geometry. Treating clusters as hypotheses to validate keeps unsupervised output connected to real decisions.',
    useCases: [
      'Grouping support-ticket embeddings to discover recurring issue themes',
      'Segmenting product usage patterns for differentiated research interviews',
      'Finding observations far from any dense operating cluster for anomaly review',
    ],
    workedExample: {
      scenario: 'A product team clusters 12,000 accounts using standardized weekly sessions and collaboration events.',
      steps: [
        'Standardize both features so collaboration counts do not dominate distance because of their larger raw scale.',
        'Fit candidate k-means solutions for three through seven clusters and compare stability across resampled datasets.',
        'Choose four stable clusters, then inspect representative accounts rather than assigning meaning from centroid values alone.',
        'Validate that one high-collaboration cluster has 18% higher retained usage in a later period before using it for research sampling.',
      ],
      result: 'The analysis yields four reproducible behavioral groups and one externally validated retention difference, while avoiding the claim that the algorithm discovered permanent customer identities.',
    },
    interview: {
      prompt: 'How would you decide whether a clustering result is useful when there are no ground-truth labels?',
      answer: 'I would check stability across samples and settings, inspect whether members are coherent to domain experts, and test whether clusters predict or support a separate downstream outcome or action. Internal scores alone only measure agreement with the algorithm objective, not business meaning.',
    },
  },
  'Nearest neighbors': {
    explanation: [
      'Nearest-neighbor methods compare a query with stored training examples under a distance or similarity function. K-nearest neighbors predicts from the labels or values of the closest k examples, while retrieval systems often use the same local-similarity idea to return candidates rather than a final prediction.',
      'The method assumes nearby represented points have similar targets and that all important dimensions are scaled and relevant. It requires little fitting and can model irregular local boundaries, but inference and storage costs grow with the dataset, irrelevant dimensions degrade distance, and small k is noisy while large k smooths away local structure.',
    ],
    whyItMatters: 'Nearest neighbors provides an intuitive local baseline and exposes whether a representation places genuinely similar cases together. Its limitations also explain why scaling, dimensionality reduction, approximate indexes, and careful choice of k matter in retrieval systems.',
    useCases: [
      'Classifying an incident from outcomes of similar historical incidents',
      'Retrieving semantically similar knowledge-base passages from embeddings',
      'Estimating a home price from nearby comparable properties',
    ],
    workedExample: {
      scenario: 'A standardized incident vector has five nearest historical labels: Network, Network, Database, Network, and Database.',
      steps: [
        'Fit scaling on training features and transform both stored incidents and the new incident with the same parameters.',
        'Compute distances and select the five closest training records without using validation or test labels as neighbors.',
        'Count three Network and two Database labels, producing an unweighted Network vote of 3 divided by 5, or 0.60.',
        'Choose k on validation data and measure final classification behavior on a separate test set.',
      ],
      result: 'The five-neighbor classifier predicts Network with a local vote share of 60%, while the validation process determines whether five neighbors provide the best bias-variance tradeoff.',
    },
    interview: {
      prompt: 'Why does k-nearest neighbors often perform poorly when many irrelevant dimensions are added?',
      answer: 'In high dimensions, distances tend to become less discriminative, and irrelevant coordinates add noise to every comparison. The selected neighbors may no longer be meaningfully local. Feature selection, a better learned representation, dimensionality reduction, or more data can restore useful geometry.',
    },
  },
  'Confusion matrix': {
    explanation: [
      'A binary confusion matrix counts true positives, false positives, true negatives, and false negatives after a score threshold has converted model outputs into class decisions. It preserves the direction of errors, unlike accuracy, and supplies the counts used by precision, recall, specificity, and other metrics.',
      'Its interpretation assumes a declared positive class, threshold, and representative class prevalence. Use it to connect errors to operational consequences and subgroup behavior, but one matrix describes only one threshold and raw counts do not compare fairly across populations of very different size without rates or context.',
    ],
    whyItMatters: 'The confusion matrix prevents a single summary score from hiding who is missed and who is incorrectly acted upon. It is the clearest bridge from model decisions to workload, customer harm, and downstream cost.',
    useCases: [
      'Counting fraudulent purchases missed and legitimate purchases blocked',
      'Auditing false negatives for a safety-event detector by site',
      'Comparing the operational effects of two classification thresholds',
    ],
    workedExample: {
      scenario: 'A fixed fraud threshold is evaluated on 1,000 transactions containing 40 actual fraud cases.',
      steps: [
        'Count 30 fraudulent transactions flagged as true positives and 10 missed as false negatives.',
        'Count 70 legitimate transactions flagged as false positives and 890 correctly cleared as true negatives.',
        'Verify all cells total 1,000 and derive recall as 30 divided by 40, or 75%.',
        'Report that the threshold creates 100 investigations and misses 10 fraud cases, not merely that accuracy is 92%.',
      ],
      code: {
        language: 'Text',
        code: `                 predicted fraud   predicted legitimate
actual fraud              30                  10
actual legitimate         70                 890`,
      },
      result: 'The matrix shows 75% fraud recall, 100 review cases, and 10 misses, making the consequences of this particular threshold explicit.',
    },
    interview: {
      prompt: 'Why is a confusion matrix incomplete unless you state the threshold and positive class?',
      answer: 'Changing the threshold changes every predicted label and therefore all four cells. Swapping which class is positive also swaps the meaning of false positives and false negatives. The counts only describe a reproducible decision rule when both choices are explicit.',
    },
  },
  'Precision and recall': {
    explanation: [
      'Precision is true positives divided by all predicted positives, so it answers how often a positive alert is correct. Recall is true positives divided by all actual positives, so it answers how much of the positive class the decision rule finds; changing the threshold usually trades one against the other.',
      'The metrics assume a clear positive class and representative labels, while precision also depends strongly on prevalence. Prioritize recall when misses are costly and precision when false alarms consume scarce capacity or cause harm, but select an operating point using both consequences rather than optimizing either metric in isolation.',
    ],
    whyItMatters: 'Precision and recall express two distinct failure costs hidden by accuracy. They let teams discuss whether a model finds enough important cases and whether people can trust or process the alerts it creates.',
    useCases: [
      'Setting high recall for detection of severe equipment faults',
      'Maintaining high precision for automatic account suspension',
      'Balancing fraud coverage against a fixed investigation-team capacity',
    ],
    workedExample: {
      scenario: 'A safety classifier flags 120 events, of which 90 are true incidents, from 150 actual incidents in the evaluation set.',
      steps: [
        'Calculate precision as 90 divided by 120, which equals 75%.',
        'Calculate recall as 90 divided by 150, which equals 60%.',
        'Lower the threshold on validation data and observe 120 true positives among 200 alerts, giving 60% precision and 80% recall.',
        'Choose between the operating points from the cost of 30 additional detected incidents versus 80 additional reviews, then test the frozen threshold.',
      ],
      result: 'The lower threshold gains 20 percentage points of recall but loses 15 points of precision, exposing the exact coverage and workload tradeoff for the decision owner.',
    },
    interview: {
      prompt: 'Can a model have high recall and low precision, and what does that look like operationally?',
      answer: 'Yes. A low threshold can flag most actual positives, producing high recall, while also flagging many negatives, producing low precision. Operationally, few important cases are missed, but reviewers face many false alarms and may lack capacity or lose trust in the alerts.',
    },
  },
  'F1 score': {
    explanation: [
      'F1 is the harmonic mean of precision and recall: two times their product divided by their sum. The harmonic mean is pulled toward the smaller value, so a classifier must maintain both metrics to achieve a high F1 score.',
      'F1 assumes precision and recall deserve equal weight and intentionally ignores true negatives. It is useful for comparing operating points in positive-class tasks with similar false-positive and false-negative importance, but it can hide very different error profiles and is inappropriate when costs, capacity, calibration, or negative-class performance matter separately.',
    ],
    whyItMatters: 'F1 provides a compact balance measure without rewarding a model for an abundant true-negative class. Understanding what it omits prevents teams from using it as a universal score for every imbalanced problem.',
    useCases: [
      'Comparing document extraction models where missed and spurious entities matter similarly',
      'Selecting among balanced alert thresholds during early model development',
      'Summarizing positive-class performance alongside the underlying precision and recall',
    ],
    workedExample: {
      scenario: 'A ticket classifier has precision 0.75 and recall 0.60 at a proposed threshold.',
      steps: [
        'Multiply precision and recall to obtain 0.75 times 0.60, or 0.45.',
        'Double the product to obtain 0.90 and divide by the sum 1.35.',
        'Calculate F1 as approximately 0.667 rather than using the arithmetic mean of 0.675.',
        'Inspect the original precision, recall, and alert volume before accepting the threshold based on F1.',
      ],
      code: {
        language: 'Text',
        code: `F1 = 2 * (0.75 * 0.60) / (0.75 + 0.60)
   = 0.667`,
      },
      result: 'The threshold has F1 approximately 0.67, but the decision still exposes the underlying 75% precision and 60% recall so their unequal operational effects remain visible.',
    },
    interview: {
      prompt: 'When would maximizing F1 choose the wrong model for a business problem?',
      answer: 'F1 treats precision and recall symmetrically and ignores true negatives, dollar costs, probability quality, and capacity. If a missed fraud costs far more than a review, or only 100 alerts can be processed, the best business threshold can have lower F1 than an unconstrained alternative.',
    },
  },
  'ROC and PR curves': {
    explanation: [
      'An ROC curve plots true-positive rate against false-positive rate as the threshold moves, while a precision-recall curve plots precision against recall. Area under either curve summarizes ranking across thresholds, but neither chooses the operating threshold that the deployed system will use.',
      'ROC analysis is informative across balanced classes and comparisons of ranking, but false-positive rate can look small when negatives are extremely abundant. PR curves focus attention on positive retrieval quality and are often clearer for rare positives; both depend on the evaluation distribution, and PR baselines change directly with prevalence.',
    ],
    whyItMatters: 'Curves show how a model behaves across possible operating points instead of hiding threshold sensitivity in one metric. Choosing the right curve prevents a visually strong summary from obscuring an unusable number of false alarms.',
    useCases: [
      'Comparing fraud-ranking models when positives are less than 1% of transactions',
      'Inspecting sensitivity and false-positive rate for a medical screening score',
      'Selecting candidate thresholds before applying business costs and capacity constraints',
    ],
    workedExample: {
      scenario: 'A fraud dataset has 100 positives and 9,900 negatives. At one threshold, the model finds 80 frauds and falsely flags 198 legitimate transactions.',
      steps: [
        'Calculate true-positive rate as 80 divided by 100, or 80%.',
        'Calculate false-positive rate as 198 divided by 9,900, or 2%.',
        'Calculate precision as 80 divided by 278, or approximately 28.8%, revealing that most alerts are still false.',
        'Use the PR curve and review capacity to compare this point with alternatives, then select the threshold on validation data.',
      ],
      result: 'An apparently low 2% false-positive rate creates 198 false alerts and only 28.8% precision, so the PR view better communicates performance under 1% prevalence.',
    },
    interview: {
      prompt: 'Why can ROC AUC look excellent for a rare-event classifier that is operationally disappointing?',
      answer: 'With many negatives, hundreds of false positives can still be a small false-positive rate, which keeps the ROC curve attractive. Precision exposes how those false positives compare with the few true positives. I would inspect the PR curve and concrete threshold-level counts before judging usefulness.',
    },
  },
  Calibration: {
    explanation: [
      'Calibration measures whether predicted probabilities match observed frequencies: among cases scored near 0.8, roughly 80% should be positive. Reliability plots, Brier score, and calibration error assess this property, which is distinct from ranking because a model can order cases correctly while assigning probabilities that are consistently too extreme.',
      'Calibration assumes outcomes are observed on representative data and can drift when prevalence or process changes. Use calibrated probabilities for expected-cost decisions, resource planning, and risk communication; post-hoc methods such as Platt scaling or isotonic regression need separate validation data and may improve probability accuracy while leaving ranking largely unchanged.',
    ],
    whyItMatters: 'Many decisions multiply probabilities by costs or combine them with other risks. Miscalibrated scores turn those calculations into false precision even when classification accuracy or AUC appears strong.',
    useCases: [
      'Estimating expected credit loss from predicted default probabilities',
      'Planning review staffing from the expected number of true alerts',
      'Communicating patient risk bands that correspond to observed outcome rates',
    ],
    workedExample: {
      scenario: 'A model assigns scores from 0.75 to 0.85 to 200 validation cases, but only 120 become positive.',
      steps: [
        'Treat the bin as having an average prediction near 0.80, which implies about 160 positives among 200 cases.',
        'Compare the observed rate of 120 divided by 200, or 0.60, showing that the model is overconfident in this range.',
        'Fit a calibration mapping on a dedicated validation partition without changing the underlying model ranking.',
        'Evaluate the calibrated model on untouched test data using reliability bins and Brier score before selecting any decision threshold.',
      ],
      result: 'The original 0.80 scores corresponded to only 60% observed risk; successful test calibration would move similar cases toward 0.60 and make expected-cost calculations more credible.',
    },
    interview: {
      prompt: 'Can calibration improve without improving ROC AUC?',
      answer: 'Yes. ROC AUC depends on ranking, while calibration depends on the numeric probabilities matching observed frequencies. A monotonic calibration mapping can preserve case order and therefore AUC while correcting scores from values such as 0.8 toward an observed rate such as 0.6.',
    },
  },
  'Cross-validation': {
    explanation: [
      'K-fold cross-validation partitions development data into k folds, repeatedly fitting on k minus one folds and validating on the remaining fold. Aggregating fold metrics estimates both average performance and sensitivity to the particular split while allowing every development example to serve as validation once.',
      'Standard folds assume examples are exchangeable and independent enough to move between partitions. Use grouped folds for related entities, stratification for class proportions, and forward-chaining for temporal prediction; cross-validation costs k fits and does not create extra independent data, so a final untouched test set is still needed after model selection.',
    ],
    whyItMatters: 'Cross-validation provides more stable selection evidence when one validation split would be noisy. Its fold variation can reveal that a small reported advantage is less reliable than it appears.',
    useCases: [
      'Comparing regularization strengths on a limited labeled dataset',
      'Keeping all observations from one customer within the same fold',
      'Using expanding time windows to validate a demand forecast',
    ],
    workedExample: {
      scenario: 'Two classifiers are compared with five-fold cross-validation on 2,500 labeled tickets before final test evaluation.',
      steps: [
        'Create five stratified folds of 500 tickets while grouping duplicate conversations into the same fold.',
        'For each round, fit preprocessing and model parameters on 2,000 tickets and score the held-out 500.',
        'Record F1 scores of 0.71, 0.74, 0.69, 0.73, and 0.72 for model A, giving a mean of 0.718.',
        'Select the model using aggregate fold evidence, freeze the full procedure, and evaluate it once on a separate test set.',
      ],
      result: 'Model A has mean cross-validation F1 of 0.718 with a visible 0.69 to 0.74 range, providing more context than a single favorable split while preserving the test set for final evidence.',
    },
    interview: {
      prompt: 'Why should preprocessing be fitted separately inside each cross-validation fold?',
      answer: 'If preprocessing is fitted once on all development data, each validation fold influences means, vocabularies, selected features, or imputations used by its training folds. That leaks validation information and makes results optimistic. The entire learned pipeline must be refitted within every fold.',
    },
  },
  'Business evaluation': {
    explanation: [
      'Business evaluation maps model outputs to the real decision process, including action thresholds, error costs, benefits, capacity, latency, fairness, and fallback behavior. Model fitting estimates scores, threshold selection converts scores into proposed actions, and evaluation measures the frozen end-to-end policy against technical and business outcomes.',
      'The analysis assumes costs and benefits are explicit enough to estimate and that offline data represents deployment effects. Use shadow tests, pilots, and controlled experiments when model actions can change user behavior; a model with better AUC may still lose if it creates excessive reviews, arrives too late, shifts harm to a subgroup, or cannot produce incremental value over existing operations.',
    ],
    whyItMatters: 'A model is useful only through the decisions and outcomes it changes. Business evaluation prevents metric improvements from being mistaken for value and makes operational constraints part of model design before deployment.',
    useCases: [
      'Choosing a fraud-review threshold that fits daily investigator capacity',
      'Testing whether churn interventions create incremental retained revenue',
      'Comparing an automated support route with the cost and latency of the current queue',
    ],
    workedExample: {
      scenario: 'A fraud model scores 10,000 daily transactions, the team can review 200, a caught fraud saves $500, and each review costs $8.',
      steps: [
        'Fit the probability model on training data and compare candidate model configurations on validation ranking and calibration.',
        'On validation data, select the threshold that produces at most 200 daily alerts; it yields 200 alerts containing an expected 50 frauds.',
        'Estimate daily gross savings as 50 times $500, or $25,000, and review cost as 200 times $8, or $1,600.',
        'Freeze the model and threshold, then measure test performance and run a monitored pilot to verify the estimated $23,400 daily net benefit against actual outcomes.',
      ],
      code: {
        language: 'Text',
        code: `expected benefit = (50 * $500) - (200 * $8)
                 = $25,000 - $1,600
                 = $23,400 per day`,
      },
      result: 'The selected policy respects the 200-review limit and has an estimated daily net benefit of $23,400, which the untouched test set and pilot must confirm before broad rollout.',
    },
    interview: {
      prompt: 'A new model has higher AUC than the current model. What else must you know before recommending deployment?',
      answer: 'I need threshold-level outcomes under real prevalence, probability calibration if costs use probabilities, review or action capacity, latency and reliability, subgroup effects, and incremental value over the current process. I would freeze the selected policy, validate it on untouched data, and use a shadow test or experiment when deployment changes behavior.',
    },
  },
} satisfies Record<string, AiLessonDetails>