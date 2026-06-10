"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./AIAssistantDrawer.module.css";
import type { DocumentProcessResponse } from "../types/ocr.types";
import { uploadDocument, extractFieldsFromDocument } from "../services/ocrApi";
import { mapOCRMetadataToFormFields } from "../utils/ocrDataMapper";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SuggestionChip {
  label: string;
  prompt: string;
}

interface Props {
  onClose: () => void;
  onExtract: (res: DocumentProcessResponse) => void;
  onObservationExtract: (res: DocumentProcessResponse) => void;
  onTemplateSelect: (template: string) => void;
  currentStage: "unit-details" | "observations";
  lastOCRResult: DocumentProcessResponse | null;
  externalMessage: { role: string; content: string; id?: string } | null;
}

const STAGE_CHIPS: Record<string, SuggestionChip[]> = {
  "unit-details": [
    { label: "Analyze risks", prompt: "Analyze the safety risks for this unit and department." },
    { label: "Fill from report", prompt: "Can you help me auto-fill the SO form from my safety report?" },
    { label: "Best practices", prompt: "What are the best practices for a safety observation in the IT department?" },
    { label: "HOD guidelines", prompt: "What should the HOD review in this SO form?" },
  ],
  observations: [
    { label: "Suggest corrections", prompt: "Suggest corrective actions for the observations I've entered." },
    { label: "Risk assessment", prompt: "Assess the risk potential for the current observations." },
    { label: "Extract from PDF", prompt: "I have a safety report PDF. Can you extract the observations from it?" },
    { label: "Summarize SO", prompt: "Summarize all observations entered so far." },
  ],
};

const WELCOME_MESSAGES: Record<string, string> = {
  "unit-details": "I can help you fill in the **Unit & SO Details**, analyze risks, or auto-fill from a safety report. What would you like to do?",
  observations: "You're now in the **Observations** section. I can suggest corrective actions, assess risks, or extract observations from a PDF or image. How can I help?",
};

const disasterOptions = [
  "Wildfire / Vegetation Fire",
  "Inundation / Flooding",
  "Industrial Chemical/Oil Spill",
  "Earthquake Disruption",
  "Explosion / Fireball",
  "Structural Collapse",
  "Landslide / Rockfall",
  "Thermal / Fire Hazard",
  "Flooding / Accumulation",
  "Vegetation / Environmental Hazard",
  "Structural / Debris Hazard",
  "Environmental Anomaly",
];

const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const renderMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/^[-•]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    .replace(/\n/g, "<br />");
};

const AIIcon = () => (
  <svg viewBox="0 0 24 24" fill="white" width="14" height="14" aria-hidden="true">
    <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1v1a7 7 0 01-7 7H9a7 7 0 01-7-7v-1H1a1 1 0 110-2h1a7 7 0 017-7h1V5.73A2 2 0 0112 2zm-4 9a5 5 0 000 10h8a5 5 0 000-10H8zm3 2h2v2h-2v-2zm-3 0h2v2H8v-2zm5 0h2v2h-2v-2z" />
  </svg>
);

const TypingIndicator = () => (
  <div className={styles.typingRow}>
    <div className={styles.aiAvatar} aria-label="AI"><AIIcon /></div>
    <div className={styles.typingBubble}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </div>
  </div>
);

