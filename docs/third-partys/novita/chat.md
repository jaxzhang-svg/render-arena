# Create chat completion

Creates a model response for the given chat conversation.

## Request Headers

<ParamField header="Content-Type" type="string" required={true}>
  Enum: `application/json`
</ParamField>

<ParamField header="Authorization" type="string" required={true}>
  Bearer authentication format, for example: Bearer \{\{API Key}}.
</ParamField>

## Request Body

<ParamField body="model" type="string" required={true}>
  The name of the model to use.
</ParamField>

<ParamField body="messages" type="object[]" required={true}>
  A list of messages comprising the conversation so far.

  <Expandable title="properties" defaultOpen={false}>
    <ParamField body="content" type="string | object[] | null" required={true}>
      The contents of the message. content is required for all messages, and may be null for assistant messages with function calls.

      You may use the following parameters depending on the modality.

      <Frame>
        <div class="param_frame">
          <Tabs>
            <Tab title="Text content">
              <p class="param_text">Option 1:</p>
              <p class="param_text">You can use the string type to represent the text contents of the message. </p>

              <br />

              <p class="param_text">Option 2:</p>
              <p class="param_text">Use an array of content parts, object\[]. Detailed fields are as follows:</p>

              <ParamField body="type" type="string" required={true}>
                The type of the content part, in this case `text`.
              </ParamField>

              <ParamField body="text" type="string" required={true}>
                The text content.
              </ParamField>
            </Tab>

            <Tab title="Image content">
              <p class="param_text">Only vision language models can be used.</p>
              <p class="param_text">An array of content parts, object\[]. Detailed fields are as follows:</p>

              <ParamField body="type" type="string" required={true}>
                The type of the content part, in this case `image_url`.
              </ParamField>

              <ParamField body="image_url" type="string" required={true}>
                <Expandable title="properties" defaultOpen={true}>
                  <ParamField body="url" type="string" required={true}>
                    Either a URL of the image or the base64 encoded image data.
                  </ParamField>
                </Expandable>
              </ParamField>
            </Tab>

            <Tab title="Video content">
              <p class="param_text">Only models that support video can be used.</p>
              <p class="param_text">An array of content parts, object\[]. Detailed fields are as follows:</p>

              <ParamField body="type" type="string" required={true}>
                The type of the content part, in this case `video_url`.
              </ParamField>

              <ParamField body="video_url" type="string" required={true}>
                <Expandable title="properties" defaultOpen={true}>
                  <ParamField body="url" type="string" required={true}>
                    URL of the video.
                  </ParamField>
                </Expandable>
              </ParamField>
            </Tab>

            <Tab title="Audio content">
              <p class="param_text mb-2">Only models that support audio can be used.</p>
              <p class="param_text">Output modality parameters:</p>

              <ParamField body="modalities" type="string[]" required={false}>
                Set the modality of the model output. Currently support two types: `["text"]`, `["text","audio"]`.
                If `["text"]` is passed in, the model only returns text content. If `["text","audio"]` is passed in, the model will return both text content and audio content.
                Default is `["text"]`.
              </ParamField>

              <p class="param_text">An array of content parts, object\[]. Detailed fields are as follows:</p>

              <ParamField body="type" type="string" required={true}>
                The type of the content part, in this case `input_audio`.
              </ParamField>

              <ParamField body="input_audio" type="object" required={true}>
                <Expandable title="properties" defaultOpen={true}>
                  <ParamField body="data" type="string" required={true}>
                    The URL or Base64 encoded data of the audio.
                  </ParamField>

                  <ParamField body="format" type="string" required={true}>
                    The format of the audio.
                  </ParamField>
                </Expandable>
              </ParamField>
            </Tab>
          </Tabs>
        </div>
      </Frame>
    </ParamField>

    <ParamField body="role" type="string" required={true}>
      The role of the messages author. One of system, user, or assistant.

      Enum: `system`, `user`, `assistant`
    </ParamField>

    <ParamField body="name" type="string">
      The name of the author of this message. May contain a-z, A-Z, 0-9, and underscores, with a maximum length of 64 characters.
    </ParamField>
  </Expandable>
</ParamField>

<ParamField body="max_tokens" type="integer" required={true}>
  The maximum number of tokens to generate in the completion.

  If the token count of your prompt (previous messages) plus max\_tokens exceed the model's context length, the behavior is depends on context\_length\_exceeded\_behavior. By default, max\_tokens will be lowered to fit in the context window instead of returning an error.
</ParamField>

<ParamField body="stream" type="boolean | null" default={false}>
  Whether to stream back partial progress. If set, tokens will be sent as data-only server-sent events (SSE) as they become available, with the stream terminated by a `data: [DONE]` message.
</ParamField>

<ParamField body="stream_options" type="object | null">
  Options for streaming response. Only set this when you set stream: true.

  <Expandable title="properties" defaultOpen={false}>
    <ParamField body="include_usage" type="boolean">
      If set, an additional chunk will be streamed before the data: \[DONE] message. The usage field on this chunk shows the token usage statistics for the entire request, and the choices field will always be an empty array. All other chunks will also include a usage field, but with a null value.
    </ParamField>
  </Expandable>
