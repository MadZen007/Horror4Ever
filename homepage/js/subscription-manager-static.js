// Static-only subscription manager for live site
// Uses localStorage and directs to existing Ko-fi for payments

class StaticSubscriptionManager {
  constructor() {
    this.storageKey = 'horror4ever_subscription';
    this.init();
  }

  init() {
    this.checkSubscriptionStatus();
    this.setupAdDisplay();
  }

  // Check if user is subscribed (using localStorage)
  checkSubscriptionStatus() {
    const subscription = this.getSubscriptionFromStorage();
    return subscription && subscription.status === 'active';
  }

  // Get subscription from localStorage
  getSubscriptionFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading subscription from storage:', error);
      return null;
    }
  }

  // Save subscription to localStorage
  saveSubscriptionToStorage(subscription) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(subscription));
    } catch (error) {
      console.error('Error saving subscription to storage:', error);
    }
  }

  // Create a subscription (simulated - after Ko-fi donation)
  createSubscription() {
    const subscription = {
      id: 'sub_' + Date.now(),
      status: 'active',
      plan: 'basic',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };
    
    this.saveSubscriptionToStorage(subscription);
    this.updateUI();
    this.setupAdDisplay();
    
    return subscription;
  }

  // Cancel subscription
  cancelSubscription() {
    const subscription = this.getSubscriptionFromStorage();
    if (subscription) {
      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date().toISOString();
      this.saveSubscriptionToStorage(subscription);
      this.updateUI();
      this.setupAdDisplay();
    }
  }

  // Reactivate subscription
  reactivateSubscription() {
    const subscription = this.getSubscriptionFromStorage();
    if (subscription && subscription.status === 'cancelled') {
      subscription.status = 'active';
      subscription.reactivatedAt = new Date().toISOString();
      subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      this.saveSubscriptionToStorage(subscription);
      this.updateUI();
      this.setupAdDisplay();
    }
  }

  // Update UI based on subscription status
  updateUI() {
    const isSubscribed = this.checkSubscriptionStatus();
    const subscription = this.getSubscriptionFromStorage();
    
    // Update subscription page if it exists
    const subscriptionContainer = document.getElementById('subscriptionContainer');
    if (subscriptionContainer) {
      if (isSubscribed) {
        subscriptionContainer.innerHTML = `
          <div class="subscription-active">
            <h2>🎃 Active Subscription 🎃</h2>
            <p>Thank you for supporting Horror4Ever!</p>
            <div class="subscription-details">
              <p><strong>Status:</strong> Active</p>
              <p><strong>Plan:</strong> Horror4Ever Basic</p>
              <p><strong>Expires:</strong> ${new Date(subscription.expiresAt).toLocaleDateString()}</p>
            </div>
            <button onclick="subscriptionManager.cancelSubscription()" class="cancel-button">
              Cancel Subscription
            </button>
          </div>
        `;
      } else if (subscription && subscription.status === 'cancelled') {
        subscriptionContainer.innerHTML = `
          <div class="subscription-cancelled">
            <h2>Subscription Cancelled</h2>
            <p>Your subscription has been cancelled. You'll still have access until ${new Date(subscription.expiresAt).toLocaleDateString()}.</p>
            <button onclick="subscriptionManager.reactivateSubscription()" class="reactivate-button">
              Reactivate Subscription
            </button>
          </div>
        `;
      } else {
        subscriptionContainer.innerHTML = `
          <div class="subscription-prompt">
            <h2>🎃 Support Horror4Ever 🎃</h2>
            <p>Unlock the full Horror4Ever experience by supporting us on Ko-fi!</p>
            <ul class="features-list">
              <li>No ads - Enjoy a clean, ad-free experience</li>
              <li>Early access to new games and features</li>
              <li>Submit suggestions for new content</li>
              <li>Personalized profiles and preferences</li>
              <li>Support the Horror4Ever community</li>
              <li>Help keep a real person fed! 🍕 (This site is built and run by just one horror-loving human)</li>
            </ul>
            <div style="margin: 2rem 0;">
              <a href="https://ko-fi.com/ihearthorror" target="_blank" rel="noopener noreferrer" 
                 style="display: inline-block; background: #FF7518; color: #000; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1.1rem;">
                🍕 Support on Ko-fi - $2/month
              </a>
            </div>
            <p style="font-size: 0.9rem; color: #B0B0B0; margin-top: 1rem;">
              After supporting on Ko-fi, click the button below to activate your subscription:
            </p>
            <button onclick="subscriptionManager.createSubscription()" class="subscribe-button" style="margin-top: 1rem;">
              Activate Subscription (After Ko-fi Support)
            </button>
          </div>
        `;
      }
    }
  }

  // Setup ad display based on subscription status
  setupAdDisplay() {
    const isSubscribed = this.checkSubscriptionStatus();
    
    // Remove existing ads
    this.removeAds();
    
    // Add ads only for non-subscribers
    if (!isSubscribed) {
      this.addAds();
    }
  }

  // Remove all ads
  removeAds() {
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => {
      container.innerHTML = '';
    });
  }

  // Add ads to containers
  addAds() {
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => {
      this.createAdSenseAd(container.id);
    });
  }

  // Create AdSense ad (placeholder for now)
  createAdSenseAd(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const adDiv = document.createElement('div');
    adDiv.className = 'adsense-ad';
    
    // Placeholder ad content (replace with actual AdSense code when approved)
    adDiv.innerHTML = `
      <div style="text-align: center; padding: 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 117, 24, 0.3); border-radius: 8px; min-height: 90px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <p style="color: #B0B0B0; margin: 0 0 0.5rem 0;">Advertisement</p>
        <p style="font-size: 0.8rem; margin: 0 0 0.5rem 0; color: #888;">
          <a href="https://ko-fi.com/ihearthorror" target="_blank" rel="noopener noreferrer" style="color: #FF7518; text-decoration: none;">
            Remove ads by supporting on Ko-fi
          </a>
        </p>
        <p style="font-size: 0.7rem; margin: 0; color: #666; font-style: italic;">
          Help keep a horror-loving human fed! 🍕
        </p>
      </div>
    `;

    container.appendChild(adDiv);
  }

  // Show subscription prompt for non-subscribers
  showSubscriptionPrompt() {
    if (this.checkSubscriptionStatus()) return;

    // Remove existing prompt
    const existingPrompt = document.querySelector('.subscription-prompt-overlay');
    if (existingPrompt) {
      existingPrompt.remove();
    }

    // Create prompt overlay
    const prompt = document.createElement('div');
    prompt.className = 'subscription-prompt-overlay';
    prompt.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #FF7518;
      border-radius: 12px;
      padding: 2rem;
      z-index: 10000;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 0 20px rgba(255, 117, 24, 0.3);
    `;

    prompt.innerHTML = `
      <h3 style="color: #FF7518; margin-bottom: 1rem;">🎃 Remove Ads! 🎃</h3>
      <p style="color: #E0E0E0; margin-bottom: 1rem;">
        Support us on Ko-fi for just $2/month and enjoy an ad-free experience!
      </p>
      <p style="color: #B0B0B0; font-size: 0.9rem; margin-bottom: 1.5rem; font-style: italic;">
        Plus, you'll help keep this horror-loving human fed! 🍕 (This site is built and run by just one person)
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="https://ko-fi.com/ihearthorror" target="_blank" rel="noopener noreferrer"
           style="background: #FF7518; color: #000; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: bold; cursor: pointer; text-decoration: none; display: inline-block;">
          🍕 Support on Ko-fi
        </a>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: transparent; color: #B0B0B0; border: 1px solid #B0B0B0; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer;">
          Maybe Later
        </button>
      </div>
    `;

    document.body.appendChild(prompt);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (prompt.parentElement) {
        prompt.remove();
      }
    }, 10000);
  }
}

// Initialize the static subscription manager
const subscriptionManager = new StaticSubscriptionManager();

// Show subscription prompt after 5 seconds for non-subscribers
setTimeout(() => {
  subscriptionManager.showSubscriptionPrompt();
}, 5000); 