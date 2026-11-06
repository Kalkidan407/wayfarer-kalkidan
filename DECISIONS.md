# Architectural Decisions — Wayfarer

### 1. Honest Ranking Formula (Places Bug Fixed)
To prevent a brand-new place with a single 5-star review from outranking an established place with multiple solid reviews, I implemented a Bayesian Average (Weighted Rating) formula:
Score = (v / (v + m)) * R + (m / (v + m)) * C
- v = review count for the place
- m = minimum credibility threshold (set to 2 for this data volume)
- R = raw average rating for the place
- C = global average rating across the entire city
