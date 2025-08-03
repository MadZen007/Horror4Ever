# Google AdSense Setup Guide for Horror4Ever

## Step-by-Step Instructions

### Step 1: Create a Google AdSense Account

1. **Go to Google AdSense**
   - Visit: https://www.google.com/adsense
   - Click "Get Started" or "Sign Up"

2. **Enter Your Website Information**
   - Website URL: `https://yourdomain.com` (replace with your actual domain)
   - Website language: English
   - Account type: Individual
   - Contact information: Your name and address

3. **Accept Terms and Submit**
   - Read and accept the AdSense program policies
   - Submit your application

### Step 2: Wait for Approval (1-2 weeks)

- Google will review your site for compliance
- You'll receive an email when approved
- Don't add ad code until you're approved

### Step 3: Get Your AdSense Code

1. **Log into AdSense Dashboard**
   - Go to https://www.google.com/adsense
   - Sign in with your Google account

2. **Create Your First Ad Unit**
   - Click "Ads" in the left sidebar
   - Click "By ad unit" tab
   - Click "Create new ad unit"

3. **Configure the Ad Unit**
   - **Name**: "Horror4Ever Banner Ad"
   - **Ad size**: Select "Responsive" or "728x90" (banner)
   - **Ad type**: Display ads
   - **Style**: Choose a style that matches your site's dark theme
   - Click "Save and get code"

4. **Copy the Ad Code**
   - You'll get HTML code that looks like this:
   ```html
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
   ```

### Step 4: Update Your Subscription Manager

1. **Open the file**: `homepage/js/subscription-manager.js`

2. **Find the `createAdSenseAd` function** (around line 60)

3. **Replace the placeholder ad code** with your actual AdSense code:

```javascript
function createAdSenseAd(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const adDiv = document.createElement('div');
  adDiv.className = 'adsense-ad';
  
  // Replace this section with your actual AdSense code
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

  container.appendChild(adDiv);
}
```

**Important**: Replace `YOUR_PUBLISHER_ID` and `YOUR_AD_SLOT_ID` with your actual values from Step 3.

### Step 5: Create Additional Ad Units (Optional)

For better revenue, create multiple ad units:

1. **Top Banner Ad** (728x90)
   - Place at the top of pages
   - Use the existing `#top-banner` container

2. **Bottom Banner Ad** (728x90)
   - Place at the bottom of pages
   - Use the existing `#bottom-banner` container

3. **Sidebar Ad** (300x250) - Optional
   - Create a new container in your layout
   - Good for longer content pages

### Step 6: Test Your Implementation

1. **Check Ad Display**
   - Visit your site as a non-subscriber
   - Verify ads appear in the designated containers
   - Check that ads disappear for subscribers

2. **Test Responsive Design**
   - View on mobile devices
   - Ensure ads scale properly

3. **Check Console for Errors**
   - Open browser developer tools
   - Look for any JavaScript errors

### Step 7: Monitor Performance

1. **AdSense Dashboard**
   - Check "Reports" section for earnings
   - Monitor "Ad units" for performance
   - Review "Policy center" for any violations

2. **Key Metrics to Watch**
   - Page RPM (Revenue Per Mille)
   - Click-through rate (CTR)
   - Ad fill rate

### Step 8: Optimize for Better Performance

1. **Ad Placement Best Practices**
   - Above the fold (visible without scrolling)
   - Near content, not navigation
   - Avoid too many ads per page (max 3-4)

2. **Content Optimization**
   - Create more horror-related content
   - Use relevant keywords
   - Regular updates increase traffic

3. **User Experience**
   - Ensure ads don't interfere with site navigation
   - Keep subscription option visible
   - Balance monetization with user experience

## Important Notes

### Compliance Requirements
- **Don't click your own ads** - This violates AdSense policies
- **Don't place ads too close together** - Minimum spacing required
- **Don't use prohibited content** - No adult content, violence, etc.
- **Don't manipulate ad placement** - Let AdSense handle positioning

### Revenue Expectations
- **New sites**: $1-10/month initially
- **Growing sites**: $10-100/month with regular content
- **Established sites**: $100+/month with good traffic

### Payment Information
- **Minimum payout**: $100
- **Payment methods**: Bank transfer, check
- **Payment schedule**: Monthly (around 21st of each month)

## Troubleshooting

### Ads Not Showing
1. Check if you're logged in as a subscriber (ads are hidden)
2. Verify AdSense code is correct
3. Check browser console for errors
4. Ensure site is approved by AdSense

### Low Revenue
1. Increase site traffic
2. Improve ad placement
3. Create more content
4. Optimize for mobile users

### Account Suspension
1. Review AdSense policies
2. Remove any prohibited content
3. Contact AdSense support
4. Wait for review process

## Next Steps

1. **Set up payment information** in AdSense dashboard
2. **Create more ad units** for different page types
3. **Implement ad blocking detection** (optional)
4. **Consider AdSense Auto ads** for automatic placement
5. **Explore other ad networks** as backup (Media.net, Amazon Associates)

## Support Resources

- **AdSense Help Center**: https://support.google.com/adsense
- **AdSense Community**: https://support.google.com/adsense/community
- **Policy Center**: Check your AdSense dashboard regularly

---

**Remember**: AdSense approval can take 1-2 weeks. Don't add ad code until you're approved, and always follow Google's policies to avoid account suspension. 