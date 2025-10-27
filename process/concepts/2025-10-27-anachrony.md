# Anachrony

## Pitch

`Anachrony` is an interactive installation where a player repairs a `mythological break` by exploring different eras to recover misplaced playing cards symbols. Through [gesture-controlled](../gestures/README.md) instruments, the player restores harmony to the world of playing cards, until discovering that the chaos was caused by the `Joker`, caught in an identity crisis.

### Keyword

`Anachrony`

### Novel combinaison

- Entry point: `Anachrony`
- Interaction: `Explore`
- Feedback: `Repair`

## Storyboard

### Initial State

_Initial state, installation in standby mode, waiting for a player._

TO BE DEFINED

### The Mythological Breakdown [Prologue]

_Triggers when the player is facing the screen._

####

#### Images

A dark room. Brief flashes of light reveal that something is hidden, waiting to be illuminated. Shards of broken cards float in the air like frozen fireflies. The cards are blank – they've lost their visual identity. Some symbols drift freely without cards – a heart, a spade, a diamond, a club.

#### Sound

A low hum, a discontinuous breath — the sound of chaos.

#### Interactions

By moving [the flashlight](../gestures/the-flashlight.md), with right hand, the player discovers they can reveal hidden fragments scattered around the room. The player shines light across the space, trying to understand what has happened. Some fragments are not quite like the others.

Once all different fragments are found, the player notices a [map within a card](../observations/2025-10-13-map-within-card.md). This card reveals how to use [the chronoscope](../gestures/the-chronoscope.md). The player learns a new gesture that allows them to travel across eras. By rotating the left hand, the scenery subtly shifts - time itself moves, following the rotation of the player's wrist.

The player can freely move from one era to another. Navigation is non-linear.

#### Exit

Find five colored fragments by illuminating them, and learn how to travel between eras.

### Ancient China [Sequence 1]

_Non-linear navigation_

#### Ideas

Chine - Bougie - Ombre chinoise - utiliser sa main pour faire ombre chinoise ?

#### Images

Un espace d'encre et de papier.
Des traits flottent, incomplets, comme suspendus dans un brouillard.

Symbole au mauvais endroit ? Quel symbole ? Pourquoi ?

#### Sound

...

#### Interactions

Le joueur fouille la pièce...
[the candle](../gestures/the-candle.md)

#### Exit

...

### Medieval Europe [Sequence 2]

_Non-linear navigation_

#### Images

Un espace de cendre et de poussière, silencieux.
Des silhouettes de rois et de reines effacées.

Les visages reviennent, mais certains éléments semblent faux : une **moustache étrangère** sur un roi.

#### Sound

TO BE DEFINED

#### Interactions

Le joueur souffle (mouvement de main avant/arrière).
Les cendres se dispersent, révélant les figures brûlées.
[the bellows](../gestures/the-bellows.md)

#### Exit

...

### Japan [Sequence 3]

_Non-linear navigation_

#### Images

A wooden table in a ryokan (traditional Japanese accommodation). The cards are laid out on the table (isometric view).

#### Sound

TO BE DEFINED

#### Interactions

Some Hanafuda cards have lost their colors, while others have symbols from other card games. The player uses [the palette](../gestures/the-palette.md) to recolor the cards and erase the intruding symbols.

By painting the cards, the player learns that [some hanafuda cards were hand-painted](../observations/2025-10-13-hanadufa-hand-painting.md) to circumvent bans on foreign games.

#### Exit

Cleared 3 foreign symbols and recolored 3 cards.

### Mamluk World [Sequence 4]

_Non-linear navigation_

#### Images

Un désert doré, saturé de soleil.
Les cartes sont devenues invisibles, brûlées par la lumière.

Un symbole (un grelot, peut-être) apparaît au mauvais endroit

#### Sounds

...

#### Interactions

Le joueur découvre un **filtre solaire** qu'il utilise pour ...
[the filter](../gestures/the-filter.md)

#### Exit

...

### The Joker Revealed [Final Sequence]

_Sequence unlocked once all others have been completed._

#### Images

A full-screen joker card appears. The card follows the player's head movements ([x,y axes](https://codepen.io/Web_Cifar/full/wvrzKxK)). Symbols belonging to other cards are visible on his face. They scroll rapidly, changing from one to another (like a slot machine).The player understands that he is the thief of the fragments.

> _I just wanted to be normal, like everyone else..._

The player must help the joker rediscover his identity by touching the symbols on his face.
Once the Joker's card is fully "restored", the screen darkens. A few flashes of light briefly reveal the Joker's card — until, in the final flash, it transforms into a card showing a pixelated representation of the player.

The Joker has stolen the player's identity.

#### Sound

TO BE DEFINED

#### Interactions

Using [the configurator](../gestures/the-configurator.md), the player can change the symbols on the Joker's face to restore his "normal", yet multiple, appearance.

Once the Joker's card is fully reconstructed, an image of the player appears in place of the Joker on the card.

The player must then [TO BE DEFINED] to reclaim their identity.
But to do so, they must break the card, freeing the Joker — and shattering the myth once again.

#### Exit

The myth is broken once more.
The player finds themselves back in the initial room, with the floating fragments — only now, the player's own card drifts among them.

### Possible additional sequences

- Church / Prohibition: Fire, ashes, whispers (Italy)
- Collectible Cards: Candy packs, baseball, Pokémon
- Future of Cards: Touchscreens, AI, cards that "watch you"

## Technical Approach

The installation combines gesture recognition, 3D environments, and spatial sound.
It can be displayed on one or three screens (front, left, right), with reactive ground lighting marking the player's position.

Developed in Three.js, the world evolves through light and atmosphere across different eras.
Gestures are tracked with MediaPipe, each linked to a symbolic action — lighting, filtering, blowing, recoloring.

A physical wall of cards acts as a visible Cardodex (Bestiary of Suits), showing the player's progress and allowing spectators to perceive the myth's reconstruction.
Sound will be spatialized (5.1) to reinforce immersion and guide the player through space and time.

## Research

My research began with the materiality of playing cards — their texture, manufacturing processes, and physical properties. This led me to study the objects and gestures of cheating, as a way to understand how material and manipulation intertwine.

From there, I explored the mirror ("shiner") as an interface — a poetic object that reveals what is usually invisible. The mirror later gave way to the story of Bianco's 19th-century scam, where cards became tools of deception and illusion.

When this narrative became too narrow, it coincided with the moment we formed groups and began merging ideas. The project quickly evolved into a collection of disparate mini-games, closer to WarioWare than to a cohesive narrative experience. This lack of depth led me to step back and rebuild the conceptual framework.

Drawing on Nicolas Nova's writings (La persistance du merveilleux, Bestiary of the Anthropocene), I reframed the project around myth as a possible common denominator — both as a way of telling stories and as a lens through which to view playing cards themselves. This shift led to the notion of a mythological breakdown, where the player explores the world through gesture-based exploration, restoring misplaced cultural and temporal fragments to their rightful eras.

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
- 📺 [The Untold Secrets of Pokémon's Monster Mythology](https://www.pbs.org/video/the-untold-secrets-of-pokemons-monster-mythology-ha2xkp/) - (2023)
- 📺 [Florence (Gameplay Only)](https://www.youtube.com/watch?v=4Dxw4dj_AY8) - (2024)
