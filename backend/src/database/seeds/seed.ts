import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'it_connect_matrimony',
  synchronize: false,
  logging: false,
});

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

const users = [
  {
    email: 'admin@itconnectmatrimony.com',
    password: 'Admin@123',
    firstName: 'Super',
    lastName: 'Admin',
    gender: 'male' as const,
    dob: '1990-01-15',
    role: 'super_admin' as const,
    status: 'active' as const,
    phone: '+919876543210',
  },
  {
    email: 'priya.sharma@gmail.com',
    password: 'Priya@123',
    firstName: 'Priya',
    lastName: 'Sharma',
    gender: 'female' as const,
    dob: '1996-03-20',
    role: 'verified' as const,
    status: 'active' as const,
    phone: '+919876543211',
  },
  {
    email: 'rahul.patel@outlook.com',
    password: 'Rahul@123',
    firstName: 'Rahul',
    lastName: 'Patel',
    gender: 'male' as const,
    dob: '1994-07-12',
    role: 'verified' as const,
    status: 'active' as const,
    phone: '+919876543212',
  },
  {
    email: 'ananya.singh@yahoo.com',
    password: 'Ananya@123',
    firstName: 'Ananya',
    lastName: 'Singh',
    gender: 'female' as const,
    dob: '1998-11-05',
    role: 'registered' as const,
    status: 'active' as const,
    phone: '+919876543213',
  },
  {
    email: 'vikram.reddy@gmail.com',
    password: 'Vikram@123',
    firstName: 'Vikram',
    lastName: 'Reddy',
    gender: 'male' as const,
    dob: '1992-05-18',
    role: 'premium' as const,
    status: 'active' as const,
    phone: '+919876543214',
  },
  {
    email: 'sneha.iyer@outlook.com',
    password: 'Sneha@123',
    firstName: 'Sneha',
    lastName: 'Iyer',
    gender: 'female' as const,
    dob: '1997-09-22',
    role: 'verified' as const,
    status: 'active' as const,
    phone: '+919876543215',
  },
  {
    email: 'arjun.kumar@gmail.com',
    password: 'Arjun@123',
    firstName: 'Arjun',
    lastName: 'Kumar',
    gender: 'male' as const,
    dob: '1995-02-14',
    role: 'registered' as const,
    status: 'active' as const,
    phone: '+919876543216',
  },
  {
    email: 'deepa.nair@yahoo.com',
    password: 'Deepa@123',
    firstName: 'Deepa',
    lastName: 'Nair',
    gender: 'female' as const,
    dob: '1993-08-30',
    role: 'premium' as const,
    status: 'active' as const,
    phone: '+919876543217',
  },
  {
    email: 'karthik.menon@gmail.com',
    password: 'Karthik@123',
    firstName: 'Karthik',
    lastName: 'Menon',
    gender: 'male' as const,
    dob: '1996-12-01',
    role: 'verified' as const,
    status: 'active' as const,
    phone: '+919876543218',
  },
  {
    email: 'meera.joshi@outlook.com',
    password: 'Meera@123',
    firstName: 'Meera',
    lastName: 'Joshi',
    gender: 'female' as const,
    dob: '1999-04-10',
    role: 'registered' as const,
    status: 'active' as const,
    phone: '+919876543219',
  },
  {
    email: 'ravi.gupta@gmail.com',
    password: 'Ravi@123',
    firstName: 'Ravi',
    lastName: 'Gupta',
    gender: 'male' as const,
    dob: '1991-06-25',
    role: 'verified' as const,
    status: 'active' as const,
    phone: '+919876543220',
  },
];

