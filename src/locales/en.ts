export const en = {
  common: {
    continue: "Continue",
    skip: "Skip",
    getStarted: "Get Started",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    delete: "Delete",
    loading: "Loading...",
    success: "Success",
    error: "Error",
    goBack: "Go Back",
    done: "Done",
    retry: "Retry",
    or: "OR",
  },
  onboarding: {
    slides: [
      {
        title: "Soil Testing in ",
        highlight: "60 Seconds",
        body: "The Agni device analyzes 14 parameters — pH, N, P, K, moisture, EC and more. No lab. No waiting.",
        badge: "60 SECS"
      },
      {
        title: "Your Farm, ",
        highlight: "Your Language",
        body: "Get recommendations in Odia, Hindi, English or 7 other Indian languages — with full voice advisory support.",
        badge: "10 LANGS"
      },
      {
        title: "AI That Knows ",
        highlight: "Agriculture",
        body: "Saathi AI is trained on peer-reviewed agronomic data to deliver personalized fertilizer plans and yield forecasts.",
        badge: "CUSTOM LLM"
      }
    ]
  },
  auth: {
    login: {
      title: "Welcome Back",
      subtitle: "Login to check your soil health & chat with Saathi",
      usernameOrEmail: "Username or Email",
      password: "Password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot Password?",
      loginBtn: "Login to Saathi",
      socialAuthTitle: "Or connect via",
      noAccount: "Don't have an account?",
      signUp: "Register here",
      loading: "Logging you in...",
      validationError: "Please fill all fields",
      errorTitle: "Login Failed",
    },
    register: {
      title: "Create Account",
      subtitle: "Join thousands of smart farmers using Saathi AI",
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      location: "Location / Village",
      password: "Password",
      confirmPassword: "Confirm Password",
      agreeTerms: "I agree to the Terms & Privacy Policy",
      registerBtn: "Register & Connect",
      alreadyAccount: "Already have an account?",
      login: "Login here",
      loading: "Creating your profile...",
      validationError: "Please fill all required fields",
      passwordMismatch: "Passwords do not match",
      errorTitle: "Registration Failed",
    },
    forgot: {
      title: "Forgot Password",
      subtitle: "Enter your email or phone to reset your password",
      emailOrPhone: "Email or Phone Number",
      sendBtn: "Send Reset Link",
      backToLogin: "Back to Login",
      successTitle: "Link Sent",
      successDesc: "If the account exists, a recovery link has been sent.",
      loading: "Processing request...",
    },
    verify: {
      title: "Verify OTP",
      subtitle: "Enter the code sent to your phone or email",
      otpPlaceholder: "Enter 6-Digit OTP",
      verifyBtn: "Verify Code",
      resendCode: "Resend Code",
      timerText: "Resend in {seconds}s",
      loading: "Verifying code...",
      errorTitle: "Verification Failed",
    }
  },
  dashboard: {
    greeting: "Namaste",
    farmerBadge: "Kisan",
    quickStats: {
      farmsAnalyzed: "FARMS ANALYZED",
      soilTests: "SOIL TESTS",
      aiRecs: "AI RECOMMENDATIONS"
    },
    connectAgni: {
      cardTitle: "Connect Agni",
      cardSubtitle: "Pair your soil sensor instantly for real-time insights.",
      statusNotConnected: "Agni Disconnected",
      statusConnecting: "Connecting to Agni...",
      statusConnected: "Agni Connected",
      tapToScan: "Tap to scan devices",
      activeDetails: "Tap to check details & parameters",
      deviceFound: "Agni Device Found! Tap to pair",
      searching: "Searching for Agni...",
      actionConnect: "Pair Agni",
      actionDisconnect: "Disconnect",
    },
    speedTesting: {
      title: "Soil Testing in 3 Steps",
      sub: "How to use your Agni BLE device",
      steps: [
        {
          title: "Insert Agni Probe",
          desc: "Insert the metal probe of your Agni device 4-6 inches deep into the moist soil."
        },
        {
          title: "Pair & Run Test",
          desc: "Open Saathi AI App, connect via Bluetooth and tap 'Run Instant Soil Test'."
        },
        {
          title: "Get AI Advice",
          desc: "Instantly view N-P-K, pH levels and get personalized fertilizer & crop advisories."
        }
      ]
    },
    testingSpeed: {
      title: "Testing Speed",
      traditionalLab: "Traditional Lab",
      daysWait: "14 days wait",
      saathiAi: "Saathi AI",
      seconds: "< 60 seconds",
      efficiency: "EFFICIENCY",
      faster: "336X FASTER",
    },
    features: {
      title: "Saathi Features",
      subtitle: "Comprehensive agronomic solutions",
      soilReport: {
        title: "Instant Analysis",
        desc: "Get comprehensive soil health data in seconds with our Agni device.",
        detailTitle: "Instant Analysis",
        detailTagline: "Know Your Soil Instantly with Agni ⚡",
        detailDesc: "Traditional soil testing takes days, sometimes even weeks. Farmers often have to depend on distant laboratories, spend money on testing, and wait without clarity. This delay can lead to wrong fertilizer decisions, reduced crop quality, and unnecessary expenses.\n\nWith Saathi AI and the Agni Soil Scanner, you can analyze your soil directly from your field within seconds. Just insert the device into the soil, and it instantly measures critical parameters like Nitrogen (N), Phosphorus (P), Potassium (K), pH level, moisture, and temperature.\n\nThe system then converts this raw data into a simple, easy-to-understand soil health report. You will also receive an AI-powered soil health score and immediate recommendations tailored specifically to your field conditions.\n\nThis means you no longer have to guess what your soil needs. You can take precise actions at the right time, improving crop yield, reducing fertilizer waste, and saving both time and money.\n\nSaathi AI brings lab-level accuracy directly to your hands — fast, reliable, and farmer-friendly.",
        detailResult: "Save time, increase yield, avoid lab delays"
      },
      aiAdvisory: {
        title: "Local Language",
        desc: "Receive recommendations in Odia, Hindi, or English with voice support.",
        detailTitle: "Local Language",
        detailTagline: "Farming Guidance in Your Own Language 🗣️",
        detailDesc: "Many farmers struggle to use modern technology because most apps and tools are only available in English or use complicated terminology. This creates a gap between advanced technology and real-world farming needs.\n\nSaathi AI removes this barrier completely by allowing you to interact in your own language. Whether you speak Odia, Hindi, or English, you can ask questions, understand recommendations, and receive guidance in a way that feels natural to you.\n\nYou can even use voice input to speak directly to the AI. Ask questions like “Which fertilizer should I use?” or “Why is my crop turning yellow?” and get clear, practical answers instantly.\n\nThe system not only translates but understands your farming context, making the advice more relevant and actionable. This ensures that every farmer, regardless of education level or language, can confidently use advanced AI tools.\n\nWith Saathi AI, technology becomes simple, accessible, and truly inclusive for every farmer.",
        detailResult: "No confusion, easy decisions for every farmer"
      },
      weatherForecast: {
        title: "Weather Advisories",
        desc: "Rainfall alerts, temperature trends & farm tasks",
        detailTitle: "Weather Advisories",
        detailDesc: "Receive real-time micro-climate warnings, heavy rainfall predictions, and temperature trends customized to your village coordinates, accompanied by action steps to save your crops."
      },
      pestDiagnosis: {
        title: "Pest Diagnosis",
        desc: "Scan pests with camera to get organic/chemical cures",
        detailTitle: "Pest & Disease Diagnosis",
        detailDesc: "Use our intelligent crop camera to scan weeds, insects, or leaf spots. Instantly identify the pest or disease and receive organic solutions and safe chemical recommendations."
      },
      sustainableFarming: {
        title: "Sustainable Farming",
        desc: "AI-powered organic fertilizer recommendations for better crop yield.",
        detailTitle: "Sustainable Farming",
        detailTagline: "Smart and Sustainable Farming for the Future 🌿",
        detailDesc: "Excessive use of chemical fertilizers can harm soil health over time, reduce productivity, and increase farming costs. Many farmers unknowingly overuse fertilizers, leading to poor soil balance and long-term damage.\n\nSaathi AI helps you adopt a smarter and more sustainable approach to farming. Based on your soil data, it provides precise recommendations on what your soil actually needs — not more, not less.\n\nYou will receive a balanced mix of organic and chemical fertilizer suggestions, helping you reduce unnecessary chemical usage while maintaining high productivity. The system also suggests suitable crops based on soil condition, season, and nutrient levels.\n\nBy following these recommendations, you can improve soil fertility, reduce input costs, and ensure better crop quality. Over time, this leads to healthier land, higher profits, and a more sustainable farming practice.\n\nSaathi AI empowers you to farm intelligently — protecting both your income and your soil for future generations.",
        detailResult: "Better soil health + long-term profit"
      },
      fieldMapping: {
        title: "Field Mapping",
        desc: "Visualize your soil data on interactive maps for better field management.",
        detailTitle: "Field Mapping",
        detailTagline: "Understand Your Farm Like Never Before 📍",
        detailDesc: "Every part of your field is different. Soil conditions can vary from one area to another, but traditional farming methods treat the entire field the same. This often leads to uneven crop growth and inefficient use of resources.\n\nSaathi AI introduces smart field mapping to solve this problem. Every time you perform a soil test, the data is linked to a specific location on your farm. Over time, this creates a detailed map of your field showing variations in soil health.\n\nYou can visualize where nutrients are low, where moisture is high, and which areas need special attention. This allows you to take targeted actions instead of applying the same treatment everywhere.\n\nWith this insight, you can optimize fertilizer usage, improve crop consistency, and make better long-term planning decisions. It transforms your farm into a data-driven system where every decision is backed by real information.\n\nSaathi AI helps you see your land not just as a field, but as a smart, manageable ecosystem.",
        detailResult: "Make data-driven farming decisions"
      },
      keyBenefit: "KEY BENEFIT",
      gotIt: "Got it, thanks!"
    },
    ticker: {
      title: "IMPORTANT UPDATE",
      message: "Monsoon advisory released for your region. Check Saathi AI weather forecast now to manage crop drainage!"
    },
    slogans: {
      row1Start: "Har kisan ka digital ",
      row1Highlight: "Saathi",
      row1End: ",",
      row2Highlight: "Mitti",
      row2End: " samjho, sahi faisla lo...",
      fromMitti: "💚 From Mitti AI",
    },
    trustedRecognized: "Trusted & Recognized",
    howItWorks: "How It Works",
    awards: [
      "🏆 Disruptive Innovation Award",
      "🌱 Best Farmer-Tech Solution",
      "🚀 Govt. Incubated Startup",
      "💰 ₹5L Govt Seed Grant",
      "🏅 FM University Innovation",
      "⚡ < 60s Soil Testing",
      "🥇 State Level Winner"
    ],
    connection: {
      connecting: "CONNECTING...",
      connected: "CONNECTED",
      disconnected: "DISCONNECTED"
    },
    errors: {
      statsLoadFailed: "Unable to load dashboard stats.",
      statsUnavailable: "Unable to load live stats right now."
    }
  },
  connect: {
    title: "Agni Connection",
    subtitle: "Manage your smart soil tester",
    statusBadge: {
      offline: "Offline",
      scanning: "Scanning...",
      connected: "Connected",
      online: "Online"
    },
    button: {
      scan: "Scan for Agni Device",
      stopScanning: "Stop Scanning",
      connecting: "Connecting...",
      fetching: "Fetching Soil Data...",
      receiving: "Receiving Soil Data...",
      complete: "Transfer Complete ✓",
      retry: "Retry Connection",
      reconnect: "Reconnect Agni...",
      activating: "Activating Bluetooth...",
      grant: "Grant BT Permissions"
    },
    emptyReports: "Waiting for sensor data...\nReports will appear here automatically.",
    formatTitle: "Danger Zone",
    formatDesc: "This permanently deletes all farmland data from the SD card. Cannot be undone!",
    formatBtn: "Format SD Card",
    formatting: "Formatting...",
    formatSuccessTitle: "Format Complete",
    formatSuccessDesc: "SD card farmland data cleared",
    formatFailedTitle: "Format Failed",
    invalidFile: "This file contains invalid data and cannot be analyzed.",
    openAction: "Open →",
    statusCard: {
      deviceState: "Device State",
      connectedText: "Ready for testing",
      disconnectedText: "Please switch on Agni & turn on Bluetooth",
      paired: "PAIRED",
      unpaired: "NOT PAIRED",
      runTestBtn: "Run Instant Soil Test",
      testingActive: "Analyzing soil...",
    },
    tabs: {
      reports: "Soil Reports",
      guide: "Quick Start Guide"
    },
    quickStart: {
      title: "Quick Start Guide",
      steps: [
        "1. Switch on the Agni device power switch on the side.",
        "2. Ensure your smartphone's Bluetooth and GPS location are turned on.",
        "3. Push the Agni probe 4-6 inches down into moist soil (avoid dry or rocky soil).",
        "4. Tap the 'Connect' button on the dashboard or this screen.",
        "5. Once connected, tap 'Run Instant Soil Test' and wait 60 seconds."
      ]
    },
    deviceLogs: {
      title: "Connection Logs",
      emptyLogs: "No Bluetooth activity. Tap Scan or Connect to start.",
      logHeader: "System Activity"
    },
    alerts: {
      bleDisabled: "Bluetooth is disabled. Please turn on Bluetooth in settings.",
      scanFailed: "Failed to scan for devices. Please check permissions.",
      pairSuccess: "Successfully paired with Agni device!",
      pairFailed: "Failed to connect to Agni device. Make sure it is nearby.",
      permissionTitle: "Location Permission Required",
      permissionDesc: "Saathi AI needs Location Access to scan for nearby Agni Bluetooth devices.",
      grantBtn: "Grant Permission",
    }
  },
  chat: {
    welcomeTitle: "Namaste, Farmer! 🙏",
    welcomeSub: "I'm Saathi AI, your agronomic assistant. Ask me anything about your soil health, fertilizer application, crop disease, or weather updates.",
    statusOffline: "Offline / Error",
    statusRestored: "Session restored",
    statusActive: "Thinking fast, acting smart",
    inputPlaceholder: "Ask Saathi AI (e.g. Why are my tomato leaves yellow?)...",
    micBtnText: "Voice",
    voiceActive: "Listening to your voice...",
    voiceStop: "Processing audio...",
    emptyState: "No messages yet. Select a topic below to start chatting!",
    suggestions: [
      {
        title: "Fertilizer Plan",
        prompt: "Can you make a balanced N-P-K fertilizer application plan for my paddy field based on average clayey soil?",
        desc: "Optimal N-P-K application guidelines"
      },
      {
        title: "Pest Diagnosis",
        prompt: "My cotton crop is showing white powdery spots under the leaves. What organic treatment can I apply?",
        desc: "Organic/chemical cures for crop spot"
      },
      {
        title: "Crop Suitability",
        prompt: "My soil pH is around 6.5 with medium moisture. Which commercial crops are best suited for this season?",
        desc: "Match crop to soil properties"
      },
      {
        title: "Weather Advisory",
        prompt: "Show me the weather advisory and crop protection guidelines for my area for the next 3 days.",
        desc: "Rain alerts & farming recommendations"
      }
    ],
    typingIndicator: "Saathi AI is thinking...",
    sendError: "Failed to send message. Please check your connection.",
    alerts: {
      uploadError: "Failed to upload attachment.",
      micPermissionTitle: "Microphone Permission Required",
      micPermissionDesc: "Please enable microphone access in settings to use voice typing.",
      micError: "Unable to start recording right now.",
      attachError: "Unable to attach this file.",
      voiceRecorded: "[Voice Recorded]"
    }
  },
  chatHistory: {
    title: "Chat History",
    subtitle: "Review and manage your AI conversations",
    searchPlaceholder: "Search sessions...",
    emptyChats: "No chat sessions yet",
    emptyChatsDesc: "Start a conversation with Saathi AI to see your history here.",
    deleteConfirmTitle: "Delete Session",
    deleteConfirmDesc: "Are you sure you want to delete this chat session?",
    allSessions: "All Sessions",
    filterAdvisory: "Advisories",
    filterPest: "Pest Diagnosis",
    newChat: "New Chat",
    creating: "Creating...",
    noSessionsFound: "No sessions found",
    tryDifferentSearch: "Try a different search term.",
    startNewChat: "Start New Chat",
    sessionsCount: "{count} sessions",
    msgCount: "{count} msgs",
    newSessionFailed: "Failed to create a new chat session. Please try again.",
    deleteSessionFailed: "Could not delete the session. Please try again."
  },
  history: {
    title: "Soil History",
    subtitle: "Monitor trends & metrics over time",
    rangeBtn: {
      "7d": "7 Days",
      "30d": "30 Days",
      "60d": "60 Days",
      "90d": "90 Days",
      "1y": "1 Year",
      all: "All Time"
    },
    avgParam: "Avg {parameter}",
    totalTests: "Total Tests",
    trend: "Trend",
    logHeading: "Test History Log ({range})",
    noRecords: "No Records",
    noTestsInRange: "No soil tests in the selected {range} range.",
    fieldLocations: "Field Locations",
    mappedTests: "{count} mapped tests",
    trendAnalysisSuffix: " Trend Analysis",
    noTrendData: "No Trend Data",
    insufficientTrendData: "Insufficient data to show trend for {range}.",
    updating: "Updating",
    modal: {
      title: "Test Details",
      metrics: "Metrics",
      healthScore: "Health Score",
      aiRecHeading: "AI Recommendation",
      insights: "Insights",
      naturalFertilizers: "Natural Fertilizers",
      chemicalFertilizers: "Chemical Fertilizers",
      location: "Location",
      coordinates: "Coordinates",
      locationUnavailable: "Location Unavailable",
      noCoordinates: "No coordinates recorded",
      exportReport: "Export Report"
    },
    parameters: {
      ph: {
        title: "pH Level",
        desc: "Soil acidity/alkalinity level",
        unit: "pH"
      },
      nitrogen: {
        title: "Nitrogen (N)",
        desc: "Promotes leaf growth & lush green color",
        unit: "mg/kg"
      },
      phosphorus: {
        title: "Phosphorus (P)",
        desc: "Enhances root development & flowering",
        unit: "mg/kg"
      },
      potassium: {
        title: "Potassium (K)",
        desc: "Increases disease resistance & crop quality",
        unit: "mg/kg"
      },
      moisture: {
        title: "Soil Moisture",
        desc: "Percentage of water content in soil",
        unit: "%"
      },
      temperature: {
        title: "Soil Temperature",
        desc: "Current temperature of the soil",
        unit: "°C"
      },
      ec: {
        title: "Electrical Conductivity (EC)",
        desc: "Indicates soluble salts in soil",
        unit: "dS/m"
      }
    },
    graphHeading: "Soil Nutrient Trends",
    insightsTitle: "Saathi Smart Insights",
    insightsList: [
      "⚠️ Nitrogen (N) levels are critically low in your North field. We recommend adding urea or cow dung compost.",
      "✅ Soil pH is stable at 6.8 which is ideal for rice, maize, and wheat cultivation.",
      "📈 Moisture level dropped 12% since last week. Consider scheduling irrigation tomorrow morning."
    ],
    fieldMap: "Farm Soil Mapping",
    noData: "No soil test records found. Pair Agni to run your first test!",
    testOnDate: "Test on {date}",
    alerts: {
      noDataTitle: "No Data",
      noDataDesc: "You need at least one soil test to export a report.",
      exportErrorTitle: "Export Error",
      exportErrorDesc: "Could not generate the PDF report."
    }
  },
  profile: {
    title: "My Profile",
    subtitle: "Manage your farm identity",
    stats: {
      soilTests: "Soil Tests",
      village: "Village",
      memberSince: "Member Since"
    },
    menu: {
      accountSettings: "Account Settings",
      security: "Security & Passwords",
      quickLinks: "Quick Links",
      buyAgni: "Buy Agni",
      readBlogs: "Read Blogs",
      appSettings: "App Settings & Theme",
      chatHistory: "Chat History",
      aboutSaathi: "About Saathi AI",
      logout: "Logout",
    },
    fields: {
      fullName: "Full Name",
      phone: "Phone Number",
      email: "Email Address",
      village: "Village / Location",
    },
    logoutModal: {
      title: "Logout?",
      desc: "Are you sure you want to log out of Saathi AI?",
      btn: "Logout"
    },
    updateSuccess: "Profile updated successfully!",
    saveChanges: "Save Changes",
    discard: "Discard",
    unsavedChanges: "Unsaved changes",
    security: "Security",
    changePassword: "Change Password",
    managedBy: "Managed by {provider}",
    sendResetLink: "Send reset link to your email",
    aiSettings: "AI Settings",
    aiPipelineControl: "AI Pipeline Control",
    aiPipelineDesc: "Enable automated AI analysis when syncing data from your Agni soil sensor.",
    privacyDataSettings: "Privacy & Data Settings",
    managePrivacy: "Manage Privacy & Data",
    privacyDesc: "Visibility, sharing, analytics, and emails",
    dataManagement: "Data Management",
    exportHistory: "Export Historical Data",
    exportDesc: "Download your soil tests as JSON or CSV",
    appActions: "Account Actions",
    footerText: "Saathi AI · Farmer First Technology",
    farmerId: "Farmer ID",
    joined: "Joined",
  },
  settings: {
    title: "Settings",
    subtitle: "Customize your Saathi AI experience",
    summary: {
      eyebrow: "PROFILE SETTINGS",
      title: "Your app preferences",
      theme: "Theme",
      themeDark: "Dark",
      themeLight: "Light",
      language: "Language",
      sync: "Sync",
      syncOn: "On",
      syncOff: "Off"
    },
    appearance: {
      title: "Appearance",
      subtitle: "Display and visual comfort",
      toggleLabel: "Dark Mode",
      toggleDesc: "Switch to dark theme for better low-light visibility"
    },
    languageSection: {
      title: "Language & Region",
      subtitle: "Choose the interface language",
      label: "Interface Language"
    },
    syncSection: {
      title: "Sync & Storage",
      subtitle: "Keep your soil test data backed up",
      label: "Auto Sync",
      desc: "Automatically sync soil test data when connected to the internet"
    },
    dataSection: {
      title: "Data Management",
      subtitle: "Download or move your account data",
      btnText: "Export All Data",
      btnDesc: "JSON file with soil tests and AI recommendations",
      exportAlertTitle: "Data Ready",
      exportAlertDesc: "Your data export has {count} records. Sharing now...",
      exportAlertFallback: "Records: {size}\n\nVisit saathiai.org/account to download your full data export.",
      exportFailed: "Failed to export data."
    },
    dangerZone: {
      title: "Danger Zone",
      subtitle: "Irreversible account actions",
      desc: "Irreversible actions — proceed with caution",
      deleteLabel: "Delete Account",
      deleteDesc: "Permanently delete your account and all data",
      deleteBtn: "Delete",
      deleteAlertTitle: "Delete Account?",
      deleteAlertDesc: "This will permanently delete your account, all soil tests, AI recommendations, and chat history. This cannot be undone."
    }
  },
  about: {
    title: "Saathi AI",
    navTitle: "Saathi AI",
    hero: {
      chipText: "Farmer-first agri intelligence",
      title: "Empowering Farmers with Organic Intelligence",
      body: "Saathi AI brings soil testing, AI guidance and Agni device insights together so every farmer can make faster, confident decisions.",
      growth: "Growth",
      ai: "AI",
      ruralReady: "Rural Ready"
    },
    mission: {
      eyebrow: "01 / MISSION",
      title: "Built to remove farming guesswork",
      cardTitle: "AI that respects soil, time and farmers.",
      cardBody: "Saathi AI exists to reduce long lab delays, make soil intelligence understandable, and help farmers improve productivity with practical recommendations that feel simple, local and trustworthy.",
      keywords: {
        soilFirst: "Soil-first",
        local: "Local",
        fast: "Fast",
        human: "Human"
      }
    },
    ecosystem: {
      eyebrow: "02 / ECOSYSTEM",
      title: "A complete farm intelligence companion",
      features: {
        soilAnalysis: {
          title: "Instant Soil Analysis",
          body: "Understand pH, NPK, moisture, EC and temperature without waiting for lab reports."
        },
        aiGuidance: {
          title: "AI Farming Guidance",
          body: "Get crop, fertilizer and care recommendations tailored to your field conditions."
        },
        fieldMapping: {
          title: "Smart Field Mapping",
          body: "Track soil health across farms with location-aware history and field insights."
        },
        langSupport: {
          title: "Local Language Support",
          body: "Designed for farmers who prefer simple guidance in familiar languages."
        },
        deviceIntegration: {
          title: "Agni Device Integration",
          body: "Connect the soil scanner and turn sensor readings into clear next steps."
        },
        smartRecommendations: {
          title: "Smart Recommendations",
          body: "Convert raw soil data into practical plans for better yield and lower waste."
        }
      }
    },
    scanner: {
      tag: "Real-time soil intelligence",
      title: "Agni Soil Scanner",
      body: "A portable field device that captures key soil signals and sends them into Saathi AI for clear, actionable guidance.",
      points: [
        "NPK, pH, EC, moisture and temperature readings",
        "Bluetooth workflow for rural field usage",
        "AI converts readings into farmer-friendly advice"
      ]
    },
    impact: {
      insight: "soil scan insight",
      langReady: "local language ready",
      labWait: "faster than lab wait",
      recEngine: "recommendation engine"
    },
    farmerCard: {
      title: "Simple enough for every farmer. Powerful enough for every field.",
      body: "The experience is built for rural accessibility: simple words, clear next steps, local language support, offline-friendly device flows, and guidance that does not require technical knowledge."
    },
    stack: {
      eyebrow: "03 / STACK",
      title: "Modern stack, grounded in agriculture",
      items: {
        aiPowered: {
          title: "AI Powered",
          body: "Soil-aware intelligence for personalized farm decisions."
        },
        smartSensors: {
          title: "Smart Sensors",
          body: "Agni scanner reads core soil signals in the field."
        },
        cloudAnalytics: {
          title: "Cloud Analytics",
          body: "History, insights and recommendations stay connected."
        },
        realtime: {
          title: "Real-time Processing",
          body: "Guidance is generated when the farmer needs it."
        }
      }
    },
    community: {
      eyebrow: "04 / COMMUNITY",
      title: "Grounded in trust, built by innovators",
      meetBuilders: "Meet the Builders",
      team: {
        nilambar: {
          name: "Nilambar Behera",
          role: "Founder & Lead Architect (IoT & AI LLM)",
          college: "Bhadrak Autonomous College, BCA"
        },
        sanatan: {
          name: "Sanatan Sethi",
          role: "Co-Founder & Mobile App Developer",
          college: "Bhadrak Autonomous College, BCA"
        }
      },
      testimonials: {
        mahendra: {
          name: "Mahendra Behera",
          subtitle: "Soro Village, Balasore",
          review: "I did not believe a phone app could understand my soil. But the instant Odia advice showed me why my paddy leaves turned yellow. Our yield was the healthiest in five years.",
          verified: "Verified Soil Scan"
        },
        ramamani: {
          name: "Ramamani Behera",
          subtitle: "Niali Village, Cuttack",
          review: "We used to wait two weeks for soil reports from the city. Now, with the scanner, we get recommendations immediately. It feels like having an agricultural expert in our pockets.",
          verified: "Verified Soil Scan"
        }
      }
    },
    connect: {
      eyebrow: "05 / CONNECT",
      title: "Talk to the Saathi AI team",
      address: "FMU-TBI, Balasore, Odisha, India"
    },
    footer: {
      builtWithCare: "Version 1.0.3 - Built with care for Farmers",
      copyright: "Copyright 2026 Agni Innovations"
    },
    contactForm: {
      fullName: "Full Name",
      emailAddress: "Email Address",
      message: "Message",
      enterName: "Enter your name",
      enterEmail: "Enter your email",
      enterMessage: "Enter your message",
      sendButton: "Send Message",
      sending: "Sending...",
      success: "Message sent successfully!",
      error: "Failed to send message",
      missingFields: "Missing Fields",
      fillAllFields: "Please fill all fields before sending.",
      invalidEmail: "Invalid Email",
      enterValidEmail: "Please enter a valid email address.",
      nameTooLong: "Name is too long (max 100 characters).",
      emailTooLong: "Email is too long (max 255 characters).",
      messageTooLong: "Message is too long (max 5000 characters)."
    }
  }
};
