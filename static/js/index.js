const DOMAIN_ORDER = ["speech", "music", "sound"];
const DOMAIN_LABELS = {
  speech: "Speech",
  music: "Music",
  sound: "Sound"
};
const DEMO_DATA = window.DEMO_DATA || null;

document.addEventListener("DOMContentLoaded", () => {
  renderGenerationSection("pretrain-generation", "static/data/pre-training/generation");
  renderUnderstandingSection({
    targetId: "pretrain-understanding",
    basePath: "static/data/pre-training/understanding",
    mode: "pretrain"
  });
  renderUnderstandingSection({
    targetId: "posttrain-understanding",
    basePath: "static/data/post-training/understanding",
    mode: "posttrain"
  });
  setupRevealObserver();
});

function normalizeText(text) {
  if (!text) {
    return "";
  }
  let clean = String(text);
  clean = clean.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });
  clean = clean.replace(/\/u([0-9a-fA-F]{4})/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });
  return clean;
}

function splitParagraphs(text) {
  if (!text) {
    return [];
  }
  return String(text)
    .split(/\n\s*\n/g)
    .map((part) => part.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function appendParagraphs(container, text) {
  const paragraphs = splitParagraphs(text);
  if (!paragraphs.length) {
    const p = document.createElement("p");
    p.textContent = text;
    container.appendChild(p);
    return;
  }
  paragraphs.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    container.appendChild(p);
  });
}

function stripCaptionPrefix(text) {
  if (!text) {
    return "";
  }
  return text.replace(/^\s*Caption of the audio:\s*/i, "");
}

function splitCaptionSummary(text) {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  const summaryIndex = lower.lastIndexOf("in summary");
  if (summaryIndex > -1) {
    return {
      caption: clean.slice(0, summaryIndex).trim(),
      answer: clean.slice(summaryIndex).trim()
    };
  }
  const paragraphs = splitParagraphs(clean);
  if (paragraphs.length > 1) {
    const answer = paragraphs[paragraphs.length - 1];
    const caption = paragraphs.slice(0, -1).join("\n\n");
    return { caption, answer };
  }
  return { caption: clean, answer: clean };
}

function extractAssistantParts(text) {
  const clean = text.trim();
  const start = clean.indexOf("<think>");
  const end = clean.indexOf("</think>");
  if (start !== -1 && end !== -1 && end > start) {
    return {
      caption: clean.slice(0, start).trim(),
      thinking: clean.slice(start + 7, end).trim(),
      answer: clean.slice(end + 8).trim()
    };
  }
  return { caption: "", thinking: "", answer: clean };
}

function getBasename(path) {
  if (!path) {
    return "";
  }
  const parts = String(path).split(/[\\/]/);
  return parts[parts.length - 1];
}

function getNestedValue(source, keys, fallback) {
  let current = source;
  for (let i = 0; i < keys.length; i += 1) {
    if (!current || typeof current !== "object" || !(keys[i] in current)) {
      return fallback;
    }
    current = current[keys[i]];
  }
  return current;
}

function createDomainBlock(label) {
  const block = document.createElement("div");
  block.className = "domain-block";
  block.setAttribute("data-reveal", "");

  const header = document.createElement("div");
  header.className = "domain-header";

  const badge = document.createElement("span");
  badge.className = "domain-badge";
  badge.textContent = label;

  header.appendChild(badge);
  block.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "card-grid";
  block.appendChild(grid);

  return { block, grid };
}

function createSampleCard(sampleLabel) {
  const card = document.createElement("div");
  card.className = "sample-card";
  card.setAttribute("data-reveal", "");

  const header = document.createElement("div");
  header.className = "sample-header";

  const title = document.createElement("span");
  title.className = "sample-title";
  title.textContent = sampleLabel;

  header.appendChild(title);
  card.appendChild(header);

  return card;
}

function createAudioField(label, src) {
  const field = document.createElement("div");
  field.className = "field";

  const fieldLabel = document.createElement("span");
  fieldLabel.className = "field-label";
  fieldLabel.textContent = label;

  const audio = document.createElement("audio");
  audio.controls = true;
  audio.preload = "none";
  audio.src = src;

  field.appendChild(fieldLabel);
  field.appendChild(audio);
  return field;
}

