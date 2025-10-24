# Bestiary of Suits

## Pitch

Bestiary of Suits is an interactive installation where a player repairs a mythological breakdown by exploring different eras to recover misplaced fragments. Using temporal instruments mastered through gesture, the player restores the scattered patterns and colors of playing cards – until discovering that the chaos was caused by the Joker, caught in an identity crisis and trying to resemble the others.

### Keyword

`Anachrony`

### Novel combinaison

- Entry point: `Anachrony`
- Interaction: `Explore`
- Feedback: `Repair`

## Storyboard

### **The Mythological Breakdown [Prologue]**

**Image**
A dark room. Brief flashes of light reveal that something is hidden, waiting to be illuminated. Shards of broken cards float in the air like frozen fireflies. The cards are blank – they’ve lost their visual identity. Some symbols drift freely without cards – a heart, a spade, a diamond, a club.

**Sound**
A low hum, a discontinuous breath — the sound of chaos.

**Interaction**
By moving the [flashlight](./bestiary-of-suits.md#the-flashlight), with right hand, the player discovers they can reveal hidden fragments scattered around the room. The player shines light across the space, trying to understand what has happened. Some fragments are not quite like the others.

Once all different fragments are found, the player notices a [map within a card](../../observations/2025-10-13-map-within-card.md). This card reveals how to use the [Chronoscope](./bestiary-of-suits.md#le-chronoscope). The player learns a new gesture that allows them to travel across eras. By rotating the left hand, the scenery subtly shifts - time itself moves, following the rotation of the player’s wrist.

**Objective**
**Find five colored fragments** by illuminating them, and learn how to travel between eras.

### Chine Ancienne [Séquence 1]

**Idées**
Chine - Bougie - Ombre chinoise - utiliser sa main pour faire ombre chinoise ?

**Image**
Un espace d’encre et de papier.
Des traits flottent, incomplets, comme suspendus dans un brouillard.

Symbole au mauvais endroit ? Quel symbole ? Pourquoi ?

**Son**
...

**Interactions**
Le joueur fouille la pièce...
[Bougie](./bestiary-of-suits.md#the-candle)

**Objectif**
...

### Europe médiévale [Séquence 2]

**Idées**
...

**Image**
Un espace de cendre et de poussière, silencieux.
Des silhouettes de rois et de reines effacées.

Les visages reviennent, mais certains éléments semblent faux : une **moustache étrangère** sur un roi.

**Son**
...

**Interactions**
Le joueur souffle (mouvement de main avant/arrière).
Les cendres se dispersent, révélant les figures brûlées.
[Soufflet](./bestiary-of-suits.md#the-bellows)

**Objectif**
...

### Japon [Séquence 3]

**Idées**
...

**Image**
Une scène calme, baignée de brume et de fleurs Hanafuda délavées.

Les visages reviennent, mais certains éléments semblent faux : une **moustache étrangère** sur un roi.

Symbole au mauvais endroit ? Quel symbole ? Pourquoi ?

**Son**
...

**Interactions**
Le joueur utilise une **palette gestuelle** (mouvement de main pour repeindre).
En recolorant, il découvre un **rouge anormal**, venu d’ailleurs — preuve du vol du Joker.
[Palette](./bestiary-of-suits.md#the-palette)

**Objectif**
...

### Monde Mamelouk [Séquence 4]

**Idées**
...

**Image**
Un désert doré, saturé de soleil.
Les cartes sont devenues invisibles, brûlées par la lumière.

Un symbole (un grelot, peut-être) apparaît au mauvais endroit

**Son**
...

**Interactions**
Le joueur découvre un **filtre solaire** qu’il utilise pour ...
[Filter](./bestiary-of-suits.md#the-filter)

**Objectif**
...

### La Révélation Du Joker [Séquence 5]

**Idées**
...

**Image**
Le Joker apparaît, patchwork de toutes les cartes : moitié roi, moitié fleur, moitié pixel.
Autour de lui, les cartes vibrent.>

> “I only wanted to belong. To be like the others.”

Le joueur comprend que c’est lui, **le voleur des fragments**.

**Son**
...

**Interactions**
Le joueur redonne au jocker son apparence normale, bien que multiple, en retirant les restes de fragments symboles sur son visage.
[Configurateur](./bestiary-of-suits.md#the-configurator)

**Objectif**
Réparer le mythe — ou le laisser ouvert.
Deux faisceaux apparaissent :

- lumière blanche (rétablir l’ordre),
- lumière multicolore (accepter le désordre).

### Réparation ou chaos [Épilogue]

**Si le joueur répare :**
Le monde se stabilise. Les cartes reprennent leur place. Le Joker disparaît dans la lumière.

**Si le joueur laisse libre :**
Les cartes se mettent à bouger, à rire. Le Joker allume la lampe et la tend au joueur.
Le jeu recommence.

**Image finale :**
Le mur des cartes brille. Une carte reste vide : celle du joueur ?

### Autres séquences possibles

Église / interdiction : Feu, cendres, murmures (italie)
Cartes à collectionner : Paquets de bonbons, baseball, Pokémon
Futur des cartes : Écran tactile, IA, cartes qui “te regardent”

## Gestures

### The Move

Body position in space. Move forward, backward, left, or right.
The player can walk within a defined area.

_Not prototyped yet._

![The Move](./images/0-le-deplacement.gif)

### The Chronoscope

Left arm extended, fingers pointing forward.
Rotating the elbow and shoulder adjusts the position of the time cursor.

_Not prototyped yet._

![The Chronoscope](./images/1-le-chronoscope.gif)

### The Flashlight

Right arm extended, fingers pointing forward.
The distance between the fingers controls the width of the light beam.

_Prototyped in [Chronoscope Lamp](../../../code/2025-10-24/chronoscope-lamp/) project._

![The Flashlight](./images/2-la-lampe-torche.gif)

### The Candle

Right arm extended, thumb raised.
The candle can be moved freely in three-dimensional space.
Quick movements dim the flame.

_Not prototyped yet._

![The Candle](./images/3-la-bougie.gif)

### The Bellows

Body slightly leaning forward, lips tightened.
The player blows air in a chosen direction.

_Prototyped in [Look And Blow](../../../code/2025-10-23/look-and-blow/) project._

![The Bellows](./images/4-le-soufflet.gif)

### The Palette

Index finger and thumb pinched together – the player moves an invisible “brush” in three-dimensional space.
They can change color by touching the fingers of the left hand with the pinched gesture.

_Prototyped in [Icon Painter](../../../code/2025-10-22/icon-painter/) project._

![The Palette](./images/5-la-palette.gif)

### The Filter

Both index fingers meet, then separate, revealing a translucent filter between the hands.
The player can move this filter through space.

_Prototyped in [Camera Reframe](../../../code/2025-10-21/camera-reframe/) project._

![The Filter](./images/6-le-filtre.gif)

### The Configurator

Using the right hand, the player selects parts of their face (eyes, mouth, nose) to modify them.
Each feature acts like a button.

_Prototyped in [Body Interface](../../../code/2025-10-23/body-interface/) project._

![The Configurator](./images/7-le-configurateur.gif)

## Technical Approach

The installation combines gesture recognition, 3D environments, and spatial sound.
It can be displayed on one or three screens (front, left, right), with reactive ground lighting marking the player’s position.

Developed in Three.js, the world evolves through light and atmosphere across different eras.
Gestures are tracked with MediaPipe, each linked to a symbolic action — lighting, filtering, blowing, recoloring.

A physical wall of cards acts as a visible Cardodex (Bestiary of Suits), showing the player’s progress and allowing spectators to perceive the myth’s reconstruction.
Sound will be spatialized (5.1) to reinforce immersion and guide the player through space and time.

## Research

My research began with the materiality of playing cards — their texture, manufacturing processes, and physical properties. This led me to study the objects and gestures of cheating, as a way to understand how material and manipulation intertwine.

From there, I explored the mirror (“shiner”) as an interface — a poetic object that reveals what is usually invisible. The mirror later gave way to the story of Bianco’s 19th-century scam, where cards became tools of deception and illusion.

When this narrative became too narrow, it coincided with the moment we formed groups and began merging ideas. The project quickly evolved into a collection of disparate mini-games, closer to WarioWare than to a cohesive narrative experience. This lack of depth led me to step back and rebuild the conceptual framework.

Drawing on Nicolas Nova’s writings (La persistance du merveilleux, Bestiary of the Anthropocene), I reframed the project around myth as a possible common denominator — both as a way of telling stories and as a lens through which to view playing cards themselves. This shift led to the notion of a mythological breakdown, where the player explores the world through gesture-based exploration, restoring misplaced cultural and temporal fragments to their rightful eras.

### Insights

5 insights that inspired the current form of the concept.

1. From Mini-Games to Myth
   Moving away from WarioWare-style entertainment opened space for a slower, poetic, and symbolic experience.
   The project shifted from playing stories to unfolding myths.

2. Collection as Narrative Engine
   Inspired by Pokémon and the Pokédex, the project embraces collection as a way to tell stories through discovery, classification, and repair.
   This mechanic has been a central interest since the beginning of the workshops.

3. The Card as Cultural Mirror
   Each card reflects a society and a moment in time — a fragment of human culture that can be misplaced, reinvented, or rediscovered.
   This led to the idea of treating the history of cards as a mythological breakdown.

4. Exploration during the creative coding workshop
   The creative coding workshop was a turning point to test gestures as storytelling tools, transforming interaction into a poetic language.

5. Inventory as Storytelling
   The diversity of anecdotes, symbols, and aesthetics across eras inspired the idea of creating an inventory-based narrative: a form of storytelling through fragments, where each discovery contributes to repairing the myth.

### References

- 📘 [Persistance du merveilleux](https://www.premierparallele.fr/livre/persistance-du-merveilleux) – (2020)
- 📘 [Bestiaire de l'Anthropocène](https://artfiction.ch/produit/bestiaire-de-lanthropocene/) - (2021)
- 📰 [Trading Playing Cards and the Birth of Collecting](https://www.nationalgeographic.com/history/article/trading-playing-cards) - (2023)
- 📰 [Are the Face Cards (Kings, Queens, Jacks) Real People?](https://history.howstuffworks.com/history-vs-myth/kings-queens-and-jacks-playing-cards-real-people.htm) - (2024)
- 📺 [The Untold Secrets of Pokémon’s Monster Mythology](https://www.pbs.org/video/the-untold-secrets-of-pokemons-monster-mythology-ha2xkp/) - (2023)
- 📺 [Florence (Gameplay Only)](https://www.youtube.com/watch?v=4Dxw4dj_AY8) - (2024)