</ParamField>

<ParamField body="n" type="integer | null" default={1}>
  How many completions to generate for each prompt.

  Note: Because this parameter generates many completions, it can quickly consume your token quota. Use carefully and ensure that you have reasonable settings for max\_tokens and stop.

  Required range: `1 < x < 128`
</ParamField>

<ParamField body="seed" type="integer | null">
  If specified, our system will make a best effort to sample deterministically, such that repeated requests with the same seed and parameters should return the same result.
</ParamField>

<ParamField body="frequency_penalty" type="number | null" default={0}>
  Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.

  Reasonable value is around 0.1 to 1 if the aim is to just reduce repetitive samples somewhat. If the aim is to strongly suppress repetition, then one can increase the coefficients up to 2, but this can noticeably degrade the quality of samples. Negative values can be used to increase the likelihood of repetition.

  See also presence\_penalty for penalizing tokens that have at least one appearance at a fixed rate.

  Required range: `-2 < x < 2`
</ParamField>

<ParamField body="presence_penalty" type="number | null" default={0}>
  Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.

  Reasonable value is around 0.1 to 1 if the aim is to just reduce repetitive samples somewhat. If the aim is to strongly suppress repetition, then one can increase the coefficients up to 2, but this can noticeably degrade the quality of samples. Negative values can be used to increase the likelihood of repetition.

  See also `frequency_penalty` for penalizing tokens at an increasing rate depending on how often they appear.

  Required range: `-2 < x < 2`
</ParamField>

<ParamField body="repetition_penalty" type="number | null">
  Applies a penalty to repeated tokens to discourage or encourage repetition. A value of 1.0 means no penalty, allowing free repetition. Values above 1.0 penalize repetition, reducing the likelihood of repeating tokens. Values between 0.0 and 1.0 reward repetition, increasing the chance of repeated tokens. For a good balance, a value of 1.2 is often recommended. Note that the penalty is applied to both the generated output and the prompt in decoder-only models.

  Required range: `0 < x < 2`
</ParamField>

<ParamField body="stop" type="string | null">
  Up to 4 sequences where the API will stop generating further tokens. The returned text will contain the stop sequence.
</ParamField>

<ParamField body="temperature" type="number | null" default={1}>
  What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.

  We generally recommend altering this or `top_p` but not both.

  Required range: `0 < x < 2`
</ParamField>

<ParamField body="top_p" type="number | null">
  An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top\_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered. We generally recommend altering this or temperature but not both.

  Required range: `0 < x <= 1`
</ParamField>

<ParamField body="top_k" type="integer | null">
  Top-k sampling is another sampling method where the k most probable next tokens are filtered and the probability mass is redistributed among only those k next tokens. The value of k controls the number of candidates for the next token at each step during text generation.

  Required range: `1 < x < 128`
</ParamField>

<ParamField body="min_p" type="number | null">
  float that represents the minimum probability for a token to be considered, relative to the probability of the most likely token.

  Required range: `0 <= x <= 1`
</ParamField>

<ParamField body="logit_bias" type="map[string, integer] | null" required={false}>
  Modify the likelihood of specified tokens appearing in the completion.

  Accepts a JSON object that maps tokens to an associated bias value from -100 to 100.
  Mathematically, the bias is added to the logits generated by the model prior to
  sampling. The exact effect will vary per model.

  For example, by setting `"logit_bias":{"1639": 6}` will increase the likelihood of the token with token ID 1639.
</ParamField>

<ParamField body="logprobs" type="boolean | null" default={false}>
  Whether to return log probabilities of the output tokens or not. If true, returns the log probabilities of each output token returned in the content of message.
</ParamField>

<ParamField body="top_logprobs" type="integer | null">
  An integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability.  `logprobs` must be set to true if this parameter is used.

  Required range: `0 <= x <= 20`
</ParamField>

