import { Product } from '../types/ecommerce';

export const AMAZON_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    asin: 'B09XS7JWHH',
    title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones - Auto Optimizer, 30hr Battery Life, Hands-Free Calling',
    brand: 'Sony',
    category: 'Audio & Headphones',
    price: 348.00,
    originalPrice: 399.99,
    rating: 4.6,
    reviewCount: 14820,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    ],
    description: [
      'Industry-leading noise cancellation optimized to you: Two processors control 8 microphones for unprecedented noise cancellation.',
      'Magnificent Sound, engineered to perfection with the new Integrated Processor V1 and specially designed 30mm driver unit.',
      'Crystal clear hands-free calling with 4 beamforming microphones, precise voice pickup technology, and advanced audio signal processing.',
      'Up to 30-hour battery life with quick charging (3 min charge for 3 hours of playback).'
    ],
    features: [
      'Active Noise Cancellation (Auto NC Optimizer)',
      '30 Hours Playtime on Single Charge',
      'Multipoint Bluetooth 5.2 Connection',
      'Touch Sensor Controls & Speak-to-Chat'
    ],
    inStock: true,
    isPrime: true,
    bestSeller: true,
    amazonChoice: false,
    kCoreInteractionCount: 284,
    coPurchasedAsins: ['B07978J597', 'B08F9V4P3G'],
    similarAsins: ['B08HG8XJ3W', 'B0BDHW4P9D'],
    twoTowerEmbeddingSimilarity: 0.96,
    recReason: 'Top predicted match based on your audio peripheral interactions (Cosine: 0.96)',
    reviews: [
      {
        id: 'rev-101',
        userId: 'U3812739174',
        userName: 'Marcus R. Miller',
        rating: 5,
        title: 'The ANC is frighteningly quiet. Perfect for daily transit and deep focus.',
        text: 'Upgraded from the XM3s. The soundstage is significantly flatter and more refined. The microphone quality during Zoom meetings is noticeably better than earlier generations. The earcups are super plush.',
        timestamp: 'September 14, 2023',
        helpfulVotes: 342,
        verifiedPurchase: true,
        sentiment: 'positive',
        sentimentScore: 0.95
      },
      {
        id: 'rev-102',
        userId: 'U9920194821',
        userName: 'Elena K.',
        rating: 4,
        title: 'Great sound and battery, hinge does not fold completely flat',
        text: 'Everything about the audio and ANC is stellar. However, note that unlike XM4, the headband doesn’t fold into itself, so the carrying case is slightly larger in my backpack.',
        timestamp: 'October 3, 2023',
        helpfulVotes: 89,
        verifiedPurchase: true,
        sentiment: 'neutral',
        sentimentScore: 0.65
      }
    ]
  },
  {
    id: 'prod-2',
    asin: 'B07978J597',
    title: 'Anker Powerline+ III USB-C to USB-C Fast Charging Cable (6ft, 60W Delivery) - Ultra Durable Double Braided Nylon',
    brand: 'Anker',
    category: 'Electronics',
    price: 16.99,
    originalPrice: 22.99,
    rating: 4.8,
    reviewCount: 31250,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=800&q=80'
    ],
    description: [
      'Slimmer Yet Stronger: An optimized internal structure means the latest generation of PowerLine is even slimmer than its predecessors.',
      'Universal High-Speed Charging: Supports Power Delivery high-speed charging up to 60W for laptops, phones, and tablets.',
      'Tested to withstand up to 35,000 bends in rigorous laboratory stress tests.'
    ],
    features: [
      '60W High-Speed Power Delivery',
      'Double-Braided Tough Nylon Fiber',
      'MFi & USB-IF Compliant',
      'Tangle-Resistant Silicone Tie Included'
    ],
    inStock: true,
    isPrime: true,
    bestSeller: true,
    amazonChoice: true,
    kCoreInteractionCount: 512,
    coPurchasedAsins: ['B09XS7JWHH', 'B09JQL856G'],
    similarAsins: ['B081X78C2R'],
    twoTowerEmbeddingSimilarity: 0.92,
    recReason: 'Frequently co-purchased with premium USB-C devices (Co-occurrence lift: 4.2x)',
    reviews: [
      {
        id: 'rev-201',
        userId: 'U118274628',
        userName: 'Jason Vance',
        rating: 5,
        title: 'Only cables I will buy now',
        text: 'I have owned three of these for 2 years now. Survives cats chewing on them, daily commuting in tight pockets, and delivers steady 60W to my iPad and MacBook.',
        timestamp: 'August 28, 2023',
        helpfulVotes: 120,
        verifiedPurchase: true,
        sentiment: 'positive',
        sentimentScore: 0.98
      }
    ]
  },
  {
    id: 'prod-3',
    asin: 'B09JQL856G',
    title: 'Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C) - Up to 2X More Active Noise Cancelling, Transparency',
    brand: 'Apple',
    category: 'Audio & Headphones',
    price: 189.99,
    originalPrice: 249.00,
    rating: 4.7,
    reviewCount: 48900,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=800&q=80'
    ],
    description: [
      'Up to 2x more Active Noise Cancellation than the previous generation AirPods Pro.',
      'Adaptive Audio dynamically blends Transparency mode and Active Noise Cancellation to tailor the noise control experience as you move.',
      'Dust, sweat, and water resistant (IP54) for both AirPods Pro and MagSafe Charging Case.'
    ],
    features: [
      'Apple H2 Headphone Chip',
      'Personalized Spatial Audio with Dynamic Head Tracking',
      'Touch Control for Volume Sliding',
      'Precision Finding with U1 Chip'
    ],
    inStock: true,
    isPrime: true,
    bestSeller: true,
    amazonChoice: false,
    kCoreInteractionCount: 890,
    coPurchasedAsins: ['B07978J597', 'B08F9V4P3G'],
    similarAsins: ['B09XS7JWHH', 'B0BDHW4P9D'],
    twoTowerEmbeddingSimilarity: 0.94,
    recReason: 'High affinity in 20-core User Collaborative Graph for Audio enthusiasts',
    reviews: [
      {
        id: 'rev-301',
        userId: 'U772184912',
        userName: 'Chloe Sanders',
        rating: 5,
        title: 'Adaptive Audio feature is magic in coffee shops',
        text: 'The transition between silencing blender noises and letting baristas talk to you without touching the earbuds is uncanny. USB-C case makes travel unified.',
        timestamp: 'November 12, 2023',
        helpfulVotes: 410,
        verifiedPurchase: true,
        sentiment: 'positive',
        sentimentScore: 0.96
      }
    ]
  },
  {
    id: 'prod-4',
    asin: 'B08F9V4P3G',
    title: 'Logitech MX Master 3S Wireless Performance Mouse - 8K DPI Sensor, Quiet Clicks, Ultrafast MagSpeed Scrolling, Bluetooth',
    brand: 'Logitech',
    category: 'Computers & Accessories',
    price: 99.99,
    originalPrice: 119.99,
    rating: 4.7,
    reviewCount: 22130,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
    ],
    description: [
      'Any-surface tracking - now 8K DPI: Use MX Master 3S cordless computer mouse to work on any surface - even glass.',
      'Quiet clicks: Introducing 90% quieter clicks while retaining the satisfying tactile click feel.',
      'MagSpeed scrolling: Remarkable speed, precision, and near-silence - scroll 1,000 lines in a second.',
      'Ergonomic silhouette crafted for the palm with thumb wheel and gesture button.'
    ],
    features: [
      '8,000 DPI Darkfield Sensor (Tracks on Glass)',
      'MagSpeed Electromagnetic Scroll Wheel',
      'Logi Bolt & Bluetooth Wireless',
      '70 Days Battery Life on Full Charge'
    ],
    inStock: true,
    isPrime: true,
    bestSeller: true,
    amazonChoice: true,
    kCoreInteractionCount: 420,
    coPurchasedAsins: ['B0B147R5V9', 'B07978J597'],
    similarAsins: ['B098K4J23N'],
    twoTowerEmbeddingSimilarity: 0.91,
    recReason: 'Item-to-Item Collaborative Filter: 78% of MacBook/PC power users acquire this',
    reviews: [
      {
        id: 'rev-401',
        userId: 'U332198042',
        userName: 'TechReviewer Dan',
        rating: 5,
        title: 'The undisputed king of productivity mice',
        text: 'The quiet clicks are a welcome change from the MX Master 3. The side scroll wheel for wide Excel sheets or timeline scrubbing in Premiere Pro is unmatched.',
        timestamp: 'October 19, 2023',
        helpfulVotes: 230,
        verifiedPurchase: true,
        sentiment: 'positive',
        sentimentScore: 0.94
      }
    ]
  },
  {
    id: 'prod-5',
    asin: 'B0B147R5V9',
    title: 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard - 75% QMK/VIA Gasket Mount, Hot-Swappable Red Switches',
    brand: 'Keychron',
    category: 'Computers & Accessories',
    price: 199.99,
    originalPrice: 219.99,
    rating: 4.6,
    reviewCount: 3410,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
    ],
    description: [
      'Full CNC Machined Aluminum Body: Crafted with 6063 aluminum that is processed through CNC machining, polished, anodized, sandblasted.',
      'Double-Gasket Design: Enhances acoustic sound and cushioning flexibility during long typing sessions.',
      'QMK & VIA Program: Remap keys, write macros, and customize RGB backlighting effortlessly on macOS, Windows, and Linux.'
    ],
    features: [
      'Full Aluminum CNC Chassis',
      'Hot-Swappable PCB (3-pin & 5-pin MX)',
      'Bluetooth 5.1 & Type-C Wired Dual Mode',
      'Custom South-Facing RGB LEDs'
    ],
    inStock: true,
    isPrime: true,
    bestSeller: false,
    amazonChoice: true,
    kCoreInteractionCount: 165,
    coPurchasedAsins: ['B08F9V4P3G', 'B07978J597'],
    similarAsins: ['B098K4J23N'],
    twoTowerEmbeddingSimilarity: 0.89,
    recReason: 'High embedding proximity to mechanical desk accessories',
    reviews: [
      {
        id: 'rev-501',
        userId: 'U883109271',
        userName: 'S. Cooper',
        rating: 5,
        title: 'Heaviest, most solid typing experience you can buy out of the box',
        text: 'Weighs nearly 4 pounds. The acoustic resonance is deep (thocky) without needing aftermarket foam mods. Seamless switching between my work Mac and home PC.',
        timestamp: 'December 2, 2023',
        helpfulVotes: 87,
        verifiedPurchase: true,
        sentiment: 'positive',
        sentimentScore: 0.92
      }
    ]
  },
  {
    id: 'prod-6',
    asin: 'B08HG8XJ3W',
    title: 'Bose QuietComfort 45 Bluetooth Wireless Noise Cancelling Headphones - Triple Black with Aware Mode',
    brand: 'Bose',
    category: 'Audio & Headphones',
    price: 279.00,
    originalPrice: 329.00,
    rating: 4.6,
    reviewCount: 29400,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    description: [
      'Iconic quiet, comfort, and sound: You feel it the minute you put them on. The soft, plush cushions seal you in.',
      'High-fidelity audio: TriPort acoustic architecture offers depth and fullness. Adjustable EQ allows you to set the bass, mid-range, and treble.',
      '24 hours of battery life from a single charge via USB-C.'
    ],
    features: [
      'Acoustic Noise Cancelling Technology',
      '24-Hour Battery Life with Fast Charge',
      'Lightweight Synthetic Leather Cushions',
      'Simultaneous 2-Device Multipoint'
    ],
    inStock: true,
    isPrime: true,
    bestSeller: false,
    amazonChoice: false,
    kCoreInteractionCount: 395,
    coPurchasedAsins: ['B07978J597'],
    similarAsins: ['B09XS7JWHH', 'B09JQL856G'],
    twoTowerEmbeddingSimilarity: 0.93,
    recReason: 'Clustered in the same latent vector space as Sony WH-1000XM5',
    reviews: [
      {
        id: 'rev-601',
        userId: 'U559128374',
        userName: 'Rachel T.',
        rating: 5,
        title: 'Unrivaled comfort for 8+ hour flights',
        text: 'Clamping force is much gentler than competitors. You can wear these all day without any crown pressure. Real physical buttons instead of finicky touch sliders.',
        timestamp: 'July 15, 2023',
        helpfulVotes: 145,
        verifiedPurchase: true,
        sentiment: 'positive',
        sentimentScore: 0.93
      }
    ]
  },
  {
    id: 'prod-7',
    asin: 'B08F7T8M6Z',
    title: 'Philips Hue White & Color Ambiance Smart LED Starter Kit - 4 Smart Bulbs (75W Equivalent) & Hue Smart Bridge',
    brand: 'Philips Hue',
    category: 'Smart Home',
    price: 159.99,
    originalPrice: 199.99,
    rating: 4.7,
    reviewCount: 16750,
    image: 'https://images.unsplash.com/photo-1550524514-9b2512db75b8?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80'
    ],
    description: [
      'Transform your home with 16 million colors and preset light recipes tailored for reading, relaxing, or concentrating.',
      'Hub included: Connects to your home Wi-Fi router for rock-solid Zigbee reliability that will never bog down your internet.',
      'Compatible with Alexa, Google Assistant, Apple HomeKit, and Samsung SmartThings.'
    ],
    features: [
      '16 Million Colors & 50,000 Shades of Warm/Cool White',
      'Zigbee Protocol with Instant Bridge Control',
      'Automated Sunset & Sunrise Scheduling',
      'Works with all major voice assistants'
    ],
    inStock: true,
    isPrime: true,
    bestSeller: true,
    amazonChoice: true,
    kCoreInteractionCount: 310,
    coPurchasedAsins: ['B09B2SBHQK', 'B07978J597'],
    similarAsins: ['B081X78C2R'],
    twoTowerEmbeddingSimilarity: 0.88,
    recReason: 'Personalized recommendation for Smart Home & Ambient Lighting preference',
    reviews: [
      {
        id: 'rev-701',
        userId: 'U661928471',
        userName: 'Brian Keller',
        rating: 5,
        title: 'The gold standard for smart lighting',
        text: 'Do not bother with cheap Wi-Fi light bulbs that disconnect randomly. Hue Zigbee mesh network never drops a single packet. Bridge integration into Apple Home is flawless.',
        timestamp: 'September 22, 2023',
        helpfulVotes: 98,
        verifiedPurchase: true,
        sentiment: 'positive',
        sentimentScore: 0.97
      }
    ]
  },
  {
    id: 'prod-8',
    asin: 'B09B2SBHQK',
    title: 'Echo Show 8 (3rd Gen, 2023 release) - Smart HD Display with Spatial Audio, Smart Home Hub, and 13MP Camera',
    brand: 'Amazon',
    category: 'Smart Home',
    price: 149.99,
    originalPrice: 179.99,
    rating: 4.5,
    reviewCount: 18420,
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
    ],
    description: [
      'Rich sound with Spatial Audio: Enhanced bass and room-adapting clarity that automatically calibrates to your room.',
      'Built-in smart home hub: Pair and control Zigbee, Matter, and Thread smart devices without a separate hub.',
      'Centering 13 MP camera: Auto-framing keeps you in focus during video calls with family and friends.'
    ],
    features: [
      '8-inch HD Touchscreen Display',
      'Spatial Audio Acoustic Chamber',
      'Built-in Zigbee & Matter Smart Hub',
      '13MP Auto-Framing Camera with Shutter'
    ],
    inStock: true,
    isPrime: true,
    bestSeller: true,
    amazonChoice: false,
    kCoreInteractionCount: 640,
    coPurchasedAsins: ['B08F7T8M6Z'],
    similarAsins: [],
    twoTowerEmbeddingSimilarity: 0.95,
    recReason: 'Top device paired with Philips Hue Zigbee network interactions',
    reviews: [
      {
        id: 'rev-801',
        userId: 'U994108420',
        userName: 'Linda W.',
        rating: 5,
        title: 'Speaker upgrade is massive over gen 2',
        text: 'The spatial audio fill in the kitchen is astonishing. You can clearly hear recipe steps even while cooking with the exhaust fan running.',
        timestamp: 'November 29, 2023',
        helpfulVotes: 167,
        verifiedPurchase: true,
        sentiment: 'positive',
        sentimentScore: 0.91
      }
    ]
  },
  {
    id: 'prod-9',
    asin: 'B0C7B83PQM',
    title: 'Garmin Forerunner 265 GPS Running Smartwatch - Colorful AMOLED Display, Training Readiness, 13 Days Battery',
    brand: 'Garmin',
    category: 'Wearables',
    price: 449.99,
    originalPrice: 449.99,
    rating: 4.8,
    reviewCount: 4120,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    description: [
      'Brilliant AMOLED Touchscreen Display: Vibrant color visuals paired with traditional button controls.',
      'Morning Report: Summary of sleep, HRV status, recovery, and daily training outlook upon waking.',
      'Multi-Band GNSS with SatIQ Technology: Superior positioning accuracy in challenging tree cover and urban canyons.'
    ],
    features: [
      '1.3" Sunlight-Readable AMOLED Display',
      'Up to 13 Days Battery Life in Smartwatch Mode',
      'Dual-Frequency Multi-Band GPS',
      'Garmin Pay & On-Device Music Storage'
    ],
    inStock: true,
    isPrime: true,
    bestSeller: false,
    amazonChoice: true,
    kCoreInteractionCount: 198,
    coPurchasedAsins: ['B09JQL856G'],
    similarAsins: ['B0BDHW4P9D'],
    twoTowerEmbeddingSimilarity: 0.87,
    recReason: 'Recommended for Fitness & Biometric telemetry interest cohort',
    reviews: [
      {
        id: 'rev-901',
        userId: 'U441209384',
        userName: 'Dave Marathoner',
        rating: 5,
        title: 'Switched from Apple Watch - battery life changed my routine',
        text: 'Only charging every 10 days instead of daily is liberating. The GPS lock takes 3 seconds and HRV tracking gives genuine insight into recovery.',
        timestamp: 'August 12, 2023',
        helpfulVotes: 184,
        verifiedPurchase: true,
        sentiment: 'positive',
        sentimentScore: 0.96
      }
    ]
  },
  {
    id: 'prod-10',
    asin: 'B0BDHW4P9D',
    title: 'Sony Alpha 7 IV Full-Frame Mirrorless Interchangeable Lens Camera (Body Only) - 33MP BSI CMOS Sensor, 4K 60p 10-Bit',
    brand: 'Sony',
    category: 'Cameras',
    price: 2298.00,
    originalPrice: 2498.00,
    rating: 4.8,
    reviewCount: 2890,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80'
    ],
    description: [
      '33MP full-frame Exmor R back-illuminated CMOS sensor with BIONZ XR processing engine.',
      'Real-time Eye AF for humans, animals, and birds in both photo and video modes with 759 phase-detection points.',
      '4K 60p 10-bit 4:2:2 recording with S-Cinetone color profile.'
    ],
    features: [
      '33 Megapixel Full-Frame Exmor R Sensor',
      '4K 60p Recording with Active Mode Stabilization',
      '759-Point Phase-Detection AF',
      'Dual CFexpress Type A / SD Card Slots'
    ],
    inStock: true,
    isPrime: true,
    bestSeller: false,
    amazonChoice: false,
    kCoreInteractionCount: 220,
    coPurchasedAsins: ['B07978J597'],
    similarAsins: ['B09XS7JWHH'],
    twoTowerEmbeddingSimilarity: 0.85,
    recReason: 'High tier photography recommendation based on cross-category affinity',
    reviews: [
      {
        id: 'rev-1001',
        userId: 'U223910294',
        userName: 'PhotographyPro',
        rating: 5,
        title: 'The perfect hybrid camera for photo and video creators',
        text: 'The 33MP resolution strikes the sweet spot for cropping without overwhelming hard drives. The autofocus tracking feels like black magic.',
        timestamp: 'September 5, 2023',
        helpfulVotes: 142,
        verifiedPurchase: true,
        sentiment: 'positive',
        sentimentScore: 0.98
      }
    ]
  },
  {
    id: 'prod-11',
    asin: 'B081X78C2R',
    title: 'Anker Magnetic Wireless Power Bank 10,000mAh with Foldable Phone Stand - MagGo Portable Charger',
    brand: 'Anker',
    category: 'Electronics',
    price: 49.99,
    originalPrice: 59.99,
    rating: 4.5,
    reviewCount: 15400,
    image: 'https://images.unsplash.com/photo-1609592426508-cc8534d0263f?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    description: [
      'Snap & Go: Strong magnets securely attach to iPhone 12/13/14/15 series for seamless wireless charging.',
      'Built-in foldable kickstand lets you watch videos or make FaceTime calls while keeping your phone charged.',
      '10,000mAh capacity provides nearly 2 full charges on standard modern smartphones.'
    ],
    features: [
      'Strong 9N Magnetic Lock',
      'Built-in Versatile Foldable Kickstand',
      '20W USB-C Two-Way Fast Charging',
      'MultiProtect Safety System'
    ],
    inStock: true,
    isPrime: true,
    bestSeller: true,
    amazonChoice: true,
    kCoreInteractionCount: 380,
    coPurchasedAsins: ['B07978J597', 'B09JQL856G'],
    similarAsins: ['B07978J597'],
    twoTowerEmbeddingSimilarity: 0.90,
    recReason: 'Top complementary accessory for mobile & audio user cluster',
    reviews: [
      {
        id: 'rev-1101',
        userId: 'U109283912',
        userName: 'Samantha L.',
        rating: 5,
        title: 'Essential for long travel days',
        text: 'The kickstand on flights is brilliant. Slaps firmly onto MagSafe cases and doesn’t overheat like older wireless chargers.',
        timestamp: 'October 11, 2023',
        helpfulVotes: 73,
        verifiedPurchase: true,
        sentiment: 'positive',
        sentimentScore: 0.93
      }
    ]
  },
  {
    id: 'prod-12',
    asin: 'B098K4J23N',
    title: 'Dell UltraSharp 32 4K USB-C Hub Monitor (U3223QE) - IPS Black Technology, 2000:1 Contrast, 90W Power Delivery',
    brand: 'Dell',
    category: 'Computers & Accessories',
    price: 689.99,
    originalPrice: 829.99,
    rating: 4.6,
    reviewCount: 4980,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    description: [
      'Brilliant Visuals: Experience incredible color and superior black performance with a contrast ratio of 2,000:1 on IPS Black technology.',
      'Peak Productivity: Connect all your devices via a single USB-C cable carrying 4K video, audio, data, and 90W laptop charging.',
      'ComfortView Plus: Built-in always-on low blue light screen reduces potentially harmful blue light emissions without compromising color.'
    ],
    features: [
      '31.5" 4K UHD (3840 x 2160) IPS Black Panel',
      'Built-in RJ45 Ethernet & 90W USB-C Power Hub',
      'KVM Switch for Dual-PC Multi-tasking',
      '100% sRGB and 98% DCI-P3 Color Gamut'
    ],
    inStock: true,
    isPrime: true,
    bestSeller: false,
    amazonChoice: true,
    kCoreInteractionCount: 260,
    coPurchasedAsins: ['B08F9V4P3G', 'B0B147R5V9'],
    similarAsins: ['B0B147R5V9'],
    twoTowerEmbeddingSimilarity: 0.93,
    recReason: 'Anchor item for high-productivity workspace setups in 20-core dataset',
    reviews: [
      {
        id: 'rev-1201',
        userId: 'U781290349',
        userName: 'Software Lead Rob',
        rating: 5,
        title: 'IPS Black is almost OLED-like for coding in dark mode',
        text: 'The single-cable setup with built-in Ethernet cleans up desk cable clutter instantly. Colors are spot-on right out of the box.',
        timestamp: 'September 30, 2023',
        helpfulVotes: 119,
        verifiedPurchase: true,
        sentiment: 'positive',
        sentimentScore: 0.95
      }
    ]
  }
];

export const CATEGORIES = [
  'All Departments',
  'Audio & Headphones',
  'Computers & Accessories',
  'Electronics',
  'Smart Home',
  'Cameras',
  'Wearables'
];