const profiles = [
  { userIdx: 1, height: 170, weight: 60, maritalStatus: 'never_married', religion: 'hindu', community: 'brahmin', motherTongue: 'hindi', country: 'India', state: 'Karnataka', city: 'Bangalore', aboutMe: 'Passionate about building scalable systems and finding the right partner who understands the tech world.' },
  { userIdx: 2, height: 175, weight: 72, maritalStatus: 'never_married', religion: 'hindu', community: 'patel', motherTongue: 'gujarati', country: 'India', state: 'Gujarat', city: 'Ahmedabad', aboutMe: 'DevOps enthusiast who believes in continuous improvement in both infrastructure and relationships.' },
  { userIdx: 3, height: 162, weight: 55, maritalStatus: 'never_married', religion: 'sikh', community: 'khatri', motherTongue: 'punjabi', country: 'India', state: 'Punjab', city: 'Chandigarh', aboutMe: 'Design is my passion. Looking for someone who appreciates creativity and good UX in life.' },
  { userIdx: 4, height: 178, weight: 75, maritalStatus: 'never_married', religion: 'hindu', community: 'reddy', motherTongue: 'telugu', country: 'India', state: 'Telangana', city: 'Hyderabad', aboutMe: 'Tech lead by day, open source contributor by night. Seeking a partner who loves learning.' },
  { userIdx: 5, height: 165, weight: 58, maritalStatus: 'never_married', religion: 'hindu', community: 'iyer', motherTongue: 'tamil', country: 'India', state: 'Tamil Nadu', city: 'Chennai', aboutMe: 'Data tells stories, and I love listening. Looking for someone genuine and kind-hearted.' },
  { userIdx: 6, height: 173, weight: 68, maritalStatus: 'never_married', religion: 'hindu', community: 'nair', motherTongue: 'malayalam', country: 'India', state: 'Kerala', city: 'Kochi', aboutMe: 'Full stack developer who codes in multiple languages, fluent in only one - love.' },
  { userIdx: 7, height: 168, weight: 62, maritalStatus: 'never_married', religion: 'hindu', community: 'nair', motherTongue: 'malayalam', country: 'India', state: 'Karnataka', city: 'Bangalore', aboutMe: 'Cloud architect designing scalable solutions. Looking for a partner to build a life with.' },
  { userIdx: 8, height: 176, weight: 70, maritalStatus: 'never_married', religion: 'hindu', community: 'menon', motherTongue: 'malayalam', country: 'India', state: 'Kerala', city: 'Bangalore', aboutMe: 'ML engineer who believes love is the ultimate neural network. Training my heart for the right match.' },
  { userIdx: 9, height: 160, weight: 52, maritalStatus: 'never_married', religion: 'hindu', community: 'brahmin', motherTongue: 'hindi', country: 'India', state: 'Maharashtra', city: 'Mumbai', aboutMe: 'Frontend developer with an eye for detail and a heart for meaningful connections.' },
  { userIdx: 10, height: 180, weight: 78, maritalStatus: 'never_married', religion: 'hindu', community: 'gupta', motherTongue: 'hindi', country: 'India', state: 'Delhi', city: 'New Delhi', aboutMe: 'Engineering manager who knows that the best teams are built on trust. Looking for my co-founder in life.' },
];

const professionalDetails = [
  { userIdx: 1, company: 'Google', designation: 'Software Engineer', experience: 4, salary: 2500000, currency: 'INR', techStack: '["Java","Python","GCP","Kubernetes"]', skills: '["System Design","Microservices","Algorithms"]', workMode: 'hybrid', github: 'https://github.com/priyasharma', linkedin: 'https://linkedin.com/in/priyasharma' },
  { userIdx: 2, company: 'Amazon', designation: 'Senior DevOps Engineer', experience: 6, salary: 3200000, currency: 'INR', techStack: '["AWS","Terraform","Docker","Jenkins"]', skills: '["CI/CD","Infrastructure","Monitoring"]', workMode: 'remote', github: 'https://github.com/rahulpatel', linkedin: 'https://linkedin.com/in/rahulpatel' },
  { userIdx: 3, company: 'Microsoft', designation: 'UI/UX Designer', experience: 3, salary: 1800000, currency: 'INR', techStack: '["Figma","React","CSS","TypeScript"]', skills: '["User Research","Prototyping","Design Systems"]', workMode: 'onsite', linkedin: 'https://linkedin.com/in/ananyasingh' },
  { userIdx: 4, company: 'Meta', designation: 'Tech Lead', experience: 8, salary: 4500000, currency: 'INR', techStack: '["React","GraphQL","Node.js","Python"]', skills: '["Architecture","Team Leadership","React Native"]', workMode: 'remote', github: 'https://github.com/vikramreddy', linkedin: 'https://linkedin.com/in/vikramreddy' },
  { userIdx: 5, company: 'Netflix', designation: 'Data Scientist', experience: 4, salary: 2800000, currency: 'INR', techStack: '["Python","TensorFlow","Spark","AWS"]', skills: '["Machine Learning","NLP","Recommendation Systems"]', workMode: 'hybrid', github: 'https://github.com/snehaiyer', linkedin: 'https://linkedin.com/in/snehaiyer' },
  { userIdx: 6, company: 'Flipkart', designation: 'Full Stack Developer', experience: 5, salary: 2200000, currency: 'INR', techStack: '["React","Node.js","MongoDB","AWS"]', skills: '["REST APIs","GraphQL","DevOps"]', workMode: 'hybrid', github: 'https://github.com/arjunkumar', linkedin: 'https://linkedin.com/in/arjunkumar' },
  { userIdx: 7, company: 'AWS', designation: 'Cloud Architect', experience: 7, salary: 3800000, currency: 'INR', techStack: '["AWS","Azure","GCP","Terraform"]', skills: '["Cloud Migration","Cost Optimization","Security"]', workMode: 'remote', linkedin: 'https://linkedin.com/in/deepanair' },
  { userIdx: 8, company: 'OpenAI', designation: 'ML Engineer', experience: 5, salary: 4000000, currency: 'INR', techStack: '["Python","PyTorch","Transformers","CUDA"]', skills: '["Deep Learning","NLP","Computer Vision"]', workMode: 'remote', github: 'https://github.com/karthikmenon', linkedin: 'https://linkedin.com/in/karthikmenon' },
  { userIdx: 9, company: 'Spotify', designation: 'Frontend Developer', experience: 2, salary: 1500000, currency: 'INR', techStack: '["React","TypeScript","Next.js","Tailwind"]', skills: '["UI Development","Animation","Accessibility"]', workMode: 'remote', github: 'https://github.com/meerajoshi', linkedin: 'https://linkedin.com/in/meerajoshi' },
  { userIdx: 10, company: 'Uber', designation: 'Engineering Manager', experience: 10, salary: 5500000, currency: 'INR', techStack: '["Java","Go","Kubernetes","gRPC"]', skills: '["Team Management","System Design","Agile"]', workMode: 'hybrid', github: 'https://github.com/ravigupta', linkedin: 'https://linkedin.com/in/ravigupta' },
];

