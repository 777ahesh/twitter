const TWEET_MAX_LENGTH = 280;
const THREAD_MAX_LENGTH = 240;

// Enhanced topic detection
const detectTopicType = (topic) => {
    const cleanTopic = topic.toLowerCase().trim();
    
    const categories = {
        technical: ['angular', 'react', 'vue', 'javascript', 'python', 'java', 'css', 'html', 'node', 'api', 'framework', 'library', 'code', 'programming', 'development', 'features', 'version', 'update', 'typescript', 'backend', 'frontend', 'database', 'docker', 'kubernetes', 'aws', 'cloud', 'microservices', 'algorithm', 'data structure'],
        business: ['marketing', 'sales', 'business', 'startup', 'entrepreneur', 'product', 'strategy', 'growth', 'revenue', 'customer', 'brand', 'market', 'competition', 'investment', 'funding', 'b2b', 'b2c', 'saas', 'roi', 'kpi'],
        creative: ['design', 'art', 'creative', 'inspiration', 'innovation', 'music', 'writing', 'photography', 'video', 'content', 'storytelling', 'visual', 'aesthetic', 'ux', 'ui'],
        science: ['ai', 'machine learning', 'artificial intelligence', 'data science', 'research', 'science', 'technology', 'innovation', 'future', 'automation', 'robotics', 'blockchain'],
        lifestyle: ['productivity', 'motivation', 'career', 'life', 'work', 'balance', 'health', 'fitness', 'learning', 'education', 'personal', 'growth', 'mindset']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => cleanTopic.includes(keyword))) {
            return category;
        }
    }
    
    return 'general';
};

const generateLocalTweet = (topic, options = {}) => {
    const topicType = detectTopicType(topic);
    
    console.log('Detected topic type:', topicType, 'for topic:', topic, 'with options:', options);
    
    switch (topicType) {
        case 'technical':
            return generateTechnicalLocalTweet(topic, options);
        case 'business':
            return generateBusinessLocalTweet(topic, options);
        case 'creative':
            return generateCreativeLocalTweet(topic, options);
        default:
            return generateGeneralLocalTweet(topic, options);
    }
};

const generateTechnicalLocalTweet = (topic, options = {}) => {
    const cleanTopic = topic.trim();
    
    const templates = [
        `🚀 Just explored ${cleanTopic} and I'm blown away! The performance improvements are incredible - we're talking 40% faster builds and significantly reduced bundle sizes. The new API design is intuitive yet powerful, making complex tasks feel effortless. Developer experience has been completely reimagined with better error messages, improved debugging tools, and seamless IDE integration. The migration guide is comprehensive and the community support is outstanding. Early benchmarks show impressive results across different project sizes. The future of web development just got a lot more exciting!`,
        
        `💡 Deep dive into ${cleanTopic}: The architectural improvements are game-changing! Memory usage is optimized, startup times are drastically reduced, and the overall developer experience is phenomenal. The new features include advanced tree-shaking, improved code splitting, and enhanced TypeScript support with better type inference. Testing framework integration is seamless, making TDD workflows more productive. Real-world applications are already seeing significant performance gains. The documentation is excellent with interactive examples and best practices. This is definitely a must-upgrade for any serious development team!`,
        
        `🔥 ${cleanTopic} is revolutionizing how we build applications! The practical benefits are immediately apparent: cleaner code architecture, better maintainability, and significantly improved performance metrics. Advanced features like automatic optimization, intelligent caching, and enhanced security measures make this a standout release. The learning curve is manageable thanks to excellent guides and community resources. Enterprise teams are adopting rapidly due to improved stability and comprehensive enterprise features. The ecosystem is growing with numerous plugins and integrations. Definitely worth exploring for your next project!`,
        
        `⚡ Technical breakdown of ${cleanTopic}: The under-the-hood improvements are remarkable! New compilation optimizations result in faster builds and smaller output files. The runtime performance shows consistent improvements across all major browsers. Enhanced debugging capabilities provide better insights into application behavior. The new API surface is more consistent and intuitive while maintaining backward compatibility. Code splitting and lazy loading have been refined for optimal performance. The TypeScript support is first-class with improved error messages and better IDE integration. This release sets a new standard for developer tools!`
    ];
    
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    const hashtags = generateTechHashtags(cleanTopic);
    const fullText = randomTemplate + ' ' + hashtags;
    
    console.log('Generated technical content length:', fullText.length);
    return processForTwitter(fullText, options);
};

