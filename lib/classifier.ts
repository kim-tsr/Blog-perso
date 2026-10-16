import type { Story } from './kort'

export const HF_MODEL = 'https://huggingface.co/Kim-tsr/redflag-mmbert-base-s1'
export const KAGGLE_NOTEBOOK = 'https://www.kaggle.com/code/majeee/notebooke9e1aadf49'

export const CLASSIFIER: Story = {
  title: 'RedFlag : classifier les prompts malveillants avant le LLM',
  intro: "Projet du cours d'IA à l'EPITA : un modèle qui classe chaque prompt entrant en cinq catégories (sain, injection directe, jailbreak, détournement, exfiltration de données) avant qu'il n'atteigne un LLM. Il sert de pre-hook : un score binaire, P(dangereux) = 1 − P(sain), comparé à un seuil calibré. Une première version entraînée sur 130 000 prompts m'a appris à évaluer proprement (et à débusquer un faux résultat) ; la seconde, sur 1,1 million de prompts, atteint 0,96 de macro-F1. Le modèle est publié sur Hugging Face et branché derrière une démo façon retransmission de Formule 1.",
  tech: ['Python', 'PyTorch', 'Transformers', 'mmBERT', 'scikit-learn', 'Hugging Face', 'Kaggle (2× T4)', 'FastAPI'],
  repos: [
    { label: 'Modèle sur Hugging Face', href: HF_MODEL },
    { label: 'Notebook Kaggle (entraînement v2)', href: KAGGLE_NOTEBOOK },
    { label: 'Dataset utilisé', href: 'https://huggingface.co/datasets/Nailyk14/prompt-safety-multilingual' },
  ],
  steps: [
    {
      title: "Partir d'un dataset, et ne pas lui faire confiance",
      text: [
        "Je suis parti de prompt-safety-multilingual, qui regroupe des prompts de nombreuses sources publiques en cinq classes et en plusieurs dizaines de langues. Dans la première version, environ 130 000 prompts d'entraînement ; le français y était surtout traduit automatiquement par Qwen2.5-7B, ce qui compte pour interpréter les résultats.",
        "Deux précautions dès le départ. Les splits sont assignés par groupe : un prompt et ses traductions ou paraphrases restent dans le même split, sinon le test mesure de la mémorisation. Et je fige la version du dataset par son hash de commit, écrit dans le meta.json de chaque run. J'ai aussi écrit un script d'audit pour traquer les mêmes prompts avec des labels différents, les catégories non mappées, les templates bénins répétitifs et les augmentations cassées.",
      ],
    },
    {
      title: "Un encodeur multilingue, face à un baseline honnête",
      text: [
        "Le modèle principal est mmBERT-base (308 M de paramètres, architecture ModernBERT, multilingue, contexte long, rapide à l'inférence), fine-tuné en entier. Ni décodeur ni LoRA : ce n'est pas nécessaire pour ce volume de données et cette contrainte de latence.",
        "À côté, un baseline volontairement simple : TF-IDF sur n-grammes de caractères et régression logistique. Il répond à une question précise : qu'apporte la compréhension du contexte par rapport à la détection de motifs ? Les n-grammes de caractères résistent bien au multilingue et au leetspeak, c'est un adversaire sérieux.",
      ],
      snippets: [{ file: 'baseline_tfidf.py', lang: 'python', code: `# n-grammes de caractères : robustes au multilingue et au leetspeak
vec = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 5),
                      max_features=300_000, sublinear_tf=True, min_df=3)` }],
    },
    {
      title: "Entraîner malgré des classes déséquilibrées",
      text: [
        "Le sain et l'injection directe pèsent bien plus que l'exfiltration. J'ai pondéré la cross-entropy par la racine de l'inverse de la fréquence, normalisée à une moyenne de 1, de sorte que les classes rares ne soient pas ignorées.",
        "Sur la v1 : trois epochs, learning rate 3e-5 avec warmup, batch effectif de 32, sélection du meilleur checkpoint sur la macro-F1 de validation avec early stopping, et trois seeds pour mesurer la variance. Un seul run ne dit pas si un résultat est stable.",
      ],
      snippets: [{ file: 'train.py (principe)', lang: 'python', code: `# poids de classe : racine de l'inverse de la fréquence, moyenne ramenée à 1
w = np.sqrt(N / (K * counts))
w = w / w.mean()

loss = F.cross_entropy(logits, labels, weight=w.to(logits.device))` }],
    },
    {
      title: "Les galères de l'entraînement sur Kaggle",
      text: [
        "Rien n'a tourné du premier coup. transformers 5 avait renommé des arguments de TrainingArguments : je filtre maintenant les arguments selon la signature installée. Un CUDA out of memory dès le step 0 : le sampler par longueur place le batch le plus long en premier, 32 × 512 tokens ne tiennent pas sur un T4. Un StopIteration sous 2 GPU, venu du DataParallel implicite que ModernBERT ne supporte pas : je suis passé à torchrun en DDP. Un second out of memory au step 26 : j'ai fini à 8 par GPU, 2 d'accumulation, 2 GPU.",
        "Le plus vicieux : un notebook « réussi » sans aucun résultat, parce qu'une erreur dans une commande !python n'arrête pas Kaggle. J'ai ajouté une fonction qui lève une exception si le meta.json attendu n'existe pas.",
      ],
    },
    {
      title: "Le jour où le modèle semblait ne rien savoir faire",
      text: [
        "Premier rapport d'évaluation de la v1 : macro-F1 de 0,205 et ROC-AUC de 0,53. C'est le hasard. Pendant ce temps, le baseline TF-IDF affichait 0,856. Un encodeur fine-tuné sur 130 000 exemples ne peut pas être au niveau du hasard : j'ai cherché un bug dans le pipeline plutôt qu'un problème de modèle.",
        "La cause : trainer.predict combiné à group_by_length. Le LengthGroupedSampler, qui regroupe les prompts par longueur pour limiter le padding, s'applique aussi à l'évaluation. Les prédictions sortaient dans un ordre mélangé par rapport aux labels. Le modèle était bon, la comparaison était fausse.",
        "J'ai écrit predict.py, qui recalcule les prédictions dans l'ordre exact du dataset à partir des modèles déjà entraînés, sans réentraîner. Même modèle, macro-F1 de 0,912.",
      ],
      snippets: [{ file: 'predict.py (principe)', lang: 'python', code: `# ordre du dataset garanti : jamais de LengthGroupedSampler à l'évaluation
loader = DataLoader(
    ds,
    batch_size=bs,
    sampler=SequentialSampler(ds),
    collate_fn=DataCollatorWithPadding(tok),
)` }],
    },
    {
      title: "Évaluer pour un pre-hook, pas pour un concours",
      text: [
        "Une macro-F1 ne dit pas si le filtre est utilisable. Un pre-hook doit bloquer peu de prompts légitimes : je fixe donc d'abord le taux de faux positifs à 1 %, et je regarde la part d'attaques détectées à ce seuil.",
        "Tout se règle sur la validation, jamais sur le test. Une température est ajustée en minimisant la NLL pour calibrer les probabilités, le score binaire est 1 moins la probabilité de « sain », et le seuil est le quantile des scores des prompts sains de validation. Le test ne sert qu'à mesurer, avec des intervalles de confiance par bootstrap.",
      ],
      snippets: [{ file: 'evaluate.py (principe)', lang: 'python', code: `s_val  = 1 - softmax(val_logits / T)[:, BENIGN]
thr    = np.quantile(s_val[val_is_benign], 1 - 0.01)   # FPR visé : 1 %

s_test = 1 - softmax(test_logits / T)[:, BENIGN]
flagged = s_test >= thr                                # appliqué tel quel au test` }],
    },
    {
      title: "Passer à 1,1 million de prompts : la v2",
      text: [
        "Le dataset a ensuite grossi : 1 115 571 prompts d'entraînement au lieu de 130 575, et un test de 47 790 prompts au lieu de 5 065, avec beaucoup plus de sources et de langues. Cette échelle a changé la façon de travailler.",
        "Plus question de trois epochs et trois seeds : une seule epoch représente 34 862 steps, soit environ 9 heures sur les deux T4 de Kaggle. J'ai donc fait un seul passage, une seule seed, et j'évalue quatre fois par epoch sur un sous-échantillon de 10 000 prompts de validation pour ne pas passer des heures à évaluer. Le baseline a changé aussi : la régression logistique saga prenait 1,8 h sur 130 000 prompts, je l'ai remplacée par une version SGD qui entraîne sur 1,1 million de prompts en 13 minutes.",
      ],
      snippets: [
        { file: 'baseline_tfidf.py (v2)', lang: 'python', code: `# SGD : passe à l'échelle sur 1M+ prompts (saga : ~1,5 h déjà sur 130k)
clf = SGDClassifier(loss="log_loss", alpha=1e-6, class_weight="balanced",
                    max_iter=20, tol=1e-4, n_jobs=-1, random_state=0)
clf.fit(X, y)` },
        { file: 'Kaggle, 2 × T4 (v2)', lang: 'bash', code: `torchrun --nproc_per_node 2 train.py \\
    --model jhu-clsp/mmBERT-base \\
    --epochs 1 --seed 1 --bs 8 --grad_accum 2` },
      ],
    },
    {
      title: "Ce que la v2 change, et ce qu'elle révèle",
      text: [
        "Les chiffres montent nettement : 0,964 de macro-F1 (0,961 à 0,967 en intervalle de confiance), et 94,2 % des attaques détectées à 1 % de faux positifs, contre 66,9 % pour le baseline. Le jailbreak, la classe la plus difficile, passe de 0,83 à 0,94 de F1. Les deux jeux de tests ne sont pas les mêmes : la comparaison avec la v1 donne un ordre de grandeur, pas une mesure stricte.",
        "Mais un bon score moyen cache des trous. Les erreurs se concentrent entre « sain » et « jailbreak » (environ 580 prompts dans chaque sens). Les langues peu représentées décrochent : 61 % de recall en haoussa, 70 % en kikuyu, 71 % en khmer, et 13 % de faux positifs en thaï. Enfin une source, Necent/llm-jailbreak-prompt-injection-dataset, fait environ 84 % du test : sur d'autres sources le recall tombe, par exemple 60 % sur JailbreakHub et 70 % sur un autre jeu de jailbreaks. Le chiffre global reflète surtout la distribution de cette source.",
      ],
    },
    {
      title: "Le brancher dans une démo : RedFlag",
      text: [
        "Pour voir le filtre travailler, j'ai monté une démo : un backend FastAPI classe chaque message avant de le transmettre à un second LLM via OpenRouter. Si le message est jugé sain il passe, sinon il est bloqué, c'est le « drapeau rouge ». L'interface imite une retransmission de Formule 1.",
        "Le modèle pèse environ 1,2 Go, trop lourd pour git : je l'ai publié sur Hugging Face, et le backend le télécharge automatiquement au premier démarrage. On peut aussi lancer la démo avec ELECTRA pour comparer.",
      ],
    },
  ],
  retex: {
    learned: [
      "Un résultat aberrant est d'abord un bug de pipeline : le faux 0,2 de macro-F1 de la v1 venait de l'ordre des prédictions, pas du modèle.",
      "Le baseline TF-IDF m'a servi de garde-fou : à 0,856, il rendait le 0,2 impossible. Et il reste sérieux, mais l'écart se creuse avec les données : à 1 % de faux positifs, mmBERT détecte 94 % des attaques contre 67 % pour lui.",
      "Régler seuil et température sur la validation uniquement, puis ne mesurer qu'une fois sur le test.",
      "Plus de données a fait plus que n'importe quel réglage : passer de 130 000 à 1,1 million de prompts a fait gagner environ 5 points de macro-F1 et plus de 6 points de recall, au prix d'un entraînement quatre fois plus long.",
      "Un score moyen cache des trous : langues rares, sources moins représentées, et une source qui domine le test.",
    ],
    next: [
      "Entraîner plusieurs seeds sur la v2 : avec une seule, je n'ai pas de variance, et chaque run coûte 9 heures.",
      "Exporter la température et le seuil dans un fichier (threshold.json) : evaluate.py les calcule mais ne les écrit pas encore, l'inférence ne peut donc pas les relire.",
      "Évaluer séparément sur chaque source et chaque langue rare, et constituer un petit test set français natif.",
      "Tester la troncature début + fin (déjà codée dans train.py et predict.py) pour les jailbreaks longs : la v2 n'a gardé que le début du prompt.",
    ],
  },
}

export const CLASSIFIER_RESULTS = {
  head: ['', 'mmBERT v1 (130 k prompts, 3 seeds)', 'mmBERT v2 (1,1 M prompts)', 'TF-IDF + régression logistique (v2)'],
  rows: [
    ['Taille du test', '5 065', '47 790', '47 790'],
    ['Macro-F1', '0,912 ± 0,001', '0,964', '0,894'],
    ['PR-AUC', '0,995', '0,998', '0,981'],
    ['Recall à 1 % de faux positifs', '0,876 ± 0,016', '0,942', '0,669'],
    ['Faux positifs mesurés sur le test', '0,7 %', '0,9 %', '0,7 %'],
    ['Précision', '0,993', '0,992', '0,991'],
    ['F1 jailbreak', '0,828', '0,937', '0,835'],
    ['F1 détournement (hijack)', '0,871', '0,964', '0,907'],
    ['F1 injection directe', '0,942', '0,974', '0,909'],
    ['F1 exfiltration de données', '0,962', '0,975', '0,917'],
    ['Temps d’entraînement', '2,3 h par seed', '9,0 h', '13 min'],
  ],
}