const educationDetails = [
  { userIdx: 1, degree: 'B.Tech', specialization: 'Computer Science', university: 'IIT Bombay', yearOfPassing: 2018 },
  { userIdx: 2, degree: 'B.Tech', specialization: 'Information Technology', university: 'NIT Surat', yearOfPassing: 2016 },
  { userIdx: 3, degree: 'B.Des', specialization: 'Interaction Design', university: 'NID Ahmedabad', yearOfPassing: 2019 },
  { userIdx: 4, degree: 'B.Tech', specialization: 'Computer Science', university: 'IIT Hyderabad', yearOfPassing: 2014 },
  { userIdx: 5, degree: 'M.Tech', specialization: 'Data Science', university: 'IIT Madras', yearOfPassing: 2018 },
  { userIdx: 6, degree: 'B.Tech', specialization: 'Computer Science', university: 'CUSAT Kochi', yearOfPassing: 2017 },
  { userIdx: 7, degree: 'MCA', specialization: 'Cloud Computing', university: 'Christ University Bangalore', yearOfPassing: 2015 },
  { userIdx: 8, degree: 'B.Tech', specialization: 'AI & ML', university: 'BITS Pilani', yearOfPassing: 2017 },
  { userIdx: 9, degree: 'BCA', specialization: 'Web Development', university: 'Mumbai University', yearOfPassing: 2020 },
  { userIdx: 10, degree: 'B.Tech', specialization: 'Computer Science', university: 'IIT Delhi', yearOfPassing: 2012 },
];

const familyDetails = [
  { userIdx: 1, fatherName: 'Suresh Sharma', fatherOccupation: 'Retired Government Officer', motherName: 'Vandana Sharma', motherOccupation: 'Teacher', siblingsCount: 1, brotherCount: 0, sisterCount: 1, familyType: 'nuclear', familyStatus: 'upper_middle', familyValues: 'traditional' },
  { userIdx: 2, fatherName: 'Mahesh Patel', fatherOccupation: 'Business Owner', motherName: 'Komal Patel', motherOccupation: 'Homemaker', siblingsCount: 2, brotherCount: 1, sisterCount: 1, familyType: 'joint', familyStatus: 'rich', familyValues: 'traditional' },
  { userIdx: 3, fatherName: 'Harpreet Singh', fatherOccupation: 'Army Officer', motherName: 'Gurpreet Kaur', motherOccupation: 'Doctor', siblingsCount: 0, brotherCount: 0, sisterCount: 0, familyType: 'nuclear', familyStatus: 'upper_middle', familyValues: 'modern' },
  { userIdx: 4, fatherName: 'Krishna Reddy', fatherOccupation: 'Businessman', motherName: 'Lakshmi Reddy', motherOccupation: 'Homemaker', siblingsCount: 1, brotherCount: 1, sisterCount: 0, familyType: 'joint', familyStatus: 'rich', familyValues: 'traditional' },
  { userIdx: 5, fatherName: 'Ramanathan Iyer', fatherOccupation: 'Bank Manager', motherName: 'Shantha Iyer', motherOccupation: 'Professor', siblingsCount: 1, brotherCount: 0, sisterCount: 1, familyType: 'nuclear', familyStatus: 'upper_middle', familyValues: 'modern' },
  { userIdx: 6, fatherName: 'Suresh Kumar', fatherOccupation: 'Engineer', motherName: 'Lakshmi Kumar', motherOccupation: 'Homemaker', siblingsCount: 1, brotherCount: 1, sisterCount: 0, familyType: 'nuclear', familyStatus: 'middle_class', familyValues: 'traditional' },
  { userIdx: 7, fatherName: 'Nagarajan Nair', fatherOccupation: 'Retired Professor', motherName: 'Sreedevi Nair', motherOccupation: 'Doctor', siblingsCount: 2, brotherCount: 1, sisterCount: 1, familyType: 'joint', familyStatus: 'upper_middle', familyValues: 'modern' },
  { userIdx: 8, fatherName: 'Krishna Menon', fatherOccupation: 'Business Owner', motherName: 'Sarojini Menon', motherOccupation: 'Homemaker', siblingsCount: 0, brotherCount: 0, sisterCount: 0, familyType: 'nuclear', familyStatus: 'rich', familyValues: 'modern' },
  { userIdx: 9, fatherName: 'Ramesh Joshi', fatherOccupation: 'Software Consultant', motherName: 'Usha Joshi', motherOccupation: 'Bank Officer', siblingsCount: 1, brotherCount: 1, sisterCount: 0, familyType: 'nuclear', familyStatus: 'upper_middle', familyValues: 'modern' },
  { userIdx: 10, fatherName: 'Mahesh Gupta', fatherOccupation: 'Chartered Accountant', motherName: 'Sunita Gupta', motherOccupation: 'Homemaker', siblingsCount: 2, brotherCount: 2, sisterCount: 0, familyType: 'joint', familyStatus: 'rich', familyValues: 'traditional' },
];

