import React, { useState, useEffect } from 'react';
import { 
  Star, 
  StarHalf, 
  ThumbsUp, 
  MessageSquare, 
  User, 
  Calendar, 
  Filter, 
  Search,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Flag,
  Reply,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewSystem = ({ productId, farmerId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [userReview, setUserReview] = useState({
    rating: 0,
    title: '',
    comment: '',
    wouldRecommend: true
  });

  // Sample review data
  const sampleReviews = [
    {
      id: 1,
      user: { name: 'Fatuma Ahmed', avatar: null },
      rating: 5,
      title: 'Excellent quality coffee!',
      comment: 'The coffee beans are of exceptional quality. Very fresh and aromatic. Will definitely order again.',
      date: '2026-04-20',
      helpful: 24,
      verified: true,
      images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100'],
      replies: [
        {
          farmer: 'Abebe Kebede',
          message: 'Thank you for your wonderful review! We take great pride in our coffee.',
          date: '2026-04-21'
        }
      ]
    },
    {
      id: 2,
      user: { name: 'Chaltu Tadesse', avatar: null },
      rating: 4,
      title: 'Good teff, fast delivery',
      comment: 'The organic teff is excellent quality. Delivery was faster than expected. Packaging was secure.',
      date: '2026-04-18',
      helpful: 18,
      verified: true,
      images: [],
      replies: []
    },
    {
      id: 3,
      user: { name: 'Mohammed Ali', avatar: null },
      rating: 5,
      title: 'Best khat in the market',
      comment: 'Premium quality khat, very fresh. The farmer is reliable and the product is always consistent.',
      date: '2026-04-15',
      helpful: 32,
      verified: true,
      images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'],
      replies: []
    },
    {
      id: 4,
      user: { name: 'Zeyneb Ahmed', avatar: null },
      rating: 3,
      title: 'Decent product',
      comment: 'The product is good but delivery took longer than expected. Quality is acceptable for the price.',
      date: '2026-04-10',
      helpful: 8,
      verified: true,
      images: [],
      replies: []
    }
  ];

  useEffect(() => {
    setReviews(sampleReviews);
    setLoading(false);
  }, []);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 
      : 0
  }));

  const filteredReviews = reviews.filter(review => {
    if (filterRating === 'all') return true;
    return review.rating === parseInt(filterRating);
  }).sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    return 0;
  });

  const handleStarClick = (rating) => {
    setUserReview({ ...userReview, rating });
  };

  const handleSubmitReview = () => {
    if (userReview.rating === 0 || !userReview.title || !userReview.comment) {
      alert('Please fill in all required fields');
      return;
    }

    const newReview = {
      id: reviews.length + 1,
      user: { name: 'You', avatar: null },
      rating: userReview.rating,
      title: userReview.title,
      comment: userReview.comment,
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
      verified: true,
      images: [],
      replies: []
    };

    setReviews([newReview, ...reviews]);
    setShowWriteReview(false);
    setUserReview({ rating: 0, title: '', comment: '', wouldRecommend: true });
  };

  const StarDisplay = ({ rating, size = 'w-5 h-5' }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={`${size} fill-yellow-400 text-yellow-400`} />
        ))}
        {hasHalfStar && <StarHalf className={`${size} fill-yellow-400 text-yellow-400`} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={`${size} text-gray-300`} />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-agriGreen" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="text-center">
            <p className="text-6xl font-black text-gray-900 mb-2">{averageRating}</p>
            <StarDisplay rating={parseFloat(averageRating)} size="w-8 h-8" />
            <p className="text-gray-500 mt-2">{reviews.length} reviews</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="space-y-3">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="font-bold text-gray-900">{star}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      <button
        onClick={() => setShowWriteReview(!showWriteReview)}
        className="w-full btn-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
      >
        <MessageSquare className="w-5 h-5" />
        Write a Review
      </button>

      {/* Write Review Form */}
      <AnimatePresence>
        {showWriteReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
          >
            <h3 className="text-xl font-black text-gray-900 mb-6">Write Your Review</h3>
            
            {/* Rating Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= userReview.rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">Review Title</label>
              <input
                type="text"
                value={userReview.title}
                onChange={(e) => setUserReview({ ...userReview, title: e.target.value })}
                placeholder="Summarize your experience"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium"
              />
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">Your Review</label>
              <textarea
                value={userReview.comment}
                onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                placeholder="Tell others about your experience with this product"
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-4 outline-none focus:ring-4 focus:ring-agriGreen/10 font-medium resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <button
                onClick={handleSubmitReview}
                className="flex-1 btn-primary py-4 rounded-2xl font-bold"
              >
                Submit Review
              </button>
              <button
                onClick={() => setShowWriteReview(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-4 focus:ring-agriGreen/10 font-bold cursor-pointer"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-4 focus:ring-agriGreen/10 font-bold cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-500">Be the first to review this product</p>
          </div>
        ) : (
          filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="w-12 h-12 bg-agriGreen/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-6 h-6 text-agriGreen" />
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-gray-900">{review.user.name}</h4>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <StarDisplay rating={review.rating} size="w-4 h-4" />
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  <h5 className="font-bold text-gray-900 mb-2">{review.title}</h5>
                  <p className="text-gray-600 mb-4">{review.comment}</p>

                  {/* Review Images */}
                  {review.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.images.map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt="Review image"
                          className="w-20 h-20 rounded-xl object-cover border border-gray-100"
                        />
                      ))}
                    </div>
                  )}

                  {/* Replies */}
                  {review.replies.length > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                      {review.replies.map((reply, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-900">{reply.farmer}</p>
                            <p className="text-sm text-gray-600">{reply.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{reply.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful})
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                      <Reply className="w-4 h-4" />
                      Reply
                    </button>
                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
                      <Flag className="w-4 h-4" />
                      Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