const generateBusinessLocalTweet = (topic, options = {}) => {
    const cleanTopic = topic.trim();
    
    const templates = [
        `📈 ${cleanTopic} is transforming business landscapes! Companies implementing these strategies are seeing 3x growth in customer acquisition and 60% improvement in retention rates. The ROI is compelling with most organizations breaking even within 6 months. Case studies show consistent results across different industries and company sizes. The methodology is scalable and adaptable to various business models. Market leaders are already leveraging these insights to gain competitive advantages. Implementation requires strategic planning but the long-term benefits are substantial. This could be the game-changer your business needs!`,
        
        `💼 Strategic insights on ${cleanTopic}: The market dynamics are shifting and early adopters are positioning themselves advantageously. Customer behavior analysis reveals new opportunities for engagement and conversion optimization. Data-driven approaches are yielding measurable improvements in key performance indicators. Successful companies are integrating these concepts into their core business processes. The competitive landscape demands innovation and this provides a clear path forward. Investment in these areas shows strong correlation with revenue growth. The timing couldn't be better for strategic implementation!`,
        
        `🎯 ${cleanTopic} success stories are inspiring! Startups are achieving unicorn status by applying these principles effectively. Enterprise clients report significant efficiency gains and cost reductions. The customer satisfaction metrics speak for themselves with NPS scores improving dramatically. Market penetration strategies based on these insights are outperforming traditional approaches. The scalability factor makes this attractive for businesses of all sizes. Industry experts predict this will become standard practice within 24 months. Don't get left behind in this business evolution!`,
        
        `💡 Business transformation through ${cleanTopic}: The strategic implications are profound! Organizations are reimagining their value propositions and market positioning. Customer journey optimization is resulting in higher conversion rates and increased lifetime value. Operational efficiency improvements are freeing up resources for innovation and growth. Partnership opportunities are expanding as ecosystem effects take hold. The risk-reward profile is favorable for businesses ready to embrace change. Market timing suggests first-movers will capture disproportionate value. This represents a fundamental shift in how business gets done!`
    ];
    
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    const hashtags = generateBusinessHashtags(cleanTopic);
    const fullText = randomTemplate + ' ' + hashtags;
    
    console.log('Generated business content length:', fullText.length);
    return processForTwitter(fullText, options);
};