<ParamField body="tools" type="object[] | null">
  A list of tools the model may call. Currently, only functions are supported as a tool. Use this to provide a list of functions the model may generate JSON inputs for.

  Learn more about function calling in the [function calling guide](/guides/llm-function-calling).

  <Expandable title="properties" defaultOpen={false}>
    <ParamField body="type" type="string" required={true}>
      The type of the tool.

      Supported types: `function`
    </ParamField>

    <ParamField body="function" type="object" required={true}>
      <Expandable title="properties" defaultOpen={false}>
        <ParamField body="name" type="string" required={true}>
          The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.
        </ParamField>

        <ParamField body="description" type="string | null">
          A description of what the function does, used by the model to choose when and how to call the function.
        </ParamField>

        <ParamField body="parameters" type="object | null">
          The parameters the functions accepts, described as a JSON Schema object. See the [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for documentation about the format.
        </ParamField>

        <ParamField body="strict" type="boolean" default={false}>
          Whether to enable strict schema adherence when generating the function call. If set to true, the model will follow the exact schema defined in the parameters field.
        </ParamField>
      </Expandable>
    </ParamField>
  </Expandable>
</ParamField>

<ParamField body="response_format" type="object | null">
  Allows to force the model to produce specific output format.

  Setting to `{ "type": "json_schema", "json_schema": {...} }` enables Structured Outputs which ensures the model will match your supplied JSON schema.

  Setting to `{ "type": "json_object" }` enables the older JSON mode, which ensures the message the model generates is valid JSON. Using `json_schema` is preferred for models that support it.

  <Expandable title="properties" defaultOpen={false}>
    <ParamField body="type" type="string" required={true} default="text">
      Enum: `text`, `json_object`, `json_schema`
    </ParamField>

    <ParamField body="json_schema" type="object | null">
      JSON Schema response format. Used to generate structured JSON responses.

      Only supported when `type` is set to `json_schema`, and also required when `type` is set to `json_schema`.

      Please learn more in the [Structured Outputs guide](/guides/llm-structured-outputs).

      <Expandable title="properties" defaultOpen={false}>
        <ParamField body="name" type="string" required={true}>
          The name of the response format. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.
        </ParamField>

        <ParamField body="description" type="string | null">
          A description of what the response format is for, used by the model to determine how to respond in the format.
        </ParamField>

        <ParamField body="schema" type="object | null">
          The schema for the response format, described as a JSON Schema object. Learn how to build JSON schemas [here](https://json-schema.org/specification).

          Supported types: `string`, `number`, `integer`, `boolean`, `array`, `object`, `enum`, `anyOf`.
        </ParamField>

        <ParamField body="strict" type="boolean" default={false}>
          Whether to enable strict schema adherence when generating the output. If set to true, the model will always follow the exact schema defined in the schema field. Only a subset of JSON Schema is supported when strict is true.

          If you turn on Structured Outputs by supplying `strict: true` and call the API with an unsupported JSON Schema, you will receive an error.
        </ParamField>
      </Expandable>
    </ParamField>
  </Expandable>
</ParamField>

<ParamField body="separate_reasoning" type="boolean | null" default={false}>
  Whether to separate the reasoning from the "content" into "reasoning\_content" field.

  Supported models:

  * `deepseek/deepseek-r1-turbo`
</ParamField>

<ParamField body="enable_thinking" type="boolean | null" default={true}>
  Controls the switches between thinking and non-thinking modes.

  Supported models:

  * zai-org/glm-4.5
  * deepseek/deepseek-v3.1
  * deepseek/deepseek-v3.1-terminus
  * deepseek/deepseek-v3.2-exp
</ParamField>

## Response

<ResponseField name="choices" type="object[]" required={true}>
  The list of chat completion choices.

  <Expandable title="properties" defaultOpen={false}>
    <ResponseField name="finish_reason" type="string" required={true}>
      The reason the model stopped generating tokens. This will be "stop" if the model hit a natural stop point or a provided stop sequence, or "length" if the maximum number of tokens specified in the request was reached.

      Available options: `stop`, `length`
    </ResponseField>

    <ResponseField name="index" type="integer" required={true}>
      The index of the chat completion choice.
    </ResponseField>

    <ResponseField name="message" type="object" required={true}>
      <Expandable title="properties" defaultOpen={false}>
        <ResponseField name="role" type="string" required={true}>
          The role of the author of this message.

          Available options: `system`, `user`, `assistant`
        </ResponseField>

        <ResponseField name="content" type="string | null">
          The contents of the message.
        </ResponseField>

        <ResponseField name="reasoning_content" type="string | null">
          The contents of the reasoning steps.

          <Warning>
            This field will only be available when `separate_reasoning` is set to true.
          </Warning>
        </ResponseField>
      </Expandable>
    </ResponseField>
  </Expandable>
</ResponseField>

<ResponseField name="created" type="integer" required={true}>
  The Unix time in seconds when the response was generated.
</ResponseField>

<ResponseField name="id" type="string" required={true}>
  A unique identifier of the response.
</ResponseField>

<ResponseField name="model" type="string" required={true}>
  The model used for the chat completion.
</ResponseField>

<ResponseField name="object" type="string" required={true}>
  The object type, which is always `chat.completion`.
</ResponseField>

<ResponseField name="usage" type="object">
  Usage statistics.

  For streaming responses, usage field is included in the very last response chunk returned.

  <Expandable title="properties" defaultOpen={false}>
    <ResponseField name="completion_tokens" type="integer" required={true}>
      The number of tokens in the generated completion.
    </ResponseField>

    <ResponseField name="prompt_tokens" type="integer" required={true}>
      The number of tokens in the prompt.
    </ResponseField>

    <ResponseField name="total_tokens" type="integer" required={true}>
      The total number of tokens used in the request (prompt + completion).
    </ResponseField>
  </Expandable>
</ResponseField>


---

> To find navigation and other pages in this documentation, fetch the llms.txt file at: https://novita.ai/docs/llms.txt