const partnerPreferences = [
  { userIdx: 1, ageMin: 24, ageMax: 30, religion: '["hindu","sikh"]', community: '["brahmin","khatri"]', country: '["India"]', education: '["B.Tech","M.Tech","BCA","MCA"]', workMode: '["remote","hybrid"]', diet: '["vegetarian","eggetarian"]' },
  { userIdx: 2, ageMin: 25, ageMax: 32, religion: '["hindu","jain"]', community: '["patel","bania"]', country: '["India"]', education: '["B.Tech","M.Tech"]', workMode: '["remote","hybrid"]', diet: '["vegetarian"]' },
  { userIdx: 3, ageMin: 26, ageMax: 35, religion: '["hindu","sikh","christian"]', country: '["India","Canada","USA"]', education: '["B.Tech","B.Des","M.Des","BCA"]', workMode: '["remote","hybrid","onsite"]' },
  { userIdx: 4, ageMin: 25, ageMax: 32, religion: '["hindu"]', country: '["India"]', education: '["B.Tech","M.Tech"]', workMode: '["remote","hybrid"]' },
  { userIdx: 5, ageMin: 27, ageMax: 35, religion: '["hindu"]', community: '["iyer","iyengar"]', country: '["India"]', education: '["B.Tech","M.Tech","M.Sc"]', workMode: '["remote","hybrid"]' },
  { userIdx: 6, ageMin: 23, ageMax: 28, religion: '["hindu"]', country: '["India"]', education: '["B.Tech","BCA","MCA"]', workMode: '["remote","hybrid","onsite"]' },
  { userIdx: 7, ageMin: 28, ageMax: 36, religion: '["hindu"]', country: '["India","USA","Canada","UK"]', education: '["B.Tech","M.Tech","MCA"]', workMode: '["remote"]' },
  { userIdx: 8, ageMin: 24, ageMax: 30, religion: '["hindu"]', country: '["India"]', education: '["B.Tech","M.Tech","M.Sc"]', workMode: '["remote"]' },
  { userIdx: 9, ageMin: 25, ageMax: 32, religion: '["hindu"]', country: '["India"]', education: '["B.Tech","BCA","B.Des"]', workMode: '["remote","hybrid"]' },
  { userIdx: 10, ageMin: 27, ageMax: 35, religion: '["hindu"]', country: '["India"]', education: '["B.Tech","M.Tech","MBA"]', workMode: '["remote","hybrid"]', diet: '["vegetarian","non_veg"]' },
];

const siteSettings = [
  { key: 'site_name', value: 'IT Connect Matrimony', type: 'string', group: 'general' },
  { key: 'site_tagline', value: 'Find Your Perfect Match in Tech', type: 'string', group: 'general' },
  { key: 'contact_email', value: 'support@itconnectmatrimony.com', type: 'string', group: 'general' },
  { key: 'contact_phone', value: '+918001234567', type: 'string', group: 'general' },
  { key: 'max_photos_free', value: '3', type: 'number', group: 'limits' },
  { key: 'max_photos_premium', value: '6', type: 'number', group: 'limits' },
  { key: 'max_interests_per_day_free', value: '5', type: 'number', group: 'limits' },
  { key: 'max_interests_per_day_premium', value: '-1', type: 'number', group: 'limits' },
  { key: 'max_messages_per_day_free', value: '10', type: 'number', group: 'limits' },
  { key: 'maintenance_mode', value: 'false', type: 'boolean', group: 'system' },
  { key: 'min_age', value: '18', type: 'number', group: 'validation' },
  { key: 'max_age', value: '70', type: 'number', group: 'validation' },
];

const faqs = [
  { question: 'What is IT Connect Matrimony?', answer: 'IT Connect Matrimony is a premium matrimony platform exclusively for IT professionals. We use AI-powered matching based on tech stack compatibility, career aspirations, and personal preferences.', category: 'general', order: 1 },
  { question: 'How does the matching algorithm work?', answer: 'Our algorithm considers over 50 factors including technology stack overlap, career goals, lifestyle preferences, education, location, and personal values to generate compatibility scores.', category: 'matching', order: 2 },
  { question: 'Is my data secure?', answer: 'Yes, we use enterprise-grade encryption, SSL certificates, and follow strict data privacy policies including GDPR compliance. Your data is never shared with third parties.', category: 'privacy', order: 3 },
  { question: 'What are the subscription plans?', answer: 'We offer Free, Premium ($19.99/mo), Gold ($39.99/mo), and Platinum ($79.99/mo) plans with increasing features like unlimited interests, advanced filters, and profile boosts.', category: 'subscription', order: 4 },
  { question: 'How do I verify my profile?', answer: 'You can verify your email, phone number, company email, government ID, LinkedIn profile, and employment. Verified profiles get a trust badge and higher visibility.', category: 'verification', order: 5 },
  { question: 'Can I hide my profile from specific users?', answer: 'Yes, you can block specific users, hide your profile from non-matches, use incognito mode (premium), and control who sees your photos and contact details.', category: 'privacy', order: 6 },
  { question: 'How do I report a suspicious profile?', answer: 'Click the "Report" button on any profile or message. Our moderation team reviews all reports within 24 hours and takes appropriate action.', category: 'safety', order: 7 },
];

