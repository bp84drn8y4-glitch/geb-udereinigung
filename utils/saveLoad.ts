// Simple XOR cipher for light obfuscation. Not for high-security needs.
const ENCRYPTION_KEY = 'FirstHauserSecretKeyForDataProtection2024';

const cipher = (data: string, key: string): string => {
    let result = '';
    for (let i = 0; i < data.length; i++) {
        result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
};

/**
 * Saves the entire application state to a file.
 * The state is stringified, encrypted, base64 encoded, and then downloaded.
 * @param appState The complete state object of the application.
 */
export const saveStateToFile = (appState: object) => {
    try {
        const jsonString = JSON.stringify(appState);
        const encrypted = cipher(jsonString, ENCRYPTION_KEY);
        // Using btoa for Base64 encoding
        const base64 = btoa(encrypted); 
        
        const blob = new Blob([base64], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        a.download = `FirstHauser_${date}.fhg`;
        a.href = url;
        
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error saving state:", error);
        alert("Ein Fehler ist beim Speichern der Daten aufgetreten.");
    }
};

/**
 * Loads the application state from a file.
 * Reads the file, base64 decodes, decrypts, and parses the JSON.
 * @param file The .fhg file selected by the user.
 * @returns A promise that resolves with the loaded application state object.
 */
export const loadStateFromFile = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!file.name.endsWith('.fhg')) {
            return reject(new Error("Ungültiger Dateityp. Bitte eine .fhg Datei auswählen."));
        }
        
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const base64 = event.target?.result as string;
                // Using atob for Base64 decoding
                const encrypted = atob(base64); 
                const jsonString = cipher(encrypted, ENCRYPTION_KEY);
                const loadedState = JSON.parse(jsonString);
                resolve(loadedState);
            } catch (error) {
                reject(new Error("Fehler beim Verarbeiten der Datei. Die Datei ist möglicherweise beschädigt."));
            }
        };
        
        reader.onerror = (error) => {
            reject(new Error("Fehler beim Lesen der Datei."));
        };
        
        reader.readAsText(file);
    });
};
