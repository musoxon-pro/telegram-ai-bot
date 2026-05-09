const conversations = require('../data/conversations.json');

class ChatEngine {
    constructor() {
        this.categories = Object.keys(conversations);
        console.log(`ChatEngine initialized with ${this.categories.length} categories`);
    }

    /**
     * Matnni tozalash va normallashtirish
     */
    normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Levenshtein masofasi - o'xshash so'zlarni topish
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }
        return matrix[len1][len2];
    }

    /**
     * So'zlar orasidagi o'xshashlik foizi
     */
    similarityScore(word1, word2) {
        const maxLen = Math.max(word1.length, word2.length);
        if (maxLen === 0) return 1.0;
        const distance = this.levenshteinDistance(word1, word2);
        return 1 - distance / maxLen;
    }

    /**
     * Asosiy javob topish funksiyasi
     */
    findBestMatch(userInput) {
        const normalizedInput = this.normalizeText(userInput);
        const inputWords = normalizedInput.split(' ');
        
        let bestScore = 0;
        let bestCategory = null;

        // Har bir kategoriya uchun
        for (const category of this.categories) {
            if (category === 'fallback') continue;
            
            const patterns = conversations[category].patterns || [];
            
            for (const pattern of patterns) {
                const normalizedPattern = this.normalizeText(pattern);
                
                // 1. To'liq moslik
                if (normalizedInput === normalizedPattern) {
                    return {
                        category: category,
                        score: 1.0,
                        matchType: 'exact'
                    };
                }
                
                // 2. Qisman moslik (pattern input ichida)
                if (normalizedInput.includes(normalizedPattern)) {
                    const score = 0.95;
                    if (score > bestScore) {
                        bestScore = score;
                        bestCategory = category;
                    }
                }
                
                // 3. So'zma-so'z moslik
                const patternWords = normalizedPattern.split(' ');
                let wordMatches = 0;
                
                for (const inputWord of inputWords) {
                    if (inputWord.length < 3) continue; // Juda qisqa so'zlarni o'tkazib yuborish
                    
                    for (const patternWord of patternWords) {
                        const similarity = this.similarityScore(inputWord, patternWord);
                        if (similarity > 0.8) { // 80% o'xshashlik
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

        // 4. To'g'ridan-to'g'ri kalit so'z qidirish
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

    /**
     * Javob generatsiya qilish
     */
    getResponse(userInput) {
        const match = this.findBestMatch(userInput);
        const responses = conversations[match.category].responses;
        
        // Tasodifiy javob tanlash
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return {
            text: randomResponse,
            category: match.category,
            confidence: match.score,
            matchType: match.matchType
        };
    }
}

module.exports = new ChatEngine();
