"""Claude Agent SDK hooks for event streaming."""

import time
from asyncio import Queue

from claude_agent_sdk import HookContext, HookInput, HookJSONOutput

from ..models.events import AgentEvent, EventType


class AgentHooks:
    """Claude Agent event hooks for streaming via SSE."""

    def __init__(self, event_queue: Queue, workdir: str):
        self.event_queue = event_queue
        self.workdir = workdir
        self.tool_start_time: dict[str, float] = {}

    async def on_pre_tool_use(
        self,
        input_data: HookInput,
        tool_use_id: str | None,
        context: HookContext,
    ) -> HookJSONOutput:
        """Hook called before tool execution."""
        tool_name = self._extract_tool_name(input_data)
        tool_input = self._extract_tool_input(input_data)

        self.tool_start_time[tool_name] = time.time()

        # Emit tool start event
        event = AgentEvent(
            type=EventType.TOOL_START,
            timestamp=time.time(),
            data={"tool": tool_name, "args": tool_input},
        )
        await self.event_queue.put(event)

        return {}

    async def on_post_tool_use(
        self,
        input_data: HookInput,
        tool_use_id: str | None,
        context: HookContext,
    ) -> HookJSONOutput:
        """Hook called after tool execution."""
        tool_name = self._extract_tool_name(input_data)
        tool_input = self._extract_tool_input(input_data)
        tool_response = self._extract_tool_response(input_data)

        duration = time.time() - self.tool_start_time.get(tool_name, time.time())

        event = self._create_tool_event(tool_name, tool_input, tool_response, duration)
        await self.event_queue.put(event)

        return {}

    async def on_error(self, error: Exception) -> None:
        """Hook called when an error occurs."""
        event = AgentEvent(
            type=EventType.ERROR,
            timestamp=time.time(),
            data={"message": str(error), "type": type(error).__name__},
        )
        await self.event_queue.put(event)

    def _extract_tool_name(self, input_data: HookInput) -> str:
        """Safely extract tool name from HookInput."""
        if isinstance(input_data, dict):
            return input_data.get("tool_name", "unknown")
        return "unknown"

    def _extract_tool_input(self, input_data: HookInput) -> dict:
        """Safely extract tool input from HookInput."""
        if isinstance(input_data, dict):
            return input_data.get("tool_input", {})
        return {}

    def _extract_tool_response(self, input_data: HookInput) -> str | None:
        """Safely extract tool response from HookInput."""
        if isinstance(input_data, dict):
            return input_data.get("tool_response")
        return None

    def _create_tool_event(
        self,
        tool_name: str,
        tool_input: dict,
        tool_response: str | None,
        duration: float,
    ) -> AgentEvent:
        """Create appropriate event based on tool type and result."""
        if tool_name == "Read":
            file_path = tool_input.get("file_path") or tool_input.get("path")
            return AgentEvent(
                type=EventType.FILE_READ,
                timestamp=time.time(),
                data={"path": file_path},
            )

        if tool_name == "Write":
            file_path = tool_input.get("file_path") or tool_input.get("path")
            content = tool_input.get("content", "")
            return AgentEvent(
                type=EventType.FILE_WRITE,
                timestamp=time.time(),
                data={"path": file_path, "size": len(content)},
            )

        has_error = tool_response and "error" in str(tool_response).lower()

        return AgentEvent(
            type=EventType.TOOL_ERROR if has_error else EventType.TOOL_END,
            timestamp=time.time(),
            data={
                "tool": tool_name,
                "duration_ms": duration * 1000,
                "success": not has_error,
            },
        )
