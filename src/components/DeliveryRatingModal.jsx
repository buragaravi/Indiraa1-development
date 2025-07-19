import React, { useState } from 'react';
import { FiStar, FiX } from 'react-icons/fi';

const DeliveryRatingModal = ({ orderId, onReviewSubmitted }) => {
  const [show, setShow] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5.');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://indiraa1-backend.onrender.com/api/products/orders/${orderId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, review })
      });
      const data = await response.json();
      if (response.ok) {
        setShow(false);
        if (onReviewSubmitted) onReviewSubmitted(rating, review);
      } else {
        setError(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      setError('Error submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full relative">
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          onClick={() => setShow(false)}
        >
          <FiX className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-yellow-700 mb-4 flex items-center">
          <FiStar className="w-6 h-6 text-yellow-500 mr-2" /> Rate Your Delivery
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Rating</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(num => (
                <button
                  key={num}
                  type="button"
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${rating >= num ? 'bg-yellow-400 border-yellow-500 text-white' : 'bg-gray-100 border-gray-300 text-yellow-500'}`}
                  onClick={() => setRating(num)}
                  disabled={submitting}
                >
                  <FiStar className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Review (optional)</label>
            <textarea
              className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              rows={3}
              value={review}
              onChange={e => setReview(e.target.value)}
              disabled={submitting}
              placeholder="Share your delivery experience..."
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliveryRatingModal;
