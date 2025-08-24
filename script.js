function analyzeText() {
  const text = document.getElementById("textInput").value.trim();

  if (!text) {
    document.getElementById("results").innerHTML =
      '<div class="empty-state"><p>Please enter some text to analyze.</p></div>';
    return;
  }

  const analysis = performAnalysis(text);
  displayResults(analysis);
}

function performAnalysis(text) {
  // Basic text metrics using RegEx
  const sentences = text.match(/[.!?]+/g) || [];
  const words = text.match(/\b\w+\b/g) || [];
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;

  // Word frequency analysis
  const wordFreq = {};
  words.forEach((word) => {
    const lowerWord = word.toLowerCase();
    wordFreq[lowerWord] = (wordFreq[lowerWord] || 0) + 1;
  });

  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Readability metrics
  const avgWordsPerSentence =
    sentences.length > 0 ? (words.length / sentences.length).toFixed(1) : 0;
  const avgCharsPerWord =
    words.length > 0 ? (charactersNoSpaces / words.length).toFixed(1) : 0;

  // Flesch Reading Ease Score (simplified)
  const avgSentenceLength = parseFloat(avgWordsPerSentence);
  const avgSyllablesPerWord = estimateSyllables(words);
  const fleschScore =
    206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;

  // SEO Analysis
  const seoMetrics = analyzeSEO(text, words);

  // Reading time estimation (average 200 words per minute)
  const readingTime = Math.ceil(words.length / 200);

  return {
    basic: {
      characters,
      charactersNoSpaces,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      readingTime,
    },
    readability: {
      fleschScore: Math.max(0, Math.min(100, fleschScore)).toFixed(1),
      avgWordsPerSentence,
      avgCharsPerWord,
      avgSyllablesPerWord: avgSyllablesPerWord.toFixed(1),
    },
    wordFreq: sortedWords,
    seo: seoMetrics,
  };
}

function estimateSyllables(words) {
  let totalSyllables = 0;
  words.forEach((word) => {
    // Simple syllable estimation using vowel groups
    const vowelGroups = word.toLowerCase().match(/[aeiouy]+/g) || [];
    let syllableCount = vowelGroups.length;

    // Adjust for silent e
    if (word.toLowerCase().endsWith("e") && syllableCount > 1) {
      syllableCount--;
    }

    // Minimum of 1 syllable per word
    syllableCount = Math.max(1, syllableCount);
    totalSyllables += syllableCount;
  });

  return words.length > 0 ? totalSyllables / words.length : 0;
}

function analyzeSEO(text, words) {
  // Keyword density for top words (excluding common stop words)
  const stopWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "this",
    "that",
    "these",
    "those",
  ];

  const meaningfulWords = words.filter(
    (word) => word.length > 2 && !stopWords.includes(word.toLowerCase())
  );

  const keywordFreq = {};
  meaningfulWords.forEach((word) => {
    const lowerWord = word.toLowerCase();
    keywordFreq[lowerWord] = (keywordFreq[lowerWord] || 0) + 1;
  });

  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({
      word,
      count,
      density: ((count / words.length) * 100).toFixed(2),
    }));

  // Text structure analysis
  const headingPattern = /^#{1,6}\s.+/gm;
  const headings = text.match(headingPattern) || [];

  const urlPattern = /https?:\/\/[^\s]+/gi;
  const urls = text.match(urlPattern) || [];

  return {
    topKeywords,
    headingCount: headings.length,
    linkCount: urls.length,
    keywordDiversity: Object.keys(keywordFreq).length,
  };
}

function getReadabilityLabel(score) {
  if (score >= 90) return { label: "Very Easy", class: "score-excellent" };
  if (score >= 80) return { label: "Easy", class: "score-excellent" };
  if (score >= 70) return { label: "Fairly Easy", class: "score-good" };
  if (score >= 60) return { label: "Standard", class: "score-good" };
  if (score >= 50) return { label: "Fairly Difficult", class: "score-fair" };
  if (score >= 30) return { label: "Difficult", class: "score-poor" };
  return { label: "Very Difficult", class: "score-poor" };
}

