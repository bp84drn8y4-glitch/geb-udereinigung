
import { Customer } from "../data/customers";
import { AcceptanceProtocol, ProtocolService } from "../data/acceptanceProtocols";
import { Invoice } from "../data/invoices";
import { Contract } from "../data/contracts";
import { formatDuration } from "./timeUtils";

// --- Generic PDF Generation ---
const generatePdf = (title: string, htmlContent: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Bitte erlauben Sie Pop-ups für diese Seite, um den PDF-Export zu ermöglichen.");
        return;
    }
    const content = `
        <html>
            <head>
                <title>${title}</title>
                <style>
                    * { box-sizing: border-box; }
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                        margin: 0; 
                        padding: 5rem 2rem 2rem 2rem; /* Top padding for fixed nav bar */
                        color: #334155; 
                        background-color: #f1f5f9;
                    }
                    .content-wrapper {
                        max-width: 840px;
                        margin: 0 auto;
                        padding: 2rem;
                        background-color: white;
                        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
                        border-radius: 0.5rem;
                    }
                    h1, h2, h3 { color: #0369a1; }
                    h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
                    th, td { border: 1px solid #cbd5e1; padding: 0.75rem; text-align: left; vertical-align: top; }
                    th { background-color: #f0f9ff; font-weight: 600; color: #0284c7; }
                    tr:nth-child(even) { background-color: #f8fafc; }
                    .header, .footer { margin-bottom: 2rem; }
                    .footer { margin-top: 2rem; text-align: center; font-size: 0.8rem; color: #64748b; }
                    
                    /* Navigation Bar */
                    .nav-bar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        background-color: #ffffff;
                        padding: 0.75rem 2rem;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        display: flex;
                        justify-content: flex-end;
                        gap: 0.75rem;
                        z-index: 100;
                        border-bottom: 1px solid #e2e8f0;
                    }
                    .nav-button {
                        padding: 0.5rem 1.25rem;
                        background-color: #0ea5e9; /* sky-500 */
                        color: white;
                        border: none;
                        border-radius: 0.375rem;
                        cursor: pointer;
                        font-size: 0.875rem;
                        font-weight: 600;
                        transition: background-color 0.2s;
                    }
                    .nav-button:hover {
                        background-color: #0284c7; /* sky-600 */
                    }
                    .nav-button.secondary {
                        background-color: #64748b; /* slate-500 */
                        color: white;
                    }
                    .nav-button.secondary:hover {
                        background-color: #475569; /* slate-600 */
                    }

                    @media print {
                        body { 
                            padding: 0; 
                            background-color: white;
                        }
                        .nav-bar { display: none; }
                        .content-wrapper {
                            box-shadow: none;
                            border: none;
                            padding: 0;
                            border-radius: 0;
                            margin: 0;
                            max-width: 100%;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="nav-bar">
                    <button class="nav-button" onclick="window.print()">Drucken / PDF</button>
                    <button class="nav-button secondary" onclick="window.close()">Fenster schließen</button>
                </div>
                <div class="content-wrapper">
                    ${htmlContent}
                </div>
            </body>
        </html>
    `;
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
};

export const openDocument = (fileDataUrl: string, title: string) => {
    if (fileDataUrl.startsWith('data:text/html;base64,')) {
        // For our generated HTML documents, wrap them with controls.
        const base64Html = fileDataUrl.split(',')[1];
        try {
            const htmlContent = atob(base64Html);
            generatePdf(title, htmlContent); // Re-use the function that adds nav bars.
        } catch (e) {
            console.error("Error decoding base64 content:", e);
            // Fallback to direct open if decoding fails
            window.open(fileDataUrl, '_blank');
        }
    } else {
        // Fallback for other types like application/pdf
        window.open(fileDataUrl, '_blank');
    }
};


// --- Customer Portal PDF Generators ---

