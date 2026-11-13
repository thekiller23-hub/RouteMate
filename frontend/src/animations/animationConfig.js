/**
 * RouteMate Central Animation Configuration
 * Controls frame sequence counts, paths, scroll heights, speed, and responsive settings.
 */

export const animationConfig = {
  hero: {
    id: 'hero',
    name: 'Main Hero Experience',
    frameCount: 55,
    folder: '/assets/frames/hero',
    prefix: 'hero_',
    ext: '.webp',
    fallbackExt: '.jpg',
    scrollSectionHeightVh: 280, // Multiplier for smooth scroll pacing
    animationSpeed: 1.0,
    mobile: {
      scrollSectionHeightVh: 220,
      skipFrames: 1, // Full frame rate
    },
    quality: {
      useWebP: true,
      maxDpr: 2.0,
      aspectRatio: 640 / 358,
    },
    title: 'Anything From Anywhere.',
    subtitle: 'Delivered By Someone Already Travelling.',
    description: 'Connect with travellers heading your way. Get products from different locations while helping people turn their existing journeys into extra earnings.',
    taglines: [
      { progress: 0.15, text: 'Your Journey. Their Need. Your Reward.' },
      { progress: 0.50, text: 'Turn Every Mile Into Earning Potential.' },
      { progress: 0.85, text: 'Peer-to-Peer Delivery Across Cities.' }
    ]
  },

  delivery: {
    id: 'delivery',
    name: 'Product Delivery Journey',
    frameCount: 9,
    folder: '/assets/frames/delivery',
    prefix: 'delivery_',
    ext: '.webp',
    fallbackExt: '.jpg',
    scrollSectionHeightVh: 220,
    animationSpeed: 1.0,
    mobile: {
      scrollSectionHeightVh: 180,
      skipFrames: 1,
    },
    quality: {
      useWebP: true,
      maxDpr: 2.0,
      aspectRatio: 551 / 299,
    },
    steps: [
      { frameIndex: 0, title: 'Request Accepted', desc: 'Traveller accepts delivery request along their planned route' },
      { frameIndex: 2, title: 'Product Collected', desc: 'Secure pickup from store, market, or individual seller' },
      { frameIndex: 5, title: 'In Transit', desc: 'Traveller commutes naturally while carrying the item safely' },
      { frameIndex: 8, title: 'Handover & OTP', desc: 'Delivery confirmation via secure OTP release and instant reward payment' }
    ]
  },

  product: {
    id: 'product',
    name: 'Cinematic Product Exploration',
    frameCount: 9,
    folder: '/assets/frames/product',
    prefix: 'product_',
    ext: '.webp',
    fallbackExt: '.jpg',
    scrollSectionHeightVh: 240,
    animationSpeed: 1.0,
    mobile: {
      scrollSectionHeightVh: 200,
      skipFrames: 1,
    },
    quality: {
      useWebP: true,
      maxDpr: 2.0,
      aspectRatio: 543 / 309,
    },
    stages: [
      { progress: 0.0, label: 'Sealed Package', detail: 'Authentic original packaging secured from seller' },
      { progress: 0.25, label: 'Unboxing Reveal', detail: 'Smart automatic unboxing and verification' },
      { progress: 0.60, label: '360° Inspection', detail: 'Full structural inspection & condition check' },
      { progress: 0.90, label: 'Hardware Specs', detail: 'Premium quality guarantee before transit' }
    ]
  }
};

/**
 * Returns formatted URL for a given frame index and configuration
 */
export const getFrameUrl = (config, index, preferWebP = true) => {
  const paddedIndex = String(index).padStart(3, '0');
  const ext = preferWebP ? config.ext : config.fallbackExt;
  return `${config.folder}/${config.prefix}${paddedIndex}${ext}`;
};