const blogs = [
  { title: '10 Tips for IT Professionals Looking for Love', slug: '10-tips-it-professionals-love', content: 'Finding love in the tech industry can be challenging. Here are 10 proven tips to help you navigate the dating world while building your career...', excerpt: 'Expert dating advice tailored for software engineers and IT professionals.', tags: '["dating","career","relationships"]', category: 'dating', status: 'published' as const },
  { title: 'How Tech Stack Compatibility Strengthens Relationships', slug: 'tech-stack-compatibility-relationships', content: 'When two developers share similar technical interests, it creates a unique bond. Research shows that shared professional passions lead to stronger personal connections...', excerpt: 'Discover why shared tech interests make for better relationships.', tags: '["technology","relationships","matching"]', category: 'technology', status: 'published' as const },
  { title: 'Remote Work and Dating: The New Normal', slug: 'remote-work-dating-new-normal', content: 'With remote work becoming the norm, IT professionals have new opportunities to connect across cities and countries. Here is how to make the most of it...', excerpt: 'Navigate the intersection of remote work and modern dating.', tags: '["remote-work","dating","lifestyle"]', category: 'lifestyle', status: 'published' as const },
];

const coupons = [
  { code: 'WELCOME50', type: 'percentage', value: 50, maxDiscount: 1000, minOrderAmount: 500, maxUses: 1000, usedCount: 0, validFrom: '2024-01-01', validUntil: '2025-12-31', isActive: true, applicablePlans: '["premium","gold","platinum"]' },
  { code: 'TECH2024', type: 'percentage', value: 20, maxDiscount: 500, minOrderAmount: 300, maxUses: 500, usedCount: 0, validFrom: '2024-01-01', validUntil: '2025-06-30', isActive: true, applicablePlans: '["gold","platinum"]' },
  { code: 'FESTIVE30', type: 'fixed', value: 300, maxDiscount: 300, minOrderAmount: 500, maxUses: 200, usedCount: 0, validFrom: '2024-10-01', validUntil: '2025-03-31', isActive: true, applicablePlans: '["premium","gold","platinum"]' },
];

const notificationTemplates = [
  { type: 'new_interest', channel: 'push', subject: 'New Interest Received', templateBody: '{{senderName}} is interested in you! View their profile to know more.', variables: '["senderName"]' },
  { type: 'interest_accepted', channel: 'push', subject: 'Interest Accepted', templateBody: '{{receiverName}} accepted your interest! You can now start chatting.', variables: '["receiverName"]' },
  { type: 'new_message', channel: 'push', subject: 'New Message', templateBody: 'You have a new message from {{senderName}}.', variables: '["senderName"]' },
  { type: 'match_recommendation', channel: 'push', subject: 'New Match Recommendation', templateBody: 'We found a {{compatibilityScore}}% match for you! Check out {{matchName}}.', variables: '["compatibilityScore","matchName"]' },
  { type: 'profile_viewed', channel: 'push', subject: 'Profile Viewed', templateBody: '{{viewerName}} viewed your profile!', variables: '["viewerName"]' },
  { type: 'welcome', channel: 'email', subject: 'Welcome to IT Connect Matrimony', templateBody: 'Welcome {{userName}}! Complete your profile to get started.', variables: '["userName"]' },
  { type: 'email_verification', channel: 'email', subject: 'Verify Your Email', templateBody: 'Click the link to verify your email: {{verificationUrl}}', variables: '["verificationUrl"]' },
];

