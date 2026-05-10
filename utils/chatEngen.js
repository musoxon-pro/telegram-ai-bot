const conversations = require('../data/conversations.json');

class ChatEngine {
    constructor() {
        this.categories = Object.keys(conversations);
    }

    normalizeText(text) {
        return text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '').replace(/\s+/g, ' ').trim();
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str1.length; i++) matrix[i] = [i];
        for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= str1.length; i++) {
            for (let j = 1; j <= str2.length; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        return matrix[str1.length][str2.length];
    }

    similarityScore(word1, word2) {
        const maxLen = Math.max(word1.length, word2.length);
        if (maxLen === 0) return 1;
        return 1 - this.levenshteinDistance(word1, word2) / maxLen;
    }

    findBestMatch(userInput) {
        const normalizedInput = this.normalizeText(userInput);
        const inputWords = normalizedInput.split(' ');
        let bestScore = 0;
        let bestCategory = null;

        for (const category of this.categories) {
            if (category === 'fallback') continue;
            const patterns = conversations[category].patterns || [];
            for (const pattern of patterns) {
                const normalizedPattern = this.normalizeText(pattern);
                // To‘liq moslik
                if (normalizedInput === normalizedPattern) {
                    return { category, score: 1.0, matchType: 'exact' };
                }
                // Qisman moslik
                if (normalizedInput.includes(normalizedPattern)) {
                    const score = 0.95;
                    if (score > bestScore) { bestScore = score; bestCategory = category; }
                }
                // So‘zma-so‘z moslik
                const patternWords = normalizedPattern.split(' ');
                let wordMatches = 0;
                for (const inputWord of inputWords) {
                    if (inputWord.length < 3) continue;
                    for (const patternWord of patternWords) {
                        if (this.similarityScore(inputWord, patternWord) > 0.8) {
                            wordMatches++;
                            break;
                        }
                    }
                }
                const patternMatchScore = wordMatches / Math.max(patternWords.length, 1);
                if (patternMatchScore > bestScore) {
                    bestScore = patternMatchScore;
                    bestCategory = category;
                }
            }
        }
        // Kalit so‘z qidiruv
        for (const category of this.categories) {
            if (category === 'fallback') continue;
            const patterns = conversations[category].patterns || [];
            for (const pattern of patterns) {
                const patternWords = pattern.toLowerCase().split(' ');
                for (const pWord of patternWords) {
                    if (pWord.length < 3) continue;
                    for (const iWord of inputWords) {
                        if (iWord.length < 3) continue;
                        const similarity = this.similarityScore(iWord, pWord);
                        if (similarity > 0.75 && similarity > bestScore) {
                            bestScore = similarity;
                            bestCategory = category;
                        }
                    }
                }
            }
        }

        return {
            category: bestCategory || 'fallback',
            score: bestScore,
            matchType: bestScore > 0.6 ? 'partial' : 'fallback'
        };
    }

    getResponse(userInput) {
        const match = this.findBestMatch(userInput);
        const responses = conversations[match.category].responses;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        return { text: randomResponse, category: match.category, confidence: match.score, matchType: match.matchType };
    }
}

module.exports = new ChatEngine();
