/**
 * useRecommendations
 * ==================
 * React hook that fetches personalised product recommendations
 * from the AgriLink FastAPI Recommendation Service (port 8001).
 *
 * Usage examples:
 *
 *   // Hybrid (default – best results)
 *   const { recommendations, loading, error } = useRecommendations({
 *     userId: user?._id,
 *     category: 'coffee',
 *     topK: 6,
 *   });
 *
 *   // Content-based only (cold-start / no user)
 *   const { recommendations } = useRecommendations({
 *     productId: 'P001',
 *     mode: 'content',
 *   });
 *
 *   // Popular by category
 *   const { recommendations } = useRecommendations({
 *     mode: 'popular',
 *     category: 'grains',
 *   });
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const RECOMMENDER_BASE = import.meta.env.VITE_RECOMMENDER_URL || 'http://localhost:8001';

/**
 * @param {Object} options
 * @param {'hybrid'|'collaborative'|'content'|'popular'|'cold-start'} [options.mode='hybrid']
 * @param {string}   [options.userId]       - AgriLink user ID (Buyer)
 * @param {string}   [options.productId]    - Seed product for content-based
 * @param {string}   [options.category]     - Category filter
 * @param {string[]} [options.tags]         - Tag filters
 * @param {number}   [options.topK=6]       - Number of results
 * @param {number}   [options.cfWeight=0.6] - Collaborative weight (hybrid only)
 * @param {number}   [options.cbWeight=0.4] - Content weight (hybrid only)
 * @param {boolean}  [options.enabled=true] - Set false to skip fetch
 */
export function useRecommendations({
  mode = 'hybrid',
  userId = null,
  productId = null,
  category = null,
  tags = null,
  topK = 6,
  cfWeight = 0.6,
  cbWeight = 0.4,
  enabled = true,
} = {}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const abortRef = useRef(null);

  const fetchRecommendations = useCallback(async () => {
    if (!enabled) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      let url;
      let payload;
      let method = 'POST';

      switch (mode) {
        case 'collaborative':
          url = `${RECOMMENDER_BASE}/recommend/collaborative`;
          payload = { user_id: userId, top_k: topK, exclude_seen: true };
          break;

        case 'content':
          url = `${RECOMMENDER_BASE}/recommend/content`;
          payload = {
            product_id: productId,
            category,
            tags,
            top_k: topK,
          };
          break;

        case 'popular':
          url = `${RECOMMENDER_BASE}/recommend/popular/${category || 'coffee'}?top_k=${topK}`;
          method = 'GET';
          break;

        case 'cold-start':
          url = `${RECOMMENDER_BASE}/recommend/cold-start?top_k=${topK}`;
          method = 'GET';
          break;

        case 'hybrid':
        default:
          url = `${RECOMMENDER_BASE}/recommend/hybrid`;
          payload = {
            user_id: userId,
            product_id: productId,
            category,
            tags,
            top_k: topK,
            cf_weight: cfWeight,
            cb_weight: cbWeight,
          };
          break;
      }

      const start = performance.now();
      const response =
        method === 'GET'
          ? await axios.get(url, { signal: abortRef.current.signal })
          : await axios.post(url, payload, { signal: abortRef.current.signal });

      const data = response.data;
      setLatencyMs(data.latency_ms ?? Math.round(performance.now() - start));
      setRecommendations(data.recommendations ?? []);
    } catch (err) {
      if (axios.isCancel(err)) return; // ignore cancellation
      console.error('[useRecommendations] Error:', err);
      setError(err.response?.data?.detail || err.message || 'Recommendation service unavailable');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [mode, userId, productId, category, JSON.stringify(tags), topK, cfWeight, cbWeight, enabled]);

  useEffect(() => {
    fetchRecommendations();
    return () => abortRef.current?.abort();
  }, [fetchRecommendations]);

  return { recommendations, loading, error, latencyMs, refetch: fetchRecommendations };
}

export default useRecommendations;