function displayResults(analysis) {
  const readability = getReadabilityLabel(
    parseFloat(analysis.readability.fleschScore)
  );

  const resultsHTML = `
                <div class="results-grid">
                    <div class="metric-card">
                        <div class="metric-value">${analysis.basic.words.toLocaleString()}</div>
                        <div class="metric-label">Words</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${analysis.basic.characters.toLocaleString()}</div>
                        <div class="metric-label">Characters</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${
                          analysis.basic.sentences
                        }</div>
                        <div class="metric-label">Sentences</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${
                          analysis.basic.paragraphs
                        }</div>
                        <div class="metric-label">Paragraphs</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${
                          analysis.basic.readingTime
                        }</div>
                        <div class="metric-label">Min Read</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${
                          analysis.readability.fleschScore
                        }</div>
                        <div class="metric-label">Readability</div>
                    </div>
                </div>

                <div class="detailed-analysis">
                    <div class="analysis-section">
                        <div class="analysis-title">📖 Readability Analysis</div>
                        <div class="analysis-item">
                            <span>Flesch Reading Ease</span>
                            <span class="readability-score ${
                              readability.class
                            }">
                                ${analysis.readability.fleschScore} - ${
    readability.label
  }
                            </span>
                        </div>
                        <div class="analysis-item">
                            <span>Average Words per Sentence</span>
                            <span>${
                              analysis.readability.avgWordsPerSentence
                            }</span>
                        </div>
                        <div class="analysis-item">
                            <span>Average Characters per Word</span>
                            <span>${analysis.readability.avgCharsPerWord}</span>
                        </div>
                        <div class="analysis-item">
                            <span>Estimated Syllables per Word</span>
                            <span>${
                              analysis.readability.avgSyllablesPerWord
                            }</span>
                        </div>
                    </div>

                    <div class="analysis-section">
                        <div class="analysis-title">🔍 SEO Metrics</div>
                        <div class="analysis-item">
                            <span>Keyword Diversity</span>
                            <span>${
                              analysis.seo.keywordDiversity
                            } unique keywords</span>
                        </div>
                        <div class="analysis-item">
                            <span>Headings Found</span>
                            <span>${analysis.seo.headingCount}</span>
                        </div>
                        <div class="analysis-item">
                            <span>Links Found</span>
                            <span>${analysis.seo.linkCount}</span>
                        </div>
                    </div>

                    <div class="analysis-section">
                        <div class="analysis-title">📊 Top Keywords</div>
                        ${analysis.seo.topKeywords
                          .map(
                            (keyword) => `
                            <div class="analysis-item">
                                <span><strong>${keyword.word}</strong> (${keyword.count} times)</span>
                                <span>${keyword.density}% density</span>
                            </div>
                        `
                          )
                          .join("")}
                    </div>

                    <div class="analysis-section">
                        <div class="analysis-title">🏆 Most Frequent Words</div>
                        ${analysis.wordFreq
                          .slice(0, 8)
                          .map(
                            ([word, count]) => `
                            <div class="analysis-item">
                                <span>${word}</span>
                                <span>
                                    ${count} times
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${
                                          (count / analysis.wordFreq[0][1]) *
                                          100
                                        }%"></div>
                                    </div>
                                </span>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
            `;

  document.getElementById("results").innerHTML = resultsHTML;
}

function clearText() {
  document.getElementById("textInput").value = "";
  document.getElementById("results").innerHTML =
    '<div class="empty-state"><p>Enter some text and click "Analyze Text" to see results.</p></div>';
}

function loadSample() {
  const sampleText = `The quick brown fox jumps over the lazy dog. This is a sample paragraph to demonstrate the text analysis capabilities of our tool.

Text analysis is an important skill in web development and content creation. It helps writers understand their content's readability, structure, and SEO potential.

By analyzing factors like word count, sentence length, and keyword density, writers can optimize their content for better engagement and search engine visibility. Modern content strategies rely heavily on data-driven insights to improve performance.`;

  document.getElementById("textInput").value = sampleText;
  analyzeText();
}

// Auto-analyze when typing stops (debounced)
let timeout;
document.getElementById("textInput").addEventListener("input", function () {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (this.value.trim()) {
      analyzeText();
    }
  }, 1000);
});

// Load sample on page load for demo
document.addEventListener("DOMContentLoaded", function () {
  loadSample();
});
