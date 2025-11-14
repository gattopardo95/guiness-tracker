My mate Dylan and I often make a series of small bets with each other, on which ride pints of guiness. We can have multiple going at one time.

This originated from a bet where I said that Liz Truss wouldn't be PM by Christmas. I won 3 guinesses, compared to a half for Dylan if she had still been PM.

In terms of a data structure, I suppose that each bet has

- A verifiable condition (I.e. it will resolve to true or false)
- A due date for the bet to resolve by
- Dylan takes one side, and I take the other
- Odds in the sense of guinesses on each side (e.g. 3 pints of Guiness to 1 pint of Guiness)

Once a bet is resolved, we'd then like to track

- The resolution date
- Who won the bet
- Whether the pints have been paid out yet

---

I would like to start tracking these bets in a shared website with Dylan and I. 

Super simple functionality — First lets have a page to view current bets, then add the ability to "resolve" a bet.

Then we'd add the ability to add in a new bet

Then we'd add the ability to view past bets

Dylan and I would both have access and we might share the link around with friends. We might wish to add very very simple auth (literally a password, or passcode)

---

In terms of stack, I'd like to use as similar a stack as possible as for the ratings-app we built, as I'm familiar with it.

I would also be keen to explore ShadCN for building the UI, and seeing how that changes things up.

We can get into design details down the line, but the colour scheme should obviously be guiness themed ha. Prominent use of a very deep, almost black brown, with white accents.

We should also incorporate the colours of the toucan somewhere into the design — perhaps as highlights