const generateCreativeLocalTweet = (topic, options = {}) => {
    const cleanTopic = topic.trim();
    
    const templates = [
        `✨ ${cleanTopic} is sparking incredible creativity! The artistic possibilities are endless and creators worldwide are pushing boundaries in fascinating ways. Visual storytelling has reached new heights with tools and techniques that were unimaginable just years ago. The community collaboration is inspiring with artists sharing knowledge and building upon each other's innovations. Accessibility improvements mean more people can participate in creative expression. The intersection of technology and artistry is producing breathtaking results. Museums and galleries are showcasing digital works alongside traditional pieces. The future of creative expression looks absolutely brilliant!`,
        
        `🎨 Creative exploration of ${cleanTopic}: The innovation happening in this space is mind-blowing! Artists are developing entirely new mediums and expression forms that challenge conventional boundaries. The democratization of creative tools means incredible diversity in voices and perspectives. Collaborative projects are emerging that span continents and cultures. The learning resources available make it easier than ever to develop artistic skills. Commercial applications are creating new career paths for creative professionals. The cultural impact is already visible in how we consume and interact with media. This creative renaissance is just getting started!`,
        
        `🌟 ${cleanTopic} inspiration strikes again! The creative community's response has been phenomenal with innovative projects launching daily. Traditional art forms are being reimagined through modern lenses while maintaining their essential beauty. Educational institutions are incorporating these approaches into their curricula. The therapeutic and wellness applications are proving beneficial for mental health and personal growth. Cross-disciplinary collaborations are producing unexpected and delightful results. The preservation of cultural heritage through these methods ensures future generations can experience our artistic legacy. Creativity truly knows no bounds!`,
        
        `🎭 Artistic revolution through ${cleanTopic}: The creative landscape is evolving at breakneck speed! New forms of expression are emerging that blend traditional techniques with cutting-edge innovation. The storytelling possibilities have expanded exponentially with immersive and interactive experiences. Creative professionals are finding unprecedented opportunities for artistic and financial success. The global reach means artists can connect with audiences worldwide instantly. Skill development resources have never been more accessible or comprehensive. The cultural dialogue facilitated by these creative works is enriching society. We're witnessing a golden age of human creativity!`
    ];
    
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    const hashtags = generateCreativeHashtags(cleanTopic);
    const fullText = randomTemplate + ' ' + hashtags;
    
    console.log('Generated creative content length:', fullText.length);
    return processForTwitter(fullText, options);
};

const generateGeneralLocalTweet = (topic, options = {}) => {
    const cleanTopic = topic.trim();
    
    const templates = [
        `🌟 Exploring ${cleanTopic} has been an incredible journey! The depth of knowledge and practical applications continue to amaze me. Every new discovery opens doors to possibilities I hadn't considered before. The community of enthusiasts and experts is welcoming and generous with sharing insights. Learning resources have never been more accessible or comprehensive. The real-world impact is becoming increasingly apparent across various sectors. Research breakthroughs are happening regularly, advancing our understanding significantly. The future implications are both exciting and transformative for society!`,
        
        `💫 ${cleanTopic} continues to evolve in fascinating ways! The interdisciplinary connections are revealing unexpected insights and solutions. Global collaboration is accelerating progress at an unprecedented pace. The practical applications are solving real problems and improving quality of life. Educational opportunities abound for those interested in diving deeper. The ripple effects are being felt across multiple industries and communities. Innovation cycles are shortening as knowledge sharing improves. We're living through remarkable times of discovery and advancement!`,
        
        `🚀 The world of ${cleanTopic} is expanding rapidly! New developments emerge weekly that challenge our previous understanding. The accessibility of information and tools has democratized participation. Success stories from around the globe inspire continued exploration and innovation. The collaborative spirit in this field creates synergies that amplify individual efforts. Long-term trends suggest we're only at the beginning of something transformative. The convergence with other fields is creating hybrid solutions and approaches. The excitement and momentum in this space is absolutely contagious!`,
        
        `✨ ${cleanTopic} represents the future unfolding before our eyes! The paradigm shifts happening challenge conventional wisdom and open new possibilities. Practitioners worldwide are reporting breakthrough moments and revelations. The learning curve rewards curiosity and persistence with profound insights. Cross-cultural perspectives enrich understanding and drive innovation. The sustainability and long-term viability make this more than just a trend. Investment and interest from major institutions validate the significance. We're witnessing history in the making!`
    ];
    
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    const hashtags = generateGeneralHashtags(cleanTopic);
    const fullText = randomTemplate + ' ' + hashtags;
    
    console.log('Generated general content length:', fullText.length);
    return processForTwitter(fullText, options);
};

const generateTechHashtags = (topic) => {
    const baseHashtags = ['#TechTrends', '#WebDev', '#Programming', '#Innovation'];
    const topicHash = `#${topic.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')}`;
    return [topicHash, ...baseHashtags.slice(0, 3)].join(' ');
};