const AIAssistantDrawer: React.FC<Props> = ({
  onClose, onExtract, onObservationExtract, onTemplateSelect,
  currentStage, lastOCRResult, externalMessage,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractionTarget, setExtractionTarget] = useState<"unit-details" | "observations">(currentStage);

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadPlaceholderId = useRef<string | null>(null);
  const prevStageRef = useRef(currentStage);
  const prevExternalIdRef = useRef<string | null>(null);

  useEffect(() => { setExtractionTarget(currentStage); }, [currentStage]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatAreaRef.current) chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  // ── Real OCR file upload ──────────────────────────────────────────────────
  const extractVisualFeaturesFromImage = (file: File, userPrompt: string = ""): Promise<any> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/") && !file.name.toLowerCase().match(/\.(png|jpg|jpeg|webp)$/)) {
        resolve(null); return;
      }
      const imgUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = imgUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 100; canvas.height = 100;
        if (ctx) {
          ctx.drawImage(img, 0, 0, 100, 100);
          const data = ctx.getImageData(0, 0, 100, 100).data;
          let rSum = 0, gSum = 0, bSum = 0;
          for (let i = 0; i < data.length; i += 4) { rSum += data[i]; gSum += data[i+1]; bSum += data[i+2]; }
          const total = data.length / 4;
          const avgR = rSum/total, avgG = gSum/total, avgB = bSum/total;
          const isWarm = avgR > avgB;
          const filenameLower = (file.name + " " + userPrompt).toLowerCase();
          let disasterType = "Environmental Anomaly", isNatural = false, details = "", risk = "High";
          if (filenameLower.includes("fire") || filenameLower.includes("wildfire") || (avgR > 130 && avgG < 100)) {
            disasterType = "Wildfire / Vegetation Fire"; isNatural = filenameLower.includes("wildfire");
            details = isNatural ? "Uncontrolled natural wildfire detected." : "Industrial fire incident detected."; risk = "Extreme";
          } else if (filenameLower.includes("flood") || filenameLower.includes("water") || (avgB > 130 && avgG > 110)) {
            disasterType = "Inundation / Flooding"; isNatural = true;
            details = "Large-scale flooding detected."; risk = "Extreme";
          } else if (filenameLower.includes("spill") || filenameLower.includes("chemical")) {
            disasterType = "Industrial Chemical/Oil Spill";
            details = "Hazardous chemical spill detected."; risk = "High";
          } else if (filenameLower.includes("earthquake") || filenameLower.includes("crack")) {
            disasterType = "Earthquake Disruption"; isNatural = true;
            details = "Structural damage consistent with seismic activity."; risk = "Extreme";
          } else if (filenameLower.includes("explosion") || filenameLower.includes("blast")) {
            disasterType = "Explosion / Fireball";
            details = "Industrial explosion detected."; risk = "Extreme";
          } else if (filenameLower.includes("collapse") || filenameLower.includes("structure")) {
            disasterType = "Structural Collapse";
            details = "Structural collapse detected."; risk = "High";
          } else {
            disasterType = "Industrial / Operational Anomaly";
            details = isWarm ? "Potential thermal anomaly detected." : "Visual anomaly detected.";
          }
          URL.revokeObjectURL(imgUrl);
          resolve({ observation_detail: details, observation_type: "Unsafe Condition", observation_category: isNatural ? "Natural Disaster" : "Artificial Disaster", risk_potential: risk, exact_location: "" });
        } else { URL.revokeObjectURL(imgUrl); resolve(null); }
      };
      img.onerror = () => { URL.revokeObjectURL(imgUrl); resolve(null); };
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const placeholderId = generateId();
    if (uploadPlaceholderId.current) {
      setMessages((prev) => prev.filter((m) => (m as any).id !== uploadPlaceholderId.current));
    }
    uploadPlaceholderId.current = placeholderId;
    setHasStarted(true);
    setIsUploading(true);

    // User message
    setMessages((prev) => [...prev, {
      id: generateId(), role: "user",
      content: `📎 Uploaded: **${file.name}**`, timestamp: new Date(),
    }]);

    // Typing placeholder
    setMessages((prev) => [...prev, {
      id: placeholderId, role: "assistant",
      content: extractionTarget === "observations"
        ? "📄 Extracting observation data from document..."
        : "Extracting document and preparing AI response...",
      timestamp: new Date(),
    }]);
    setIsTyping(true);

    try {
      // Fast field extraction for unit-details
      if (extractionTarget !== "observations") {
        try {
          const fastRes = await extractFieldsFromDocument(file);
          const fastFields = fastRes.field_mappings || mapOCRMetadataToFormFields(fastRes);
          const formatted = Object.entries(fastFields)
            .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
            .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
            .join("\n");
          setMessages((prev) => prev.map((m) =>
            (m as any).id === placeholderId
              ? { ...m, content: formatted ? `Quick field extraction complete:\n${formatted}` : "Quick field extraction complete. No mapped fields found." }
              : m
          ));
        } catch { /* continue to full upload */ }
      }

      const res = await uploadDocument(file);

      // Add visual features for images
      const visualObs = await extractVisualFeaturesFromImage(file, inputValue);
      if (visualObs) {
        res.observations = [visualObs, ...(res.observations || [])];
      }

      if (extractionTarget === "observations") {
        const obsCount = res.observations?.length || 0;
        let previewText = "";
        if (obsCount > 0) {
          const first = res.observations![0] as any;
          previewText = `\n\n**First Observation Extracted:**\n- **Details:** ${first.observation_detail || "N/A"}\n- **Type:** ${first.observation_type || "N/A"}\n- **Category:** ${first.observation_category || "N/A"}\n- **Risk:** ${first.risk_potential || "N/A"}\n- **Location:** ${first.exact_location || "N/A"}`;
          if (obsCount > 1) previewText += `\n\n*${obsCount - 1} additional observation(s) found.*`;
        }
        setMessages((prev) => prev.map((m) =>
          (m as any).id === placeholderId
            ? { ...m, content: obsCount > 0
                ? `✅ Extracted **${obsCount}** observation(s) from **${res.filename || file.name}**. Draft is ready for review.${previewText}`
                : `✅ Document processed: **${res.filename || file.name}**. No observations extracted.` }
            : m
        ));
        if (typeof onObservationExtract === "function") onObservationExtract(res);
      } else {
        const fieldMappings = res.field_mappings || mapOCRMetadataToFormFields(res);
        const formattedFields = Object.entries(fieldMappings)
          .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "")
          .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
          .join("\n");
        const textPreview = res.extracted_text ? `${res.extracted_text.slice(0, 1200)}${res.extracted_text.length > 1200 ? "..." : ""}` : "";
        const parts = [];
        if (formattedFields) parts.push(`📋 **Extracted Fields:**\n${formattedFields}`);
        if (textPreview) parts.push(`📄 **Document Text:**\n${textPreview}`);
        if (parts.length === 0) parts.push(`Extraction completed. Metadata: ${JSON.stringify(res.metadata || {})}`);

        setMessages((prev) => prev.map((m) =>
          (m as any).id === placeholderId ? { ...m, content: parts.join("\n\n") } : m
        ));

        // JSON output message
        setMessages((prev) => [...prev, {
          id: generateId(), role: "assistant", timestamp: new Date(),
          content: `✅ **Extraction Complete!**\n\nFields mapped to SO form successfully. Check the form fields above.`,
        }]);

        if (typeof onExtract === "function") onExtract(res);
      }
    } catch (e: any) {
      setMessages((prev) => prev.map((m) =>
        (m as any).id === placeholderId
          ? { ...m, content: `❌ Error processing file: ${e?.message || "Unknown error"}. Please try again.` }
          : m
      ));
    } finally {
      uploadPlaceholderId.current = null;
      setIsTyping(false);
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Text message (mock AI — replace with real LLM call if needed) ─────────
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;
    setHasStarted(true);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((prev) => [...prev, { id: generateId(), role: "user", content: trimmed, timestamp: new Date() }]);
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
    const lower = trimmed.toLowerCase();
    let reply = "I'm here to help with your Safety Observation form. You can ask me to analyze risks, suggest corrective actions, or upload a document to auto-fill fields.";
    if (lower.includes("risk") || lower.includes("assess"))
      reply = "Based on the current SO form, I've identified **3 medium-priority risks**:\n\n- Inadequate cable management near workstations\n- Missing emergency exit signage in IT wing\n- No recent fire drill scheduled for Q3\n\nWould you like me to add these as corrective actions?";
    else if (lower.includes("fill") || lower.includes("auto") || lower.includes("extract"))
      reply = "Please upload your safety report (PDF or image) using the 📎 button and I'll extract the relevant fields and observations automatically.";
    else if (lower.includes("correct") || lower.includes("action"))
      reply = "Here are suggested corrective actions:\n\n- **Immediate**: Install cable ties and management trays\n- **Short-term**: Update emergency exit maps\n- **Long-term**: Schedule quarterly fire drills\n\nShall I add these to the form?";
    else if (lower.includes("summar"))
      reply = "**SO Form Summary**\n\nUnit: Information Technology\nObservations recorded: 2\nHigh risk: 0 · Medium risk: 2 · Low risk: 0\n\nAll required fields are filled. You're ready to publish.";
    else if (lower.includes("generate") || lower.includes("observation report"))
      reply = `I'll generate an observation report for: **${trimmed.replace(/generate an observation report for:/i, "").trim()}**\n\nPlease upload an image or PDF of the incident scene and I'll extract the full observation data.`;

    setMessages((prev) => [...prev, { id: generateId(), role: "assistant", content: reply, timestamp: new Date() }]);
    setIsTyping(false);
  }, [isTyping]);

  // ── External message handler ───────────────────────────────────────────────
  useEffect(() => {
    if (!externalMessage) return;
    const msgId = (externalMessage as any).id ?? null;
    if (msgId && msgId === prevExternalIdRef.current) return;
    prevExternalIdRef.current = msgId;
    sendMessage(externalMessage.content);
  }, [externalMessage, sendMessage]);

  // ── Stage change notice ───────────────────────────────────────────────────
  useEffect(() => {
    if (prevStageRef.current !== currentStage && hasStarted) {
      setMessages((prev) => [...prev, {
        id: generateId(), role: "assistant", timestamp: new Date(),
        content: currentStage === "observations"
          ? "You've moved to the **Observations** section. I can now help with risk assessment and corrective actions."
          : "You're back to the **Unit & SO Details** section.",
      }]);
    }
    prevStageRef.current = currentStage;
  }, [currentStage, hasStarted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue); }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setSelectedFile(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetChat = () => {
    setMessages([]); setHasStarted(false); setInputValue("");
    setSelectedFile(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const chips = STAGE_CHIPS[currentStage] ?? STAGE_CHIPS["unit-details"];
  const welcomeText = WELCOME_MESSAGES[currentStage];

  return (
    <aside
      style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        background: "#ffffff", borderLeft: "1px solid #e5e7eb", overflow: "hidden",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
      aria-label="Velocity Jinsafe AI Assistant"
    >
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.aiAvatarLg} aria-hidden="true"><AIIcon /></div>
          <div>
            <div className={styles.headerTitle}>Velocity Jinsafe</div>
            <div className={styles.headerSub}><span className={styles.statusDot} />AI Safety Assistant</div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} title="New chat" onClick={resetChat} aria-label="New chat">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className={styles.iconBtn} title="Close" onClick={onClose} aria-label="Close AI assistant">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className={styles.chatArea} ref={chatAreaRef} role="log" aria-live="polite">
        {!hasStarted && (
          <div className={styles.welcomeBlock}>
            <div className={styles.welcomeIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
                <path d="M12 1a11 11 0 110 22A11 11 0 0112 1zm0 2a9 9 0 100 18A9 9 0 0012 3zm0 2a7 7 0 110 14A7 7 0 0112 5zm-1 3v4l3 3-1.5 1.5L9 13.5V8h2z" />
              </svg>
            </div>
            <p className={styles.welcomeTitle}>How can I help you today?</p>
            <p className={styles.welcomeDesc} dangerouslySetInnerHTML={{ __html: renderMarkdown(welcomeText) }} />
            <div className={styles.chips} role="list">
              {chips.map((chip) => (
                <button key={chip.label} className={styles.chip} onClick={() => sendMessage(chip.prompt)} role="listitem">
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.msgRow} ${msg.role === "user" ? styles.userRow : styles.aiRow}`}>
            {msg.role === "assistant" && <div className={styles.aiAvatar} aria-hidden="true"><AIIcon /></div>}
            <div className={styles.bubbleWrap}>
              <div
                className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.aiBubble}`}
                dangerouslySetInnerHTML={{ __html: msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content.replace(/\n/g, "<br/>") }}
              />
              <div className={`${styles.bubbleMeta} ${msg.role === "user" ? styles.metaRight : styles.metaLeft}`}>
                <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                {msg.role === "assistant" && (
                  <button className={styles.microBtn} onClick={() => copyMessage(msg.id, msg.content)} title={copiedId === msg.id ? "Copied!" : "Copy"}>
                    {copiedId === msg.id ? (
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                    )}
                  </button>
                )}
              </div>
            </div>
            {msg.role === "user" && <div className={styles.userAvatar} aria-hidden="true">SK</div>}
          </div>
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* ── Selected file preview ── */}
      {selectedFile && (
        <div className={styles.filePreview}>
          <div className={styles.filePreviewLeft}>
            <span className={styles.fileIcon}>📄</span>
            <div>
              <div className={styles.fileName}>{selectedFile.name}</div>
              <div className={styles.fileTarget}>
                Target:&nbsp;
                <select
                  value={extractionTarget}
                  onChange={(e) => setExtractionTarget(e.target.value as "unit-details" | "observations")}
                  className={styles.targetSelect}
                >
                  <option value="unit-details">SO Unit Details</option>
                  <option value="observations">Observations</option>
                </select>
              </div>
            </div>
          </div>
          <div className={styles.filePreviewActions}>
            <button className={styles.uploadBtn} onClick={() => handleFileUpload(selectedFile)} disabled={isUploading}>
              {isUploading ? "Uploading…" : "⬆ Upload"}
            </button>
            <button className={styles.discardBtn} onClick={() => setSelectedFile(null)}>✕</button>
          </div>
        </div>
      )}

      {/* ── Input area ── */}
      <div className={styles.inputArea}>
        <div className={styles.inputBox}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about safety observations, risks…"
            rows={1}
            maxLength={2000}
            aria-label="Chat message input"
            disabled={isTyping || isUploading}
          />
          <div className={styles.inputActions}>
            <button className={styles.attachBtn} onClick={() => fileInputRef.current?.click()} title="Attach file" disabled={isTyping || isUploading}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <button className={styles.sendBtn} onClick={() => sendMessage(inputValue)} disabled={!inputValue.trim() || isTyping || isUploading} title="Send (Enter)">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className={styles.inputFooter}>
          <select
            className={styles.templatesSelect}
            onChange={(e) => {
              if (e.target.value) {
                setInputValue(`Generate an observation report for: ${e.target.value}`);
                if (onTemplateSelect) onTemplateSelect(e.target.value);
                e.target.value = "";
              }
            }}
          >
            <option value="">📋 Templates</option>
            {disasterOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>
          {inputValue.length > 0 && <span className={styles.charCount}>{inputValue.length}/2000</span>}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.docx,.txt,.csv,.xlsx"
          className={styles.hiddenInput}
          onChange={handleFileSelect}
          aria-hidden="true"
        />
      </div>
    </aside>
  );
};

export default AIAssistantDrawer;