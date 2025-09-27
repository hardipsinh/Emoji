// Application data
const appData = {
    "emojis": ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿","👹","👺","🤡","💩","👻","💀","☠️","👽","👾","🤖","🎃"],
    "alphabet": ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
};

// Zero-width characters for steganography
const ZERO_WIDTH_CHARS = {
    '0': '\u200B', // Zero Width Space
    '1': '\u200C', // Zero Width Non-Joiner
    'separator': '\u200D' // Zero Width Joiner (used as separator)
};

// Application state
let currentMode = 'encode';
let currentPicker = 'emoji';
let selectedChar = '';

// DOM elements
const decodeBtn = document.getElementById('decodeBtn');
const encodeBtn = document.getElementById('encodeBtn');
const emojiTab = document.getElementById('emojiTab');
const letterTab = document.getElementById('letterTab');
const emojiPicker = document.getElementById('emojiPicker');
const letterPicker = document.getElementById('letterPicker');
const messageInput = document.getElementById('messageInput');
const resultOutput = document.getElementById('resultOutput');
const copyBtn = document.getElementById('copyBtn');
const inputLabel = document.getElementById('inputLabel');

// Initialize the application
function init() {
    populateEmojiPicker();
    populateLetterPicker();
    setupEventListeners();
    updateUI();
}

// Populate emoji picker
function populateEmojiPicker() {
    emojiPicker.innerHTML = '';
    appData.emojis.forEach(emoji => {
        const emojiElement = document.createElement('div');
        emojiElement.className = 'picker-item';
        emojiElement.textContent = emoji;
        emojiElement.addEventListener('click', () => selectCharacter(emoji));
        emojiPicker.appendChild(emojiElement);
    });
}

