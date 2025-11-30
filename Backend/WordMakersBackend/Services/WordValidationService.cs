using System.Collections.Generic;
using System.Linq;

namespace WordMakersBackend.Services
{
    public interface IWordValidationService
    {
        bool IsValidAnswer(string userAnswer, string originalWord);
    }

    public class WordValidationService : IWordValidationService
    {
        // Dictionary of letter combinations and their valid words
        private readonly Dictionary<string, HashSet<string>> _validWordGroups = new()
        {
            // 3-letter words
            ["ACT"] = new HashSet<string> { "CAT", "ACT" },
            ["DGO"] = new HashSet<string> { "DOG", "GOD" },
            ["BDI"] = new HashSet<string> { "BIRD", "DRIB" },
            ["FHI"] = new HashSet<string> { "FISH" },
            ["ERT"] = new HashSet<string> { "TREE" },

            // 4-5 letter words
            ["EHOUS"] = new HashSet<string> { "HOUSE" },
            ["AERTW"] = new HashSet<string> { "WATER" },
            ["ABDER"] = new HashSet<string> { "BREAD", "BEARD", "BARED", "DEBAR" },
            ["EHNOP"] = new HashSet<string> { "PHONE" },
            ["CIMSU"] = new HashSet<string> { "MUSIC" },

            // 6-8 letter words
            ["CEMOPRTU"] = new HashSet<string> { "COMPUTER" },
            ["ABINORW"] = new HashSet<string> { "RAINBOW" },
            ["ABILRRY"] = new HashSet<string> { "LIBRARY" },
            ["ADEGNR"] = new HashSet<string> { "GARDEN", "GANDER", "RANGED", "DANGER" },
            ["CEIHKNT"] = new HashSet<string> { "KITCHEN", "THICKEN" },
            ["AEHLNPT"] = new HashSet<string> { "ELEPHANT" },
            ["AIMNNOTU"] = new HashSet<string> { "MOUNTAIN" },
            ["BEFLRTTUY"] = new HashSet<string> { "BUTTERFLY", "FLUTTERBY" },
            ["ACCEHLOOT"] = new HashSet<string> { "CHOCOLATE" },
            ["ADEENRTUV"] = new HashSet<string> { "ADVENTURE", "DENATURE" },

            // 9-11 letter words
            ["DEGKLNOW"] = new HashSet<string> { "KNOWLEDGE" },
            ["EINRSTUVY"] = new HashSet<string> { "UNIVERSITY" },
            ["CEGHLOOTY"] = new HashSet<string> { "TECHNOLOGY" },
            ["DEFHINPRS"] = new HashSet<string> { "FRIENDSHIP" },
            ["ABCEEILNORT"] = new HashSet<string> { "CELEBRATION", "CALEBRATION" }
        };

        // Common valid English words that might be formed from letter combinations
        private readonly HashSet<string> _commonEnglishWords = new()
        {
            // 3-letter words
            "CAT", "ACT", "DOG", "GOD", "TAR", "RAT", "ART", "BAT", "TAB",
            "TEA", "ATE", "EAT", "TAR", "PAN", "NAP", "TAP", "PAT", "APT",

            // 4-letter words
            "READ", "DEAR", "DARE", "BEAR", "BARE", "TEAR", "RATE", "TARE",
            "PEAR", "REAP", "RAPE", "PARE", "LEAP", "PALE", "PLEA", "PEAL",

            // 5-letter words
            "BREAD", "BEARD", "BARED", "DEBAR", "LATER", "ALTER", "ALERT",
            "WATER", "TOWER", "WROTE", "WORTH",

            // Longer words
            "DANGER", "GARDEN", "GANDER", "RANGED",
            "THICKEN", "KITCHEN",
            "DENATURE", "ADVENTURE"
        };

        public bool IsValidAnswer(string userAnswer, string originalWord)
        {
            if (string.IsNullOrWhiteSpace(userAnswer))
                return false;

            userAnswer = userAnswer.Trim().ToUpper();
            originalWord = originalWord.ToUpper();

            // First check if it's the original word
            if (userAnswer == originalWord)
                return true;

            // Check if letters match (anagram check)
            if (!IsAnagram(userAnswer, originalWord))
                return false;

            // Get sorted letters as key
            var sortedLetters = GetSortedLetters(originalWord);

            // Check if this letter combination has known valid words
            if (_validWordGroups.ContainsKey(sortedLetters))
            {
                return _validWordGroups[sortedLetters].Contains(userAnswer);
            }

            // For words not in our predefined groups, accept if it's a common English word
            // and has the same letters
            return _commonEnglishWords.Contains(userAnswer);
        }

        private bool IsAnagram(string word1, string word2)
        {
            if (word1.Length != word2.Length)
                return false;

            var sorted1 = GetSortedLetters(word1);
            var sorted2 = GetSortedLetters(word2);

            return sorted1 == sorted2;
        }

        private string GetSortedLetters(string word)
        {
            return new string(word.ToUpper().OrderBy(c => c).ToArray());
        }
    }
}