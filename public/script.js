document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const textArea = document.getElementById('text-area');
    const fileInput = document.getElementById('file-input');
    const fileUploadPlaceholder = document.getElementById('file-upload-placeholder');
    const analyzeBtn = document.getElementById('analyze-btn');

    const summaryElement = document.querySelector('#summary p');
    const clausesElement = document.querySelector('#clauses p');
    const lawsElement = document.querySelector('#laws p');
    const loadingSpinner = document.getElementById('loading-spinner');
    const analysisResults = document.getElementById('analysis-results');

    let activeTab = 'text-input';
    let uploadedFile = null;

    // Function to handle UI updates when switching tabs
    function switchInputView(tab) {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;

        if (activeTab === 'text-input') {
            textArea.style.display = 'block';
            fileUploadPlaceholder.style.display = 'none';
        } else {
            textArea.style.display = 'none';
            // Use 'flex' for the file upload area as per the new CSS
            fileUploadPlaceholder.style.display = 'flex'; 
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchInputView(tab));
    });

    // Make the entire placeholder clickable
    fileUploadPlaceholder.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            uploadedFile = fileInput.files[0];
            fileUploadPlaceholder.querySelector('p').innerHTML = `File selected: <span>${uploadedFile.name}</span>`;
        }
    });

    analyzeBtn.addEventListener('click', async () => {
        if (activeTab === 'text-input') {
            const text = textArea.value;
            if (!text.trim()) {
                alert('Please paste some text to analyze.');
                return;
            }
            await getAnalysis(text, null);
        } else if (uploadedFile) {
            await getAnalysis(null, uploadedFile);
        } else {
            alert('Please select a file to analyze.');
        }
    });

    async function getAnalysis(documentText, documentFile) {
        loadingSpinner.style.display = 'block';
        analysisResults.removeAttribute('data-loaded');
        
        // Reset to placeholder text and style
        summaryElement.textContent = 'Analyzing...';
        clausesElement.textContent = '';
        lawsElement.textContent = '';
        summaryElement.classList.add('placeholder');
        clausesElement.classList.add('placeholder');
        lawsElement.classList.add('placeholder');

        const formData = new FormData();
        if (documentText) {
            formData.append('documentText', documentText);
        }
        if (documentFile) {
            formData.append('documentFile', documentFile);
        }

        try {
            const response = await fetch('http://localhost:3000/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || `Server error: ${response.statusText}`);
            }

            const analysis = await response.json();

            summaryElement.textContent = analysis.summary || 'No summary provided.';
            clausesElement.textContent = analysis.keyClauses || 'No key clauses identified.';
            lawsElement.textContent = analysis.relevantLaws || 'No relevant laws found.';
            
            summaryElement.classList.remove('placeholder');
clausesElement.classList.remove('placeholder');
lawsElement.classList.remove('placeholder');
            
            // Set the attribute to change text color via CSS
            analysisResults.setAttribute('data-loaded', 'true');

        } catch (error) {
            console.error('Error:', error);
            summaryElement.textContent = `An error occurred: ${error.message}. Please check the console for details.`;
            clausesElement.textContent = "";
            lawsElement.textContent = "";
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }
});
