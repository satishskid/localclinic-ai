# Privacy Policy

**AI Medical Assistant - Browser Extension**

*Last Updated: December 11, 2025*

---

## Overview

AI Medical Assistant ("the Extension", "we", "our") is committed to protecting your privacy. This privacy policy explains how our browser extension handles your data.

**Key Point: All data processing occurs locally on your device. No medical data, personal information, or analysis results are ever transmitted to external servers.**

---

## Data Collection and Processing

### What We DON'T Collect

- ❌ **No Personal Health Information (PHI)** is collected or transmitted
- ❌ **No medical records** are stored on external servers
- ❌ **No patient data** leaves your device
- ❌ **No browsing history** is tracked or collected
- ❌ **No analytics or tracking** data is sent to third parties
- ❌ **No account registration** is required
- ❌ **No cookies** are used for tracking purposes

### What Stays on Your Device

- ✅ **AI Models**: Downloaded once and cached locally in your browser
- ✅ **Analysis Results**: Processed and displayed locally, never transmitted
- ✅ **User Preferences**: Stored in browser's local storage only
- ✅ **Report Drafts**: Saved locally until you choose to export them

---

## How the Extension Works

### Local AI Processing

1. **Text/Image Analysis**: When you analyze medical content, the AI model runs entirely within your browser using WebAssembly technology
2. **No Server Communication**: Analysis requests never leave your device
3. **Model Caching**: AI models are downloaded once from public CDN sources (Hugging Face) and cached locally for offline use

### Data Flow

```
[Medical Content on Screen] → [Local AI Processing] → [Results Displayed Locally]
                                     ↓
                              NO EXTERNAL SERVERS
```

---

## HIPAA Compliance Considerations

This extension is designed with healthcare privacy in mind:

### Privacy by Design
- **Client-Side Processing**: All AI inference happens in your browser
- **No Data Transmission**: Medical content is never sent to remote servers
- **No Data Storage**: We don't store any health information
- **No Third-Party Access**: No external services receive your data

### Healthcare Provider Responsibilities
While this extension processes data locally, healthcare providers using this tool should:
- Follow their organization's IT security policies
- Ensure devices running the extension are properly secured
- Review and verify AI-generated suggestions before clinical use
- Not rely solely on AI analysis for clinical decisions

### Limitations
- This extension is an **assistive tool**, not a diagnostic device
- AI analysis should be verified by qualified healthcare professionals
- The extension does not replace clinical judgment

---

## Permissions Explained

The extension requests the following browser permissions:

| Permission | Purpose | Data Access |
|------------|---------|-------------|
| `activeTab` | Access current page content for analysis | Only when you click analyze |
| `storage` | Save your preferences locally | Local browser storage only |
| `contextMenus` | Right-click menu options | No data collection |
| `scripting` | Inject analysis UI into pages | Local execution only |

### Host Permissions
- `<all_urls>`: Required to analyze content on any medical website you visit
- **Note**: The extension only activates when you explicitly request analysis

---

## Third-Party Services

### AI Model Sources
- **Hugging Face** (huggingface.co): AI models are downloaded from Hugging Face's CDN
- Models downloaded: Transformers.js compatible models for text/image analysis
- No user data is sent to Hugging Face

### No Other Third Parties
- No analytics services (Google Analytics, etc.)
- No advertising networks
- No data brokers
- No cloud storage services

---

## Data Retention

### Local Data
| Data Type | Retention | Your Control |
|-----------|-----------|--------------|
| AI Models | Until browser cache cleared | Clear via browser settings |
| Preferences | Until extension uninstalled | Clear via extension settings |
| Analysis History | Session only (not persisted) | Cleared on browser close |

### Server Data
**None** - We do not operate servers that store user data.

---

## Your Rights and Controls

### You Can:
- ✅ **Uninstall** the extension at any time, removing all local data
- ✅ **Clear cached models** through your browser's storage settings
- ✅ **Reset preferences** through the extension settings
- ✅ **Use offline** after initial model download (no network required)

### Data Portability
- Export your generated reports in standard formats (text, PDF)
- All exports are initiated by you and saved locally

---

## Security Measures

### Technical Security
- **Sandboxed Execution**: Extension runs in browser's isolated environment
- **No External API Calls**: Analysis doesn't require internet after model download
- **Manifest V3**: Uses Chrome's latest, most secure extension framework
- **Content Security Policy**: Strict CSP prevents code injection

### Best Practices
- Keep your browser updated
- Download the extension only from official browser stores
- Review extension permissions before installation

---

## Children's Privacy

This extension is intended for use by healthcare professionals and is not directed at children under 13. We do not knowingly collect data from children.

---

## Changes to This Policy

We may update this privacy policy to reflect changes in our practices or for legal compliance. Changes will be noted with an updated "Last Updated" date.

For significant changes, we will:
- Update the version number in the extension
- Provide notice through the extension update notes

---

## Contact Information

For privacy-related questions or concerns:

- **GitHub Issues**: [https://github.com/satishskid/ConciousAI/issues](https://github.com/satishskid/ConciousAI/issues)
- **Email**: [Contact through GitHub]

---

## Regulatory Compliance

### GDPR (European Users)
- **Legal Basis**: Legitimate interest (providing the service)
- **Data Processing**: Local only, no cross-border transfers
- **Rights**: Access, rectification, erasure - all controllable locally

### CCPA (California Users)
- **Sale of Data**: We do NOT sell personal information
- **Collection**: No personal information collected
- **Opt-Out**: Not applicable as no data is collected

### HIPAA (US Healthcare)
- **Covered Entity Status**: This extension is a tool, not a covered entity
- **PHI Handling**: No PHI is collected, transmitted, or stored by the extension
- **BAA**: Not required as no PHI is processed by our systems

---

## Summary

| Question | Answer |
|----------|--------|
| Do you collect my medical data? | **No** |
| Is my data sent to servers? | **No** |
| Can you see my analysis results? | **No** |
| Is my data sold to third parties? | **No** |
| Can I use this offline? | **Yes** (after initial model download) |
| Is my data encrypted? | N/A (no data leaves your device) |

---

*This privacy policy is effective as of December 11, 2025.*

**AI Medical Assistant** - Privacy-First Medical AI
