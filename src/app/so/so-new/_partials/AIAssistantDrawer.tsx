"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./AIAssistantDrawer.module.css";
import type { DocumentProcessResponse } from "../types/ocr.types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
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
  "unit-details":
    "I can help you fill in the **Unit & SO Details**, analyze risks, or auto-fill from a safety report. What would you like to do?",
  observations:
    "You're now in the **Observations** section. I can suggest corrective actions, assess risks, or extract observations from a PDF or image. How can I help?",
};

const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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
    <div className={styles.aiAvatar} aria-label="AI">
      <AIIcon />
    </div>
    <div className={styles.typingBubble}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </div>
  </div>
);

const AIAssistantDrawer: React.FC<Props> = ({
  onClose,
  onExtract,
  onObservationExtract,
  onTemplateSelect,
  currentStage,
  lastOCRResult,
  externalMessage,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevStageRef = useRef(currentStage);
  const prevExternalIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatAreaRef.current) {
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const simulateReply = useCallback(async (userText: string): Promise<string> => {
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
    const lower = userText.toLowerCase();
    if (lower.includes("risk") || lower.includes("assess"))
      return "Based on the current SO form, I've identified **3 medium-priority risks**:\n\n- Inadequate cable management near workstations\n- Missing emergency exit signage in IT wing\n- No recent fire drill scheduled for Q3\n\nWould you like me to add these as corrective actions?";
    if (lower.includes("fill") || lower.includes("auto") || lower.includes("extract"))
      return "Please upload your safety report (PDF or image) and I'll extract the relevant fields and observations automatically.";
    if (lower.includes("correct") || lower.includes("action"))
      return "Here are suggested corrective actions for your observations:\n\n- **Immediate**: Install cable ties and management trays\n- **Short-term**: Update emergency exit maps\n- **Long-term**: Schedule quarterly fire drills\n\nShall I add these to the form?";
    if (lower.includes("summar"))
      return "**SO Form Summary**\n\nUnit: Information Technology\nObservations recorded: 2\nHigh risk: 0 · Medium risk: 2 · Low risk: 0\n\nAll required fields are filled. You're ready to publish.";
    return "I'm here to help with your Safety Observation form. You can ask me to analyze risks, suggest corrective actions, or auto-fill fields from a document.";
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    setHasStarted(true);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const reply = await simulateReply(trimmed);
      const aiMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [isTyping, simulateReply]);

  useEffect(() => {
    if (!externalMessage) return;
    const msgId = (externalMessage as any).id ?? null;
    if (msgId && msgId === prevExternalIdRef.current) return;
    prevExternalIdRef.current = msgId;
    sendMessage(externalMessage.content);
  }, [externalMessage, sendMessage]);

  useEffect(() => {
    if (prevStageRef.current !== currentStage && hasStarted) {
      const notice: Message = {
        id: generateId(),
        role: "assistant",
        content:
          currentStage === "observations"
            ? "You've moved to the **Observations** section. I can now help you with risk assessment and corrective actions."
            : "You're back to the **Unit & SO Details** section.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, notice]);
    }
    prevStageRef.current = currentStage;
  }, [currentStage, hasStarted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setHasStarted(true);

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: `📎 Uploaded: **${file.name}**`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1500));
    const aiMsg: Message = {
      id: generateId(),
      role: "assistant",
      content: `I've received **${file.name}**. Processing it now — I'll extract the relevant SO fields and observations shortly.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetChat = () => {
    setMessages([]);
    setHasStarted(false);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const chips = STAGE_CHIPS[currentStage] ?? STAGE_CHIPS["unit-details"];
  const welcomeText = WELCOME_MESSAGES[currentStage];

  return (
    <aside
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        borderLeft: "1px solid #e5e7eb",
        overflow: "hidden",
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
      aria-label="Velocity Jinsafe AI Assistant"
    >
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.aiAvatarLg} aria-hidden="true">
            <AIIcon />
          </div>
          <div>
            <div className={styles.headerTitle}>Velocity Jinsafe</div>
            <div className={styles.headerSub}>
              <span className={styles.statusDot} />
              AI Safety Assistant
            </div>
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
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
            <p
              className={styles.welcomeDesc}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(welcomeText) }}
            />
            <div className={styles.chips} role="list">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  className={styles.chip}
                  onClick={() => sendMessage(chip.prompt)}
                  role="listitem"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.msgRow} ${msg.role === "user" ? styles.userRow : styles.aiRow}`}
          >
            {msg.role === "assistant" && (
              <div className={styles.aiAvatar} aria-hidden="true">
                <AIIcon />
              </div>
            )}
            <div className={styles.bubbleWrap}>
              <div
                className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.aiBubble}`}
                dangerouslySetInnerHTML={{
                  __html:
                    msg.role === "assistant"
                      ? renderMarkdown(msg.content)
                      : msg.content.replace(/\n/g, "<br/>"),
                }}
              />
              <div className={`${styles.bubbleMeta} ${msg.role === "user" ? styles.metaRight : styles.metaLeft}`}>
                <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                {msg.role === "assistant" && (
                  <button
                    className={styles.microBtn}
                    onClick={() => copyMessage(msg.id, msg.content)}
                    aria-label="Copy message"
                    title={copiedId === msg.id ? "Copied!" : "Copy"}
                  >
                    {copiedId === msg.id ? (
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
            {msg.role === "user" && (
              <div className={styles.userAvatar} aria-hidden="true">SK</div>
            )}
          </div>
        ))}

        {isTyping && <TypingIndicator />}
      </div>

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
            <button
              className={styles.attachBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              aria-label="Attach file"
              disabled={isTyping || isUploading}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <button
              className={styles.sendBtn}
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping || isUploading}
              aria-label="Send message"
              title="Send (Enter)"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className={styles.inputFooter}>
          <span className={styles.hint}>Enter to send · Shift+Enter for newline</span>
          {inputValue.length > 0 && (
            <span className={styles.charCount}>{inputValue.length}/2000</span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className={styles.hiddenInput}
          onChange={handleFileChange}
          aria-hidden="true"
        />
      </div>
    </aside>
  );
};

export default AIAssistantDrawer;