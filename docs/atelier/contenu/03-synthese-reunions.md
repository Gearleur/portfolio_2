# Synthèse de réunions

> Brouillon du 2026-11-08, tiré de ton rapport TN10 (stage e.SNCF, 24 semaines,
> rendu le 26/02/2026). Même squelette que SNCF GPT et Whiteboard AMDEC, en plus
> court : neuf sections, quatre schémas, aucune image du rapport. Le texte vit
> dans `src/apps/atelier/projets.ts` (`SYNTHESE_REUNIONS`) ; ce fichier en est la
> version lisible. Français d'abord, l'anglais ensuite.
>
> Volontairement absents : les noms de tes collègues et de tes encadrants, les
> captures de l'application (elles montrent une vraie réunion interne, un nom et
> une adresse), les adresses Azure, et toute mesure que le rapport ne donne pas
> (pas de taux d'erreur de transcription, pas de nombre d'utilisateurs).
>
> À vérifier : le mois de début (septembre 2025, déduit des 24 semaines avant le
> rendu). Précisé par toi : la voix n'est pas conservée, seuls le transcript et
> les sorties (résumés) le sont. Tu as aussi autorisé à nommer les entreprises des
> RFI, la SNCF étant publique.

## 0. En-tête

**Synthèse de réunions**
Un outil qui transforme une réunion Teams en transcription, en rapport et en
conversation, pour retrouver une décision sans réécouter une heure.

- **24 semaines** dans l'équipe IA d'e.SNCF, de l'exploration au déploiement ;
- **3** modèles de transcription comparés : Whisper, Faster-Whisper et Voxtral ;
- **2** Web Apps déployées sur Azure, le front et le back, avec authentification SSO.

| | |
| --- | --- |
| Équipe | Seul sur la réalisation et le déploiement, dans l'équipe IA d'e.SNCF |
| Période | Septembre 2025 – février 2026, à Saint-Denis |
| Rôle | Ingénieur IA stagiaire : transcription, LLM, backend, frontend, déploiement Azure |

## 1. Comment retrouver ce qui s'est décidé dans une réunion, sans la réécouter ?

L'information utile se perd dans des réunions d'une heure. J'ai construit, de
l'idée au déploiement, un outil de synthèse de réunions Teams. *Trois tuiles :*
**Explorer** · **Prototyper** · **Déployer**.

**Le problème : l'essentiel d'une réunion est dit, pas écrit.** Pour retrouver
décisions et actions, il faut réécouter, ou compter sur des notes.

**L'opportunité : la transcription est devenue assez fiable pour servir de base.**
Avec les locuteurs, un modèle peut résumer, répondre et extraire les tâches. Pour
la SNCF : le faire chez elle, avec des données qui restent chez elle, à un coût
maîtrisé.

## 2. Le sujet de départ n'était pas faisable, alors j'ai changé de piste.

Les modèles temps réel de la convention n'étaient pas utilisables en Europe, pour
des raisons de sécurité et de déploiement. Le stage s'est réorienté vers la
transcription et la synthèse vocale.

**Comparer avant de choisir.** Whisper, Faster-Whisper, Voxtral ; diarisation avec
pyannote, que Voxtral a en partie rendue inutile en rendant des segments.
**Choisir la réunion.** Le cas d'usage le plus structurant.

## 3. Une réunion entre, un rapport sort, et on peut lui poser des questions.

*Visuel : la page d'une réunion redessinée (schéma `reunion`).* Import d'une vidéo
ou réunion Teams, transcription par locuteur, rapport (résumé, points clés,
actions), chat et tâches assignées. *Visuel : la chaîne (schéma `chaine`).*

## 4. Les décisions techniques

- **Normaliser le son avant tout.** Un format unique, une chaîne reproductible.
- **Découper selon les limites de chaque fournisseur.** Durée ou taille, avec marge.
- **Passer par une passerelle, pas par un fournisseur.** LiteLLM, format OpenAI,
  routé vers Azure ou Mistral.
- **Un chat qui raisonne.** Motif ReAct, transcript entier en contexte.
- *Compromis :* tâche de fond FastAPI plutôt qu'une file dédiée, pour livrer
  seul et à temps ; l'orchestration est isolée.

## 5. Un transcript ne dit pas ce qui est affiché à l'écran.

*Visuel : images → doublons → sélection → OCR → contexte du chat (schéma `images`).*
La sélection compte plus que le moteur d'OCR. Mistral OCR testé après un outil
local ; les modèles vision-langage explorés, pas industrialisés.

## 6. Passer du « ça marche en local » à un outil que l'entreprise accepte.

Deux Web Apps Azure dans un même groupe de ressources, via GitLab, Jenkins et
Artifactory, en images Docker. *Visuel : le déploiement (schéma `azure`).* Le proxy
Nginx sur `/api`, le SSO et les cookies (SameSite, CORS), les certificats internes,
l'identité managée pour le stockage.

## 7. Résultats

- Une application complète, déployée sur Azure.
- De l'import ou de la réunion Teams jusqu'au rapport, au chat et aux tâches, avec
  un enregistrement micro ou écran en picture-in-picture.
- La voix n'est pas conservée : on garde le transcript et les résumés.
- Resté en presque production : stabiliser le déploiement et brancher l'outil sur
  SNCF GPT sont les étapes suivantes.

## 8. À côté, quatre autres missions.

Un prototype mobile Flutter pour les contre-visites ; un hackathon de trois jours
sur MCP (Confluence et GitLab, en lecture seule) ; des RFI avec Illuin, Gladia,
Vespa AI, Galadrim, Hugging Face, Mistral et IBM, pour challenger leurs
technologies et nourrir un appel d'offres ; des pipelines d'automatisation
(rapports quotidiens sur l'actualité SNCF, newsletters multi-sources, rapports
d'audit des systèmes numériques).

## 9. Ce que ça m'a apporté

- **Un sujet se cadre en route.**
- **Le plus gros du travail est en amont du modèle.**
- **L'entreprise commence au déploiement.**
- **Traiter moins est aussi une qualité.**