export const generateProtocolPDF = (customer: Customer, protocol: AcceptanceProtocol) => {
    const getServiceStatusText = (service: ProtocolService): string => {
        let status = '';
        if (service.isTarget && service.isFulfilled) status = '[Erfüllt]';
        else if (service.isTarget && !service.isFulfilled) status = '[Mangel]';
        else if (!service.isTarget && service.isFulfilled) status = '[Zusatzleistung]';
        const customText = service.customText ? ` - "${service.customText}"` : '';
        return `<li>${status} ${service.serviceName}${customText}</li>`;
    }
    const html = `
        <h1>Abnahmeprotokoll ${protocol.protocolNumber}</h1>
        <div class="header">
            <p><strong>Kunde:</strong> ${customer.name}</p>
            <p><strong>Datum:</strong> ${new Date(protocol.date).toLocaleDateString('de-DE')}</p>
        </div>
        <h3>Details</h3>
        <table>
            <tr><th>Mitarbeiter</th><td>${protocol.employees.join(', ')}</td></tr>
            <tr><th>Dauer</th><td>${formatDuration(protocol.durationMs)}</td></tr>
        </table>
        <h3>Leistungen</h3>
        <ul>${(protocol.services || []).map(getServiceStatusText).join('')}</ul>
        ${protocol.signature ? `<h3>Unterschrift</h3><img src="${protocol.signature}" alt="Unterschrift" style="max-width: 200px; border: 1px solid #ccc;"/>` : ''}
    `;
    generatePdf(`Protokoll ${protocol.protocolNumber}`, html);
};

export const generateInvoicePDF = (customer: Customer, invoice: Invoice) => {
    const renderPrice = (price: number) => price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    const totalNet = invoice.items.reduce((sum, item) => sum + item.price, 0);
    const vat = invoice.amount - totalNet;
    const html = `
        <h1>Rechnung ${invoice.invoiceNumber}</h1>
        <div class="header">
            <p><strong>Kunde:</strong> ${customer.name}</p>
            <p><strong>Rechnungsdatum:</strong> ${new Date(invoice.date).toLocaleDateString('de-DE')}</p>
        </div>
        <h3>Leistungsposten</h3>
        <table>
            <thead><tr><th>Beschreibung</th><th>Betrag</th></tr></thead>
            <tbody>
                ${invoice.items.map(item => `<tr><td>${item.description}</td><td>${renderPrice(item.price)}</td></tr>`).join('')}
            </tbody>
        </table>
        <h3>Zusammenfassung</h3>
        <table>
            <tr><td>Zwischensumme (Netto)</td><td>${renderPrice(totalNet)}</td></tr>
            <tr><td>MwSt.</td><td>${renderPrice(vat)}</td></tr>
            <tr><th>Gesamtbetrag (Brutto)</th><th>${renderPrice(invoice.amount)}</th></tr>
        </table>
    `;
    generatePdf(`Rechnung ${invoice.invoiceNumber}`, html);
};

export const generateContractPDF = (customer: Customer, contract: Contract) => {
     const html = `
        <h1>Vertragsdokument</h1>
        <div class="header">
            <p><strong>Kunde:</strong> ${customer.name}</p>
            <p><strong>Vertragsdatum:</strong> ${new Date(contract.date).toLocaleDateString('de-DE')}</p>
        </div>
        <h3>${contract.title}</h3>
        <p><em>Dies ist eine vereinfachte Ansicht. Der vollständige Vertrag ist als PDF hinterlegt.</em></p>
        <br/><p>[Inhalt des Vertrags...]</p>
    `;
    generatePdf(`Vertrag ${contract.title}`, html);
}

// --- Admin Export Function ---
export const exportProtocolsToPDF_Admin = (customer: Customer, protocols: AcceptanceProtocol[]) => {
    const getServiceStatusText = (service: ProtocolService): string => {
        let status = '';
        if (service.isTarget && service.isFulfilled) status = '[Erfüllt]';
        else if (service.isTarget && !service.isFulfilled) status = '[Mangel]';
        else if (!service.isTarget && service.isFulfilled) status = '[Zusatzleistung]';
        
        const customText = service.customText ? ` - "${service.customText}"` : '';
        return `<li>${status} ${service.serviceName}${customText}</li>`;
    }
    const tableRows = protocols.map(p => `
        <tr>
            <td>${p.protocolNumber}</td>
            <td>${new Date(p.date).toLocaleDateString('de-DE')}</td>
            <td>${p.employees.join(', ')}</td>
            <td>${formatDuration(p.durationMs)}</td>
            <td><ul>${(p.services || []).map(getServiceStatusText).join('')}</ul></td>
        </tr>
    `).join('');

    const content = `
        <h1>Abnahmeprotokoll-Export</h1>
        <h2>Kunde: ${customer.name}</h2>
        <p>Exportiert am: ${new Date().toLocaleDateString('de-DE')}</p>
        <table>
            <thead>
                <tr>
                    <th>Protokoll-Nr.</th>
                    <th>Datum</th>
                    <th>Mitarbeiter</th>
                    <th>Dauer</th>
                    <th>Leistungen</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;

    generatePdf(`Protokoll-Export ${customer.name}`, content);
};