// Populate letter picker
function populateLetterPicker() {
    letterPicker.innerHTML = '';
    appData.alphabet.forEach(letter => {
        const letterElement = document.createElement('div');
        letterElement.className = 'picker-item letter-item';
        letterElement.textContent = letter;
        letterElement.addEventListener('click', () => selectCharacter(letter));
        letterPicker.appendChild(letterElement);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Mode toggle buttons
    decodeBtn.addEventListener('click', () => setMode('decode'));
    encodeBtn.addEventListener('click', () => setMode('encode'));
    
    // Picker tabs
    emojiTab.addEventListener('click', () => setPicker('emoji'));
    letterTab.addEventListener('click', () => setPicker('letter'));
    
    // Message input
    messageInput.addEventListener('input', handleInput);
    
    // Copy button
    copyBtn.addEventListener('click', copyToClipboard);
}

// Set current mode
function setMode(mode) {
    currentMode = mode;
    updateUI();
    processInput();
}

// Set current picker
function setPicker(picker) {
    currentPicker = picker;
    updateUI();
}

// Update UI based on current state
function updateUI() {
    // Update mode buttons
    decodeBtn.classList.toggle('active', currentMode === 'decode');
    decodeBtn.classList.toggle('btn--primary', currentMode === 'decode');
    decodeBtn.classList.toggle('btn--outline', currentMode === 'encode');
    
    encodeBtn.classList.toggle('active', currentMode === 'encode');
    encodeBtn.classList.toggle('btn--primary', currentMode === 'encode');
    encodeBtn.classList.toggle('btn--outline', currentMode === 'decode');
    
    // Update picker tabs
    emojiTab.classList.toggle('active', currentPicker === 'emoji');
    letterTab.classList.toggle('active', currentPicker === 'letter');
    
    // Show/hide pickers
    emojiPicker.classList.toggle('hidden', currentPicker !== 'emoji');
    letterPicker.classList.toggle('hidden', currentPicker !== 'letter');
    
    // Update labels and placeholders based on mode
    if (currentMode === 'encode') {
        inputLabel.textContent = 'Message to hide:';
        messageInput.placeholder = 'Type your secret message here...';
        resultOutput.placeholder = 'Your encoded result will appear here...';
    } else {
        inputLabel.textContent = 'Encoded text to decode:';
        messageInput.placeholder = 'Paste the encoded text here...';
        resultOutput.placeholder = 'Your decoded message will appear here...';
    }
    
    // Clear selection when switching modes or pickers
    clearSelection();
}

// Select a character (emoji or letter)
function selectCharacter(char) {
    selectedChar = char;
    
    // Update visual selection
    const pickerGrid = currentPicker === 'emoji' ? emojiPicker : letterPicker;
    const items = pickerGrid.querySelectorAll('.picker-item');
    items.forEach(item => {
        item.classList.toggle('selected', item.textContent === char);
    });
    
    // Process input if we have both message and selected character
    if (messageInput.value.trim() || currentMode === 'decode') {
        processInput();
    }
}

// Clear character selection
function clearSelection() {
    selectedChar = '';
    const items = document.querySelectorAll('.picker-item');
    items.forEach(item => item.classList.remove('selected'));
    resultOutput.value = '';
    copyBtn.disabled = true;
}

// Handle input changes
function handleInput() {
    processInput();
}

// Process input based on current mode
function processInput() {
    const inputText = messageInput.value;
    
    if (!inputText.trim()) {
        resultOutput.value = '';
        copyBtn.disabled = true;
        return;
    }
    
    if (currentMode === 'encode') {
        if (!selectedChar) {
            resultOutput.value = '';
            copyBtn.disabled = true;
            return;
        }
        const encoded = encodeMessage(inputText, selectedChar);
        resultOutput.value = encoded;
        copyBtn.disabled = false;
    } else {
        const decoded = decodeMessage(inputText);
        resultOutput.value = decoded;
        copyBtn.disabled = !decoded;
    }
}

// Encode message using steganography
function encodeMessage(message, char) {
    try {
        // Convert message to binary
        const binaryMessage = Array.from(message)
            .map(c => c.charCodeAt(0).toString(2).padStart(16, '0'))
            .join('');
        
        // Convert binary to zero-width characters
        const stegoText = binaryMessage
            .split('')
            .map(bit => ZERO_WIDTH_CHARS[bit])
            .join('');
        
        // Combine character with steganographic text
        return char + ZERO_WIDTH_CHARS.separator + stegoText + ZERO_WIDTH_CHARS.separator;
    } catch (error) {
        console.error('Encoding error:', error);
        return char;
    }
}

// Decode message from steganographic text
function decodeMessage(encodedText) {
    try {
        // Find zero-width characters in the text
        const zwChars = encodedText.match(/[\u200B\u200C\u200D]/g);
        if (!zwChars || zwChars.length < 3) {
            return '';
        }
        
        // Remove the separators and extract the binary data
        const separatorIndices = [];
        for (let i = 0; i < zwChars.length; i++) {
            if (zwChars[i] === ZERO_WIDTH_CHARS.separator) {
                separatorIndices.push(i);
            }
        }
        
        if (separatorIndices.length < 2) {
            return '';
        }
        
        // Extract binary data between separators
        const binaryChars = zwChars.slice(separatorIndices[0] + 1, separatorIndices[1]);
        
        // Convert zero-width characters back to binary
        const binaryString = binaryChars
            .map(char => {
                if (char === ZERO_WIDTH_CHARS['0']) return '0';
                if (char === ZERO_WIDTH_CHARS['1']) return '1';
                return '';
            })
            .join('');
        
        // Convert binary back to text
        if (binaryString.length % 16 !== 0) {
            return '';
        }
        
        const decodedMessage = [];
        for (let i = 0; i < binaryString.length; i += 16) {
            const binaryChar = binaryString.substr(i, 16);
            const charCode = parseInt(binaryChar, 2);
            if (charCode > 0 && charCode < 65536) {
                decodedMessage.push(String.fromCharCode(charCode));
            }
        }
        
        return decodedMessage.join('');
    } catch (error) {
        console.error('Decoding error:', error);
        return '';
    }
}

// Copy result to clipboard
async function copyToClipboard() {
    try {
        const text = resultOutput.value;
        if (!text) return;
        
        await navigator.clipboard.writeText(text);
        
        // Show copy feedback
        const copyText = copyBtn.querySelector('.copy-text');
        const copySuccess = copyBtn.querySelector('.copy-success');
        
        copyText.classList.add('hidden');
        copySuccess.classList.remove('hidden');
        copyBtn.classList.add('copied');
        
        // Reset after 2 seconds
        setTimeout(() => {
            copyText.classList.remove('hidden');
            copySuccess.classList.add('hidden');
            copyBtn.classList.remove('copied');
        }, 2000);
        
    } catch (error) {
        console.error('Copy failed:', error);
        // Fallback for older browsers
        resultOutput.select();
        document.execCommand('copy');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);