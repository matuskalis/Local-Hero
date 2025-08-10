# 🚀 Quick Setup Guide - College Compass

Get College Compass running in 5 minutes!

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up OpenAI API Key
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create `.env.local` file in the root directory:
```bash
OPENAI_API_KEY=sk-your-key-here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Run the App
```bash
npm run dev
```

### 4. Open Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 What You'll See

- **Landing Page**: Modern design with "Start My Assessment" button
- **Assessment Form**: Comprehensive form for academic profile
- **Results Page**: AI-powered analysis with university rankings
- **AI Integration**: OpenAI GPT-3.5-turbo for personalized recommendations

## 🔧 Troubleshooting

### Common Issues

**"OpenAI API Error"**
- Check your API key in `.env.local`
- Ensure you have credits in your OpenAI account

**"Universities not loading"**
- Verify `public/universities.json` exists
- Check browser console for errors

**"Form validation errors"**
- Ensure all required fields are filled
- Check GPA (0.0-4.0) and SAT (400-1600) ranges

## 📱 Test the App

1. **Fill out the form** with sample data:
   - GPA: 3.8
   - SAT: 1450
   - Major: Computer Science
   - Essay: "I'm passionate about technology..."

2. **Submit and see results** with AI evaluation

3. **Explore university rankings** and recommendations

## 🚀 Deploy to Vercel

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize universities in `public/universities.json`
- Modify AI prompts in `src/app/api/evaluate/route.ts`
- Add your own styling with TailwindCSS

---

**Need help?** Check the [README.md](README.md) or create an issue! 