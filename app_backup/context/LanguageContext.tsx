import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Language = 'English' | 'Odia' | 'Hindi';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  English: {
    // ------------------------------------
    // TAB BAR & NAVIGATION
    // ------------------------------------
    'Dashboard': 'Dashboard',
    'Live Connect': 'Live Connect',
    'History': 'History',
    'AI Chat': 'AI Chat',
    'About': 'About',

    // ------------------------------------
    // INDEX.TSX (Dashboard)
    // ------------------------------------
    'The': 'The',
    'Organic': 'Organic',
    'Intelligence': 'Intelligence',
    'Platform': 'Platform',
    'Empower your farming with AI-driven soil analysis. Connect your Agni device, get instant soil health insights, and receive personalized recommendations in your local language.': 'Empower your farming with AI-driven soil analysis. Connect your Agni device, get instant soil health insights, and receive personalized recommendations in your local language.',
    'Connect Your Device': 'Connect Your Device',
    'View Demo': 'View Demo',
    'Farms Analyzed': 'Farms Analyzed',
    'Soil Tests': 'Soil Tests',
    'AI Recommendations': 'AI Recommendations',
    'Why Choose Saathi AI?': 'Why Choose Saathi AI?',
    'Advanced technology meets traditional farming wisdom to maximize your harvest potential.': 'Advanced technology meets traditional farming wisdom to maximize your harvest potential.',
    'Instant Analysis': 'Instant Analysis',
    'Get comprehensive soil health data in seconds with our Agni device.': 'Get comprehensive soil health data in seconds with our Agni device.',
    'Local Language': 'Local Language',
    'Receive recommendations in Odia, Hindi, or English with voice support.': 'Receive recommendations in Odia, Hindi, or English with voice support.',
    'Sustainable Farming': 'Sustainable Farming',
    'AI-powered organic fertilizer recommendations for better crop yield.': 'AI-powered organic fertilizer recommendations for better crop yield.',
    'Field Mapping': 'Field Mapping',
    'Visualize your soil data on interactive maps for better field management.': 'Visualize your soil data on interactive maps for better field management.',
    'How It Works': 'How It Works',
    'Simple 3-step process to transform your farming approach': 'Simple 3-step process to transform your farming approach',
    'Scan Soil with Agni': 'Scan Soil with Agni',
    'Insert your Agni device into the soil and press the scan button for instant analysis.': 'Insert your Agni device into the soil and press the scan button for instant analysis.',
    'Connect to Saathi': 'Connect to Saathi',
    'Automatically sync your data via Bluetooth to the Saathi AI platform.': 'Automatically sync your data via Bluetooth to the Saathi AI platform.',
    'Get AI Recommendations (Index)': 'Get AI Recommendations', // Renamed slightly to avoid conflict in key management
    'Receive personalized fertilizer advice in your local language with voice playback.': 'Receive personalized fertilizer advice in your local language with voice playback.',
    'Connect Device': 'Connect Device',
    'Pair and connect your Agni soil sensor device via Bluetooth.': 'Pair and connect your Agni soil sensor device via Bluetooth.',
    'Take Sample': 'Take Sample',
    'Insert the sensor into the soil and press the analysis button on the device.': 'Insert the sensor into the soil and press the analysis button on the device.',
    'Get Results': 'Get Results',
    'Receive instant, personalized soil health and fertilizer recommendations.': 'Receive instant, personalized soil health and fertilizer recommendations.',
    // ------------------------------------
    // LIVE-CONNECT.TSX
    // ------------------------------------
    'Connect your Agni device to analyze soil data in real-time': 'Connect your Agni device to analyze soil data in real-time',
    'Available Devices:': 'Available Devices:',
    'Scanning for devices...': 'Scanning for devices...',
    'Tap to Connect': 'Tap to Connect',
    'Connected': 'Connected',
    'Scan for Devices': 'Scan for Devices',
    'Scanning...': 'Scanning...',
    'Load Mock Data': 'Load Mock Data',
    'Disconnect': 'Disconnect',
    'Soil Analysis Data': 'Soil Analysis Data',
    'pH Level (Data)': 'pH Level', // Renamed slightly to avoid conflict in key management
    'Nitrogen': 'Nitrogen',
    'Phosphorus': 'Phosphorus',
    'Potassium': 'Potassium',
    'Moisture': 'Moisture',
    'Temperature': 'Temperature',
    'EC (Electrical Conductivity)': 'EC (Electrical Conductivity)',

    // ------------------------------------
    // HISTORY.TSX
    // ------------------------------------
    'History & Analytics': 'History & Analytics',
    'Track your soil health trends and field performance over time': 'Track your soil health trends and field performance over time',
    'Last 30 Days': 'Last 30 Days',
    'Export': 'Export',
    'Total Tests': 'Total Tests',
    'Avg pH': 'Avg pH',
    'pH Trend': 'pH Trend',
    'Recent Soil Tests': 'Recent Soil Tests',
    'Date': 'Date',
    'Location': 'Location',
    'Status': 'Status',
    'Neutral': 'Neutral',
    'Acidic': 'Acidic',
    'Alkaline': 'Alkaline',

    // ------------------------------------
    // AI-CHAT.TSX
    // ------------------------------------
    'Saathi AI Assistant': 'Saathi AI Assistant',
    'Analyze Soil': 'Analyze Soil',
    'Ask me anything about soil health and farming.': 'Ask me anything about soil health and farming.',
    "Hello! I'm your Saathi AI Assistant. Ask me anything about soil health and farming in Odia, Hindi, or English.": "Hello! I'm your Saathi AI Assistant. Ask me anything about soil health and farming in Odia, Hindi, or English.",
    'Type your question or command...': 'Type your question or command...',
    'Thinking...': 'Thinking...',
    'Sorry, no response.': 'Sorry, no response.',
    'Stop Speaking': 'Stop Speaking',
    'Listen to Response': 'Listen to Response',
    
    // ------------------------------------
    // ABOUT.TSX
    // ------------------------------------
    'About Saathi AI': 'About Saathi AI',
    'Revolutionizing agriculture through organic intelligence, empowering farmers with AI-driven insights for sustainable farming practices.': 'Revolutionizing agriculture through organic intelligence, empowering farmers with AI-driven insights for sustainable farming practices.',
    'Our Mission': 'Our Mission',
    'At Agni Innovations, we believe that technology should serve those who feed the world. Our mission is to bridge the gap between advanced agricultural science and traditional farming wisdom, making precision agriculture accessible to every farmer.': 'At Agni Innovations, we believe that technology should serve those who feed the world. Our mission is to bridge the gap between advanced agricultural science and traditional farming wisdom, making precision agriculture accessible to every farmer.',
    'Saathi AI combines the power of artificial intelligence with deep understanding of local farming practices, delivering personalized recommendations in farmers\' native languages.': 'Saathi AI combines the power of artificial intelligence with deep understanding of local farming practices, delivering personalized recommendations in farmers\' native languages.',
    'Years of Research': 'Years of Research',
    'Farming Partners': 'Farming Partners',
    'How Our Technology Works': 'How Our Technology Works',
    'Advanced Sensors': 'Advanced Sensors',
    'Multi-parameter soil analysis with laboratory-grade accuracy': 'Multi-parameter soil analysis with laboratory-grade accuracy',
    'AI Processing': 'AI Processing',
    'Machine learning algorithms trained on local soil data': 'Machine learning algorithms trained on local soil data',
    'Local Language Support (About)': 'Local Language Support', // Renamed slightly to avoid conflict in key management
    'Recommendations in Odia, Hindi, and English with audio support': 'Recommendations in Odia, Hindi, and English with audio support',
    'Meet Our Team': 'Meet Our Team',
    'Project Manager & Hardware Manufacturer': 'Project Manager & Hardware Manufacturer',
    'BCA graduate with interest in agricultural technology solutions': 'BCA graduate with interest in agricultural technology solutions',
    'Software Engineer & AI Specialist': 'Software Engineer & AI Specialist',
    'Software engineer with experties in web and mobile app development': 'Software engineer with experties in web and mobile app development',
    'What Farmers Say': 'What Farmers Say',
    '"Saathi AI helped me understand my soil better. The Odia recommendations made it so easy to follow, and my crop yield improved by 30% this season."': '"Saathi AI helped me understand my soil better. The Odia recommendations made it so easy to follow, and my crop yield improved by 30% this season."',
    'Get In Touch': 'Get In Touch',
    'Have a question or feedback? Reach out to our team.': 'Have a question or feedback? Reach out to our team.',
    'Name': 'Name',
    'Email': 'Email',
    'Message': 'Message',
    'Send Message': 'Send Message',
    'Sending...': 'Sending...',
    'Please fill in all fields.': 'Please fill in all fields.',
    'Success! Your message has been sent to the recipients.': 'Success! Your message has been sent to the recipients.',
    'Submission Failed:': 'Submission Failed:',
    'Could not connect to the form handling service.': 'Could not connect to the form handling service.',
  },
  Odia: {
    // ------------------------------------
    // TAB BAR & NAVIGATION
    // ------------------------------------
    'Dashboard': 'ଡାସବୋର୍ଡ',
    'Live Connect': 'ସିଧାସଳଖ ସଂଯୋଗ',
    'History': 'ଇତିହାସ',
    'AI Chat': 'ଏ.ଆଇ ଚାଟ୍',
    'About': 'ବିଷୟରେ',

    // ------------------------------------
    // INDEX.TSX (Dashboard)
    // ------------------------------------
    'The': ' ',
    'Organic ': 'ଜୈବିକ ',
    'Intelligence ': 'ଇଣ୍ଟେଲିଜେନ୍ସ ',
    'Platform': 'ପ୍ଲାଟଫର୍ମ',
    'Empower your farming with AI-driven soil analysis. Connect your Agni device, get instant soil health insights, and receive personalized recommendations in your local language.': 'AI-ନିର୍ଦ୍ଦେଶିତ ମାଟି ବିଶ୍ଳେଷଣ ସହିତ ଆପଣଙ୍କ ଚାଷକୁ ସଶକ୍ତ କରନ୍ତୁ। ଆପଣଙ୍କ ଅଗ୍ନି ଡିଭାଇସକୁ ସଂଯୋଗ କରନ୍ତୁ, ତୁରନ୍ତ ମାଟି ସ୍ୱାସ୍ଥ୍ୟ ବିଷୟରେ ଜାଣନ୍ତୁ ଏବଂ ଆପଣଙ୍କ ସ୍ଥାନୀୟ ଭାଷାରେ ବ୍ୟକ୍ତିଗତ ପରାମର୍ଶ ପାଆନ୍ତୁ।',
    'Connect Agni': 'Agni ଡିଭାଇସ୍ ସଂଯୋଗ କରନ୍ତୁ',
    'View Demo': 'ଡେମୋ ଦେଖନ୍ତୁ',
    'Farms Analyzed': 'ବିଶ୍ଳେଷଣ କରାଯାଇଥିବା ଫାର୍ମ',
    'Soil Tests': 'ମାଟି ପରୀକ୍ଷା',
    'AI Recommendations': 'ଏ.ଆଇ ପରାମର୍ଶ',
    'Why Choose Saathi AI?': 'କାହିଁକି ସାଥୀ AI ବାଛନ୍ତୁ?',
    'Advanced technology meets traditional farming wisdom to maximize your harvest potential.': 'ଉନ୍ନତ ପ୍ରଯୁକ୍ତିବିଦ୍ୟା ପାରମ୍ପରିକ ଚାଷ ଜ୍ଞାନ ସହିତ ମିଶି ଆପଣଙ୍କ ଅମଳ ସମ୍ଭାବନାକୁ ବଢ଼ାଏ।',
    'Instant Analysis': 'ତୁରନ୍ତ ବିଶ୍ଳେଷଣ',
    'Get comprehensive soil health data in seconds with our Agni device.': 'ଆମର ଅଗ୍ନି ଡିଭାଇସ୍ ସହିତ କିଛି ସେକେଣ୍ଡରେ ସମ୍ପୂର୍ଣ୍ଣ ମାଟି ସ୍ୱାସ୍ଥ୍ୟ ତଥ୍ୟ ପାଆନ୍ତୁ।',
    'Local Language': 'ସ୍ଥାନୀୟ ଭାଷା',
    'Receive recommendations in Odia, Hindi, or English with voice support.': 'ଭଏସ୍ ସପୋର୍ଟ ସହିତ ଓଡିଆ, ହିନ୍ଦୀ, କିମ୍ବା ଇଂରାଜୀରେ ପରାମର୍ଶ ପାଆନ୍ତୁ।',
    'Sustainable Farming': 'ସ୍ଥାୟୀ ଚାଷ',
    'AI-powered organic fertilizer recommendations for better crop yield.': 'ଉନ୍ନତ ଫସଲ ଅମଳ ପାଇଁ AI-ସକ୍ଷମ ଜୈବ ସାର ପରାମର୍ଶ।',
    'Field Mapping': 'କ୍ଷେତ୍ର ମାନଚିତ୍ରଣ',
    'Visualize your soil data on interactive maps for better field management.': 'ଉନ୍ନତ କ୍ଷେତ୍ର ପରିଚାଳନା ପାଇଁ ଇଣ୍ଟରାକ୍ଟିଭ୍ ମାନଚିତ୍ରରେ ଆପଣଙ୍କ ମାଟି ତଥ୍ୟ ଦେଖନ୍ତୁ।',
    'How It Works': 'ଏହା କିପରି କାମ କରେ',
    'Simple 3-step process to transform your farming approach': 'ଆପଣଙ୍କ ଚାଷ ପ୍ରଣାଳୀକୁ ରୂପାନ୍ତରିତ କରିବା ପାଇଁ ସରଳ ୩-ପଦକ୍ଷେପ ପ୍ରକ୍ରିୟା',
    'Scan Soil with Agni': 'ଅଗ୍ନି ସହିତ ମାଟି ସ୍କାନ୍ କରନ୍ତୁ',
    'Insert your Agni device into the soil and press the scan button for instant analysis.': 'ତୁରନ୍ତ ବିଶ୍ଳେଷଣ ପାଇଁ ଆପଣଙ୍କ ଅଗ୍ନି ଡିଭାଇସକୁ ମାଟିରେ ଭର୍ତ୍ତି କରନ୍ତୁ ଏବଂ ସ୍କାନ୍ ବଟନ୍ ଦବାନ୍ତୁ।',
    'Connect to Saathi': 'ସାଥୀ ସହିତ ସଂଯୋଗ କରନ୍ତୁ',
    'Automatically sync your data via Bluetooth to the Saathi AI platform.': 'ବ୍ଲୁଟୁଥ୍ ମାଧ୍ୟମରେ ଆପଣଙ୍କ ତଥ୍ୟକୁ ସାଥୀ AI ପ୍ଲାଟଫର୍ମ ସହିତ ସ୍ୱୟଂଚାଳିତ ଭାବରେ ସିଙ୍କ୍ କରନ୍ତୁ।',
    'Get AI Recommendations (Index)': 'AI ପରାମର୍ଶ ପାଆନ୍ତୁ',
    'Receive personalized fertilizer advice in your local language with voice playback.': 'ଭଏସ୍ ପ୍ଲେବ୍ୟାକ୍ ସହିତ ଆପଣଙ୍କ ସ୍ଥାନୀୟ ଭାଷାରେ ବ୍ୟକ୍ତିଗତ ସାର ପରାମର୍ଶ ପାଆନ୍ତୁ।',
    'Connect Device': 'ଡିଭାଇସ୍ ସଂଯୋଗ କରନ୍ତୁ',
    'Pair and connect your Agni soil sensor device via Bluetooth.': 'ବ୍ଲୁଟୁଥ୍ ମାଧ୍ୟମରେ ଆପଣଙ୍କ ଅଗ୍ନି ମାଟି ସେନ୍ସର୍ ଡିଭାଇସ୍ କୁ ପେୟାର୍ ଏବଂ ସଂଯୋଗ କରନ୍ତୁ।',
    'Take Sample': 'ନମୁନା ନିଅନ୍ତୁ',
    'Insert the sensor into the soil and press the analysis button on the device.': 'ସେନ୍ସର୍ କୁ ମାଟିରେ ଭର୍ତ୍ତି କରନ୍ତୁ ଏବଂ ଡିଭାଇସ୍ ଉପରେ ବିଶ୍ଳେଷଣ ବଟନ୍ ଦବାନ୍ତୁ।',
    'Get Results': 'ଫଳାଫଳ ପାଆନ୍ତୁ',
    'Receive instant, personalized soil health and fertilizer recommendations.': 'ତୁରନ୍ତ, ବ୍ୟକ୍ତିଗତ ମାଟି ସ୍ୱାସ୍ଥ୍ୟ ଏବଂ ସାର ପରାମର୍ଶ ପାଆନ୍ତୁ।',

    // ------------------------------------
    // LIVE-CONNECT.TSX
    // ------------------------------------
    'Connect your Agni device to analyze soil data in real-time': 'ରିଅଲ୍-ଟାଇମ୍ ରେ ମାଟି ତଥ୍ୟ ବିଶ୍ଳେଷଣ କରିବା ପାଇଁ ଆପଣଙ୍କ ଅଗ୍ନି ଡିଭାଇସ୍ ସଂଯୋଗ କରନ୍ତୁ',
    'Available Devices:': 'ଉପଲବ୍ଧ ଡିଭାଇସ୍‍:',
    'Scanning for devices...': 'ଡିଭାଇସ୍ ଖୋଜା ଚାଲିଛି...',
    'Tap to Connect': 'ସଂଯୋଗ କରିବାକୁ ଟ୍ୟାପ୍ କରନ୍ତୁ',
    'Connected': 'ସଂଯୁକ୍ତ',
    'Scan for Devices': 'ଡିଭାଇସ୍ ଖୋଜନ୍ତୁ',
    'Scanning...': 'ସ୍କାନିଂ ଚାଲିଛି...',
    'Load Mock Data': 'ମକ୍ ତଥ୍ୟ ଲୋଡ୍ କରନ୍ତୁ',
    'Disconnect': 'ସଂଯୋଗ ବିଚ୍ଛିନ୍ନ କରନ୍ତୁ',
    'Soil Analysis Data': 'ମାଟି ବିଶ୍ଳେଷଣ ତଥ୍ୟ',
    'pH Level (Data)': 'pH ସ୍ତର',
    'Nitrogen': 'ନାଇଟ୍ରୋଜେନ୍',
    'Phosphorus': 'ଫସଫରସ୍',
    'Potassium': 'ପୋଟାସିଅମ୍',
    'Moisture': 'ଆର୍ଦ୍ରତା',
    'Temperature': 'ତାପମାତ୍ରା',
    'EC (Electrical Conductivity)': 'EC (ବିଦ୍ୟୁତ୍ ପରିବାହିତା)',

    // ------------------------------------
    // HISTORY.TSX
    // ------------------------------------
    'History & Analytics': 'ଇତିହାସ ଏବଂ ବିଶ୍ଳେଷଣ',
    'Track your soil health trends and field performance over time': 'ସମୟ ସହିତ ଆପଣଙ୍କ ମାଟି ସ୍ୱାସ୍ଥ୍ୟ ଧାରା ଏବଂ କ୍ଷେତ୍ର କାର୍ଯ୍ୟଦକ୍ଷତା ଟ୍ରାକ୍ କରନ୍ତୁ',
    'Last 30 Days': 'ଶେଷ ୩୦ ଦିନ',
    'Export': 'ରପ୍ତାନି',
    'Total Tests': 'ମୋଟ ପରୀକ୍ଷା',
    'Avg pH': 'ହାରାହାରି pH',
    'pH Trend': 'pH ଧାରା',
    'Recent Soil Tests': 'ସମ୍ପ୍ରତି ମାଟି ପରୀକ୍ଷା',
    'Date': 'ତାରିଖ',
    'Location': 'ସ୍ଥାନ',
    'Status': 'ସ୍ଥିତି',
    'Neutral': 'ନିରପେକ୍ଷ',
    'Acidic': 'ଅମ୍ଳୀୟ',
    'Alkaline': 'କ୍ଷାରୀୟ',

    // ------------------------------------
    // AI-CHAT.TSX
    // ------------------------------------
    'Saathi AI Assistant': 'ସାଥୀ AI ସହାୟକ',
    'Analyze Soil': 'ମାଟି ବିଶ୍ଳେଷଣ କରନ୍ତୁ',
    'Ask me anything about soil health and farming.': 'ମାଟି ସ୍ୱାସ୍ଥ୍ୟ ଏବଂ ଚାଷ ବିଷୟରେ ମୋତେ ଯାହାବି ପଚାରନ୍ତୁ।',
    "Hello! I'm your Saathi AI Assistant. Ask me anything about soil health and farming in Odia, Hindi, or English.": 'ହେଲୋ! ମୁଁ ଆପଣଙ୍କ ସାଥୀ AI ସହାୟକ। ମାଟି ସ୍ୱାସ୍ଥ୍ୟ ଏବଂ ଚାଷ ବିଷୟରେ ଓଡିଆ, ହିନ୍ଦୀ, କିମ୍ବା ଇଂରାଜୀରେ ମୋତେ ଯାହାବି ପଚାରନ୍ତୁ।',
    'Type your question or command...': 'ଆପଣଙ୍କ ପ୍ରଶ୍ନ ବା ନିର୍ଦ୍ଦେଶ ଲେଖନ୍ତୁ...',
    'Thinking...': 'ଚିନ୍ତା କରାଯାଉଛି...',
    'Sorry, no response.': 'ଦୁଃଖିତ, କୌଣସି ଉତ୍ତର ନାହିଁ।',
    'Stop Speaking': 'କହିବା ବନ୍ଦ କରନ୍ତୁ',
    'Listen to Response': 'ଉତ୍ତର ଶୁଣନ୍ତୁ',

    // ------------------------------------
    // ABOUT.TSX
    // ------------------------------------
    'About Saathi AI': 'ସାଥୀ AI ବିଷୟରେ',
    'Revolutionizing agriculture through organic intelligence, empowering farmers with AI-driven insights for sustainable farming practices.': 'ଜୈବିକ ଇଣ୍ଟେଲିଜେନ୍ସ ମାଧ୍ୟମରେ କୃଷିରେ ବିପ୍ଳବ ଆଣିବା, ସ୍ଥାୟୀ ଚାଷ ପ୍ରଣାଳୀ ପାଇଁ AI-ନିର୍ଦ୍ଦେଶିତ ଅନ୍ତର୍ନିହିତ ସୂଚନା ସହିତ ଚାଷୀମାନଙ୍କୁ ସଶକ୍ତ କରିବା।',
    'Our Mission': 'ଆମର ଲକ୍ଷ୍ୟ',
    'At Agni Innovations, we believe that technology should serve those who feed the world. Our mission is to bridge the gap between advanced agricultural science and traditional farming wisdom, making precision agriculture accessible to every farmer.': 'ଅଗ୍ନି ଇନୋଭେସନ୍ସରେ, ଆମେ ବିଶ୍ୱାସ କରୁ ଯେ ପ୍ରଯୁକ୍ତିବିଦ୍ୟା ସେବା କରିବା ଉଚିତ୍ ଯେଉଁମାନେ ବିଶ୍ୱକୁ ଖାଦ୍ୟ ଦିଅନ୍ତି। ଉନ୍ନତ କୃଷି ବିଜ୍ଞାନ ଏବଂ ପାରମ୍ପରିକ ଚାଷ ଜ୍ଞାନ ମଧ୍ୟରେ ଥିବା ବ୍ୟବଧାନକୁ ପୂରଣ କରିବା ଏବଂ ପ୍ରତ୍ୟେକ ଚାଷୀଙ୍କ ପାଇଁ ସଠିକ୍ କୃଷିକୁ ସୁଲଭ କରିବା ଆମର ଲକ୍ଷ୍ୟ।',
    'Saathi AI combines the power of artificial intelligence with deep understanding of local farming practices, delivering personalized recommendations in farmers\' native languages.': 'ସାଥୀ AI କୃତ୍ରିମ ବୁଦ୍ଧିମତ୍ତାର ଶକ୍ତିକୁ ସ୍ଥାନୀୟ ଚାଷ ପ୍ରଣାଳୀର ଗଭୀର ବୁଝାମଣା ସହିତ ମିଶାଇ, ଚାଷୀମାନଙ୍କର ମାତୃଭାଷାରେ ବ୍ୟକ୍ତିଗତ ପରାମର୍ଶ ପ୍ରଦାନ କରେ।',
    'Years of Research': 'ବର୍ଷର ଗବେଷଣା',
    'Farming Partners': 'ଚାଷ ଅଂଶୀଦାର',
    'How Our Technology Works': 'ଆମର ପ୍ରଯୁକ୍ତିବିଦ୍ୟା କିପରି କାମ କରେ',
    'Advanced Sensors': 'ଉନ୍ନତ ସେନ୍ସର',
    'Multi-parameter soil analysis with laboratory-grade accuracy': 'ଲାବୋରେଟୋରୀ-ଗ୍ରେଡ୍ ସଠିକତା ସହିତ ବହୁ-ପାରାମିଟର ମାଟି ବିଶ୍ଳେଷଣ',
    'AI Processing': 'AI ପ୍ରକ୍ରିୟାକରଣ',
    'Machine learning algorithms trained on local soil data': 'ସ୍ଥାନୀୟ ମାଟି ତଥ୍ୟ ଉପରେ ତାଲିମ ପ୍ରାପ୍ତ ମେସିନ୍ ଲର୍ଣ୍ଣିଂ ଆଲଗୋରିଦମ୍',
    'Local Language Support': 'ସ୍ଥାନୀୟ ଭାଷା ସହାୟତା',
    'Recommendations in Odia, Hindi, and English with audio support': 'ଅଡିଓ ସହାୟତା ସହିତ ଓଡିଆ, ହିନ୍ଦୀ ଏବଂ ଇଂରାଜୀରେ ପରାମର୍ଶ',
    'Meet Our Team': 'ଆମ ଦଳକୁ ଭେଟନ୍ତୁ',
    'Project Manager & Hardware Manufacturer': 'ପ୍ରୋଜେକ୍ଟ ମ୍ୟାନେଜର ଏବଂ ହାର୍ଡୱେର ଉତ୍ପାଦକ',
    'BCA graduate with interest in agricultural technology solutions': 'କୃଷି ପ୍ରଯୁକ୍ତିବିଦ୍ୟା ସମାଧାନରେ ଆଗ୍ରହୀ BCA ସ୍ନାତକ',
    'Software Engineer & AI Specialist': 'ସଫ୍ଟୱେର୍ ଇଞ୍ଜିନିୟର୍ ଏବଂ AI ବିଶେଷଜ୍ଞ',
    'Software engineer with experties in web and mobile app development': 'ୱେବ୍ ଏବଂ ମୋବାଇଲ୍ ଆପ୍ ବିକାଶରେ ବିଶେଷଜ୍ଞତା ଥିବା ସଫ୍ଟୱେର୍ ଇଞ୍ଜିନିୟର୍',
    'What Farmers Say': 'ଚାଷୀମାନେ କ’ଣ କୁହନ୍ତି',
    '"Saathi AI helped me understand my soil better. The Odia recommendations made it so easy to follow, and my crop yield improved by 30% this season."': '"ସାଥୀ AI ମୋତେ ମୋ ମାଟିକୁ ଭଲ ଭାବରେ ବୁଝିବାରେ ସାହାଯ୍ୟ କଲା। ଓଡିଆ ପରାମର୍ଶ ଅନୁସରଣ କରିବା ଏତେ ସହଜ ଥିଲା, ଏବଂ ଏହି ଋତୁରେ ମୋ ଫସଲ ଅମଳ ୩୦% ବୃଦ୍ଧି ପାଇଲା।"',
    '"The AI chat feature is amazing! I can ask questions anytime and get instant answers in my language. It\'s like having an agricultural expert in my pocket."': '"AI ଚାଟ୍ ବୈଶିଷ୍ଟ୍ୟଟି ଆଶ୍ଚର୍ଯ୍ୟଜନକ! ମୁଁ ଯେକୌଣସି ସମୟରେ ପ୍ରଶ୍ନ ପଚାରିପାରିବି ଏବଂ ମୋ ଭାଷାରେ ତୁରନ୍ତ ଉତ୍ତର ପାଇପାରିବି। ଏହା ମୋ ପକେଟରେ ଜଣେ କୃଷି ବିଶେଷଜ୍ଞ ରହିବା ଭଳି।"',
    'Get In Touch': 'ସମ୍ପର୍କରେ ରୁହନ୍ତୁ',
    'Have a question or feedback? Reach out to our team.': 'ଏକ ପ୍ରଶ୍ନ କିମ୍ବା ମତାମତ ଅଛି କି? ଆମ ଦଳ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ।',
    'Name': 'ନାମ',
    'Email': 'ଇମେଲ୍',
    'Message': 'ବାର୍ତ୍ତା',
    'Send Message': 'ବାର୍ତ୍ତା ପଠାନ୍ତୁ',
    'Sending...': 'ପଠାଯାଉଛି...',
    'Please fill in all fields.': 'ଦୟାକରି ସମସ୍ତ ଫିଲ୍ଡ ପୂରଣ କରନ୍ତୁ।',
    'Success! Your message has been sent to the recipients.': 'ସଫଳତା! ଆପଣଙ୍କ ବାର୍ତ୍ତା ଗ୍ରହୀତାଙ୍କୁ ପଠାଯାଇଛି।',
    'Submission Failed:': 'ଦାଖଲ ବିଫଳ ହେଲା:',
    'Could not connect to the form handling service.': 'ଫର୍ମ ହ୍ୟାଣ୍ଡଲିଂ ସେବା ସହିତ ସଂଯୋଗ ହୋଇପାରିଲା ନାହିଁ।',
  },
  Hindi: {
    // ------------------------------------
    // TAB BAR & NAVIGATION
    // ------------------------------------
    'Dashboard': 'डैशबोर्ड',
    'Live Connect': 'लाइव कनेक्ट',
    'History': 'इतिहास',
    'AI Chat': 'एआई चैट',
    'About': 'हमारे बारे में',

    // ------------------------------------
    // INDEX.TSX (Dashboard)
    // ------------------------------------
    'The': ' ',
    'Organic ': 'जैविक ',
    'Intelligence ': 'इंटेलिजेंस ',
    'Platform': 'प्लेटफॉर्म',
    'Empower your farming with AI-driven soil analysis. Connect your Agni device, get instant soil health insights, and receive personalized recommendations in your local language.': 'AI-संचालित मिट्टी विश्लेषण के साथ अपनी खेती को सशक्त बनाएं। अपने अग्नि डिवाइस को कनेक्ट करें, तुरंत मिट्टी स्वास्थ्य की जानकारी प्राप्त करें और अपनी स्थानीय भाषा में व्यक्तिगत सिफारिशें प्राप्त करें।',
    'Connect Agni': 'Agni डिवाइस कनेक्ट करें',
    'View Demo': 'डेमो देखें',
    'Farms Analyzed': 'विश्लेषित खेत',
    'Soil Tests': 'मिट्टी परीक्षण',
    'AI Recommendations': 'एआई सिफारिशें',
    'Why Choose Saathi AI?': 'साथी AI क्यों चुनें?',
    'Advanced technology meets traditional farming wisdom to maximize your harvest potential.': 'आपकी फसल की क्षमता को अधिकतम करने के लिए उन्नत तकनीक पारंपरिक खेती के ज्ञान से मिलती है।',
    'Instant Analysis': 'त्वरित विश्लेषण',
    'Get comprehensive soil health data in seconds with our Agni device.': 'हमारे अग्नि डिवाइस के साथ सेकंडों में व्यापक मिट्टी स्वास्थ्य डेटा प्राप्त करें।',
    'Local Language': 'स्थानीय भाषा',
    'Receive recommendations in Odia, Hindi, or English with voice support.': 'वॉयस सपोर्ट के साथ ओडिया, हिंदी, या अंग्रेजी में सिफारिशें प्राप्त करें।',
    'Sustainable Farming': 'टिकाऊ खेती',
    'AI-powered organic fertilizer recommendations for better crop yield.': 'बेहतर फसल उपज के लिए AI-संचालित जैविक उर्वरक सिफारिशें।',
    'Field Mapping': 'फील्ड मैपिंग',
    'Visualize your soil data on interactive maps for better field management.': 'बेहतर क्षेत्र प्रबंधन के लिए इंटरैक्टिव मानचित्रों पर अपने मिट्टी डेटा की कल्पना करें।',
    'How It Works': 'यह कैसे काम करता है',
    'Simple 3-step process to transform your farming approach': 'अपनी खेती के दृष्टिकोण को बदलने के लिए सरल 3-चरणीय प्रक्रिया',
    'Scan Soil with Agni': 'अग्नि के साथ मिट्टी स्कैन करें',
    'Insert your Agni device into the soil and press the scan button for instant analysis.': 'त्वरित विश्लेषण के लिए अपने अग्नि डिवाइस को मिट्टी में डालें और स्कैन बटन दबाएं।',
    'Connect to Saathi': 'साथी से कनेक्ट करें',
    'Automatically sync your data via Bluetooth to the Saathi AI platform.': 'ब्लूटूथ के माध्यम से साथी एआई प्लेटफॉर्म पर स्वचालित रूप से अपना डेटा सिंक करें।',
    'Get AI Recommendations (Index)': 'एआई सिफारिशें प्राप्त करें',
    'Receive personalized fertilizer advice in your local language with voice playback.': 'वॉयस प्लेबैक के साथ अपनी स्थानीय भाषा में व्यक्तिगत उर्वरक सलाह प्राप्त करें।',
    'Connect Device': 'डिवाइस कनेक्ट करें',
    'Pair and connect your Agni soil sensor device via Bluetooth.': 'ब्लूटूथ के माध्यम से अपने अग्नि मिट्टी सेंसर डिवाइस को पेयर और कनेक्ट करें।',
    'Take Sample': 'नमूना लें',
    'Insert the sensor into the soil and press the analysis button on the device.': 'सेंसर को मिट्टी में डालें और डिवाइस पर विश्लेषण बटन दबाएं।',
    'Get Results': 'परिणाम प्राप्त करें',
    'Receive instant, personalized soil health and fertilizer recommendations.': 'तुरंत, व्यक्तिगत मिट्टी स्वास्थ्य और उर्वरक सिफारिशें प्राप्त करें।',

    // ------------------------------------
    // LIVE-CONNECT.TSX
    // ------------------------------------
    'Connect your Agni device to analyze soil data in real-time': 'वास्तविक समय में मिट्टी डेटा का विश्लेषण करने के लिए अपने अग्नि डिवाइस को कनेक्ट करें',
    'Available Devices:': 'उपलब्ध डिवाइस:',
    'Scanning for devices...': 'डिवाइस स्कैन किए जा रहे हैं...',
    'Tap to Connect': 'कनेक्ट करने के लिए टैप करें',
    'Connected': 'कनेक्टेड',
    'Scan for Devices': 'डिवाइस स्कैन करें',
    'Scanning...': 'स्कैन किया जा रहा है...',
    'Load Mock Data': 'मॉक डेटा लोड करें',
    'Disconnect': 'डिस्कनेक्ट करें',
    'Soil Analysis Data': 'मिट्टी विश्लेषण डेटा',
    'pH Level (Data)': 'पीएच स्तर',
    'Nitrogen': 'नाइट्रोजन',
    'Phosphorus': 'फास्फोरस',
    'Potassium': 'पोटेशियम',
    'Moisture': 'नमी',
    'Temperature': 'तापमान',
    'EC (Electrical Conductivity)': 'ईसी (विद्युत चालकता)',

    // ------------------------------------
    // HISTORY.TSX
    // ------------------------------------
    'History & Analytics': 'इतिहास और विश्लेषण',
    'Track your soil health trends and field performance over time': 'समय के साथ अपनी मिट्टी के स्वास्थ्य के रुझान और क्षेत्र के प्रदर्शन को ट्रैक करें',
    'Last 30 Days': 'पिछले 30 दिन',
    'Export': 'निर्यात',
    'Total Tests': 'कुल परीक्षण',
    'Avg pH': 'औसत पीएच',
    'pH Trend': 'पीएच प्रवृत्ति',
    'Recent Soil Tests': 'हालिया मिट्टी परीक्षण',
    'Date': 'तारीख',
    'Location': 'स्थान',
    'Status': 'स्थिति',
    'Neutral': 'तटस्थ',
    'Acidic': 'अम्लीय',
    'Alkaline': 'क्षारीय',

    // ------------------------------------
    // AI-CHAT.TSX
    // ------------------------------------
    'Saathi AI Assistant': 'साथी एआई सहायक',
    'Analyze Soil': 'मिट्टी का विश्लेषण करें',
    'Ask me anything about soil health and farming.': 'मुझसे मिट्टी के स्वास्थ्य और खेती के बारे में कुछ भी पूछें।',
    "Hello! I'm your Saathi AI Assistant. Ask me anything about soil health and farming in Odia, Hindi, or English.": 'नमस्ते! मैं आपका साथी एआई सहायक हूँ। मुझसे ओडिया, हिंदी, या अंग्रेजी में मिट्टी के स्वास्थ्य और खेती के बारे में कुछ भी पूछें।',
    'Type your question or command...': 'अपना प्रश्न या कमांड टाइप करें...',
    'Thinking...': 'सोचा जा रहा है...',
    'Sorry, no response.': 'क्षमा करें, कोई प्रतिक्रिया नहीं।',
    'Stop Speaking': 'बोलना बंद करें',
    'Listen to Response': 'प्रतिक्रिया सुनें',

    // ------------------------------------
    // ABOUT.TSX
    // ------------------------------------
    'About Saathi AI': 'साथी एआई के बारे में',
    'Revolutionizing agriculture through organic intelligence, empowering farmers with AI-driven insights for sustainable farming practices.': 'जैविक बुद्धिमत्ता के माध्यम से कृषि में क्रांति लाना, किसानों को टिकाऊ खेती के तरीकों के लिए एआई-संचालित अंतर्दृष्टि के साथ सशक्त बनाना।',
    'Our Mission': 'हमारा मिशन',
    'At Agni Innovations, we believe that technology should serve those who feed the world. Our mission is to bridge the gap between advanced agricultural science and traditional farming wisdom, making precision agriculture accessible to every farmer.': 'अग्नि इनोवेशन्स में, हम मानते हैं कि प्रौद्योगिकी को उनकी सेवा करनी चाहिए जो दुनिया को खिलाते हैं। हमारा मिशन उन्नत कृषि विज्ञान और पारंपरिक खेती के ज्ञान के बीच की खाई को पाटना है, जिससे सटीक कृषि हर किसान के लिए सुलभ हो सके।',
    'Saathi AI combines the power of artificial intelligence with deep understanding of local farming practices, delivering personalized recommendations in farmers\' native languages.': 'साथी एआई, कृत्रिम बुद्धिमत्ता की शक्ति को स्थानीय खेती के तरीकों की गहरी समझ के साथ जोड़ता है, जिससे किसानों की मूल भाषाओं में व्यक्तिगत सिफारिशें मिलती हैं।',
    'Years of Research': 'वर्षों का अनुसंधान',
    'Farming Partners': 'खेती भागीदार',
    'How Our Technology Works': 'हमारी तकनीक कैसे काम करती है',
    'Advanced Sensors': 'उन्नत सेंसर',
    'Multi-parameter soil analysis with laboratory-grade accuracy': 'प्रयोगशाला-ग्रेड सटीकता के साथ बहु-पैरामीटर मिट्टी विश्लेषण',
    'AI Processing': 'एआई प्रोसेसिंग',
    'Machine learning algorithms trained on local soil data': 'स्थानीय मिट्टी डेटा पर प्रशिक्षित मशीन लर्निंग एल्गोरिदम',
    'Local Language Support (About)': 'स्थानीय भाषा समर्थन',
    'Recommendations in Odia, Hindi, and English with audio support': 'ऑडियो समर्थन के साथ ओडिया, हिंदी, और अंग्रेजी में सिफारिशें',
    'Meet Our Team': 'हमारी टीम से मिलें',
    'Project Manager & Hardware Manufacturer': 'परियोजना प्रबंधक और हार्डवेयर निर्माता',
    'BCA graduate with interest in agricultural technology solutions': 'कृषि प्रौद्योगिकी समाधानों में रुचि के साथ बीसीए स्नातक',
    'Software Engineer & AI Specialist': 'सॉफ्टवेयर इंजीनियर और एआई विशेषज्ञ',
    'Software engineer with experties in web and mobile app development': 'वेब और मोबाइल ऐप विकास में विशेषज्ञता वाला सॉफ्टवेयर इंजीनियर',
    'What Farmers Say': 'किसान क्या कहते हैं',
    '"The AI chat feature is amazing! I can ask questions anytime and get instant answers in my language. It\'s like having an agricultural expert in my pocket."': '"AI चैट सुविधा कमाल की है! मैं कभी भी सवाल पूछ सकता हूँ और अपनी भाषा में तुरंत जवाब पा सकता हूँ। यह ऐसा है जैसे मेरी जेब में कोई कृषि विशेषज्ञ मौजूद हो।"',
    '"Saathi AI helped me understand my soil better. The Odia recommendations made it so easy to follow, and my crop yield improved by 30% this season."': '"साथी एआई ने मुझे अपनी मिट्टी को बेहतर ढंग से समझने में मदद की। ओडिया सिफारिशों का पालन करना बहुत आसान था, और इस मौसम में मेरी फसल की उपज 30% सुधर गई।"',
    'Get In Touch': 'संपर्क में रहो',
    'Have a question or feedback? Reach out to our team.': 'कोई प्रश्न या प्रतिक्रिया है? हमारी टीम से संपर्क करें।',
    'Name': 'नाम',
    'Email': 'ईमेल',
    'Message': 'संदेश',
    'Send Message': 'संदेश भेजें',
    'Sending...': 'भेजा जा रहा है...',
    'Please fill in all fields.': 'कृपया सभी फ़ील्ड भरें।',
    'Success! Your message has been sent to the recipients.': 'सफलता! आपका संदेश प्राप्तकर्ताओं को भेज दिया गया है।',
    'Submission Failed:': 'जमा करना विफल रहा:',
    'Could not connect to the form handling service.': 'फॉर्म हैंडलिंग सेवा से कनेक्ट नहीं हो सका।',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Start with 'English' as the default language
  const [currentLanguage, setCurrentLanguage] = useState<Language>('English');

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[currentLanguage][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook for components to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};