async function seed() {
  console.log('🌱 Starting seed...\n');

  try {
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Seed Admin Users
      console.log('👤 Seeding admin users...');
      for (const user of users) {
        const hashedPassword = await hashPassword(user.password);
        const userId = uuidv4();

        await queryRunner.query(
          `INSERT INTO users (uuid, email, phone, password_hash, first_name, last_name, date_of_birth, gender, role, status, email_verified_at, phone_verified_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), NOW())
           ON DUPLICATE KEY UPDATE updated_at = NOW()`,
          [userId, user.email, user.phone, hashedPassword, user.firstName, user.lastName, user.dob, user.gender, user.role, user.status]
        );

        // Get the auto-increment ID
        const [result] = await queryRunner.query('SELECT id FROM users WHERE uuid = ?', [userId]);
        const dbUserId = result?.id;

        if (dbUserId) {
          // Seed Profile
          const profileData = profiles.find(p => p.userIdx === users.indexOf(user));
          if (profileData) {
            await queryRunner.query(
              `INSERT INTO profiles (user_id, about_me, height, weight, marital_status, religion, community, mother_tongue, country, state, city, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
               ON DUPLICATE KEY UPDATE updated_at = NOW()`,
              [dbUserId, profileData.aboutMe, profileData.height, profileData.weight, profileData.maritalStatus, profileData.religion, profileData.community, profileData.motherTongue, profileData.country, profileData.state, profileData.city]
            );
          }

          // Seed Professional Details
          const profDetails = professionalDetails.find(p => p.userIdx === users.indexOf(user));
          if (profDetails) {
            await queryRunner.query(
              `INSERT INTO professional_details (user_id, current_company, designation, years_of_experience, current_salary, currency, technology_stack, skills, work_mode, github_url, linkedin_url, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
               ON DUPLICATE KEY UPDATE updated_at = NOW()`,
              [dbUserId, profDetails.company, profDetails.designation, profDetails.experience, profDetails.salary, profDetails.currency, profDetails.techStack, profDetails.skills, profDetails.workMode, profDetails.github || null, profDetails.linkedin || null]
            );
          }

          // Seed Education
          const eduDetails = educationDetails.find(e => e.userIdx === users.indexOf(user));
          if (eduDetails) {
            await queryRunner.query(
              `INSERT INTO education_details (user_id, degree, specialization, university, year_of_passing, is_highest_degree, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())
               ON DUPLICATE KEY UPDATE updated_at = NOW()`,
              [dbUserId, eduDetails.degree, eduDetails.specialization, eduDetails.university, eduDetails.yearOfPassing]
            );
          }

          // Seed Family
          const famDetails = familyDetails.find(f => f.userIdx === users.indexOf(user));
          if (famDetails) {
            await queryRunner.query(
              `INSERT INTO family_details (user_id, father_name, father_occupation, mother_name, mother_occupation, siblings_count, brother_count, sister_count, family_type, family_status, family_values, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
               ON DUPLICATE KEY UPDATE updated_at = NOW()`,
              [dbUserId, famDetails.fatherName, famDetails.fatherOccupation, famDetails.motherName, famDetails.motherOccupation, famDetails.siblingsCount, famDetails.brotherCount, famDetails.sisterCount, famDetails.familyType, famDetails.familyStatus, famDetails.familyValues]
            );
          }

          // Seed Partner Preferences
          const prefDetails = partnerPreferences.find(p => p.userIdx === users.indexOf(user));
          if (prefDetails) {
            await queryRunner.query(
              `INSERT INTO partner_preferences (user_id, age_min, age_max, religion, community, country, education, work_mode, diet, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
               ON DUPLICATE KEY UPDATE updated_at = NOW()`,
              [dbUserId, prefDetails.ageMin, prefDetails.ageMax, prefDetails.religion, prefDetails.community || null, prefDetails.country, prefDetails.education, prefDetails.workMode, prefDetails.diet || null]
            );
          }

          // Seed Lifestyle
          const diets = ['vegetarian', 'non_veg', 'eggetarian', 'vegan'];
          const smoking = ['no', 'no', 'no', 'occasionally'];
          const drinking = ['no', 'socially', 'no', 'socially'];
          const idx = users.indexOf(user);
          await queryRunner.query(
            `INSERT INTO lifestyle_details (user_id, diet, smoking, drinking, exercise_frequency, hobbies, interests, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE updated_at = NOW()`,
            [dbUserId, diets[idx % 4], smoking[idx % 4], drinking[idx % 4], 'regular', JSON.stringify(['reading', 'coding', 'traveling']), JSON.stringify(['technology', 'music', 'fitness'])]
          );

          // Seed Languages
          const langs = profileData?.motherTongue || 'hindi';
          await queryRunner.query(
            `INSERT INTO languages (user_id, language, proficiency, created_at)
             VALUES (?, ?, 'fluent', NOW())
             ON DUPLICATE KEY UPDATE proficiency = 'fluent'`,
            [dbUserId, langs]
          );
          if (langs !== 'english') {
            await queryRunner.query(
              `INSERT INTO languages (user_id, language, proficiency, created_at)
               VALUES (?, 'english', 'fluent', NOW())
               ON DUPLICATE KEY UPDATE proficiency = 'fluent'`,
              [dbUserId]
            );
          }
        }
      }
      console.log('  ✅ Users & profiles seeded');

      // Seed Subscriptions
      console.log('💳 Seeding subscriptions...');
      const premiumUsers = [2, 5, 8]; // Priya, Vikram, Deepa
      const goldUsers = [3, 6]; // Rahul, Sneha

      for (const userIdx of premiumUsers) {
        const emails = users.map(u => u.email);
        const [userResult] = await queryRunner.query('SELECT id FROM users WHERE email = ?', [emails[userIdx - 1]]);
        if (userResult) {
          await queryRunner.query(
            `INSERT INTO subscriptions (uuid, user_id, plan_type, status, start_date, end_date, auto_renew, amount, currency, payment_gateway, created_at, updated_at)
             VALUES (?, ?, 'premium', 'active', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE, 19.99, 'USD', 'stripe', NOW(), NOW())
             ON DUPLICATE KEY UPDATE updated_at = NOW()`,
            [uuidv4(), userResult.id]
          );
        }
      }

      for (const userIdx of goldUsers) {
        const emails = users.map(u => u.email);
        const [userResult] = await queryRunner.query('SELECT id FROM users WHERE email = ?', [emails[userIdx - 1]]);
        if (userResult) {
          await queryRunner.query(
            `INSERT INTO subscriptions (uuid, user_id, plan_type, status, start_date, end_date, auto_renew, amount, currency, payment_gateway, created_at, updated_at)
             VALUES (?, ?, 'gold', 'active', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), TRUE, 39.99, 'USD', 'razorpay', NOW(), NOW())
             ON DUPLICATE KEY UPDATE updated_at = NOW()`,
            [uuidv4(), userResult.id]
          );
        }
      }
      console.log('  ✅ Subscriptions seeded');

      // Seed Interests
      console.log('💌 Seeding interests...');
      const interestPairs = [
        { from: 'priya.sharma@gmail.com', to: 'rahul.patel@outlook.com', status: 'accepted' },
        { from: 'ananya.singh@yahoo.com', to: 'vikram.reddy@gmail.com', status: 'pending' },
        { from: 'sneha.iyer@outlook.com', to: 'arjun.kumar@gmail.com', status: 'accepted' },
        { from: 'deepa.nair@yahoo.com', to: 'karthik.menon@gmail.com', status: 'rejected' },
        { from: 'meera.joshi@outlook.com', to: 'priya.sharma@gmail.com', status: 'pending' },
      ];

      for (const interest of interestPairs) {
        const [fromUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', [interest.from]);
        const [toUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', [interest.to]);
        if (fromUser && toUser) {
          await queryRunner.query(
            `INSERT INTO interests (uuid, from_user_id, to_user_id, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE updated_at = NOW()`,
            [uuidv4(), fromUser.id, toUser.id, interest.status]
          );
        }
      }
      console.log('  ✅ Interests seeded');

      // Seed Matches (mutual)
      console.log('💕 Seeding matches...');
      const matchPairs = [
        { user1: 'priya.sharma@gmail.com', user2: 'rahul.patel@outlook.com', score: 87 },
        { user1: 'sneha.iyer@outlook.com', user2: 'arjun.kumar@gmail.com', score: 82 },
      ];

      for (const match of matchPairs) {
        const [u1] = await queryRunner.query('SELECT id FROM users WHERE email = ?', [match.user1]);
        const [u2] = await queryRunner.query('SELECT id FROM users WHERE email = ?', [match.user2]);
        if (u1 && u2) {
          await queryRunner.query(
            `INSERT INTO matches (uuid, user_id, matched_user_id, compatibility_score, is_mutual, matched_at, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, TRUE, NOW(), TRUE, NOW(), NOW())
             ON DUPLICATE KEY UPDATE updated_at = NOW()`,
            [uuidv4(), u1.id, u2.id, match.score]
          );
        }
      }
      console.log('  ✅ Matches seeded');

      // Seed Conversations & Messages
      console.log('💬 Seeding conversations & messages...');
      const convPairs = [
        {
          user1: 'priya.sharma@gmail.com',
          user2: 'rahul.patel@outlook.com',
          messages: [
            { from: 'priya.sharma@gmail.com', content: 'Hi Rahul! I noticed we both work in cloud technologies. How is Amazon?' },
            { from: 'rahul.patel@outlook.com', content: 'Hey Priya! Amazon is great. The DevOps culture here is amazing. How about Google?' },
            { from: 'priya.sharma@gmail.com', content: 'Google is wonderful! The work-life balance is really good. I love the collaborative environment.' },
            { from: 'rahul.patel@outlook.com', content: 'That sounds great! We should definitely meet sometime. Coffee?' },
            { from: 'priya.sharma@gmail.com', content: 'Sure! Let me know when you are free. Looking forward to it! 😊' },
          ],
        },
        {
          user1: 'sneha.iyer@outlook.com',
          user2: 'arjun.kumar@gmail.com',
          messages: [
            { from: 'sneha.iyer@outlook.com', content: 'Hi Arjun! Your Flipkart projects look impressive. I also work with recommendation systems.' },
            { from: 'arjun.kumar@gmail.com', content: 'Thanks Sneha! Netflix is my dream company. Would love to hear about your ML work.' },
            { from: 'sneha.iyer@outlook.com', content: 'Let us connect! I can share some interesting projects we are working on.' },
          ],
        },
      ];

      for (const conv of convPairs) {
        const [u1] = await queryRunner.query('SELECT id FROM users WHERE email = ?', [conv.user1]);
        const [u2] = await queryRunner.query('SELECT id FROM users WHERE email = ?', [conv.user2]);
        if (u1 && u2) {
          const convUuid = uuidv4();
          await queryRunner.query(
            `INSERT INTO conversations (uuid, type, created_by, is_active, last_message_at, created_at, updated_at)
             VALUES (?, 'direct', ?, TRUE, NOW(), NOW(), NOW())`,
            [convUuid, u1.id]
          );
          const [convResult] = await queryRunner.query('SELECT id FROM conversations WHERE uuid = ?', [convUuid]);
          if (convResult) {
            await queryRunner.query(
              `INSERT INTO conversation_participants (conversation_id, user_id, created_at)
               VALUES (?, ?, NOW()), (?, ?, NOW())
               ON DUPLICATE KEY UPDATE created_at = created_at`,
              [convResult.id, u1.id, convResult.id, u2.id]
            );
            for (const msg of conv.messages) {
              const [sender] = await queryRunner.query('SELECT id FROM users WHERE email = ?', [msg.from]);
              if (sender) {
                await queryRunner.query(
                  `INSERT INTO messages (uuid, conversation_id, sender_id, content, message_type, is_read, created_at, updated_at)
                   VALUES (?, ?, ?, ?, 'text', TRUE, NOW(), NOW())`,
                  [uuidv4(), convResult.id, sender.id, msg.content]
                );
              }
            }
          }
        }
      }
      console.log('  ✅ Conversations & messages seeded');

      // Seed Site Settings
      console.log('⚙️  Seeding site settings...');
      for (const setting of siteSettings) {
        await queryRunner.query(
          `INSERT INTO site_settings (\`key\`, value, type, \`group\`, created_at, updated_at)
           VALUES (?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = NOW()`,
          [setting.key, setting.value, setting.type, setting.group]
        );
      }
      console.log('  ✅ Site settings seeded');

      // Seed FAQs
      console.log('❓ Seeding FAQs...');
      for (const faq of faqs) {
        await queryRunner.query(
          `INSERT INTO faqs (question, answer, category, \`order\`, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, TRUE, NOW(), NOW())`,
          [faq.question, faq.answer, faq.category, faq.order]
        );
      }
      console.log('  ✅ FAQs seeded');

      // Seed Blogs
      console.log('📝 Seeding blogs...');
      const [adminUser] = await queryRunner.query('SELECT id FROM users WHERE email = ?', ['admin@itconnectmatrimony.com']);
      if (adminUser) {
        for (const blog of blogs) {
          await queryRunner.query(
            `INSERT INTO blogs (uuid, author_id, title, slug, content, excerpt, tags, category, status, published_at, view_count, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), FLOOR(RAND() * 1000), NOW(), NOW())
             ON DUPLICATE KEY UPDATE updated_at = NOW()`,
            [uuidv4(), adminUser.id, blog.title, blog.slug, blog.content, blog.excerpt, blog.tags, blog.category, blog.status]
          );
             }
      }
      console.log('  ✅ Blogs seeded');

      // Seed Coupons
      console.log('🎟️  Seeding coupons...');
      for (const coupon of coupons) {
        await queryRunner.query(
          `INSERT INTO coupons (code, type, value, max_discount, min_order_amount, max_uses, used_count, valid_from, valid_until, is_active, applicable_plans, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE updated_at = NOW()`,
          [coupon.code, coupon.type, coupon.value, coupon.maxDiscount, coupon.minOrderAmount, coupon.maxUses, coupon.usedCount, coupon.validFrom, coupon.validUntil, coupon.isActive, coupon.applicablePlans]
        );
      }
      console.log('  ✅ Coupons seeded');

      // Seed Notification Templates
      console.log('🔔 Seeding notification templates...');
      for (const template of notificationTemplates) {
        await queryRunner.query(
          `INSERT INTO notification_templates (type, channel, subject, template_body, variables, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE updated_at = NOW()`,
          [template.type, template.channel, template.subject, template.templateBody, template.variables]
        );
      }
      console.log('  ✅ Notification templates seeded');

      await queryRunner.commitTransaction();
      console.log('\n🎉 Seed completed successfully!\n');

      // Print summary
      console.log('📊 Summary:');
      console.log('  👤 Users: 11 (1 Super Admin + 10 IT Professionals)');
      console.log('  💳 Subscriptions: 5 (3 Premium + 2 Gold)');
      console.log('  💌 Interests: 5 (2 accepted, 2 pending, 1 rejected)');
      console.log('  💕 Matches: 2');
      console.log('  💬 Conversations: 2 with 8 messages');
      console.log('  ⚙️  Site Settings: 12');
      console.log('  ❓ FAQs: 7');
      console.log('  📝 Blogs: 3');
      console.log('  🎟️  Coupons: 3');
      console.log('  🔔 Notification Templates: 7\n');

      console.log('🔑 Test Accounts:');
      console.log('  Super Admin: admin@itconnectmatrimony.com / Admin@123');
      console.log('  Premium User: priya.sharma@gmail.com / Priya@123');
      console.log('  Premium User: vikram.reddy@gmail.com / Vikram@123');
      console.log('  Gold User:    rahul.patel@outlook.com / Rahul@123');
      console.log('  Free User:    arjun.kumar@gmail.com / Arjun@123');
      console.log('  Free User:    meera.joshi@outlook.com / Meera@123\n');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

seed();
