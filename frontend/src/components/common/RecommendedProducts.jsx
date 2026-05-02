/**
 * RecommendedProducts
 * ====================
 * Drop-in component that renders an AI-powered product recommendation
 * carousel, fetching from the FastAPI recommender service.
 *
 * <RecommendedProducts userId={user?._id} category="coffee" topK={6} />
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Star, MapPin, Zap, Loader2, AlertCircle } from 'lucide-react';
import useRecommendations from '../hooks/useRecommendations';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const Badge = ({ label, color = 'green' }) => {
  const colours = {
    green:  'bg-agriGreen text-white',
    amber:  'bg-amber-500 text-white',
    blue:   'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${colours[color] || colours.green}`}>
      {label}
    </span>
  );
};

const MethodBadge = ({ method }) => {
  const map = {
    collaborative: { label: '👥 For You',    color: 'blue'   },
    content:       { label: '🧠 Similar',    color: 'purple' },
    hybrid:        { label: '⚡ AI Pick',    color: 'amber'  },
    top_rated:     { label: '⭐ Top Rated',  color: 'green'  },
  };
  const config = map[method] || map.top_rated;
  return <Badge label={config.label} color={config.color} />;
};

const ProductCard = ({ product, index, onAddToCart }) => {
  const { t } = useTranslation();
  const hasDiscount = product.original_price > product.price_etb;
  const discount = hasDiscount
    ? Math.round((1 - product.price_etb / product.original_price) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 hover:border-agriGreen/20 transition-all duration-300 flex flex-col"
    >
      {/* Image placeholder */}
      <div className="relative h-44 bg-gradient-to-br from-agriGreen/10 to-amber-100 flex items-center justify-center overflow-hidden">
        <span className="text-6xl select-none">
          {categoryEmoji(product.category)}
        </span>
        {/* Score overlay */}
        {product.score > 0 && (
          <div className="absolute top-3 left-3">
            <MethodBadge method={product.method} />
          </div>
        )}
        {discount && (
          <div className="absolute top-3 right-3">
            <Badge label={`-${discount}%`} color="amber" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-grow gap-2">
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <MapPin className="w-3 h-3" />
          <span>{product.location}</span>
        </div>

        <h3 className="font-black text-gray-900 text-sm leading-tight group-hover:text-agriGreen transition-colors line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span className="text-xs font-bold text-gray-700">{product.rating}</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="text-lg font-black text-agriGreen">
            ETB {product.price_etb?.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">/{product.unit}</span>
        </div>

        <button
          onClick={() => onAddToCart?.(product)}
          className="mt-2 w-full bg-agriDark hover:bg-agriGreen text-white py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          {t('featuredProducts.addToCart', 'Add to Cart')}
        </button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {Object}   props
 * @param {string}   [props.userId]       - AgriLink user/buyer ID for personalised results
 * @param {string}   [props.category]     - Seed category
 * @param {string}   [props.productId]    - Seed product
 * @param {string[]} [props.tags]         - Seed tags
 * @param {'hybrid'|'collaborative'|'content'|'popular'|'cold-start'} [props.mode]
 * @param {number}   [props.topK=6]
 * @param {Function} [props.onAddToCart]  - (product) => void
 * @param {string}   [props.title]        - Section heading override
 */
const RecommendedProducts = ({
  userId = null,
  category = null,
  productId = null,
  tags = null,
  mode = 'hybrid',
  topK = 6,
  onAddToCart,
  title,
}) => {
  const { t } = useTranslation();
  const { recommendations, loading, error, latencyMs } = useRecommendations({
    mode,
    userId,
    category,
    productId,
    tags,
    topK,
    enabled: true,
  });

  const sectionTitle = title || t('ai.recommendations', 'Smart Recommendations');

  return (
    <section className="py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-agriGreen/10 rounded-2xl flex items-center justify-center text-agriGreen">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {sectionTitle}
            </h2>
            {latencyMs && (
              <p className="text-[10px] text-gray-400 font-medium">
                AI · {latencyMs} ms
              </p>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-2">
          <Badge label="⚡ AI Pick"   color="amber"  />
          <Badge label="👥 For You"   color="blue"   />
          <Badge label="🧠 Similar"   color="purple" />
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center gap-3 text-gray-500 py-10 justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-agriGreen" />
          <span className="font-medium text-sm">Loading recommendations...</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">
            Could not load recommendations. Showing top products instead.
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && recommendations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {recommendations.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}

      {!loading && recommendations.length === 0 && !error && (
        <p className="text-center text-gray-400 text-sm py-10">
          No recommendations available at the moment.
        </p>
      )}
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function categoryEmoji(cat) {
  const map = {
    coffee: '☕', khat: '🌿', grains: '🌾',
    vegetables: '🥬', fruits: '🍎', livestock: '🐄', spices: '🌶️',
  };
  return map[cat?.toLowerCase()] || '📦';
}

export default RecommendedProducts;
