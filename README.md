# Starlit Wish

A pass-and-play card game for 2–4 players. Collect the pictured ingredients, complete wishes, and be the first player to earn 10 stars.

## Run locally

Requires Node.js. No package installation is needed.

```powershell
node server.mjs
```

Open [http://localhost:3000](http://localhost:3000) in a browser. Stop the server with `Ctrl+C`.

## How to play

- Rock, Paper, Scissors chooses who starts. Players then pick one of four face-up starter cards.
- On each turn, draw a card. Item cards join your collection; action cards resolve immediately.
- Match the frosting color and berry type shown on an open wish to claim its stars. Birthday cards are wild and stay hidden until used.
- The first player to reach 10 or more stars wins.
