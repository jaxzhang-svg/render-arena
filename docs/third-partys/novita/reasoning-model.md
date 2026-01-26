# Reasoning Models

export const ReasoningModels = () => {
if (typeof document === "undefined") {
return null;
} else {
let attempts = 0;
const maxAttempts = 50;
const INIT_DISPLAY_COUNT = 3;
const interval = setInterval(() => {
const clientComponent = document.getElementById("reasoning-models");
if (clientComponent && window.novitaRemoteData.llmModels.status === 'loaded') {
const modelList = window.novitaRemoteData.llmModels.data.filter(model => {
return (model.features || []).includes('reasoning');
});
let displayModels = modelList.slice(0, INIT_DISPLAY_COUNT).map(model => {
return `<li><span class="model-id-item">${model.id}</span></li>`;
}).join('');
let showMoreButton = '';
if (modelList.length > INIT_DISPLAY_COUNT) {
showMoreButton = `<button id="show-more-reasoning-model-btn" style="margin-left: 32px; color: rgb(40 116 255)">View More</button>`;
}
clientComponent.innerHTML = `           <ul>${displayModels}</ul>
          ${showMoreButton}
        `;
document.getElementById('show-more-reasoning-model-btn')?.addEventListener('click', () => {
clientComponent.innerHTML = `            <ul>${modelList.map(model => {
            return`<li><span class="model-id-item">${model.id}</span></li>`;
          }).join('')}</ul>
          `;
});
clearInterval(interval);
}
attempts++;
if (attempts >= maxAttempts) {
clearInterval(interval);
}
}, 200);
return <div id="reasoning-models"></div>;
}
};

## Overview

Reasoning models are advanced language models optimized for complex problem-solving tasks. By generating detailed reasoning steps (chain-of-thought), they improve the accuracy of answers in analytical scenarios.

### Typical Use Cases

- **Complex Problem Solving**: Suitable for tasks requiring step-by-step logic, such as math or scientific reasoning.
- **Decision Support Systems**: Helps explain the logic behind conclusions by providing detailed reasoning processes.
- **Education and Training**: Assists learners in understanding complex concepts by presenting derivation processes clearly.

---

## Installation & Setup

Before using reasoning models, make sure the latest OpenAI SDK is installed:

```bash theme={"system"}
pip install -U openai
```

---

## API Usage

Use the `/chat/completions` endpoint to invoke reasoning models.

### Request Parameters

- `max_tokens`: Sets the maximum number of tokens the model can return.
- `temperature`: Recommended between 0.5 and 0.7 (suggested: 0.6) to balance creativity and logic.
- `top_p`: Recommended value is 0.95.

---

### Example Code

#### Streaming Response

```python theme={"system"}
from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.novita.ai/openai")
messages = [
    {"role": "user", "content": "Explain Newton's Second Law."}
]

response = client.chat.completions.create(
    model="deepseek/deepseek-r1",
    messages=messages,
    stream=True,
    max_tokens=4096
)

content = ""
reasoning_content = ""
for chunk in response:
    if chunk.choices[0].delta.content:
        content += chunk.choices[0].delta.content
    if chunk.choices[0].delta.reasoning_content:
        reasoning_content += chunk.choices[0].delta.reasoning_content

print("Final Answer:", content)
print("Reasoning Steps:", reasoning_content)
```

#### Non-Streaming Response

```python theme={"system"}
response = client.chat.completions.create(
    model="deepseek/deepseek-r1",
    messages=[
        {"role": "user", "content": "What is the greenhouse effect? How can it be mitigated?"}
    ],
    stream=False,
    max_tokens=4096
)

content = response.choices[0].message.content
reasoning_content = response.choices[0].message.reasoning_content

print("Final Answer:", content)
print("Reasoning Steps:", reasoning_content)
```

---

## Context Management

Reasoning outputs are not automatically carried over to the next round of dialogue. You must manually maintain the message history:

```python theme={"system"}
messages.append({"role": "assistant", "content": content})
messages.append({"role": "user", "content": "Please continue explaining the solution."})
```

---

## Supported Models

The following reasoning models are currently supported on the Novita platform:

<ReasoningModels />

---

## Billing

- Billing is based on the number of tokens for both input and output.
- Please refer to each model's pricing page for specific billing rules and token conversion details.

---

## Notes & Best Practices

- Avoid placing reasoning instructions in the `system` message. Instead, make the intent explicit in the `user` message.
- For mathematical tasks, clearly instruct the model, e.g., “Please reason step by step and provide a final answer.”
- To prevent the model from skipping reasoning steps, consider asking for a newline before the final answer.

---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novita.ai/docs/llms.txt
