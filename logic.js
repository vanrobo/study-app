function updateCard(card, confidence) {
  card.easeFactor =
    card.easeFactor +
    (0.1 - (5 - confidence) * (0.08 + (5 - confidence) * 0.02));
  if (card.easeFactor < 1.3) card.easeFactor = 1.3;
  if (confidence < 3) {
    card.interval = 1;
  } else {
    if (card.interval === 1) card.interval = 6;
    else card.interval = Math.round(card.interval * card.easeFactor);
  }

  let nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + card.interval);
  card.nextReview = nextDate.toISOString().split("T")[0];

  card.confidenceHistory.push(confidence);
  return card;
}
e;
