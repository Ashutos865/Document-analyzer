// --- Step 1: Initialize Supabase Client (Using Your Keys) ---
const SUPABASE_URL = 'https://qrockzlnfgfebcuanztb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyb2NremxuZmdmZWJjdWFuenRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMjI4MjEsImV4cCI6MjA3MTY5ODgyMX0.ND1jmNf_QaeaxwlE69d8qqKE6hbbmcxiqxz9pM6K480';

// THE FIX: We create a client instance with a new name, 'supabaseClient'.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const tabs = document.querySelectorAll('.tab-btn');
    const textArea = document.getElementById('text-area');
    const fileInput = document.getElementById('file-input');
    const analyzeBtn = document.getElementById('analyze-btn');

    const summaryElement = document.querySelector('#summary p');
    const clausesElement = document.querySelector('#clauses p');
    const lawsElement = document.querySelector('#laws p');
    const loadingSpinner = document.getElementById('loading-spinner');

    let activeTab = 'text-input';

    // --- Tab Switching Logic ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            activeTab = tab.dataset.tab;

            if (activeTab === 'text-input') {
                textArea.style.display = 'block';
                fileInput.style.display = 'none';
            } else {
                textArea.style.display = 'none';
                fileInput.click();
            }
        });
    });

    // --- File Input Logic ---
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            console.log(`File selected: ${fileInput.files[0].name}`);
            alert("File upload analysis is not yet implemented. Please use the Text Input tab.");
        }
    });

    // --- Analyze Button Click Logic ---
    analyzeBtn.addEventListener('click', async () => {
        // This is the click handler for the button. It was not working because the script was crashing before it could be attached.
        if (activeTab === 'text-input') {
            const text = textArea.value;
            if (!text.trim()) {
                alert('Please paste some text to analyze.');
                return;
            }
            await getAnalysis(text);
        } else {
            alert('File analysis is not yet connected. Please use the Text Input tab.');
        }
    });

    // --- Main Analysis Function ---
    async function getAnalysis(documentText) {
        loadingSpinner.style.display = 'block';
        summaryElement.textContent = '';
        clausesElement.textContent = '';
        lawsElement.textContent = '';
        summaryElement.classList.add('placeholder');
        clausesElement.classList.add('placeholder');
        lawsElement.classList.add('placeholder');

        try {
            // THE FIX: We use our newly named 'supabaseClient' to call the function.
            const { data, error } = await supabaseClient.functions.invoke('legal-analyzer', {
                body: { documentText: documentText },
            });

            if (error) throw error;
            
            // Display real results from the AI
            loadingSpinner.style.display = 'none';
            summaryElement.textContent = data.summary;
            clausesElement.textContent = data.clauses;
            lawsElement.textContent = data.laws;
            summaryElement.classList.remove('placeholder');
            clausesElement.classList.remove('placeholder');
            lawsElement.classList.remove('placeholder');

        } catch (error) {
            loadingSpinner.style.display = 'none';
            alert('Error analyzing document: ' + error.message);
            summaryElement.textContent = "An error occurred. Check the browser console and ensure your Supabase function is deployed correctly.";
        }
    }
});