function createTextField(label, text) {
  const field = document.createElement("div");
  field.className = "field";

  const fieldLabel = document.createElement("span");
  fieldLabel.className = "field-label";
  fieldLabel.textContent = label;

  const content = document.createElement("div");
  content.className = "field-content";
  if (text) {
    appendParagraphs(content, text);
  }

  field.appendChild(fieldLabel);
  field.appendChild(content);
  return field;
}

function createDetails(label, text) {
  const details = document.createElement("details");
  details.className = "fold";

  const summary = document.createElement("summary");
  summary.textContent = label;

  const body = document.createElement("div");
  body.className = "fold-body";
  if (text) {
    appendParagraphs(body, text);
  }

  details.appendChild(summary);
  details.appendChild(body);
  return details;
}

function renderGenerationSection(targetId, basePath) {
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  DOMAIN_ORDER.forEach((domain) => {
    const items = getNestedValue(
      DEMO_DATA,
      ["preTraining", "generation", domain],
      []
    );
    if (!items.length) {
      return;
    }
    const { block, grid } = createDomainBlock(DOMAIN_LABELS[domain]);
    items.forEach((item, index) => {
      const sampleLabel = `Sample ${String(index + 1).padStart(2, "0")}`;
      const card = createSampleCard(sampleLabel);
      card.style.setProperty("--delay", `${index * 60}ms`);

      const audioSrc = `${basePath}/${domain}/audio/${item.utt_id}_segment1.wav`;
      card.appendChild(createAudioField("Audio", audioSrc));

      const caption = normalizeText(item.caption || "");
      card.appendChild(createDetails("Caption", caption));

      grid.appendChild(card);
    });
    target.appendChild(block);
  });
}

function renderUnderstandingSection({ targetId, basePath, mode }) {
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  DOMAIN_ORDER.forEach((domain) => {
    const items = getNestedValue(
      DEMO_DATA,
      [mode === "posttrain" ? "postTraining" : "preTraining", "understanding", domain],
      []
    );
    if (!items.length) {
      return;
    }
    const { block, grid } = createDomainBlock(DOMAIN_LABELS[domain]);
    items.forEach((item, index) => {
      const sampleLabel = `Sample ${String(index + 1).padStart(2, "0")}`;
      const card = createSampleCard(sampleLabel);
      card.style.setProperty("--delay", `${index * 60}ms`);

      if (mode === "posttrain") {
        const audioMessage = (item.messages || []).find(
          (message) => message[0] === "user" && message[1] === "audio"
        );
        const questionMessage = (item.messages || []).find(
          (message) => message[0] === "user" && message[1] === "text"
        );
        const assistantMessage = (item.messages || []).find(
          (message) => message[0] === "assistant" && message[1] === "text"
        );

        const audioFilename = getBasename(audioMessage ? audioMessage[2] : "");
        const audioSrc = `${basePath}/${domain}/audio/${audioFilename}`;

        const question = normalizeText(questionMessage ? questionMessage[2] : "");
        const assistantText = normalizeText(assistantMessage ? assistantMessage[2] : "");
        const parts = extractAssistantParts(assistantText);

        const caption = stripCaptionPrefix(normalizeText(parts.caption));
        const thinking = normalizeText(parts.thinking);
        const answer = normalizeText(parts.answer);

        card.appendChild(createAudioField("Audio", audioSrc));
        card.appendChild(createTextField("Question", question));
        card.appendChild(createDetails("Caption", caption));
        card.appendChild(createDetails("Thinking", thinking));
        card.appendChild(createTextField("Answer", answer));
      } else {
        const audioSrc = `${basePath}/${domain}/audio/${item.utt_id}.wav`;
        const captionText = normalizeText(item.caption || "");
        let caption = "";
        let thinking = "";
        let answer = "";

        if (captionText.includes("<think>")) {
          const parts = extractAssistantParts(captionText);
          caption = parts.caption;
          thinking = parts.thinking;
          answer = parts.answer;
        } else {
          const split = splitCaptionSummary(captionText);
          caption = split.caption;
          answer = split.answer;
        }

        card.appendChild(createAudioField("Audio", audioSrc));
        card.appendChild(createDetails("Caption", caption));
        card.appendChild(createDetails("Thinking", thinking));
        card.appendChild(createTextField("Answer", answer));
      }

      grid.appendChild(card);
    });
    target.appendChild(block);
  });
}

function setupRevealObserver() {
  const elements = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!elements.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((element) => {
    observer.observe(element);
  });
}
