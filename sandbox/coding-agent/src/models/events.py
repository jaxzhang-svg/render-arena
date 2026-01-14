"""Event models for Agent SSE streaming.

This module maps Claude Agent SDK primitives to SSE events for streaming to the frontend.
Event types directly correspond to Claude SDK message types and content blocks.

Claude SDK Primitives:
---------------------
Message Types:
  - AssistantMessage: Contains list of content blocks
  - ResultMessage: Final result with cost/usage info
  - SystemMessage: System metadata

Content Block Types (in AssistantMessage):
  - TextBlock: Claude's text response to user
  - ThinkingBlock: Claude's internal thinking (extended thinking)
  - ToolUseBlock: Tool invocation request (tool name + input)
  - ToolResultBlock: Result of tool execution

Hook Events:
  - PreToolUse: Before tool execution
  - PostToolUse: After tool execution
  - UserPromptSubmit: User submitted a prompt

Event Flow:
-----------
1. Claude Agent SDK executes and generates messages
2. Hooks capture tool execution lifecycle (PreToolUse/PostToolUse)
3. Runner processes message content blocks (TextBlock, ThinkingBlock, ToolUseBlock, ToolResultBlock)
4. All events are streamed to frontend via SSE

No filtering is applied - all SDK events are forwarded to the frontend.
"""

from enum import Enum
from typing import Any

from pydantic import BaseModel


class EventType(str, Enum):
    """Agent event types for SSE streaming.

    Maps directly to Claude Agent SDK primitives:
    - Lifecycle: started, completed (execution state)
    - Content: text, thinking (from AssistantMessage content blocks)
    - Tool lifecycle: tool_use, tool_result (from AssistantMessage content blocks)
    - Tool execution: pre_tool_use, post_tool_use (from hooks)
    - Result: result (from ResultMessage)
    - User: user_prompt (from UserPromptSubmit hook)
    - System: system, error (metadata and errors)
    """

    # ========== Lifecycle Events ==========
    """Execution state transitions"""
    STARTED = "started"  # Agent execution started
    COMPLETED = "completed"  # Agent execution completed successfully

    # ========== Content Events (from AssistantMessage) ==========
    """Content blocks from AssistantMessage"""
    TEXT = "text"  # TextBlock - Claude's text response to user
    THINKING = "thinking"  # ThinkingBlock - Claude's internal thinking

    # ========== Tool Lifecycle Events (from AssistantMessage) ==========
    """Tool use and result content blocks from AssistantMessage"""
    TOOL_USE = "tool_use"  # ToolUseBlock - Tool being called
    TOOL_RESULT = "tool_result"  # ToolResultBlock - Tool execution result

    # ========== Tool Execution Events (from Hooks) ==========
    """Tool execution lifecycle from PreToolUse/PostToolUse hooks"""
    PRE_TOOL_USE = "pre_tool_use"  # Before tool execution
    POST_TOOL_USE = "post_tool_use"  # After tool execution

    # ========== Result Events ==========
    """Final execution result"""
    RESULT = "result"  # ResultMessage - Final result with cost/usage

    # ========== User Events ==========
    """User interactions"""
    USER_PROMPT = "user_prompt"  # UserPromptSubmit - User submitted a prompt

    # ========== System Events ==========
    """System metadata and errors"""
    SYSTEM = "system"  # SystemMessage - System metadata
    ERROR = "error"  # Error occurred


class AgentEvent(BaseModel):
    """Base event model for Agent SSE streaming.

    All events follow this structure:
    {
        "type": "event_type",
        "timestamp": 1234567890.0,
        "data": { ... event-specific data ... }
    }
    """

    type: EventType
    timestamp: float
    data: dict[str, Any] = {}

    model_config = {"use_enum_values": True}
