# Architectural Decisions — Wayfarer

### 1. Honest Ranking Formula (Places Bug Fixed)
To prevent a brand-new place with a single 5-star review from outranking an established place with multiple solid reviews, I implemented a Bayesian Average (Weighted Rating) formula:
Score = (v / (v + m)) * R + (m / (v + m)) * C
- v = review count for the place
- m = minimum credibility threshold (set to 2 for this data volume)
- R = raw average rating for the place
- C = global average rating across the entire city

### 2. Concurrency Safety (Overbooking Bug Fixed)
To eliminate race conditions when multiple users book the final remaining seat at the exact same millisecond, I utilized a Prisma Interactive Transaction block with an isolation level set to `Serializable`. This locks down data manipulation records sequentially at the SQLite engine level. The capacity availability check and the booking row insertion execute as a single atomic unit, forcing concurrent burst operations to fail gracefully with a descriptive error instead of overbooking the slot.


#### If I had more time I will add this features 

   -  I make the review update logic to enable user to give other revire and display the reviees based on the    year,  date it post so only recent revire display at the top.
   -   Regarding the tour slot booking i may add the feature users to contact the tour guide so they can request plase when the slot is full.
   -   And regarding the places I may add map so user can see where it exist and add place recommandation based on there current location.
  