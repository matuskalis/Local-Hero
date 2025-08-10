# College Compass 🎓

A full-stack Next.js 14 application that estimates a student's chance of being admitted to US universities based on academic stats, extracurricular activities, and personal projects. Uses AI to provide personalized suggestions for improvement.

## ✨ Features

### 🏠 Landing Page (/)
- Modern, responsive design with soft blue and neutral colors
- Clear value proposition and call-to-action
- Feature highlights showcasing AI-powered analysis and comprehensive database

### 📝 Assessment Form (/form)
- **Academic Scores**: GPA (0.0-4.0), SAT (400-1600), ACT (1-36, optional)
- **Academic Preferences**: Intended major, location preference, tuition budget
- **Extracurricular Activities**: Multi-select options including leadership, volunteering, projects, awards
- **Personal Statement**: Textarea for essay/personal statement
- **Form Validation**: Real-time validation with error messages
- **Responsive Design**: Mobile-friendly layout with proper form controls

### 📊 Results Page (/results)
- **Overall Strength Score**: AI-generated score from 0-100 with visual representation
- **University Rankings**: Sorted by acceptance probability with detailed cards
- **AI Verdicts**: Color-coded badges (Green: Likely Admit, Yellow: Possible Admit, Red: Unlikely Admit)
- **Personalized Suggestions**: AI-powered recommendations + algorithmic insights
- **PDF Report**: Download button for comprehensive assessment report

### 🤖 AI Integration
- **OpenAI GPT-3.5-turbo** for intelligent evaluation
- **Personalized Analysis**: Context-aware recommendations based on user profile
- **University-Specific Verdicts**: AI classification for each university
- **Strength Scoring**: Comprehensive evaluation from 0-100

### 🏫 University Database
- **25+ US Universities** with real admission data
- **Comprehensive Stats**: GPA, SAT, acceptance rates, tuition, preferred majors
- **Extracurricular Importance**: Categorized by university preference level

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **AI**: OpenAI API (GPT-3.5-turbo)
- **Deployment**: Vercel-ready
- **Responsive**: Mobile-first design

## 📁 Project Structure

```
college-compass/
├── src/
│   ├── app/
│   │   ├── api/evaluate/route.ts    # AI evaluation API
│   │   ├── form/page.tsx            # Assessment form
│   │   ├── results/page.tsx         # Results display
│   │   ├── page.tsx                 # Landing page
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Global styles
│   ├── components/
│   │   ├── FormInput.tsx            # Reusable form input
│   │   ├── UniversityCard.tsx       # University result card
│   │   └── SuggestionsBox.tsx       # AI/algorithmic suggestions
│   └── types/
│       └── index.ts                 # TypeScript interfaces
├── public/
│   └── universities.json            # University database
├── package.json                     # Dependencies
└── README.md                        # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### 1. Clone and Install
```bash
cd college-compass
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```bash
# OpenAI API Key for AI evaluation
OPENAI_API_KEY=your_openai_api_key_here

# Base URL for the application
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add it to your `.env.local` file

### 4. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Build for Production
```bash
npm run build
npm start
```

## 🎯 How It Works

### 1. **User Input**
- Student fills out comprehensive assessment form
- Data includes academic scores, preferences, and personal statement

### 2. **Algorithmic Analysis**
- Basic probability calculation using GPA/SAT ratios
- University acceptance rate weighting
- Extracurricular activity scoring

### 3. **AI Evaluation**
- OpenAI analyzes user profile against university requirements
- Generates personalized strength score (0-100)
- Provides university-specific admission verdicts
- Creates actionable improvement suggestions

### 4. **Results Display**
- Sorted university rankings by probability
- Visual strength score representation
- AI-powered insights and recommendations
- Downloadable comprehensive report

## 🔧 Customization

### Adding Universities
Edit `public/universities.json` to add more universities:
```json
{
  "name": "University Name",
  "state": "ST",
  "avg_gpa": 3.80,
  "avg_sat": 1400,
  "acceptance_rate": 25,
  "tuition": 50000,
  "preferred_majors": ["Major1", "Major2"],
  "extracurricular_importance": "high"
}
```

### Modifying AI Prompts
Edit the prompt in `src/app/api/evaluate/route.ts` to customize AI evaluation criteria.

### Styling Changes
Modify TailwindCSS classes in component files or update `src/app/globals.css`.

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Compatible with Next.js static export
- **Railway**: Full-stack deployment support
- **AWS/GCP**: Container-based deployment

## 📱 Responsive Design

- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Proper touch targets and spacing
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Accessibility**: ARIA labels and semantic HTML

## 🔒 Security Features

- **Input Validation**: Server-side and client-side validation
- **API Rate Limiting**: Built-in Next.js API route protection
- **Environment Variables**: Secure API key management
- **Type Safety**: Full TypeScript implementation

## 🧪 Testing

### Manual Testing
1. Fill out assessment form with various data combinations
2. Test form validation and error handling
3. Verify AI evaluation responses
4. Check responsive design on different devices

### Automated Testing (Future)
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for user workflows

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues or questions:
1. Check the [Issues](https://github.com/your-repo/college-compass/issues) page
2. Create a new issue with detailed description
3. Include steps to reproduce and expected behavior

## 🔮 Future Enhancements

- **Database Integration**: Replace JSON with PostgreSQL/Supabase
- **User Accounts**: Save and track multiple assessments
- **Advanced Analytics**: Detailed admission probability breakdowns
- **College Matching**: Reverse search by student preferences
- **Application Tracking**: Timeline and checklist management
- **Scholarship Integration**: Financial aid recommendations

---

**Built with ❤️ using Next.js 14, TypeScript, and TailwindCSS**
