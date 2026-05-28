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
      sendBtn: "Send Verification Code",
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
      cardSubtitle: "Instant NPK & Soil Test",
      statusNotConnected: "Agni Disconnected",
      statusConnecting: "Connecting to Agni...",
      statusConnected: "Agni Connected",
      tapToScan: "Tap to scan devices",
      activeDetails: "Tap to check details & parameters",
      deviceFound: "Agni Device Found! Tap to pair",
      searching: "Searching for Agni...",
      actionConnect: "Connect Now",
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
    features: {
      title: "Saathi Features",
      subtitle: "Comprehensive agronomic solutions",
      soilReport: {
        title: "Soil Reports",
        desc: "Instant N-P-K, pH & moisture data right from your farm",
        detailTitle: "Soil Reports",
        detailDesc: "Get instant access to detailed metrics from your farm, including pH, N-P-K, moisture, and organic carbon. Track your soil history over time to make precise, data-driven decisions."
      },
      aiAdvisory: {
        title: "AI Advisory",
        desc: "Ask any farming query in your regional native language",
        detailTitle: "AI Advisor",
        detailDesc: "Get 24/7 localized support for your farming queries. Ask about crop diseases, modern cultivation techniques, or Government schemes in your native language, complete with voice playback."
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
      }
    },
    ticker: {
      title: "IMPORTANT UPDATE",
      message: "Monsoon advisory released for your region. Check Saathi AI weather forecast now to manage crop drainage!"
    }
  },
  connect: {
    title: "Agni Connection",
    subtitle: "Manage your smart soil tester",
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
    inputPlaceholder: "Ask Saathi AI (e.g. Why are my tomato leaves turning yellow?)...",
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
    sendError: "Failed to send message. Please check your connection."
  },
  chatHistory: {
    title: "Chat History",
    subtitle: "Review your conversations with Saathi AI",
    searchPlaceholder: "Search past conversations...",
    emptyChats: "No conversations found. Start a new chat!",
    deleteConfirmTitle: "Delete Chat?",
    deleteConfirmDesc: "This conversation will be permanently deleted.",
    allSessions: "All Sessions",
    filterAdvisory: "Advisories",
    filterPest: "Pest Diagnosis"
  },
  history: {
    title: "Soil History",
    subtitle: "Monitor trends & metrics over time",
    rangeBtn: {
      "7d": "7 Days",
      "30d": "30 Days",
      all: "All Time"
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
      buyAgni: "Buy Agni Soil Tester",
      appSettings: "App Settings & Theme",
      chatHistory: "Past Chat Advisories",
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
    title: "About Saathi AI",
    subtitle: "Pioneering smart rural agriculture",
    heroHeading: "Empowering Farmers Through Intelligence",
    heroDesc: "Saathi AI brings together advanced hardware sensors and personalized localized intelligence to optimize fertilizer usage, protect crop ecosystems, and maximize yields.",
    stats: {
      activeFarmers: "Active Farmers",
      testsRun: "Tests Conducted",
      accuracy: "AI Accuracy"
    },
    techTitle: "Our Technology Stack",
    techCards: [
      {
        title: "Agni BLE Sensor",
        desc: "Advanced multi-parameter hardware probes that measure 14 physical and chemical indicators directly in the field."
      },
      {
        title: "Saathi Agronomic Model",
        desc: "A localized custom LLM fine-tuned on multi-decadal peer-reviewed soil data, agricultural studies, and regional guidelines."
      },
      {
        title: "Voice First Architecture",
        desc: "Accessible voice capture and audio playback designed to let rural farmers communicate naturally without writing."
      }
    ],
    teamTitle: "The Builders",
    teamSubtitle: "Handcrafting solutions for rural communities",
    teamBio: "We are a team of agricultural researchers, software engineers, and hardware designers committed to making soil science accessible to every farmer, everywhere.",
    feedbackTitle: "Farmer Feedback",
    feedbackSubtitle: "Hear from our early champions in rural areas",
    feedback: [
      {
        farmer: "Ramesh Pradhan",
        location: "Khordha, Odia",
        quote: "Saathi AI told me exactly how much urea to buy. I saved ₹4,200 in my very first crop cycle!"
      },
      {
        farmer: "Sanjay Verma",
        location: "Hoshangabad, MP",
        quote: "Testing my soil used to take 3 weeks at the government lab. Now my Agni device does it in 60 seconds."
      }
    ],
    contactForm: {
      title: "Get In Touch",
      subtitle: "Have suggestions, device inquiries, or questions?",
      name: "Your Name",
      phone: "Phone Number",
      email: "Email Address",
      message: "Your Message",
      submitBtn: "Send Message",
      successTitle: "Message Received",
      successDesc: "Thank you! Our agricultural support team will contact you shortly.",
      validationError: "Please fill in all the contact form fields."
    }
  }
};
