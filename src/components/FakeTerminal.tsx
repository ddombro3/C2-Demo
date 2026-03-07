import { useEffect, useRef, useState } from "react";
import { TerminalEntry } from "../types";

interface FakeTerminalProps {
  lines: TerminalEntry[];
  onCommand: (command: string) => void;
  suggestedCommands: string[];
}

const PROMPT_USER = "c2sudo";
const PROMPT_HOST = "c2-console";
const PROMPT_PATH = "~/ops";

export default function FakeTerminal({
  lines,
  onCommand,
  suggestedCommands,
}: FakeTerminalProps) {
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  const submitCommand = (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;
    onCommand(trimmed);
    setInput("");
  };

  return (
    <div className="terminal-shell linux-terminal">
      <div className="terminal-topbar">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="terminal-title">
          {PROMPT_USER}@{PROMPT_HOST}:{PROMPT_PATH}
        </span>
      </div>

      <div className="terminal-body" ref={bodyRef}>
        {lines.map((entry) => {
          if (entry.tone === "command") {
            return (
              <div key={entry.id} className="terminal-line command">
                <span className="linux-prompt-inline">
                  <span className="prompt-userhost">
                    {PROMPT_USER}@{PROMPT_HOST}
                  </span>
                  <span className="prompt-separator">:</span>
                  <span className="prompt-path">{PROMPT_PATH}</span>
                  <span className="prompt-symbol">$</span>
                </span>
                <span className="terminal-command-text">{entry.text}</span>
              </div>
            );
          }

          return (
            <div key={entry.id} className={`terminal-line ${entry.tone}`}>
              <span className="terminal-output-prefix">•</span>
              <span>{entry.text}</span>
            </div>
          );
        })}
      </div>

      <div className="terminal-command-bar">
        <form
          className="terminal-form"
          onSubmit={(e) => {
            e.preventDefault();
            submitCommand(input);
          }}
        >
          <div className="terminal-input-shell">
            <span className="linux-prompt-inline input-prompt">
              <span className="prompt-userhost">
                {PROMPT_USER}@{PROMPT_HOST}
              </span>
              <span className="prompt-separator">:</span>
              <span className="prompt-path">{PROMPT_PATH}</span>
              <span className="prompt-symbol">$</span>
            </span>

            <input
              className="terminal-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='type "help"'
            />
          </div>

          <button className="ui-btn primary-btn" type="submit">
            Run
          </button>
        </form>

        <div className="suggested-commands">
          {suggestedCommands.map((command) => (
            <button
              key={command}
              type="button"
              className="command-chip"
              onClick={() => submitCommand(command)}
            >
              {command}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}