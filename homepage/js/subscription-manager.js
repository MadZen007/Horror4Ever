// Subscription Manager
// Handles subscription status checks and ad display control

class SubscriptionManager {
  constructor() {
    this.isSubscribed = false;
    this.subscriptionData = null;
    this.adsEnabled = true;
    this.init();
  }

  async init() {
    await this.checkSubscriptionStatus();
    this.setupAdDisplay();
  }

  // Check if user is subscribed
  async checkSubscriptionStatus() {
    try {
      const token = localStorage.getItem('horror4ever_member_token');
      if (!token) {
        this.isSubscribed = false;
        this.adsEnabled = true;
        return;
      }

      const response = await fetch('/api/subscription/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.isSubscribed = data.isSubscribed;
        this.subscriptionData = data.subscription;
        this.adsEnabled = !this.isSubscribed;
      } else {
        this.isSubscribed = false;
        this.adsEnabled = true;
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      this.isSubscribed = false;
      this.adsEnabled = true;
    }
  }

  // Setup ad display based on subscription status
  setupAdDisplay() {
    if (this.adsEnabled) {
      this.enableAds();
    } else {
      this.disableAds();
    }
  }

  // Enable ads for non-subscribers
  enableAds() {
    // Remove any existing ad blockers
    const existingAds = document.querySelectorAll('.adsense-ad');
    existingAds.forEach(ad => ad.remove());

    // Add Google AdSense ads
    this.addAdSenseAds();
  }

  // Disable ads for subscribers
  disableAds() {
    // Remove all ads
    const ads = document.querySelectorAll('.adsense-ad');
    ads.forEach(ad => ad.remove());
  }

  // Add Google AdSense ads
  addAdSenseAds() {
    // Top banner ad
    this.addAd('top-banner', 'horizontal', '728x90');
    
    // Sidebar ad (if sidebar exists)
    this.addAd('sidebar-ad', 'vertical', '300x600');
    
    // Bottom banner ad
    this.addAd('bottom-banner', 'horizontal', '728x90');
    
    // In-content ad (for articles)
    this.addAd('in-content', 'horizontal', '728x90');
  }

  // Add individual ad
  addAd(containerId, type, size) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const adDiv = document.createElement('div');
    adDiv.className = 'adsense-ad';
    adDiv.style.cssText = `
      width: 100%;
      max-width: ${size.split('x')[0]}px;
      height: ${size.split('x')[1]}px;
      margin: 1rem auto;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 117, 24, 0.3);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #B0B0B0;
      font-size: 0.9rem;
    `;

    // AdSense code (replace with your actual AdSense code)
    adDiv.innerHTML = `
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
           crossorigin="anonymous"></script>
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
           data-ad-slot="YOUR_AD_SLOT_ID"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <script>
           (adsbygoogle = window.adsbygoogle || []).push({});
      </script>
    `;

    // Fallback content if AdSense doesn't load
    setTimeout(() => {
      if (adDiv.querySelector('ins').offsetHeight === 0) {
        adDiv.innerHTML = `
          <div style="text-align: center; padding: 1rem;">
            <p>Advertisement</p>
            <p style="font-size: 0.8rem; margin-top: 0.5rem;">
              <a href="subscription.html" style="color: #FF7518; text-decoration: none;">
                Remove ads with subscription
              </a>
            </p>
            <p style="font-size: 0.7rem; margin-top: 0.3rem; color: #888; font-style: italic;">
              Help keep a horror-loving human fed! 🍕
            </p>
          </div>
        `;
      }
    }, 3000);

    container.appendChild(adDiv);
  }

  // Refresh subscription status
  async refresh() {
    await this.checkSubscriptionStatus();
    this.setupAdDisplay();
  }

  // Get subscription status
  getSubscriptionStatus() {
    return {
      isSubscribed: this.isSubscribed,
      subscriptionData: this.subscriptionData,
      adsEnabled: this.adsEnabled
    };
  }

  // Show subscription prompt
  showSubscriptionPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'subscription-prompt';
    prompt.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
      border: 2px solid #FF7518;
      border-radius: 15px;
      padding: 2rem;
      z-index: 10000;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 0 30px rgba(255, 117, 24, 0.3);
    `;

    prompt.innerHTML = `
      <h3 style="color: #FF7518; margin-bottom: 1rem;">🎃 Remove Ads! 🎃</h3>
      <p style="color: #E0E0E0; margin-bottom: 1rem;">
        Subscribe for just $5/month and enjoy an ad-free experience!
      </p>
      <p style="color: #B0B0B0; font-size: 0.9rem; margin-bottom: 1.5rem; font-style: italic;">
        Plus, you'll help keep this horror-loving human fed! 🍕 (This site is built and run by just one person)
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button onclick="window.location.href='subscription.html'" 
                style="background: #FF7518; color: #000; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; font-weight: bold; cursor: pointer;">
          Subscribe Now
        </button>
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

// Global subscription manager instance
window.subscriptionManager = new SubscriptionManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubscriptionManager;
} 