const generateBusinessHashtags = (topic) => {
    const baseHashtags = ['#Business', '#Strategy', '#Growth', '#Innovation'];
    const topicHash = `#${topic.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')}`;
    return [topicHash, ...baseHashtags.slice(0, 3)].join(' ');
};

const generateCreativeHashtags = (topic) => {
    const baseHashtags = ['#Creative', '#Design', '#Art', '#Innovation'];
    const topicHash = `#${topic.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')}`;
    return [topicHash, ...baseHashtags.slice(0, 3)].join(' ');
};

const generateGeneralHashtags = (topic) => {
    const baseHashtags = ['#Innovation', '#Learning', '#Future', '#Technology'];
    const topicHash = `#${topic.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')}`;
    return [topicHash, ...baseHashtags.slice(0, 3)].join(' ');
};

// Updated processForTwitter to handle options
const processForTwitter = (fullText, options = {}) => {
    console.log('Processing for Twitter with options:', options);
    
    const { forceSingle, forceThread } = options;
    
    // If user wants single tweet only
    if (forceSingle) {
        if (fullText.length <= TWEET_MAX_LENGTH) {
            return { tweets: [fullText], isThread: false };
        } else {
            // Truncate to single tweet
            let truncated = fullText.substring(0, TWEET_MAX_LENGTH - 3);
            const lastSpace = truncated.lastIndexOf(' ');
            if (lastSpace > TWEET_MAX_LENGTH - 50) {
                truncated = truncated.substring(0, lastSpace) + '...';
            } else {
                truncated += '...';
            }
            return { tweets: [truncated], isThread: false };
        }
    }
    
    // If content fits in single tweet and user doesn't force thread
    if (fullText.length <= TWEET_MAX_LENGTH && !forceThread) {
        return { tweets: [fullText], isThread: false };
    }
    
    // Create thread
    const tweets = createLocalThread(fullText);
    return { tweets, isThread: tweets.length > 1 };
};

const createLocalThread = (text) => {
    console.log('Creating local thread from text length:', text.length);
    
    const tweets = [];
    const maxLength = THREAD_MAX_LENGTH;
    
    // Split by sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let currentTweet = '';
    
    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim() + (i < sentences.length - 1 ? '.' : '');
        const potentialTweet = currentTweet + (currentTweet ? ' ' : '') + sentence;
        
        if (potentialTweet.length > maxLength && currentTweet) {
            tweets.push(currentTweet.trim());
            currentTweet = sentence;
        } else {
            currentTweet = potentialTweet;
        }
    }
    
    if (currentTweet.trim()) {
        tweets.push(currentTweet.trim());
    }
    
    // Split any remaining long tweets
    const finalTweets = [];
    for (const tweet of tweets) {
        if (tweet.length > maxLength) {
            const words = tweet.split(' ');
            let currentWordTweet = '';
            
            for (const word of words) {
                const potential = currentWordTweet + (currentWordTweet ? ' ' : '') + word;
                if (potential.length > maxLength && currentWordTweet) {
                    finalTweets.push(currentWordTweet.trim());
                    currentWordTweet = word;
                } else {
                    currentWordTweet = potential;
                }
            }
            
            if (currentWordTweet.trim()) {
                finalTweets.push(currentWordTweet.trim());
            }
        } else {
            finalTweets.push(tweet);
        }
    }
    
    // Add thread numbering
    if (finalTweets.length > 1) {
        const numberedTweets = finalTweets.map((tweet, index) => {
            return `${index + 1}/${finalTweets.length} ${tweet}`;
        });
        console.log('Created thread with', numberedTweets.length, 'tweets');
        return numberedTweets;
    }
    
    return finalTweets;
};

module.exports = {
    generateLocalTweet,
    generateTechnicalLocalTweet,
    generateBusinessLocalTweet,
    generateCreativeLocalTweet
};