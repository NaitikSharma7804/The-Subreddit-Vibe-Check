import Sentiment from 'sentiment';

const sentimentAnalyzer = new Sentiment();

export function analyzePostsSentiment(posts) {
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  const analyzedPosts = posts.map(post => {
    const analysis = sentimentAnalyzer.analyze(post.title);
    let sentimentType = 'Neutral';
    
    if (analysis.score > 0) {
      sentimentType = 'Positive';
      positiveCount++;
    } else if (analysis.score < 0) {
      sentimentType = 'Negative';
      negativeCount++;
    } else {
      neutralCount++;
    }

    return {
      ...post,
      sentimentScore: analysis.score,
      sentimentType,
    };
  });

  return {
    analyzedPosts,
    stats: {
      total: posts.length,
      positive: positiveCount,
      negative: negativeCount,
      neutral: neutralCount,
    }
  };
}