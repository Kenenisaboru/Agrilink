import axios from 'axios';

const API_BASE = '/api/payments';

class PaymentService {
  // Initialize payment with selected method
  async initializePayment(paymentData) {
    try {
      const response = await axios.post(`${API_BASE}/initialize`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  // Process Telebirr payment
  async processTelebirrPayment(phoneNumber, amount, orderId) {
    try {
      const response = await axios.post(`${API_BASE}/telebirr`, {
        phoneNumber,
        amount,
        orderId
      });
      return response.data;
    } catch (error) {
      console.error('Telebirr payment error:', error);
      throw error;
    }
  }

  // Process M-Pesa payment
  async processMpesaPayment(phoneNumber, amount, orderId) {
    try {
      const response = await axios.post(`${API_BASE}/mpesa`, {
        phoneNumber,
        amount,
        orderId
      });
      return response.data;
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      throw error;
    }
  }

  // Process CBE payment
  async processCBEPayment(accountNumber, amount, orderId) {
    try {
      const response = await axios.post(`${API_BASE}/cbe`, {
        accountNumber,
        amount,
        orderId
      });
      return response.data;
    } catch (error) {
      console.error('CBE payment error:', error);
      throw error;
    }
  }

  // Process card payment
  async processCardPayment(cardData, amount, orderId) {
    try {
      const response = await axios.post(`${API_BASE}/card`, {
        ...cardData,
        amount,
        orderId
      });
      return response.data;
    } catch (error) {
      console.error('Card payment error:', error);
      throw error;
    }
  }

  // Verify payment status
  async verifyPayment(transactionId) {
    try {
      const response = await axios.get(`${API_BASE}/verify/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  // Get payment methods
  async getPaymentMethods() {
    try {
      const response = await axios.get(`${API_BASE}/methods`);
      return response.data;
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw error;
    }
  }

  // Calculate shipping cost
  async calculateShippingCost(location, weight) {
    try {
      const response = await axios.post(`${API_BASE}/shipping`, {
        location,
        weight
      });
      return response.data;
    } catch (error) {
      console.error('Shipping calculation error:', error);
      throw error;
    }
  }

  // Apply promo code
  async applyPromoCode(code, orderTotal) {
    try {
      const response = await axios.post(`${API_BASE}/promo`, {
        code,
        orderTotal
      });
      return response.data;
    } catch (error) {
      console.error('Promo code error:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(userId) {
    try {
      const response = await axios.get(`${API_BASE}/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Transaction history error:', error);
      throw error;
    }
  }

  // Request refund
  async requestRefund(orderId, reason) {
    try {
      const response = await axios.post(`${API_BASE}/refund`, {
        orderId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Refund request error:', error);
      throw error;
    }
  }
}

export default new PaymentService();
