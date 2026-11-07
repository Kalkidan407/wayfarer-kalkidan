'use client';

import { useEffect, useMemo, useState } from 'react';

type User = { id: number; name: string };

type Place = {
  id: number;
  name: string;
  category: string;
  description: string;
  openingHours: string;
  reviewCount: number;
  weightedScore: number;
  rawAverageRating: number;
};

type Review = {
  id: number;
  rating: number;
  body: string;
  createdAt: string;
  user: { id: number; name: string };
};

type SlotDto = {
  id: number;
  placeId: number;
  startsAt: string;
  capacity: number;
  bookings: Array<{ id: number; userId: number; seats: number }>;
};

type SelectedPlaceDetails = Place & {
  tourSlots: SlotDto[];
  reviews: Review[];
};

const categoryOptions = ['all', 'History', 'Food', 'Nature'] as const;

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<(typeof categoryOptions)[number]>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlaceDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  const activeUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? users[0] ?? null,
    [selectedUserId, users],
  );

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('http://localhost:3000/users');
        if (!res.ok) throw new Error('Unable to load users');
        const data = (await res.json()) as User[];
        setUsers(data);
        if (data.length > 0) setSelectedUserId((current) => current ?? data[0].id);
      } catch (err) {
        console.error(err);
        setError('Could not connect to the local backend. Start the Nest app on port 3000.');
      }
    }

    loadUsers();
  }, []);

  useEffect(() => {
    async function loadPlaces() {
      if (!users.length) return;

      setLoading(true);

      try {
        const url = new URL('http://localhost:3000/places');
        if (selectedCategory !== 'all') {
          url.searchParams.set('category', selectedCategory);
        }

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Unable to load places');

        const data = (await res.json()) as Place[];
        setPlaces(data);

        if (!data.some((place) => place.id === selectedPlaceId)) {
          setSelectedPlaceId(data[0]?.id ?? null);
        }
      } catch (err) {
        console.error(err);
        setError('Unable to load place data from the backend.');
      } finally {
        setLoading(false);
      }
    }

    loadPlaces();
  }, [selectedCategory, users]);

  useEffect(() => {
    async function loadSelectedPlace() {
      if (!selectedPlaceId) {
        setSelectedPlace(null);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/places/${selectedPlaceId}`);
        if (!res.ok) throw new Error('Unable to load selected place');
        const data = (await res.json()) as SelectedPlaceDetails;
        setSelectedPlace(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load the selected place details.');
      }
    }

    loadSelectedPlace();
  }, [selectedPlaceId]);

  useEffect(() => {
    async function loadReviews() {
      if (!selectedPlaceId) {
        setReviews([]);
        return;
      }

      try {
        const res = await fetch(`http://localhost:3000/reviews?placeId=${selectedPlaceId}`);
        if (!res.ok) throw new Error('Unable to load reviews');
        const data = (await res.json()) as Review[];
        setReviews(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadReviews();
  }, [selectedPlaceId]);

  useEffect(() => {
    if (!activeUser || !selectedPlaceId) {
      setNewRating(0);
      setNewReview('');
      return;
    }

    const userReview = reviews.find((review) => review.user.id === activeUser.id);

    if (userReview) {
      setNewRating(userReview.rating);
      setNewReview(userReview.body);
    } else {
      setNewRating(0);
      setNewReview('');
    }
  }, [activeUser, selectedPlaceId, reviews]);

  const selectedPlaceSummary = useMemo(
    () => places.find((place) => place.id === selectedPlaceId) ?? places[0] ?? null,
    [places, selectedPlaceId],
  );

  const currentUserReview = useMemo(
    () => reviews.find((review) => review.user.id === activeUser?.id) ?? null,
    [activeUser, reviews],
  );

  const renderStars = (value: number) =>
    Array.from({ length: 5 }, (_, index) => (index < value ? '★' : '☆')).join('');

  async function submitReview() {
    if (!selectedPlaceSummary || !activeUser || !newRating || !newReview.trim()) return;

    try {
      const response = await fetch('http://localhost:3000/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(activeUser.id),
        },
        body: JSON.stringify({
          placeId: selectedPlaceSummary.id,
          rating: newRating,
          body: newReview.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Review could not be saved');
      }

      setError(null);
      setBookingMessage(null);

      const reviewRes = await fetch(`http://localhost:3000/reviews?placeId=${selectedPlaceSummary.id}`);
      const reviewData = (await reviewRes.json()) as Review[];
      setReviews(reviewData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to submit the review right now.');
    }
  }

  async function handleBooking(slotId: number) {
    if (!activeUser) return;

    try {
      const response = await fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(activeUser.id),
        },
        body: JSON.stringify({
          slotId,
          seats: 1,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Booking failed');
      }

      setBookingMessage(`${data.message || 'Booking confirmed'} for ${activeUser.name}.`);
      setError(null);

      const updatedPlace = await fetch(`http://localhost:3000/places/${selectedPlaceId}`);
      const updatedPlaceData = (await updatedPlace.json()) as SelectedPlaceDetails;
      setSelectedPlace(updatedPlaceData);
    } catch (err) {
      console.error(err);
      setBookingMessage(null);
      setError(err instanceof Error ? err.message : 'Booking could not be completed.');
    }
  }

  const slots = useMemo(() => {
    if (!selectedPlace?.tourSlots) return [];

    return selectedPlace.tourSlots.map((slot) => {
      const bookedSeats = slot.bookings.reduce((sum, booking) => sum + booking.seats, 0);
      const seatsRemaining = slot.capacity - bookedSeats;
      const timeLabel = new Date(slot.startsAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      return {
        id: slot.id,
        time: timeLabel,
        seats: seatsRemaining > 0 ? `${seatsRemaining} of ${slot.capacity} seats left` : 'Fully booked',
        isFull: seatsRemaining <= 0,
        remainingSeats: seatsRemaining,
      };
    });
  }, [selectedPlace]);

  return (
    <main className="wayfarer-page">
      <div className="wayfarer-card">
        <header className="wayfarer-header">
          <div className="brand-row">
            <div className="brand">Wayfarer</div>

            <div className="user-switcher">
              <span>Acting as</span>
              <select
                value={activeUser?.id ?? ''}
                onChange={(event) => setSelectedUserId(Number(event.target.value))}
                aria-label="Select active user"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <nav className="header-filters" aria-label="Main filters">
            {categoryOptions.map((category) => {
              const label = category === 'all' ? 'All' : category;
              const isActive = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  className={`chip ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </header>

        <section className="content-shell">
          <aside className="list-panel">
            <div className="sort-row">
              <span>Sort:</span>
              <select aria-label="Sort places" defaultValue="top-rated">
                <option value="top-rated">Top rated</option>
              </select>
            </div>

            {loading ? (
              <div className="empty-state">Loading places…</div>
            ) : places.length === 0 ? (
              <div className="empty-state">No places found for this category.</div>
            ) : (
              <div className="place-list">
                {places.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    className={`place-item ${selectedPlaceSummary?.id === place.id ? 'selected' : ''}`}
                    onClick={() => setSelectedPlaceId(place.id)}
                  >
                    <div className="place-name">{place.name}</div>
                    <div className="place-meta">
                      {place.weightedScore.toFixed(1)} ★ · {place.reviewCount} reviews
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <div className="details-panel">
            {error ? <div className="empty-state error-state">{error}</div> : null}
            {bookingMessage ? <div className="empty-state success-state">{bookingMessage}</div> : null}

            {selectedPlaceSummary ? (
              <>
                <div className="detail-header">
                  <div>
                    <h2>{selectedPlaceSummary.name}</h2>
                    <div className="detail-subtitle">
                      {selectedPlaceSummary.category} · {selectedPlaceSummary.description}
                    </div>
                  </div>
                  <div className="rating-pill">
                    {renderStars(Math.round(selectedPlaceSummary.weightedScore))} {selectedPlaceSummary.weightedScore.toFixed(1)}
                  </div>
                </div>

                <div className="slot-grid">
                  {slots.length > 0 ? (
                    slots.map((slot) => (
                      <div key={slot.id} className="slot-card">
                        <div className="slot-info">
                          <div className="slot-time">{slot.time}</div>
                          <div className="slot-seats">{slot.seats}</div>
                        </div>
                        <button
                          type="button"
                          className={`slot-button ${slot.isFull ? 'full' : 'available'}`}
                          onClick={() => !slot.isFull && handleBooking(slot.id)}
                          disabled={slot.isFull}
                        >
                          {slot.isFull ? 'Full' : 'Book'}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">No tour slots available for this place.</div>
                  )}
                </div>

                <div className="reviews-box">
                  <div className="review-list">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="review-item">
                          <div className="review-topline">
                            <span>{review.user.name}</span>
                            <span className="review-stars">{renderStars(review.rating)}</span>
                          </div>
                          <div>{review.body}</div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state review-empty">No reviews yet for this place.</div>
                    )}
                  </div>

                  <div className="review-form">
                    <div className="rating-label-row">
                      <span>{currentUserReview ? 'Edit your review:' : 'Your rating:'}</span>
                      <div className="star-row" aria-label="Star rating picker">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            className={`star ${value <= newRating ? 'filled' : ''}`}
                            onClick={() => setNewRating(value)}
                            aria-label={`Set rating ${value}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={newReview}
                      onChange={(event) => setNewReview(event.target.value)}
                      placeholder={currentUserReview ? 'Update your review...' : 'Write a short review...'}
                    />

                    <div className="submit-row">
                      <button type="button" className="submit-button" onClick={submitReview}>
                        {currentUserReview ? 'Update review' : 'Submit'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">Select a place to see details.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

