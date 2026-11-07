"use client";

import React, { useState } from "react";
import { Star, ShieldCheck, CheckCircle2 } from "lucide-react";
import { ReviewItem, useCreateReviewMutation, useGetProductReviewsQuery } from "./reviewsApi";

export function ProductReviews({ productId }: { productId: string }) {
  const { data, isLoading } = useGetProductReviewsQuery(productId);
  const [createReview, { isLoading: isSubmitting }] = useCreateReviewMutation();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || !userName) return;
    try {
      await createReview({ productId, rating, comment, userName }).unwrap();
      setSubmitted(true);
      setComment("");
    } catch {
      // Handled
    }
  };

  const reviews = data?.data || [];
  const averageRating = data?.averageRating || 5;

  return (
    <div className="space-y-8 rounded-2xl border bg-card p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Customer Reviews</h3>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.round(averageRating) ? "fill-amber-500" : "text-muted"}`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">
              {averageRating.toFixed(1)} out of 5
            </span>
            <span className="text-xs text-muted-foreground">({data?.total || reviews.length} reviews)</span>
          </div>
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-xs text-muted-foreground">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
            No reviews yet. Be the first to share your thoughts on this product!
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="space-y-1.5 border-b pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">{r.userName}</span>
                  {r.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-3 w-3" /> Verified Purchase
                    </span>
                  )}
                </div>
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < r.rating ? "fill-amber-500" : "text-muted"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Review Form */}
      <div className="rounded-xl bg-secondary/40 p-4 space-y-4 border">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Write a Review</h4>
        {submitted ? (
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Thank you! Your review has been submitted for moderation.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium">Your Rating:</span>
              <div className="flex gap-1 text-amber-500 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star className={`h-4 w-4 ${star <= rating ? "fill-amber-500" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                type="text"
                placeholder="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <textarea
              required
              rows={3}
              placeholder="What did you like or dislike about this product?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50"
            >
              Submit Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

